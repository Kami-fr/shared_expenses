import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../dialogs/se-expense-dialog";
import "../dialogs/se-member-dialog";
import "../dialogs/se-payment-dialog";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, formatDate, formatMoney, formatSignedMoney, initials } from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Group, GroupBalances, Member, Settlement } from "../types";

type Tab = "balances" | "expenses" | "members";

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

  @state() private result?: GroupBalances;

  @state() private tab: Tab = "balances";

  @state() private loading = true;

  @state() private error?: string;

  @state() private dialog?: "expense" | "payment" | "member";

  @state() private prefill?: Settlement;

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
          ${this.renderTab("balances", translate("tab_balances"))}
          ${this.renderTab("expenses", translate("tab_expenses"))}
          ${this.renderTab("members", translate("tab_members"))}
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
    if (this.tab === "balances") {
      return this.renderBalances();
    }

    if (this.tab === "expenses") {
      return this.renderExpenses();
    }

    return this.renderMembers();
  }

  private renderBalances() {
    const translate = this.localize;
    const currency = this.group!.currency;
    const settlements = this.result?.settlements ?? [];

    return html`
      <div class="card">
        ${(this.result?.balances ?? []).map((balance) => {
          const member = this.memberById(balance.member_id);

          return html`
            <div class="item">
              ${this.renderAvatar(member?.name ?? "?", balance.member_id)}
              <div class="info"><div class="title">${member?.name ?? "?"}</div></div>
              <span
                class=${`amount ${balance.amount > 0 ? "positive" : balance.amount < 0 ? "negative" : "muted"}`}
              >
                ${formatSignedMoney(balance.amount, currency, this.language)}
              </span>
            </div>
          `;
        })}
      </div>

      <div class="card">
        <h3 class="section-title">${translate("reimbursements")}</h3>
        ${settlements.length === 0
          ? html`<div class="empty">${translate("balance_settled")}</div>`
          : settlements.map((settlement) => this.renderSettlement(settlement))}
      </div>

      <div class="actions">
        <se-button variant="text" @click=${() => this.openPayment()}>
          ${translate("new_payment")}
        </se-button>
      </div>
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

      <div class="actions">
        <se-button @click=${() => (this.dialog = "expense")}>
          ${translate("new_expense")}
        </se-button>
      </div>
    `;
  }

  private renderExpense(expense: Expense) {
    const payer = this.memberById(expense.paid_by_member_id);
    const category = this.categories.find((c) => c.id === expense.category_id);

    return html`
      <div class="item">
        ${this.renderAvatar(payer?.name ?? "?", expense.paid_by_member_id)}
        <div class="info">
          <div class="title">${expense.title}</div>
          <div class="muted">
            ${this.localize("paid_by")} ${payer?.name ?? "?"} ·
            ${formatDate(expense.expense_date, this.language)}
            ${category ? html` · ${category.name}` : nothing}
          </div>
        </div>
        <span class="amount">
          ${formatMoney(expense.amount, expense.currency, this.language)}
        </span>
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
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @expense-created=${this.handleChanged}
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
      const [group, members, categories, expenses, result] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listMembers(this.groupId, true),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.getBalances(this.groupId),
      ]);

      this.group = group;
      this.members = members;
      this.categories = categories;
      this.expenses = expenses;
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

  private closeDialog = () => {
    this.dialog = undefined;
    this.prefill = undefined;
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
