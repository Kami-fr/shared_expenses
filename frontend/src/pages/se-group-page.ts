import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-balance-card";
import "../components/se-button";
import "../components/se-field";
import "../components/se-icon";
import "../components/se-menu-button";
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
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 3;
      }

      .page {
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
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
        z-index: 4;
      }

      /*
       * Under the toolbar it belongs to, wherever the page has been scrolled.
       *
       * Fixed, not absolute: absolute pinned it 64px from the top of the host,
       * which is as tall as the whole page — so once you had scrolled down, the
       * menu opened somewhere above the screen and never showed. The toolbar it
       * hangs from is sticky and always there, so this hangs from the viewport
       * too.
       */
      .menu {
        position: fixed;
        z-index: 5;
        top: 64px;
        left: 16px;
        right: 16px;
        max-width: 320px;
        max-height: calc(100dvh - 96px);
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
      <button role="menuitem" @click=${() => this.openDialog("group")}>
        ${translate("edit_group")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("member")}>
        ${translate("members")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("categories")}>
        ${translate("categories")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("statistics")}>
        ${translate("statistics")}
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
   * A payment, said the way its kind reads.
   *
   * The two are one movement of money and differ only in words, so the words
   * are the whole job here: a debt shown as "Dupont → Michel" reads as Dupont
   * having paid, which is true of a loan and nonsense for a debt somebody is
   * only writing down.
   */
  private renderPayment(payment: Payment) {
    const from = this.memberById(payment.from_member_id);
    const to = this.memberById(payment.to_member_id);
    const debt = payment.kind === "debt";

    // Whoever the line is about. On a reimbursement that is the one whose money
    // left; on a debt, the one who owes it — a debt is somebody's, and it is
    // theirs, not the lender's. Same member the title opens on, either way.
    const owner = debt ? to : from;
    const ownerId = debt ? payment.to_member_id : payment.from_member_id;
    const colour = owner?.color ?? colorFor(ownerId);

    return html`
      <button
        class="item item-button"
        style=${`border-left-color:${colour}`}
        @click=${() => this.openPayment(undefined, payment)}
      >
        <se-icon
          icon=${debt ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
          fallback=${debt ? "→" : "⇄"}
          .color=${colour}
          .size=${40}
        ></se-icon>
        <div class="info">
          <!--
            The arrow points at whoever ends up with the money, and it points
            that way on both: a reimbursement has sent it, a debt owes it.
            Which is why the names swap round — on a debt the one who will pay
            is the one who owes, and that is the member on the receiving end of
            the stored payment. The icon and the colour say which is which.
          -->
          <div class="title">
            ${debt
              ? html`${to?.name ?? "?"} → ${from?.name ?? "?"}`
              : html`${from?.name ?? "?"} → ${to?.name ?? "?"}`}
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
          <!--
            Red on a debt, the colour money owed already wears on the balance
            card. A reimbursement stays quiet: it is money that has landed,
            and nothing about it is outstanding.
          -->
          <span class="amount ${debt ? "negative" : "settled-amount"}">
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
        </div>
      </button>
    `;
  }




  private renderExpense(expense: Expense) {
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
          <span class="amount">
            ${formatMoney(expense.amount, expense.currency, this.language)}
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
                  expense.converted_amount,
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
          .openable=${this.openable()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
        ></se-history-dialog>
      `;
    }

    if (this.dialog === "group") {
      return html`
        <se-group-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
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
   * people — because that is what someone types: they look for "carrefour",
   * "antonin" or "essence" without thinking about which field it is.
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
      return [
        this.localize("a_settlement"),
        entry.payment.description ?? "",
        nameOf(entry.payment.from_member_id),
        nameOf(entry.payment.to_member_id),
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
    ]
      .join(" ")
      .toLowerCase();
  }

  /** Record the reimbursement a balance line stands for, filled in with it. */
  private settleUp = (event: CustomEvent) => {
    this.openPayment(event.detail.settlement);
  };

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
