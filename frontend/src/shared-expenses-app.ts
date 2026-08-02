import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./pages/se-dashboard-page";
import "./pages/se-group-page";
import { SharedExpensesApi } from "./services/api";
import {
  cacheGroup,
  forgetGroup,
  readCachedGroup,
  readRememberedGroup,
  rememberGroup,
} from "./services/last-group";
import { localizer, type Localizer } from "./services/localize";
import type { HomeAssistant, Route } from "./types";

/**
 * Root of the Shared Expenses panel.
 *
 * Home Assistant sets `hass`, `narrow`, `route` and `panel` on this element.
 *
 * The panel occupies a single history entry. Where you are inside it is kept in
 * the URL, so a link still lands where it points and a reload comes back to the
 * same place — but moving between groups replaces that entry rather than
 * stacking new ones. Back therefore leaves the panel, wherever you are in it,
 * instead of walking you through the groups you happened to open: the group
 * switcher in the header is the way between them, and it is the only one.
 *
 * An open dialog is the one exception, and it borrows a step rather than
 * keeping one: back closes the sheet, and the step goes with it. See `show` on
 * the group page. So "a single entry" holds whenever nothing is open, which is
 * the only time back is asked to leave.
 */
@customElement("shared-expenses-panel")
export class SharedExpensesPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route?: Route;

  @state() private groupId?: string;

  /** A fresh expense to open on arrival, asked for in the address by the card. */
  @state() private newExpense = false;

  /** Whether the panel has already resolved where to open. */
  private landed = false;

  /**
   * The server is being asked where to land, this device having forgotten.
   * The panel holds blank for that one round trip rather than flash the
   * dashboard and then jump.
   */
  @state() private resolving = false;

  /** The tile's "+ expense" marker, carried across that round trip. */
  private resolvingWantsExpense = false;

  /** The ask has been fired, so re-renders while awaiting do not repeat it. */
  private askedServer = false;

  private api?: SharedExpensesApi;

  public static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
    }
  `;

  public connectedCallback(): void {
    super.connectedCallback();

    this.syncFromRoute();
    window.addEventListener("popstate", this.syncFromRoute);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.syncFromRoute);
  }

  protected willUpdate(): void {
    if (this.hass && !this.api) {
      this.api = new SharedExpensesApi(this.hass);
    }

    // Deferred to here rather than done where the need is found: the route is
    // read in connectedCallback, and `hass` may not be set on the element yet.
    if (this.hass && this.resolving && !this.askedServer) {
      this.askedServer = true;
      void this.landFromServer();
    }
  }

  protected render() {
    if (!this.hass || !this.api || this.resolving) {
      return html``;
    }

    const localize: Localizer = localizer(this.hass.locale?.language ?? this.hass.language);
    const language = this.hass.locale?.language ?? this.hass.language;

    if (this.groupId) {
      return html`
        <se-group-page
          .api=${this.api}
          .hass=${this.hass}
          .narrow=${this.narrow}
          .localize=${localize}
          .groupId=${this.groupId}
          .language=${language}
          .userId=${this.hass.user?.id ?? null}
          .openNewExpense=${this.newExpense}
          @navigate-back=${this.goToDashboard}
          @group-selected=${this.handleGroupSelected}
          @group-unavailable=${this.handleGroupUnavailable}
          @new-expense-opened=${() => (this.newExpense = false)}
        ></se-group-page>
      `;
    }

    return html`
      <se-dashboard-page
        .api=${this.api}
        .hass=${this.hass}
        .narrow=${this.narrow}
        .localize=${localize}
        @group-selected=${this.handleGroupSelected}
      ></se-dashboard-page>
    `;
  }

  /**
   * Open where the address says, or where you last were.
   *
   * The URL always wins, so a link or a reload lands where it points. Only an
   * unqualified visit falls back to the last group opened.
   */
  private syncFromRoute = () => {
    const path = this.route?.path ?? window.location.pathname;
    const match = /\/group\/([^/?#]+)/.exec(path);

    if (match) {
      this.groupId = match[1];

      // The card's "+ expense" lands here with a marker to open the dialog.
      // Read it once and drop it from the address, so a reload or a step back
      // does not reopen it — the group itself stays in the URL.
      if (new URLSearchParams(window.location.search).get("new") === "expense") {
        this.newExpense = true;
        this.replacePath(`/group/${this.groupId}`);
      }

      return;
    }

    // A dashboard tile with no group of its own lands at the root with the
    // marker: "a new expense, wherever the reader is". The remembered group
    // says where that is.
    const wantsExpense =
      new URLSearchParams(window.location.search).get("new") === "expense";

    if (this.landed) {
      // Already inside the panel: the dashboard is a deliberate choice now.
      this.groupId = undefined;
      return;
    }

    this.landed = true;

    const cached = readCachedGroup();

    if (cached) {
      this.groupId = cached;
      this.newExpense = wantsExpense;
      this.replacePath(`/group/${cached}`);
      return;
    }

    // Nothing on this device. Before settling for the dashboard, ask the
    // server what this account had open: the companion app's WebView throws
    // its storage away now and then, and losing it must not read as the
    // panel forgetting you.
    this.resolvingWantsExpense = wantsExpense;
    this.resolving = true;
    this.groupId = undefined;
  };

  /** Land where the server last saw this account, or on the dashboard. */
  private async landFromServer(): Promise<void> {
    const remembered = await readRememberedGroup(this.hass);

    if (remembered) {
      cacheGroup(remembered);
      this.groupId = remembered;
      this.newExpense = this.resolvingWantsExpense;
      this.replacePath(`/group/${remembered}`);
    } else if (this.resolvingWantsExpense) {
      // No group anywhere: the dashboard, with the marker dropped so a
      // reload does not carry it around.
      this.replacePath("");
    }

    this.resolving = false;
  }

  private handleGroupSelected = (event: CustomEvent) => {
    const groupId: string = event.detail.groupId;

    // Picking a group by hand is not asking for a new expense in it: drop any
    // pending "+ expense" that never got consumed, so it cannot open here.
    this.newExpense = false;
    this.groupId = groupId;

    rememberGroup(this.hass, groupId);
    this.replacePath(`/group/${groupId}`);
  };

  private goToDashboard = () => {
    this.newExpense = false;
    this.groupId = undefined;
    this.replacePath("");
  };

  /**
   * The remembered group is gone, or no longer yours.
   *
   * Forget it and show the dashboard rather than reopening a dead end at every
   * visit.
   */
  private handleGroupUnavailable = () => {
    forgetGroup(this.hass);
    this.goToDashboard();
  };

  /**
   * Say where you are without adding a step to go back through.
   *
   * replaceState, never pushState: every group opened used to leave an entry
   * behind, so back walked you through them and out via the group list. The
   * URL still describes where you are — a link, a reload, a shared address all
   * land right — it simply is not a trail.
   */
  private replacePath(suffix: string) {
    const prefix = this.route?.prefix ?? window.location.pathname.split("/")[1];
    const base = prefix.startsWith("/") ? prefix : `/${prefix}`;

    history.replaceState(null, "", `${base}${suffix}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-panel": SharedExpensesPanel;
  }
}
