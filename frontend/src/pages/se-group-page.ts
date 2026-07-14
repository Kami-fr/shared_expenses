import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/se-balance-card";
import "../components/se-button";
import "../components/se-icon";
import "../components/se-menu-button";
import "../components/se-statistics";
import "../dialogs/se-categories-dialog";
import "../dialogs/se-expense-dialog";
import "../dialogs/se-history-dialog";
import "../dialogs/se-member-dialog";
import "../dialogs/se-payment-dialog";
import type { SharedExpensesApi } from "../services/api";
import {
  colorFor,
  formatDayDate,
  formatMoney,
  initials,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type {
  Category,
  Expense,
  Group,
  GroupBalances,
  Member,
  Payment,
  Settlement,
} from "../types";

type Tab = "overview" | "expenses" | "settlements" | "statistics";

type Dialog = "expense" | "payment" | "member" | "categories" | "history";

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

/** Left to right, as the bar shows them: a swipe has to follow the eye. */
const TABS: Tab[] = ["overview", "expenses", "settlements", "statistics"];

/** How far a finger travels before it means to change tab, in pixels. */
const SWIPE_MIN = 60;

/**
 * How much of the screen edge is left to Home Assistant.
 *
 * It opens its sidebar on a swipe from there, and losing the way out of the
 * panel would cost more than a tab change is worth.
 */
const SWIPE_EDGE = 24;

/** Detail of a group: balances, expenses and members. */
@customElement("se-group-page")
export class SeGroupPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public language = "en";

  /** The Home Assistant account looking at the panel, to know who "you" is. */
  @property({ type: String }) public userId: string | null = null;

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

  @state() private categories: Category[] = [];

  @state() private expenses: Expense[] = [];

  @state() private payments: Payment[] = [];

  @state() private result?: GroupBalances;

  @state() private tab: Tab = "overview";

  @state() private loading = true;

  @state() private error?: string;

  @state() private dialog?: Dialog;

  @state() private prefill?: Settlement;

  @state() private editedExpense?: Expense;

  @state() private editedPayment?: Payment;

  /** Where a swipe began. Plain state: no render depends on it mid-gesture. */
  private swipeFrom?: { x: number; y: number };

  @state() private busy = false;

  @state() private confirmingDelete = false;

  /**
   * Bumped on every successful load.
   *
   * The statistics fetch their own figures rather than deriving them from
   * what is here, so they need telling when the data moved under them.
   */
  @state() private version = 0;

  public static styles = [
    sharedStyles,
    css`
      /*
       * A column filling the screen, so the gesture area does too.
       *
       * The swipe zone used to be as tall as whatever the tab held: below a
       * short list the empty space belonged to the page, and a finger landing
       * there found nothing listening. The height is handed down from here to
       * .swipe so the emptiness is part of the tab, which is what it looks like.
       *
       * dvh, not vh: on a phone vh counts the address bar even while it is
       * showing, which would leave the page scrolling by its height for nothing.
       */
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        position: relative;
      }

      /*
       * The banner every other Home Assistant panel wears. Its colours come
       * from the theme: hard-coding a grey would look wrong the moment someone
       * picks a theme that is not the default.
       */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 3;
      }

      /* Takes what the toolbar leaves, and passes it on to the stack. */
      .page {
        padding: 16px;
        max-width: 720px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .page > .stack {
        flex: 1;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 720px;
        margin: 0 auto;
        padding: 8px 16px;
        min-height: 64px;
        box-sizing: border-box;
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /*
       * Carries the gesture, and the layout the tab content had when it was a
       * child of the stack itself: a wrapper must not cost the spacing.
       *
       * touch-action is what makes the gesture arrive at all. Left to itself a
       * browser claims a sideways drag for its own back-and-forward navigation,
       * and once it does it cancels the touch rather than ending it — so
       * touchend never fires and the tab never changes. pan-y hands it the
       * vertical scroll and keeps the horizontal; pinch-zoom stays, because
       * taking zoom away from someone is not a trade worth making for a tab.
       */
      .swipe {
        display: flex;
        flex-direction: column;
        gap: var(--se-gap);
        touch-action: pan-y pinch-zoom;
        /* Down to the bottom of the screen: the empty part swipes too. */
        flex: 1;
      }

      .tabs button {
        flex: 1;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 12px 4px;
        font-size: 14px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .tabs button[aria-selected="true"] {
        color: var(--primary-color, #03a9f4);
        border-bottom-color: var(--primary-color, #03a9f4);
        font-weight: 500;
      }

      /*
       * The whole activity, scrolling inside the card.
       *
       * Capped at half the screen so the balance above and the tabs stay in
       * view: the overview would otherwise become a list you scroll past to
       * reach anything else. A short list simply does not fill it — max-height
       * asks for nothing.
       *
       * overscroll-behavior keeps a flick at the end of the list from carrying
       * on into the page behind it.
       */
      .scroller {
        max-height: 50vh;
        overflow-y: auto;
        overscroll-behavior: contain;
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

      .chevron {
        color: var(--secondary-text-color);
      }

      .settlement {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        font-size: 14px;
      }

      .settlement + .settlement {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
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
        transition: transform 0.12s ease;
      }

      .fab:hover {
        transform: scale(1.06);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 4;
      }

      .menu {
        position: absolute;
        z-index: 5;
        top: 64px;
        left: 16px;
        right: 16px;
        max-width: 320px;
        padding: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
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

      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 4px;
      }

      .settled-amount {
        color: var(--se-positive);
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
    void this.load();
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

          <div class="tabs" role="tablist">
            ${this.renderTab("overview", translate("tab_overview"))}
            ${this.renderTab("expenses", translate("tab_expenses"))}
            ${this.renderTab("settlements", translate("tab_settlements"))}
            ${this.renderTab("statistics", translate("tab_statistics"))}
          </div>

          <div
            class="swipe"
            @touchstart=${this.startSwipe}
            @touchend=${this.endSwipe}
            @touchcancel=${this.cancelSwipe}
          >
            ${this.renderTabContent()}
          </div>
        </div>
      </div>

      <button
        class="fab"
        aria-label=${this.addLabel()}
        title=${this.addLabel()}
        @click=${this.add}
      >
        <se-icon plain .icon=${"mdi:plus"} fallback="+" .size=${26}></se-icon>
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
          <se-menu-button></se-menu-button>

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

        </div>
      </div>
      ${this.menu ? this.renderMenu() : nothing}
    `;
  }

  private renderMenu() {
    // A click anywhere else closes it, so the menu never traps the page.
    return html`
      <div class="scrim" @click=${() => (this.menu = undefined)}></div>
      <div class="menu" role="menu">
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

  private renderMoreMenu() {
    const translate = this.localize;

    return html`
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${translate("members")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("categories")}>
        ${translate("categories")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${translate("group_history")}
      </button>
      <button
        role="menuitem"
        class="separated"
        ?disabled=${this.busy}
        @click=${this.toggleArchive}
      >
        ${this.group!.archived ? translate("restore") : translate("archive")}
      </button>
      <button
        role="menuitem"
        class="danger separated"
        ?disabled=${this.busy}
        @click=${this.deleteGroup}
      >
        ${this.confirmingDelete ? translate("confirm_delete") : translate("delete_group")}
      </button>
    `;
  }

  private openDialog(dialog: Dialog) {
    this.menu = undefined;
    this.dialog = dialog;
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

  private renderTab(tab: Tab, label: string) {
    return html`
      <button role="tab" aria-selected=${this.tab === tab} @click=${() => (this.tab = tab)}>
        ${label}
      </button>
    `;
  }

  private renderTabContent() {
    if (this.tab === "overview") {
      return this.renderOverview();
    }

    if (this.tab === "expenses") {
      return this.renderExpenses();
    }

    if (this.tab === "statistics") {
      return this.renderStatistics();
    }

    return this.renderSettlements();
  }

  /**
   * Keyed on the group, so switching group rebuilds it.
   *
   * It fetches once, on connect: without the key it would keep the figures of
   * the group you just left, which is worse than a moment of loading.
   */
  private renderStatistics() {
    return keyed(
      this.groupId,
      html`
        <se-statistics
          .api=${this.api}
          .localize=${this.localize}
          .groupId=${this.groupId}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .meId=${this.meId()}
          .version=${this.version}
          .currency=${this.group!.currency}
          .language=${this.language}
        ></se-statistics>
      `,
    );
  }

  private renderOverview() {
    const translate = this.localize;

    return html`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .settlements=${this.result?.settlements ?? []}
        .members=${this.pastMembers}
        .meId=${this.meId()}
        .currency=${this.group!.currency}
        .language=${this.language}
      ></se-balance-card>

      <div class="card">
        <div class="section-head">
          <h3>${translate("recent_activity")}</h3>
        </div>
        <!-- Everything, scrolling within the card rather than pushing the
             page down: the balance above stays put while you look back. -->
        <div class="scroller">${this.renderActivity()}</div>
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

  private renderActivity() {
    const entries = this.activity();

    if (entries.length === 0) {
      return html`<div class="empty">${this.localize("no_activity")}</div>`;
    }

    return entries.map((entry) =>
      entry.kind === "expense"
        ? this.renderExpense(entry.expense)
        : this.renderPayment(entry.payment),
    );
  }

  private renderSettlements() {
    const translate = this.localize;

    return html`
      <div class="card">
        <h3 class="section-title">${translate("reimbursements")}</h3>
        ${(this.result?.settlements ?? []).length === 0
          ? html`<div class="empty">${translate("balance_settled")}</div>`
          : this.result!.settlements.map((s) => this.renderSettlement(s))}
      </div>

      <div class="card">
        <h3 class="section-title">${translate("payments")}</h3>
        ${this.payments.length === 0
          ? html`<div class="empty">${translate("no_settlements")}</div>`
          : this.payments.map((payment) => this.renderPayment(payment))}
      </div>
    `;
  }

  private renderPayment(payment: Payment) {
    const from = this.memberById(payment.from_member_id);
    const to = this.memberById(payment.to_member_id);

    return html`
      <button
        class="item item-button"
        style=${`border-left-color:${from?.color ?? colorFor(payment.from_member_id)}`}
        @click=${() => this.openPayment(undefined, payment)}
      >
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          .color=${from?.color ?? colorFor(payment.from_member_id)}
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${from?.name ?? "?"} → ${to?.name ?? "?"}</div>
          <!-- Where an expense shows its category: same grid, same reading. -->
          <div class="muted">${this.localize("a_settlement")}</div>
          <div class="muted">
            ${formatDayDate(payment.payment_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${formatMoney(payment.amount, this.group!.currency, this.language)}
          </span>
        </div>
      </button>
    `;
  }




  private renderSettlement(settlement: Settlement) {
    const translate = this.localize;
    const from = this.memberById(settlement.from_member_id);
    const to = this.memberById(settlement.to_member_id);

    return html`
      <div class="settlement">
        <span>
          <strong>${from?.name ?? "?"}</strong> ${translate("owes")}
          <strong class="amount">
            ${formatMoney(settlement.amount, this.group!.currency, this.language)}
          </strong>
          ${translate("to")} <strong>${to?.name ?? "?"}</strong>
        </span>
        <span class="spacer"></span>
        <se-button variant="text" @click=${() => this.openPayment(settlement)}>
          ${translate("settle_up")}
        </se-button>
      </div>
    `;
  }

  private renderExpenses() {
    const translate = this.localize;

    return html`
      <div class="card">
        ${this.expenses.length === 0
          ? html`<div class="empty">${translate("no_expenses")}</div>`
          : this.expenses.map((expense) => this.renderExpense(expense))}
      </div>
    `;
  }

  private renderExpense(expense: Expense) {
    const translate = this.localize;
    const payer = this.memberById(expense.paid_by_member_id);
    const category = this.categories.find((c) => c.id === expense.category_id);

    return html`
      <button
        class="item item-button"
        style=${`border-left-color:${payer?.color ?? colorFor(expense.paid_by_member_id)}`}
        @click=${() => this.openExpense(expense)}
      >
        ${this.renderAvatar(
          payer?.name ?? "?",
          expense.paid_by_member_id,
          `${this.localize("paid_by")} ${payer?.name ?? "?"}`,
        )}
        <div class="info">
          <div class="title">
            ${expense.title}
            ${expense.description
              ? html`<span class="note">${expense.description}</span>`
              : nothing}
          </div>
          <div class="muted">
            ${category ? category.name : translate("no_category")}
          </div>
          <div class="muted">
            ${formatDayDate(expense.expense_date, this.language)}
          </div>
        </div>
        <div class="tail">
          <span class="amount">
            ${formatMoney(expense.amount, expense.currency, this.language)}
          </span>
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

          return html`
            <div
              class="avatar small"
              title=${member?.name ?? "?"}
              style=${`background:${member?.color ?? colorFor(share.member_id)}`}
            >
              ${initials(member?.name ?? "?")}
            </div>
          `;
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
  private renderAvatar(name: string, id: string, hint?: string) {
    const member = this.memberById(id);

    return html`
      <div
        class="avatar"
        title=${hint ?? name}
        style=${`background:${member?.color ?? colorFor(id)}`}
      >
        ${initials(name)}
      </div>
    `;
  }

  private renderDialog() {
    if (!this.dialog || !this.group) {
      return nothing;
    }

    if (this.dialog === "expense") {
      return html`
        <se-expense-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersFor(this.editedExpense)}
          .categories=${this.categories}
          .expense=${this.editedExpense}
          .meId=${this.meId()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @expense-saved=${this.handleChanged}
          @expense-deleted=${this.handleChanged}
        ></se-expense-dialog>
      `;
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
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-saved=${this.handleChanged}
          @payment-deleted=${this.handleChanged}
        ></se-payment-dialog>
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
          .openable=${this.openable()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
        ></se-history-dialog>
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
        .localize=${this.localize}
        .groupId=${this.groupId}
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
        categories,
        expenses,
        payments,
        result,
      ] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listGroups(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, true),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId),
      ]);

      this.group = group;
      this.groups = groups;
      this.members = members;
      this.pastMembers = pastMembers;
      this.categories = categories;
      this.expenses = expenses;
      this.payments = payments;
      this.result = result;
      this.version += 1;
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
    }
  }

  /**
   * Change tab on a swipe, leaving a scroll alone.
   *
   * Measured from where the finger started to where it left: following it live
   * would mean fighting the browser for the vertical scroll on every move.
   * Two conditions keep the two gestures apart — far enough sideways, and
   * decidedly more sideways than down.
   */
  private startSwipe = (event: TouchEvent) => {
    const touch = event.touches[0];

    // Pinching, or starting where Home Assistant expects its own gesture.
    if (event.touches.length !== 1 || touch.clientX < SWIPE_EDGE) {
      this.swipeFrom = undefined;
      return;
    }

    this.swipeFrom = { x: touch.clientX, y: touch.clientY };
  };

  private endSwipe = (event: TouchEvent) => {
    const from = this.swipeFrom;

    this.swipeFrom = undefined;

    if (!from) {
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;

    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 2) {
      return;
    }

    const next = TABS.indexOf(this.tab) + (dx < 0 ? 1 : -1);

    // Stop at the ends rather than wrapping: the tabs are a row, not a loop.
    if (next >= 0 && next < TABS.length) {
      this.tab = TABS[next];
    }
  };

  private cancelSwipe = () => {
    this.swipeFrom = undefined;
  };

  /**
   * What the plus adds, which is whatever the tab you are on is about.
   *
   * It is the only button of the page now: the tabs used to end on one of their
   * own, saying the same thing twice, and the second one had to be scrolled to.
   * On the overview, where both belong, an expense wins — it is the one you
   * come back to enter.
   */
  private add = () => {
    if (this.tab === "settlements") {
      this.openPayment();
      return;
    }

    this.openExpense();
  };

  private addLabel(): string {
    return this.tab === "settlements"
      ? this.localize("new_payment")
      : this.localize("action_add_expense");
  }

  /** What the journal can still send you to: everything not deleted. */
  private openable(): Set<string> {
    return new Set([
      ...this.expenses.map((expense) => expense.id),
      ...this.payments.map((payment) => payment.id),
    ]);
  }

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

  /** A suggested settlement to record, or a recorded payment to correct. */
  private openPayment(settlement?: Settlement, payment?: Payment) {
    this.prefill = settlement;
    this.editedPayment = payment;
    this.dialog = "payment";
  }

  private openExpense(expense?: Expense) {
    this.editedExpense = expense;
    this.dialog = "expense";
  }

  private closeDialog = () => {
    this.dialog = undefined;
    this.prefill = undefined;
    this.editedExpense = undefined;
    this.editedPayment = undefined;
  };

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
