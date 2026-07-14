import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-balance-card";
import "../components/se-button";
import "../components/se-icon";
import "../components/se-quick-actions";
import "../dialogs/se-category-dialog";
import "../dialogs/se-expense-dialog";
import "../dialogs/se-member-dialog";
import "../dialogs/se-payment-dialog";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, formatDate, formatMoney, initials } from "../services/format";
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

type Tab = "overview" | "expenses" | "settlements" | "members" | "categories";

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

const RECENT_ACTIVITY = 5;

/** Detail of a group: balances, expenses and members. */
@customElement("se-group-page")
export class SeGroupPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public language = "en";

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

  @state() private dialog?: "expense" | "payment" | "member" | "category";

  @state() private prefill?: Settlement;

  @state() private editedCategory?: Category;

  @state() private editedExpense?: Expense;

  @state() private busy = false;

  @state() private confirmingDelete = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .back {
        background: none;
        border: none;
        color: var(--primary-text-color);
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
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

      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
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

      .item-button {
        border: none;
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

      .actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 8px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
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
        color: var(--secondary-text-color);
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
        color: var(--primary-text-color);
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .icon:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 4;
      }

      .menu {
        position: absolute;
        z-index: 5;
        top: 56px;
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

      .link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        cursor: pointer;
        font-family: inherit;
      }

      .settled-amount {
        color: var(--se-positive);
      }

      .payer {
        font-size: 13px;
        margin-top: 2px;
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
      <div class="stack">
        ${this.renderHeader()}

        ${this.group.archived
          ? html`<div class="banner">${translate("archived_hint")}</div>`
          : nothing}

        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

        <div class="tabs" role="tablist">
          ${this.renderTab("overview", translate("tab_overview"))}
          ${this.renderTab("expenses", translate("tab_expenses"))}
          ${this.renderTab("settlements", translate("tab_settlements"))}
          ${this.renderTab("members", translate("tab_members"))}
          ${this.renderTab("categories", translate("tab_categories"))}
        </div>

        ${this.renderTabContent()}
      </div>

      ${this.renderDialog()}
    `;
  }

  private renderHeader() {
    const translate = this.localize;
    const group = this.group!;

    return html`
      <div class="header">
        <button class="back" @click=${this.goBack} aria-label=${translate("back")}>
          ‹
        </button>

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
          aria-label=${translate("members")}
          @click=${() => (this.dialog = "member")}
        >
          👥
        </button>
        <button
          class="icon"
          aria-label=${translate("more")}
          @click=${() => this.openMenu("more")}
        >
          ⋮
        </button>

        ${this.menu ? this.renderMenu() : nothing}
      </div>

      ${group.archived
        ? html`<div class="banner">${translate("archived_hint")}</div>`
        : nothing}
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
      <button role="menuitem" ?disabled=${this.busy} @click=${this.toggleArchive}>
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

    if (this.tab === "settlements") {
      return this.renderSettlements();
    }

    if (this.tab === "categories") {
      return this.renderCategories();
    }

    return this.renderMembers();
  }

  private renderOverview() {
    const translate = this.localize;

    return html`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .members=${this.pastMembers}
        .currency=${this.group!.currency}
        .language=${this.language}
      ></se-balance-card>

      <div class="card">
        <se-quick-actions
          .actions=${[
            {
              key: "expense",
              label: translate("action_add_expense"),
              symbol: "+",
              color: "#2b7fd4",
            },
            {
              key: "member",
              label: translate("action_members"),
              symbol: "👥",
              color: "#3f8a4a",
            },
            {
              key: "payment",
              label: translate("action_settle"),
              symbol: "⇄",
              color: "#c9871f",
            },
            {
              key: "category",
              label: translate("tab_categories"),
              symbol: "🏷",
              color: "#8b5fbf",
            },
          ]}
          @action=${this.handleQuickAction}
        ></se-quick-actions>
      </div>

      <div class="card">
        <div class="section-head">
          <h3>${translate("recent_activity")}</h3>
          ${this.activity().length > RECENT_ACTIVITY
            ? html`<button class="link" @click=${() => (this.tab = "expenses")}>
                ${translate("see_all")}
              </button>`
            : nothing}
        </div>
        ${this.renderActivity()}
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

    return entries
      .slice(0, RECENT_ACTIVITY)
      .map((entry) =>
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

      <div class="actions">
        <se-button @click=${() => this.openPayment()}>
          ${translate("new_payment")}
        </se-button>
      </div>
    `;
  }

  private renderPayment(payment: Payment) {
    const from = this.memberById(payment.from_member_id);
    const to = this.memberById(payment.to_member_id);

    return html`
      <div class="item">
        <se-icon
          icon="mdi:swap-horizontal"
          fallback="⇄"
          color="#c9871f"
          .size=${40}
        ></se-icon>
        <div class="info">
          <div class="title">${from?.name ?? "?"} → ${to?.name ?? "?"}</div>
          <div class="muted">
            ${formatDate(payment.payment_date, this.language)} ·
            ${this.localize("a_settlement")}
          </div>
        </div>
        <div class="tail">
          <span class="amount settled-amount">
            ${formatMoney(payment.amount, this.group!.currency, this.language)}
          </span>
        </div>
      </div>
    `;
  }

  private handleQuickAction = (event: CustomEvent) => {
    const key = event.detail.key;

    if (key === "expense") {
      this.openExpense();
    } else if (key === "payment") {
      this.openPayment();
    } else if (key === "member") {
      this.tab = "members";
    } else {
      this.tab = "categories";
    }
  };

  private renderCategories() {
    const translate = this.localize;

    return html`
      <div class="card">
        ${this.categories.length === 0
          ? html`<div class="empty">${translate("no_categories")}</div>`
          : this.categories.map((category) => this.renderCategory(category))}
      </div>

      <div class="actions">
        <se-button @click=${() => this.openCategory()}>
          ${translate("new_category")}
        </se-button>
      </div>
    `;
  }

  private renderCategory(category: Category) {
    return html`
      <button class="item item-button" @click=${() => this.openCategory(category)}>
        <div class="avatar" style=${`background:${category.color ?? colorFor(category.id)}`}>
          ${category.name.charAt(0).toUpperCase()}
        </div>
        <div class="info">
          <div class="title">${category.name}</div>
          <div class="muted">${this.describeRule(category)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }

  /** Summarize a split rule in one line, for the category list. */
  private describeRule(category: Category): string {
    const envelope = category.split_rule?.envelope;

    // No envelope means the whole expense is shared: the plain equal split.
    if (envelope == null) {
      return this.localize("rule_equal");
    }

    const shared = formatMoney(envelope, this.group!.currency, this.language);

    return `${this.localize("rule_shares")} ${shared}`;
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

      <div class="actions">
        <se-button @click=${() => this.openExpense()}>
          ${translate("new_expense")}
        </se-button>
      </div>
    `;
  }

  private renderExpense(expense: Expense) {
    const payer = this.memberById(expense.paid_by_member_id);
    const category = this.categories.find((c) => c.id === expense.category_id);
    const payerColor = payer?.color ?? colorFor(expense.paid_by_member_id);

    return html`
      <button class="item item-button" @click=${() => this.openExpense(expense)}>
        <se-icon
          .icon=${category?.icon}
          .fallback=${(category?.name ?? expense.title).charAt(0).toUpperCase()}
          .color=${category?.color ?? colorFor(category?.id ?? expense.id)}
        ></se-icon>
        <div class="info">
          <div class="title">${expense.title}</div>
          <div class="muted">
            ${formatDate(expense.expense_date, this.language)}
            ${category ? html` · ${category.name}` : nothing}
          </div>
          <div class="payer" style=${`color:${payerColor}`}>
            ${this.localize("paid_by")} ${payer?.name ?? "?"}
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

  private renderMembers() {
    const translate = this.localize;

    return html`
      <div class="card">
        ${this.members.length === 0
          ? html`<div class="empty">${translate("no_members")}</div>`
          : this.members.map(
              (member) => html`
                <div class="item">
                  ${this.renderAvatar(member.name, member.id)}
                  <div class="info">
                    <div class="title">${member.name}</div>
                    ${member.user_id === null
                      ? html`<div class="muted">${translate("no_account")}</div>`
                      : nothing}
                  </div>
                </div>
              `,
            )}
      </div>

      <div class="actions">
        <se-button variant="text" @click=${() => (this.dialog = "member")}>
          ${translate("new_member")}
        </se-button>
      </div>
    `;
  }

  private renderAvatar(name: string, id: string) {
    const member = this.memberById(id);

    return html`
      <div class="avatar" style=${`background:${member?.color ?? colorFor(id)}`}>
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
          .members=${this.members}
          .categories=${this.categories}
          .expense=${this.editedExpense}
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
          .members=${this.members}
          .settlement=${this.prefill}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-created=${this.handleChanged}
        ></se-payment-dialog>
      `;
    }

    if (this.dialog === "category") {
      return html`
        <se-category-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .category=${this.editedCategory}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @category-saved=${this.handleChanged}
        ></se-category-dialog>
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

  private openPayment(settlement?: Settlement) {
    this.prefill = settlement;
    this.dialog = "payment";
  }

  private openCategory(category?: Category) {
    this.editedCategory = category;
    this.dialog = "category";
  }

  private openExpense(expense?: Expense) {
    this.editedExpense = expense;
    this.dialog = "expense";
  }

  private closeDialog = () => {
    this.dialog = undefined;
    this.prefill = undefined;
    this.editedCategory = undefined;
    this.editedExpense = undefined;
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
