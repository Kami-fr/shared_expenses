import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import { renderAvatar } from "../components/avatar";
import { withAvatars } from "../services/avatar";
import "../components/se-balance-card";
import "../components/se-button";
import "../components/se-field";
import "../components/se-icon";
import "../dialogs/se-categories-dialog";
import "../dialogs/se-expense-dialog";
import "../dialogs/se-group-dialog";
import "../dialogs/se-history-dialog";
import "../dialogs/se-member-dialog";
import "../dialogs/se-payment-dialog";
import "../dialogs/se-statistics-dialog";
import type { SharedExpensesApi } from "../services/api";
import {
  colorFor,
  colorOf,
  formatDayDate,
  formatMoney,
  moneyNeedles,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type {
  Category,
  Expense,
  Group,
  GroupBalances,
  GroupMember,
  GroupRole,
  HomeAssistant,
  Member,
  Payment,
  Permission,
  Settlement,
} from "../types";

type Dialog =
  | "expense"
  | "payment"
  | "member"
  | "group"
  | "categories"
  | "history"
  | "statistics";

/**
 * One thing that happened in the group, expense or payment alike.
 *
 * `at` is the date you typed, `addedAt` when it was actually entered. Both are
 * needed: a date input carries no time, so everything on the same day shares
 * one timestamp and would otherwise come out in no particular order.
 */
type Activity =
  | { kind: "expense"; at: string; addedAt: string; expense: Expense }
  | { kind: "payment"; at: string; addedAt: string; payment: Payment };

/** How far the plus is dragged before it means a reimbursement, in pixels. */
const FAB_DRAG = 40;

/** Detail of a group: balances, expenses and members. */
@customElement("se-group-page")
export class SeGroupPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  /** Passed straight to ha-menu-button, which is the only thing here using it. */
  @property({ attribute: false }) public hass!: HomeAssistant;

  /** Home Assistant's own: the sidebar is not on screen. Same use as hass. */
  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public language = "en";

  /** The Home Assistant account looking at the panel, to know who "you" is. */
  @property({ type: String }) public userId: string | null = null;

  /**
   * Open a fresh expense the moment the group is loaded, then say it is done.
   *
   * Set by the app when the address carried `new=expense` — the dashboard card's
   * "+ expense" walking straight here. Consumed once, on the load that follows,
   * so switching groups afterwards does not keep reopening it.
   */
  @property({ type: Boolean }) public openNewExpense = false;

  @state() private group?: Group;

  /** Every group the user belongs to, for the switcher. */
  @state() private groups: Group[] = [];

  @state() private menu?: "groups" | "more";

  /** Members still in the group: who can be picked for anything new. */
  @state() private members: Member[] = [];

  /**
   * Members including those who left.
   *
   * Only for putting a name on the past: someone who left keeps their old
   * expenses, and may still owe money. They must never be offered as a payer.
   */
  @state() private pastMembers: Member[] = [];

  /** Who holds which role here. Only ever read to know what to offer. */
  @state() private memberships: GroupMember[] = [];

  @state() private categories: Category[] = [];

  @state() private expenses: Expense[] = [];

  @state() private payments: Payment[] = [];

  @state() private result?: GroupBalances;

  /** What is typed in the search box. Filters the list, never the balance. */
  @state() private query = "";

  @state() private loading = true;

  @state() private error?: string;

  @state() private dialog?: Dialog;

  @state() private prefill?: Settlement;

  @state() private editedExpense?: Expense;

  @state() private editedPayment?: Payment;

  /** Where the plus was pressed. The render does follow this one, via below. */
  private fabFrom?: { x: number; y: number };

  /** The plus is being dragged: it would record a reimbursement, not spend. */
  @state() private addingPayment = false;

  /** The drag already acted; swallow the click the browser sends after it. */
  private draggedAway = false;

  @state() private busy = false;

  @state() private confirmingDelete = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      /*
       * The banner every other Home Assistant panel wears. Its colours come
       * from the theme: hard-coding a grey would look wrong the moment someone
       * picks a theme that is not the default.
       */
      /*
       * Above the scrim, so the buttons it carries stay live while a menu is
       * open: pressing the same button again is how you close it.
       */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 4;
      }

      .page {
        /*
         * Room at the foot for the last row to clear the add button. The FAB is
         * fixed 20px up and 56px tall, so anything in the last 76px sits under
         * it — the final expense, most of all, which is the newest and the one
         * you just came to see. The extra bottom padding is scrolled into, so it
         * lifts only that last row above the button, without spacing the list.
         */
        padding: 16px 16px calc(56px + 20px + 16px);
        max-width: 720px;
        margin: 0 auto;
      }

      /*
       * The full width of the window, like every other Home Assistant header.
       * The page below keeps its 720px column — a line of text that long is
       * unreadable, which is not true of a title and two buttons. Capping the
       * header as well left it floating in the middle of a desktop screen,
       * detached from the banner it is painted on.
       *
       * As tall as every other header in Home Assistant, and from the same
       * variable rather than a number of our own: a theme that sets its bars
       * taller means it, and ours would have stayed the odd one out.
       *
       * Positioned: the menus hang from it, see .menu.
       */
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 16px;
        min-height: var(--header-height, 56px);
        box-sizing: border-box;
        position: relative;
      }

      /*
       * A row, with whose money left drawn down its side.
       *
       * The avatar already carries the colour, but it is a 36px circle among
       * others: the list reads as a run of rows, not as a run of people. A rule
       * the height of the row groups them at a glance, without adding a word to
       * a line that has three already.
       *
       * The colour is never the only thing saying it — the avatar and its
       * tooltip stay, which matters to anyone who reads colour poorly.
       */
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px 14px 12px;
        border-left: 4px solid transparent;
      }

      .item + .item {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .item .info {
        flex: 1;
        min-width: 0;
      }

      .item .title {
        font-size: 15px;
        font-weight: 500;
      }

      .converted {
        display: block;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /*
       * A row you can press. Only the button's own borders go: a blanket
       * "border: none" would take the payer's colour with them, .item carrying
       * it as a border and this rule coming after.
       */
      .item-button {
        border-top: none;
        border-right: none;
        border-bottom: none;
        background: none;
        color: inherit;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
      }

      .item-button:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      /*
       * A row you may read but not rewrite: somebody else's, in a project that
       * does not let its members touch what is not theirs.
       *
       * Never greyed out. The line is true, it is somebody's money and it is
       * worth reading — it is simply not yours to change. Dimming it would say
       * it mattered less, which is a different thing and a false one. Only the
       * pointer and the hover go, so nothing invites a press that would do
       * nothing.
       */
      .item-fixed {
        border-top: none;
        border-right: none;
        border-bottom: none;
        background: none;
        color: inherit;
        opacity: 1;
        width: 100%;
        text-align: left;
        font-family: inherit;
        cursor: default;
      }

      .chevron {
        color: var(--secondary-text-color);
      }

      .titles {
        flex: 1;
        min-width: 0;
      }

      .titles h1 {
        font-size: 18px;
      }

      .switcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 2px 0 0;
        cursor: pointer;
        color: inherit;
        opacity: 0.85;
        font-family: inherit;
        font-size: 15px;
        max-width: 100%;
      }

      .switcher .current {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .switcher .caret {
        font-size: 12px;
      }

      .icon {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .icon:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      /* Within thumb reach, where Home Assistant puts its own add buttons. */
      .fab {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.12s ease, background 0.12s ease;
        /*
         * The drag is the button's own: without this the browser would scroll
         * the page under the finger and cancel the pointer, and the plus would
         * only ever add an expense.
         */
        touch-action: none;
      }

      /* Dragged: it says what it would do now, before the finger lifts. */
      .fab.reimbursing {
        background: var(--se-positive);
        transform: scale(1.08);
      }

      .fab-hint {
        position: fixed;
        right: 20px;
        bottom: 88px;
        z-index: 2;
        padding: 8px 14px;
        border-radius: 16px;
        background: var(--se-positive);
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        /* Never under the finger that is dragging past it. */
        pointer-events: none;
      }

      .fab:hover {
        transform: scale(1.06);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 3;
      }

      /*
       * Under the button that opened it, wherever the page has been scrolled.
       *
       * Absolute against the header, not fixed against the viewport. Both were
       * tried and both were wrong on their own: absolute against the *host*
       * pinned the menu 64px from the top of an element as tall as the whole
       * page, so once scrolled down it opened above the screen and never
       * showed; fixed cured that but hung the menu off the viewport, and the
       * viewport is not the panel — Home Assistant's sidebar owns the left of
       * it. A left of 16px therefore parked the menu at the far edge of the
       * screen, half under the sidebar, pointing at nothing. On a phone it went
       * unseen: the viewport *is* the panel there, and a menu spanning the
       * width looks deliberate.
       *
       * The header is both: the 720px column the buttons actually live in, and
       * inside a sticky toolbar that is always on screen.
       */
      .menu {
        position: absolute;
        z-index: 1;
        top: 100%;
        width: min(320px, calc(100% - 32px));
        /* What is left below the header it drops from, less a little air. */
        max-height: calc(100dvh - var(--header-height, 56px) - 32px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }

      /* Each menu drops from its own button: the groups left, the rest right. */
      .menu.at-groups {
        left: 16px;
      }

      .menu.at-more {
        right: 16px;
      }

      .menu button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        text-align: left;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
      }

      .menu button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .menu button:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .menu .current-item {
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
      }

      .menu .separated {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        margin-top: 4px;
        padding-top: 12px;
      }

      .menu .danger {
        color: var(--error-color, #db4437);
      }

      .section-title {
        padding: 12px 16px 4px;
      }

      .archived-tag {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      .banner {
        background: var(--secondary-background-color, #f1f1f1);
        color: var(--secondary-text-color);
        border-radius: var(--se-radius);
        padding: 12px 16px;
        font-size: 13px;
      }

      /* Not about you: it says what happened, not what it does to you. */
      .amount.neutral {
        color: var(--secondary-text-color);
      }

      .note {
        font-size: 12px;
        font-weight: 400;
        color: var(--secondary-text-color);
        margin-left: 6px;
      }

      .tail {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      /* Holds the face and its mark together, so the pair scrolls as one. */
      .face {
        position: relative;
        flex: 0 0 auto;
        line-height: 0;
      }

      /*
       * The category on the corner of the face rather than in a column of its
       * own — the journal's arrangement, see se-history. Who paid and what for
       * are one glance, and a third circle in the row would have been paid for
       * by the width of the title.
       *
       * It also settles the row with no category: nothing is drawn and nothing
       * has to be held open for it, where a column would have needed a blank
       * kept in it to stop the titles going ragged.
       *
       * The ring is the card's own background and not a colour: it is what keeps
       * an orange mark on an orange avatar from reading as one shape.
       */
      .face .pip {
        position: absolute;
        right: -5px;
        bottom: -5px;
        border-radius: 50%;
        border: 2px solid var(--card-background-color, #fff);
      }

      .stack-avatars {
        display: flex;
      }

      .stack-avatars .avatar.small {
        width: 26px;
        height: 26px;
        font-size: 10px;
        border: 2px solid var(--card-background-color, #fff);
      }

      .stack-avatars .avatar.small + .avatar.small {
        margin-left: -8px;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("popstate", this.handlePop);
    void this.load();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.handlePop);
  }

  /**
   * Reload when the switcher swaps the group under us.
   *
   * The app keeps one page element and only changes `groupId` when you pick
   * another group from the header — no remount, so `connectedCallback` never
   * runs again. Without this, choosing a group did nothing: the page went on
   * showing the one it first loaded, which read as the switcher being broken.
   * The initial group is already loaded in `connectedCallback`, so this fires
   * only on a real change, where `changed.get` holds the group left behind.
   */
  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("groupId") && changed.get("groupId")) {
      this.loading = true;
      void this.load();
    }
  }

  protected render() {
    const translate = this.localize;

    if (this.loading || !this.group) {
      return html`
        <div class="empty">${this.error ?? translate("loading")}</div>
      `;
    }

    return html`
      ${this.renderHeader()}

      <div class="page">
        <div class="stack">
          ${this.group.archived
            ? html`<div class="banner">${translate("archived_hint")}</div>`
            : nothing}

          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment
        ? html`<div class="fab-hint">${translate("new_payment")}</div>`
        : nothing}
      <button
        class=${`fab ${this.addingPayment ? "reimbursing" : ""}`}
        aria-label=${translate("action_add_expense")}
        title=${translate("fab_hint")}
        @click=${this.fabClick}
        @pointerdown=${this.fabDown}
        @pointermove=${this.fabMove}
        @pointerup=${this.fabUp}
        @pointercancel=${this.fabCancel}
      >
        <se-icon
          plain
          .icon=${this.addingPayment ? "mdi:swap-horizontal" : "mdi:plus"}
          fallback=${this.addingPayment ? "⇄" : "+"}
          .size=${26}
        ></se-icon>
      </button>

      ${this.renderDialog()}
    `;
  }

  private renderHeader() {
    const translate = this.localize;
    const group = this.group!;

    return html`
      <div class="toolbar">
        <div class="header">
          <!--
            Home Assistant's own, not one of ours. It knows something we would
            have to guess at and would guess wrong: whether the sidebar is
            already on screen. On a desktop it is, with a burger of its own, so
            this renders nothing and there is one burger instead of two; on a
            phone the sidebar is gone and this is the way back out of the panel.
            It carries the notification dot too, which ours never did.
          -->
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>

        <div class="titles">
          <h1>${translate("app_title")}</h1>
          <button class="switcher" @click=${() => this.openMenu("groups")}>
            <span class="current">${group.name}</span>
            <span class="caret">⌄</span>
            ${group.archived
              ? html`<span class="archived-tag">${translate("archived")}</span>`
              : nothing}
          </button>
        </div>

        <button
          class="icon"
          aria-label=${translate("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>

        ${this.menu ? this.renderMenu() : nothing}
        </div>
      </div>
      ${this.menu
        ? html`<div class="scrim" @click=${() => (this.menu = undefined)}></div>`
        : nothing}
    `;
  }

  /**
   * The open menu, inside the header so it can hang from the right button.
   *
   * The scrim that closes it stays outside: it covers the page, never the
   * toolbar, so the button you opened it with is still there to close it.
   */
  private renderMenu() {
    return html`
      <div
        class=${`menu ${this.menu === "groups" ? "at-groups" : "at-more"}`}
        role="menu"
      >
        ${this.menu === "groups" ? this.renderGroupMenu() : this.renderMoreMenu()}
      </div>
    `;
  }

  private renderGroupMenu() {
    return html`
      ${this.groups.map(
        (group) => html`
          <button
            role="menuitem"
            class=${group.id === this.groupId ? "current-item" : ""}
            @click=${() => this.switchTo(group)}
          >
            ${group.name}
            ${group.archived
              ? html`<span class="archived-tag">${this.localize("archived")}</span>`
              : nothing}
          </button>
        `,
      )}
      <button role="menuitem" class="separated" @click=${this.goBack}>
        ${this.localize("all_groups")}
      </button>
    `;
  }

  /**
   * What you may actually do here.
   *
   * An entry that is offered and then refused is worse than one that is not
   * there: it reads as the panel being broken rather than as the project being
   * shut. So each of these appears only where the backend would let it through
   * — the same rule, asked twice, and the backend's is the one that counts.
   *
   * The members and the project stay reachable either way: the first is where
   * you rename yourself or leave, the second where you read what the project
   * counts in. Both dialogs shut their own doors rather than close.
   */
  private renderMoreMenu() {
    const translate = this.localize;

    return html`
      <button role="menuitem" @click=${() => this.openDialog("group")}>
        ${this.may("manage_group") ? translate("edit_group") : translate("group_details")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${translate("members")}
      </button>
      ${this.may("manage_categories")
        ? html`<button role="menuitem" @click=${() => this.openDialog("categories")}>
            ${translate("categories")}
          </button>`
        : nothing}
      <button role="menuitem" @click=${() => this.openDialog("statistics")}>
        ${translate("statistics")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${translate("group_history")}
      </button>
      ${this.may("manage_group")
        ? html`<button
            role="menuitem"
            class="separated"
            ?disabled=${this.busy}
            @click=${this.toggleArchive}
          >
            ${this.group!.archived ? translate("restore") : translate("archive")}
          </button>`
        : nothing}
      ${this.myRole() === "admin"
        ? html`<button
            role="menuitem"
            class="danger separated"
            ?disabled=${this.busy}
            @click=${this.deleteGroup}
          >
            ${this.confirmingDelete
              ? translate("confirm_delete")
              : translate("delete_group")}
          </button>`
        : nothing}
    `;
  }

  private openDialog(dialog: Dialog) {
    this.menu = undefined;
    this.show(dialog);
  }

  private openMenu(menu: "groups" | "more") {
    this.menu = this.menu === menu ? undefined : menu;
    this.confirmingDelete = false;
  }

  private switchTo(group: Group) {
    this.menu = undefined;

    if (group.id === this.groupId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: group.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private deleteGroup = async () => {
    // Deleting takes every expense with it: ask once, in place.
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      return;
    }

    this.busy = true;

    try {
      await this.api.deleteGroup(this.groupId);

      this.menu = undefined;
      this.goBack();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
      this.confirmingDelete = false;
    } finally {
      this.busy = false;
    }
  };

  /**
   * The group, on one page: what is owed, then everything that happened.
   *
   * Expenses and reimbursements were on separate tabs, so a debt and the
   * payment clearing it never met, and the overview was a third view showing a
   * truncated copy of both. One list, scrolling with the page.
   */
  private renderHome() {
    return html`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .settlements=${this.result?.settlements ?? []}
        .members=${this.pastMembers}
        .meId=${this.meId()}
        .currency=${this.group!.currency}
        .language=${this.language}
        @settle-up=${this.settleUp}
      ></se-balance-card>

      ${this.renderSearch()} ${this.renderActivityCard()}
    `;
  }

  /**
   * Always there.
   *
   * It used to appear only past a few entries, on the grounds that a short list
   * reads at a glance — which is true, and beside the point: a control that
   * comes and goes on its own is read as a bug, and a new group is exactly when
   * you have not yet learnt where things are.
   */
  private renderSearch() {
    return html`
      <se-field
        .value=${this.query}
        .label=${""}
        placeholder=${this.localize("search")}
        @value-changed=${(e: CustomEvent) => (this.query = e.detail.value)}
      ></se-field>
    `;
  }

  private renderActivityCard() {
    const entries = this.matching();

    if (entries.length === 0) {
      return html`
        <div class="card">
          <div class="empty">
            ${this.query.trim()
              ? this.localize("no_match")
              : this.localize("no_activity")}
          </div>
        </div>
      `;
    }

    return html`
      <div class="card">
        ${entries.map((entry) =>
          entry.kind === "expense"
            ? this.renderExpense(entry.expense)
            : this.renderPayment(entry.payment),
        )}
      </div>
    `;
  }

  /**
   * Everything that moved money, newest first.
   *
   * Expenses and payments are two halves of the same story: seeing them apart
   * means never knowing whether a debt was already settled.
   */
  private activity(): Activity[] {
    const entries: Activity[] = [
      ...this.expenses.map(
        (expense): Activity => ({
          kind: "expense",
          at: expense.expense_date,
          addedAt: expense.created_at,
          expense,
        }),
      ),
      ...this.payments.map(
        (payment): Activity => ({
          kind: "payment",
          at: payment.payment_date,
          addedAt: payment.created_at,
          payment,
        }),
      ),
    ];

    // Newest first, and within a single day the most recently entered first.
    return entries.sort(
      (a, b) => b.at.localeCompare(a.at) || b.addedAt.localeCompare(a.addedAt),
    );
  }

  /**
   * A payment, said the way its kind reads, and from where you stand.
   *
   * The two kinds are one movement of money and differ only in words, so the
   * words are the whole job here: a debt shown as "Dupont → Michel" reads as
   * Dupont having paid, which is true of a loan and nonsense for a debt
   * somebody is only writing down.
   *
   * Which is why the names swap round by kind. The arrow always points at
   * whoever ends up with the money — a reimbursement has sent it, a debt owes
   * it — and on a debt the one who will pay is the one who owes, which is the
   * member on the receiving end of the stored payment.
   */
  private renderPayment(payment: Payment) {
    const debt = payment.kind === "debt";

    // Whose money leaves, and whose it becomes. The line reads payer → taker
    // whatever the kind; only which stored member is which changes.
    const payerId = debt ? payment.to_member_id : payment.from_member_id;
    const takerId = debt ? payment.from_member_id : payment.to_member_id;

    // The line is the payer's: on a reimbursement the one whose money left, on
    // a debt the one who owes it — a debt is somebody's, and it is theirs, not
    // the lender's.
    const payer = this.memberById(payerId);
    const colour = payer?.color ?? colorFor(payerId);

    // The other end. A payment has exactly one, which is what makes it a
    // payment and not an expense.
    const taker = this.memberById(takerId);

    const editable = this.mayEdit(payment);

    return html`
      <button
        class=${`item ${editable ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${colour}`}
        ?disabled=${!editable}
        @click=${() => this.openPayment(undefined, payment)}
      >
        <span class="face">
          <!--
            Whose line it is, wearing the same face the expenses above and below
            it show. This was the kind's own icon at 36px and nothing else, so
            the one list where money moves between two people was the one list
            neither of them had a face in.
          -->
          ${this.renderMemberAvatar(payer?.name ?? "?", payerId)}
          <!--
            Reimbursement or debt on the corner, exactly as an expense wears its
            category. It keeps the payer's colour, which the avatar behind it
            carries as well: the ring is what holds the two apart, and holding a
            mark apart from an avatar of its own colour is the whole reason that
            ring exists. Which of the two it is, the glyph says — a hand holding
            a coin for money still owed, two arrows for money that moved.

            Hidden from screen readers: the line underneath already says
            "Reimbursement" or "Debt" in the reader's own language.
          -->
          <se-icon
            class="pip"
            aria-hidden="true"
            .icon=${debt ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
            .fallback=${debt ? "→" : "⇄"}
            .color=${colour}
            .size=${18}
            .glyph=${0.82}
          ></se-icon>
        </span>
        <div class="info">
          <div class="title">
            ${this.nameFrom(payerId)} → ${this.nameFrom(takerId)}
          </div>
          <!--
            Where an expense shows its category: same grid, same reading. What
            somebody wrote about it wins the line — "Dette" is already said by
            the icon and the colour, and a note is only ever there because it
            said something they were not.
          -->
          <div class="muted">
            ${payment.description || this.localize(debt ? "a_debt" : "a_settlement")}
          </div>
          <div class="muted">
            ${formatDayDate(payment.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount ${this.toneFor(payerId, takerId)}">
            ${formatMoney(payment.amount, payment.currency, this.language)}
          </span>
          <!-- What it weighs in the group, exactly as on an expense. -->
          ${payment.currency === this.group!.currency
            ? nothing
            : html`<span class="converted">
                ${formatMoney(
                  payment.converted_amount,
                  this.group!.currency,
                  this.language,
                )}
              </span>`}
          <!--
            Who it reaches, where an expense keeps the people who share it. The
            same stack and the same 26px, holding one face rather than several:
            a payment has one other end, and putting it anywhere else on the row
            would have been a fourth column for a list that reads in three.
          -->
          <div class="stack-avatars">
            ${renderAvatar(taker, taker?.name ?? "?", takerId, "small")}
          </div>
        </div>
      </button>
    `;
  }




  /**
   * A member's name, or "you" when it is yours.
   *
   * The balance card has always been written from where you stand — "on te
   * doit", not "Stéphane doit recevoir". The list underneath it was not, so the
   * same fact was told twice in two voices, and finding yourself in a row meant
   * spotting your own name among the others first.
   */
  private nameFrom(id: string): string {
    if (id === this.meId()) {
      return this.localize("you");
    }

    return this.memberById(id)?.name ?? "?";
  }

  /**
   * What a movement of money does to you, in one colour.
   *
   * Green when it comes your way, red when it leaves you — the reading the
   * balance card already trained. Kind has nothing to do with it: a debt owed
   * to you is money coming, and every debt used to be red on the grounds that a
   * debt is a bad thing, which is only true of the ones you owe.
   *
   * Neither, when the line is not about you: two other people settling up is a
   * fact, not good news or bad. Same when no member is you at all — an admin
   * looking in, a tablet in the kitchen. There is no point of view to take.
   */
  private toneFor(payerId: string, takerId: string): string {
    const me = this.meId();

    if (me === takerId) {
      return "positive";
    }

    return me === payerId ? "negative" : "neutral";
  }

  private renderExpense(expense: Expense) {
    const payer = this.memberById(expense.paid_by_member_id);
    const category = this.categories.find((c) => c.id === expense.category_id);

    const editable = this.mayEdit(expense);

    // Money a shop gave back. It is the one row here whose figure carries a
    // minus, and the avatar on the left is who received it rather than who paid.
    const refund = expense.amount < 0;

    return html`
      <button
        class=${`item ${editable ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${payer?.color ?? colorFor(expense.paid_by_member_id)}`}
        ?disabled=${!editable}
        @click=${() => this.openExpense(expense)}
      >
        <span class="face">
          ${this.renderMemberAvatar(
            payer?.name ?? "?",
            expense.paid_by_member_id,
            `${this.localize(refund ? "refunded_to" : "paid_by")} ${payer?.name ?? "?"}`,
          )}
          <!--
            What it was, on the corner of who paid for it, exactly as the journal
            marks the face that wrote a line. The category was a word in grey
            under the title and nothing else, so telling the bread from the
            weekly shopping meant reading every row — while the icon and colour
            it was given when it was created were only ever seen in the dialog
            where they were chosen.

            Hidden from screen readers: the name is still written underneath, in
            the reader's own language, and hearing it twice is not hearing it
            better.

            A glyph nearly filling the badge, as the journal's does. The default
            ratio is measured for a 34px pill and would leave a mark this small
            with a glyph too faint to tell a loaf from a barcode.
          -->
          ${category
            ? html`<se-icon
                class="pip"
                aria-hidden="true"
                .icon=${category.icon}
                .fallback=${category.name.charAt(0).toUpperCase()}
                .color=${colorOf(category, this.categories)}
                .size=${18}
                .glyph=${0.82}
              ></se-icon>`
            : nothing}
        </span>
        <div class="info">
          <div class="title">
            ${expense.title}
            ${expense.description
              ? html`<span class="note">${expense.description}</span>`
              : nothing}
          </div>
          <!--
            Nothing where there is no category. "No category" is a fact about
            the form, not about the shop: it named an absence, on every row that
            had one, and said nothing anybody needed.
          -->
          ${category ? html`<div class="muted">${category.name}</div>` : nothing}
          <div class="muted">
            ${formatDayDate(expense.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <!--
            Money that left the group, or came back to it. Red on a purchase and
            green on a refund, for whoever is reading: this row is not a movement
            between two of you and so it has no side to be on. A reimbursement is
            the other case and takes its colour from the reader, which is what
            toneFor is for.

            So the two colours answer two different questions in the same list,
            and that is the point rather than an inconsistency: crossing the
            group's edge is a direction, moving inside it is a position.
          -->
          <span class="amount ${refund ? "positive" : "negative"}">
            <!--
              Without its minus. Only a refund is ever negative here, so the sign
              carried nothing the green was not already saying, and said it in the
              one place a figure is read for its size. Math.abs rather than a
              branch: a purchase is never negative, so there is nothing for it to
              do on one.
            -->
            ${formatMoney(Math.abs(expense.amount), expense.currency, this.language)}
          </span>
          <!--
            What it weighs in the group, under what was handed over at the till.
            Both, because both are true and neither answers the other: 100 USD
            is what was paid, 87,68 EUR is what it costs whoever shares it.
          -->
          ${expense.currency === this.group!.currency
            ? nothing
            : html`<span class="converted">
                ${formatMoney(
                  Math.abs(expense.converted_amount),
                  this.group!.currency,
                  this.language,
                )}
              </span>`}
          ${this.renderParticipants(expense)}
        </div>
      </button>
    `;
  }

  /** The members actually sharing the expense, stacked like on a receipt. */
  private renderParticipants(expense: Expense) {
    const shares = (expense.shares ?? []).filter((share) => share.amount !== 0);

    if (shares.length === 0) {
      return nothing;
    }

    return html`
      <div class="stack-avatars">
        ${shares.map((share) => {
          const member = this.memberById(share.member_id);

          return renderAvatar(
            member,
            member?.name ?? "?",
            share.member_id,
            "small",
          );
        })}
      </div>
    `;
  }


  /**
   * A member as a coloured initial.
   *
   * `hint` names what the avatar stands for: on an expense row the one on the
   * left is the payer and the ones on the right are who shares it, which the
   * circles alone do not say.
   */
  private renderMemberAvatar(name: string, id: string, hint?: string) {
    return renderAvatar(this.memberById(id), name, id, "", hint ?? name);
  }

  private renderDialog() {
    if (!this.dialog || !this.group) {
      return nothing;
    }

    if (this.dialog === "expense") {
      // Keyed on the expense, because a refund opens the purchase it answers
      // without the dialog ever closing: one element left standing would keep
      // the expense it first loaded, having read it in connectedCallback and
      // never again. The same reuse that made the group switcher do nothing.
      return keyed(
        this.editedExpense?.id ?? "new",
        html`
          <se-expense-dialog
            .api=${this.api}
            .localize=${this.localize}
            .group=${this.group}
            .members=${this.membersFor(this.editedExpense)}
            .categories=${this.categories}
            .expense=${this.editedExpense}
            .expenses=${this.expenses}
            .refunds=${this.refundsOf(this.editedExpense)}
            .openable=${this.openableExpenses()}
            .meId=${this.meId()}
            .language=${this.language}
            @dialog-cancelled=${this.closeDialog}
            @expense-saved=${this.handleChanged}
            @expense-deleted=${this.handleChanged}
            @open-expense=${this.openRelated}
          ></se-expense-dialog>
        `,
      );
    }

    if (this.dialog === "payment") {
      return html`
        <se-payment-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersForPayment(this.editedPayment)}
          .payment=${this.editedPayment}
          .settlement=${this.prefill}
          .expenses=${this.expenses}
          .categories=${this.categories}
          .openable=${this.openableExpenses()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-saved=${this.handleChanged}
          @payment-deleted=${this.handleChanged}
          @open-expense=${this.openRelated}
        ></se-payment-dialog>
      `;
    }

    if (this.dialog === "statistics") {
      return html`
        <se-statistics-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .meId=${this.meId()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
        ></se-statistics-dialog>
      `;
    }

    if (this.dialog === "history") {
      return html`
        <se-history-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .expenses=${this.expenses}
          .payments=${this.payments}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
          @history-restored=${this.handleChanged}
        ></se-history-dialog>
      `;
    }

    if (this.dialog === "group") {
      return html`
        <se-group-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .role=${this.myRole()}
          .mayManage=${this.may("manage_group")}
          @dialog-cancelled=${this.closeDialog}
          @group-saved=${this.handleChanged}
        ></se-group-dialog>
      `;
    }

    if (this.dialog === "categories") {
      return html`
        <se-categories-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @categories-changed=${this.handleChanged}
        ></se-categories-dialog>
      `;
    }

    return html`
      <se-member-dialog
        .api=${this.api}
        .hass=${this.hass}
        .localize=${this.localize}
        .groupId=${this.groupId}
        .role=${this.myRole()}
        .meId=${this.meId()}
        .mayManage=${this.may("manage_members")}
        @dialog-cancelled=${this.closeDialog}
        @members-changed=${this.handleChanged}
      ></se-member-dialog>
    `;
  }

  /** Looks among past members too: an old expense still needs a name on it. */
  private memberById(id: string): Member | undefined {
    return this.pastMembers.find((member) => member.id === id);
  }

  /**
   * Which member of this group you are, if any.
   *
   * Nobody, when the panel is open on an account no member is tied to — a
   * shared tablet in the kitchen, an admin looking at someone else's group.
   */
  private meId(): string | null {
    if (!this.userId) {
      return null;
    }

    return this.members.find((member) => member.user_id === this.userId)?.id ?? null;
  }

  /** What standing you have here, or null on an account no member is tied to. */
  private myRole(): GroupRole | null {
    const me = this.meId();

    if (me === null) {
      return null;
    }

    return (
      this.memberships.find(
        (membership) => membership.member_id === me && membership.left_at === null,
      )?.role ?? null
    );
  }

  /**
   * Whether the project lets you do this.
   *
   * The same rule the backend applies, and only ever used to decide what to
   * offer. A courtesy, never a guard: the panel is a program on somebody's
   * machine, and the door is `ensure_permission`. Offering what would be
   * refused is the thing to avoid — a button that always errors is worse than
   * no button.
   */
  private may(permission: Permission): boolean {
    const role = this.myRole();

    if (role === "admin") {
      return true;
    }

    return this.group?.permissions.includes(permission) ?? false;
  }

  /** Whether an entry is yours: you entered it, or it is about you. */
  private mine(entry: Expense | Payment): boolean {
    const me = this.meId();

    if (me === null) {
      return false;
    }

    if (entry.created_by_member_id === me) {
      return true;
    }

    return "paid_by_member_id" in entry
      ? entry.paid_by_member_id === me
      : entry.from_member_id === me || entry.to_member_id === me;
  }

  /** Whether you may open an entry to change it, rather than only read it. */
  private mayEdit(entry: Expense | Payment): boolean {
    return this.mine(entry) || this.may("edit_others");
  }

  /**
   * The refunds that name this expense.
   *
   * Filtered here rather than fetched: the page already holds every expense of
   * the group, so "how much of this came back" is a question it can answer
   * without another round trip — which is why no command lists them.
   */
  private refundsOf(expense?: Expense): Expense[] {
    if (!expense) {
      return [];
    }

    return this.expenses.filter((item) => item.refund_of === expense.id);
  }

  /**
   * Which expenses may be opened rather than only read, by id.
   *
   * For every expense of the group and not for the one on screen: the expense
   * dialog offers a way through to the purchase a refund answers, and which
   * purchase that is gets chosen in the dialog, where this page cannot see it.
   * The rule stays here — it takes the group's permissions and your role, and a
   * second copy of it would be a second thing to keep in step.
   */
  private openableExpenses(): string[] {
    return this.expenses
      .filter((expense) => this.mayEdit(expense))
      .map((expense) => expense.id);
  }

  /**
   * Who the expense dialog may offer.
   *
   * The active members, plus anyone this very expense already involves. Someone
   * removed from the group must not be pickable for something new, but an
   * expense they paid still has to show them as its payer: dropping them would
   * silently reassign it on the next save.
   */
  private membersFor(expense?: Expense): Member[] {
    if (!expense) {
      return this.members;
    }

    return this.plusGone([
      expense.paid_by_member_id,
      ...(expense.shares ?? []).map((share) => share.member_id),
    ]);
  }

  /**
   * Who the payment dialog may offer.
   *
   * Anyone still owing or owed comes along, active or not. Leaving a group does
   * not clear a debt: the balances count those who left, and a settlement they
   * owe would be impossible to record if they could not be picked. Someone gone
   * and square is left out — that is over, and the list is not a graveyard.
   *
   * Editing an existing payment offers whoever it already names, whatever their
   * balance: dropping them would silently reassign the payment on the next save.
   */
  private membersForPayment(payment?: Payment): Member[] {
    if (payment) {
      return this.plusGone([payment.from_member_id, payment.to_member_id]);
    }

    const owing = (this.result?.balances ?? [])
      .filter((balance) => balance.amount !== 0)
      .map((balance) => balance.member_id);

    return this.plusGone(owing);
  }

  private plusGone(involved: string[]): Member[] {
    const ids = new Set(involved);

    const gone = this.pastMembers.filter(
      (member) =>
        ids.has(member.id) && !this.members.some((active) => active.id === member.id),
    );

    return [...this.members, ...gone];
  }

  private async load() {
    this.error = undefined;

    try {
      const [
        group,
        groups,
        members,
        pastMembers,
        memberships,
        categories,
        expenses,
        payments,
        result,
      ] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listGroups(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, true),
        this.api.listMemberships(this.groupId),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId),
      ]);

      this.group = group;
      this.groups = groups;
      this.members = withAvatars(members, this.hass);
      this.pastMembers = withAvatars(pastMembers, this.hass);
      this.memberships = memberships;
      this.categories = categories;
      this.expenses = expenses;
      this.payments = payments;
      this.result = result;
    } catch (error) {
      this.error = errorMessage(error, this.localize);

      // Deleted, or no longer ours: say so, rather than sitting on a dead end
      // the panel would reopen at every visit.
      if ((error as { code?: string })?.code === "group_not_found") {
        this.dispatchEvent(
          new CustomEvent("group-unavailable", { bubbles: true, composed: true }),
        );
      }
    } finally {
      this.loading = false;

      // Arrived from a dashboard's "+ expense": open it now the members are
      // loaded, and tell the app so a later group switch does not reopen it.
      if (this.openNewExpense && this.group) {
        this.openExpense();
        this.dispatchEvent(
          new CustomEvent("new-expense-opened", { bubbles: true, composed: true }),
        );
      }
    }
  }

  /**
   * The plus adds an expense, and is dragged to reimburse instead.
   *
   * An expense is what you come back to enter; a reimbursement happens a few
   * times a month. Making the common one cost a tap and the rare one a gesture
   * beats a menu that charges both of them two taps.
   *
   * Any direction away from the corner counts, and generously: at the bottom
   * right of a phone the room to move is up and left, and a thumb is not a
   * pointing device.
   */
  private fabDown = (event: PointerEvent) => {
    // Capture, or a drag leaving the button would never report its end and the
    // plus would sit there thinking it is still being dragged.
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.fabFrom = { x: event.clientX, y: event.clientY };
    this.addingPayment = false;
  };

  private fabMove = (event: PointerEvent) => {
    if (!this.fabFrom) {
      return;
    }

    const dx = event.clientX - this.fabFrom.x;
    const dy = event.clientY - this.fabFrom.y;

    // Up or left only: a tap drifts a little, and it must never buy the wrong
    // dialog. Away from the corner is a move nobody makes by accident.
    this.addingPayment = dy < -FAB_DRAG || dx < -FAB_DRAG;
  };

  private fabUp = () => {
    if (!this.fabFrom) {
      return;
    }

    const payment = this.addingPayment;

    this.fabFrom = undefined;
    this.addingPayment = false;

    if (payment) {
      // A click follows a pointerup, and it would open the expense on top.
      this.draggedAway = true;
      this.openPayment();
    }
  };

  private fabCancel = () => {
    this.fabFrom = undefined;
    this.addingPayment = false;
  };

  /**
   * A plain press: the expense.
   *
   * Left to the click rather than done on pointerup, so that pressing Enter on
   * the focused button works too — a keyboard raises no pointer at all.
   */
  private fabClick = () => {
    if (this.draggedAway) {
      this.draggedAway = false;
      return;
    }

    this.openExpense();
  };

  /**
   * The activity, filtered by what is typed.
   *
   * Matched on everything a row shows — title, description, category, the
   * people, the amount — because that is what someone types: they look for
   * "carrefour", "antonin", "essence" or "300" without thinking about which
   * field it is.
   *
   * The balance above never moves with it: it is the group's, not the list's,
   * and a total that shrank as you typed would be a lie.
   */
  private matching(): Activity[] {
    const needle = this.query.trim().toLowerCase();
    const entries = this.activity();

    if (!needle) {
      return entries;
    }

    return entries.filter((entry) => this.haystack(entry).includes(needle));
  }

  private haystack(entry: Activity): string {
    const nameOf = (id: string) => this.memberById(id)?.name ?? "";

    if (entry.kind === "payment") {
      const payment = entry.payment;

      return [
        this.localize("a_settlement"),
        payment.description ?? "",
        nameOf(payment.from_member_id),
        nameOf(payment.to_member_id),
        ...this.amountNeedles(
          payment.amount,
          payment.currency,
          payment.converted_amount,
        ),
      ]
        .join(" ")
        .toLowerCase();
    }

    const expense = entry.expense;
    const category = this.categories.find((c) => c.id === expense.category_id);

    return [
      expense.title,
      expense.description ?? "",
      category?.name ?? "",
      nameOf(expense.paid_by_member_id),
      ...this.amountNeedles(
        expense.amount,
        expense.currency,
        expense.converted_amount,
      ),
    ]
      .join(" ")
      .toLowerCase();
  }

  /**
   * What was paid, and what it came to — both are findable.
   *
   * A row in a foreign currency shows two figures, and either is the one that
   * stuck in somebody's memory: the 100 they handed over, or the 87,68 it cost
   * the group.
   */
  private amountNeedles(
    amount: number,
    currency: string,
    converted: number,
  ): string[] {
    const needles = moneyNeedles(amount, currency, this.language);

    if (currency === this.group!.currency) {
      return needles;
    }

    return [
      ...needles,
      ...moneyNeedles(converted, this.group!.currency, this.language),
    ];
  }

  /** Record the reimbursement a balance line stands for, filled in with it. */
  private settleUp = (event: CustomEvent) => {
    this.openPayment(event.detail.settlement);
  };

  /**
   * Jump from an entry of the journal to the thing it is about.
   *
   * The journal closes on the way: two stacked dialogs would leave no way back
   * that is not a guess, and the history you wanted is inside the one opening.
   */
  private openFromHistory = (event: CustomEvent) => {
    const { entityType, entityId } = event.detail;

    if (entityType === "expense") {
      const expense = this.expenses.find((item) => item.id === entityId);

      if (expense) {
        this.openExpense(expense);
      }

      return;
    }

    const payment = this.payments.find((item) => item.id === entityId);

    if (payment) {
      this.openPayment(undefined, payment);
    }
  };

  /**
   * Jump from an expense to another it points at: a refund to its purchase.
   *
   * The same move the journal makes, and the same reasons — one dialog at a
   * time, and one step on the history stack for the whole chain, since `show`
   * pushes nothing while a dialog is already open. Checked again here rather
   * than trusted: the dialog was handed what may be opened, and this is where
   * that is decided.
   */
  private openRelated = (event: CustomEvent) => {
    const expense = this.expenses.find((item) => item.id === event.detail.expenseId);

    if (expense && this.mayEdit(expense)) {
      this.openExpense(expense);
    }
  };

  /** A suggested settlement to record, or a recorded payment to correct. */
  private openPayment(settlement?: Settlement, payment?: Payment) {
    this.prefill = settlement;
    this.editedPayment = payment;
    this.show("payment");
  }

  private openExpense(expense?: Expense) {
    this.editedExpense = expense;
    this.show("expense");
  }

  /**
   * Show a dialog, and leave a step behind for the phone's back button.
   *
   * Back is how you dismiss a sheet on a phone, and without a step to go back
   * to it left the panel altogether — half a typed expense gone, and Home
   * Assistant's front page instead. The step is the dialog's, and it is dropped
   * again the moment it closes, so nothing accumulates and back still leaves
   * the panel once no dialog is open.
   *
   * One step for the whole chain: the journal opens the expense it points at
   * and closes on the way, and two steps for one sheet on screen would mean
   * pressing back twice for the same thing.
   */
  private show(dialog: Dialog) {
    if (!this.dialog) {
      history.pushState({ seDialog: true }, "");
    }

    this.dialog = dialog;
  }

  /**
   * Close the dialog and take its step back off the stack.
   *
   * Both, in that order and unconditionally: the dialog goes even if the step
   * is not ours to drop — a dialog you cannot dismiss is worse than a stray
   * entry in the history.
   */
  private closeDialog = () => {
    const ours = history.state?.seDialog === true;

    this.clearDialog();

    if (ours) {
      history.back();
    }
  };

  /** Back was pressed with a dialog open: the browser dropped the step for us. */
  private handlePop = () => {
    if (this.dialog) {
      this.clearDialog();
    }
  };

  private clearDialog() {
    this.dialog = undefined;
    this.prefill = undefined;
    this.editedExpense = undefined;
    this.editedPayment = undefined;
  }

  private handleChanged = () => {
    this.closeDialog();
    void this.load();
  };

  /** Archiving is reversible and freezes the group: no confirmation needed. */
  private toggleArchive = async () => {
    if (!this.group) {
      return;
    }

    this.busy = true;
    this.error = undefined;

    try {
      this.group = await this.api.archiveGroup(this.group.id, !this.group.archived);
      this.menu = undefined;
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };

  private goBack = () => {
    this.dispatchEvent(new CustomEvent("navigate-back", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-group-page": SeGroupPage;
  }
}
