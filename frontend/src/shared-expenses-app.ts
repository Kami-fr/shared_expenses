import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./pages/se-dashboard-page";
import "./pages/se-group-page";
import { SharedExpensesApi } from "./services/api";
import { localizer, type Localizer } from "./services/localize";
import type { HomeAssistant, Route } from "./types";

/**
 * Root of the Shared Expenses panel.
 *
 * Home Assistant sets `hass`, `narrow`, `route` and `panel` on this element.
 * Navigation is kept in the URL so that the back button works.
 */
@customElement("shared-expenses-panel")
export class SharedExpensesPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route?: Route;

  @state() private groupId?: string;

  /** Whether the panel has already resolved where to open. */
  private landed = false;

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
  }

  protected render() {
    if (!this.hass || !this.api) {
      return html``;
    }

    const localize: Localizer = localizer(this.hass.locale?.language ?? this.hass.language);
    const language = this.hass.locale?.language ?? this.hass.language;

    if (this.groupId) {
      return html`
        <se-group-page
          .api=${this.api}
          .localize=${localize}
          .groupId=${this.groupId}
          .language=${language}
          .userId=${this.hass.user?.id ?? null}
          @navigate-back=${this.goToDashboard}
          @group-selected=${this.handleGroupSelected}
          @group-unavailable=${this.handleGroupUnavailable}
        ></se-group-page>
      `;
    }

    return html`
      <se-dashboard-page
        .api=${this.api}
        .localize=${localize}
        @group-selected=${this.handleGroupSelected}
      ></se-dashboard-page>
    `;
  }

  /**
   * Go back to where you were.
   *
   * The URL always wins, so a link or the back button still lands where it
   * points. Only an unqualified visit falls back to the last group opened.
   */
  private syncFromRoute = () => {
    const path = this.route?.path ?? window.location.pathname;
    const match = /\/group\/([^/?#]+)/.exec(path);

    if (match) {
      this.groupId = match[1];
      return;
    }

    if (this.landed) {
      // Already inside the panel: the dashboard is a deliberate choice now.
      this.groupId = undefined;
      return;
    }

    this.landed = true;

    const remembered = readLastGroup();

    if (remembered) {
      this.groupId = remembered;
      this.pushPath(`/group/${remembered}`);
      return;
    }

    this.groupId = undefined;
  };

  private handleGroupSelected = (event: CustomEvent) => {
    const groupId: string = event.detail.groupId;

    this.groupId = groupId;

    rememberGroup(groupId);
    this.pushPath(`/group/${groupId}`);
  };

  private goToDashboard = () => {
    this.groupId = undefined;
    this.pushPath("");
  };

  /**
   * The remembered group is gone, or no longer yours.
   *
   * Forget it and show the dashboard rather than reopening a dead end at every
   * visit.
   */
  private handleGroupUnavailable = () => {
    forgetGroup();
    this.goToDashboard();
  };

  private pushPath(suffix: string) {
    const prefix = this.route?.prefix ?? window.location.pathname.split("/")[1];

    history.pushState(null, "", `${prefix.startsWith("/") ? prefix : `/${prefix}`}${suffix}`);
  }
}

/**
 * The last group opened, remembered per browser.
 *
 * A display preference, not group data: it belongs to the device you are on,
 * not to the household. Every access is guarded, as localStorage throws outright
 * when a browser disables storage.
 */
const LAST_GROUP_KEY = "shared_expenses.last_group";

function readLastGroup(): string | null {
  try {
    return window.localStorage.getItem(LAST_GROUP_KEY);
  } catch {
    return null;
  }
}

function rememberGroup(groupId: string): void {
  try {
    window.localStorage.setItem(LAST_GROUP_KEY, groupId);
  } catch {
    // Not being able to remember is not worth breaking the panel over.
  }
}

function forgetGroup(): void {
  try {
    window.localStorage.removeItem(LAST_GROUP_KEY);
  } catch {
    // Same: losing the shortcut is harmless.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-panel": SharedExpensesPanel;
  }
}
