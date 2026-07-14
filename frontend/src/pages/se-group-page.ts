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

const RECENT_EXPENSES = 4;

/** Detail of a group: balances, expenses and members. */
@customElement("se-group-page")
export class SeGroupPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public language = "en";

  @state() private group?: Group;

  @state() private members: Member[] = [];

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

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
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

      .section-title {
        padding: 12px 16px 4px;
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
        <div class="header">
          <button class="back" @click=${this.goBack} aria-label=${translate("back")}>‹</button>
          <h1>${this.group.name}</h1>
        </div>

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
        .members=${this.members}
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
          <h3>${translate("recent_expenses")}</h3>
          ${this.expenses.length > RECENT_EXPENSES
            ? html`<button class="link" @click=${() => (this.tab = "expenses")}>
                ${translate("see_all")}
              </button>`
            : nothing}
        </div>
        ${this.expenses.length === 0
          ? html`<div class="empty">${translate("no_expenses")}</div>`
          : this.expenses
              .slice(0, RECENT_EXPENSES)
              .map((expense) => this.renderExpense(expense))}
      </div>
    `;
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
          <div class="muted">${formatDate(payment.payment_date, this.language)}</div>
        </div>
        <span class="amount">
          ${formatMoney(payment.amount, this.group!.currency, this.language)}
        </span>
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
    const rule = category.split_rule;

    if (!rule || rule.cap === null) {
      return this.localize("rule_equal");
    }

    const cap = formatMoney(rule.cap, this.group!.currency, this.language);

    return `${this.localize("rule_capped")} ${cap}`;
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
                  <div class="info"><div class="title">${member.name}</div></div>
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
        @member-created=${this.handleChanged}
      ></se-member-dialog>
    `;
  }

  private memberById(id: string): Member | undefined {
    return this.members.find((member) => member.id === id);
  }

  private async load() {
    this.error = undefined;

    try {
      const [group, members, categories, expenses, payments, result] =
        await Promise.all([
          this.api.getGroup(this.groupId),
          this.api.listMembers(this.groupId, true),
          this.api.listCategories(this.groupId),
          this.api.listExpenses(this.groupId),
          this.api.listPayments(this.groupId),
          this.api.getBalances(this.groupId),
        ]);

      this.group = group;
      this.members = members;
      this.categories = categories;
      this.expenses = expenses;
      this.payments = payments;
      this.result = result;
    } catch (error) {
      this.error = errorMessage(error, this.localize);
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

  private goBack = () => {
    this.dispatchEvent(new CustomEvent("navigate-back", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-group-page": SeGroupPage;
  }
}
