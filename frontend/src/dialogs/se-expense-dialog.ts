import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import type { SharedExpensesApi, CreateExpenseInput } from "../services/api";
import {
  centsToInput,
  colorFor,
  dateToIso,
  formatMoney,
  initials,
  isoToDateInput,
  parseMoney,
  today,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { resolveShares } from "../services/splits";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Group, Member, SplitRule } from "../types";

/**
 * Dialog creating or editing an expense.
 *
 * Fires `expense-saved` on success and `expense-deleted` after a deletion.
 */
@customElement("se-expense-dialog")
export class SeExpenseDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  /** Set to edit an existing expense, leave out to create one. */
  @property({ attribute: false }) public expense?: Expense;

  @property({ type: String }) public language = "en";

  /** Named `expenseTitle` because `title` is taken by HTMLElement. */
  @state() private expenseTitle = "";

  @state() private amountInput = "";

  @state() private paidBy = "";

  @state() private date = today();

  @state() private categoryId = "";

  /** Members taking part. Unchecked means the expense is not theirs. */
  @state() private included: Set<string> = new Set();

  /** Typed amounts. Blank means an equal share of what is left. */
  @state() private amounts: Record<string, string> = {};

  @state() private busy = false;

  @state() private error?: string;

  @state() private confirmingDelete = false;

  public static styles = [
    sharedStyles,
    css`
      .split-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .split-hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }

      .reset {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 12px;
        cursor: pointer;
        font-family: inherit;
        padding: 0;
        text-align: right;
      }

      .table {
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        overflow: hidden;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
      }

      .member-row + .member-row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .member-row.excluded {
        opacity: 0.45;
      }

      .member-row .name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .member-row se-field {
        width: 104px;
        flex: 0 0 auto;
      }

      .resolved {
        width: 74px;
        text-align: right;
        font-size: 13px;
        flex: 0 0 auto;
      }

      .total {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    this.included = new Set(this.members.map((member) => member.id));

    if (!this.expense) {
      if (this.members.length > 0) {
        this.paidBy = this.members[0].id;
      }

      return;
    }

    this.expenseTitle = this.expense.title;
    this.amountInput = centsToInput(this.expense.amount);
    this.paidBy = this.expense.paid_by_member_id;
    this.date = isoToDateInput(this.expense.expense_date);
    this.categoryId = this.expense.category_id ?? "";

    // The stored shares are absolute, so an existing expense opens with every
    // amount spelled out: that is the only honest view of what was saved.
    const shares = (this.expense.shares ?? []).filter((s) => s.amount !== 0);

    this.included = new Set(shares.map((share) => share.member_id));
    this.amounts = Object.fromEntries(
      shares.map((share) => [share.member_id, centsToInput(share.amount)]),
    );
  }

  /** The rule the table describes: blanks share, typed amounts are fixed. */
  private buildRule(): SplitRule {
    const fixed: Record<string, number> = {};
    const participants: string[] = [];

    for (const member of this.members) {
      if (!this.included.has(member.id)) {
        continue;
      }

      const typed = parseMoney(this.amounts[member.id] ?? "");

      if (typed !== null && (this.amounts[member.id] ?? "").trim() !== "") {
        fixed[member.id] = typed;
      } else {
        participants.push(member.id);
      }
    }

    return { participants, fixed, cap: null, remainder: "payer" };
  }

  /** The rule of the category, then of the group, as the backend would pick. */
  private defaultRule(): SplitRule | null {
    const category = this.categories.find((c) => c.id === this.categoryId);

    return category?.split_rule ?? this.group.split_rule ?? null;
  }

  /** Shares the table resolves to, or null while the input is incomplete. */
  private resolved(amount: number | null): Record<string, number> | null {
    if (amount === null || !this.paidBy) {
      return null;
    }

    return resolveShares({
      amount,
      payerId: this.paidBy,
      memberIds: this.members.map((member) => member.id),
      rule: this.buildRule(),
    });
  }

  /** What the untouched category rule would give, shown as placeholders. */
  private suggested(amount: number | null): Record<string, number> | null {
    const rule = this.defaultRule();

    if (rule === null || amount === null || !this.paidBy) {
      return null;
    }

    return resolveShares({
      amount,
      payerId: this.paidBy,
      memberIds: this.members.map((member) => member.id),
      rule,
    });
  }

  protected render() {
    const translate = this.localize;
    const amount = parseMoney(this.amountInput);

    const heading = this.expense ? translate("edit_expense") : translate("new_expense");

    return html`
      <se-dialog open heading=${heading} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <se-field
            .label=${translate("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(e: CustomEvent) => (this.expenseTitle = e.detail.value)}
          ></se-field>

          <se-field
            .label=${translate("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            required
            decimal
            placeholder="85,42"
            @value-changed=${(e: CustomEvent) => (this.amountInput = e.detail.value)}
          ></se-field>

          <se-select
            .label=${translate("paid_by")}
            .value=${this.paidBy}
            .options=${this.members.map((m) => ({ value: m.id, label: m.name }))}
            @value-changed=${(e: CustomEvent) => (this.paidBy = e.detail.value)}
          ></se-select>

          <se-field
            .label=${translate("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(e: CustomEvent) => (this.date = e.detail.value)}
          ></se-field>

          <se-select
            .label=${translate("category")}
            .value=${this.categoryId}
            .placeholder=${translate("no_category")}
            .options=${this.categories.map((c) => ({ value: c.id, label: c.name }))}
            @value-changed=${(e: CustomEvent) => (this.categoryId = e.detail.value)}
          ></se-select>

          ${this.renderSplit(amount)}
        </div>

        ${this.expense
          ? html`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deleteExpense}
              >
                ${this.confirmingDelete ? translate("confirm_delete") : translate("delete")}
              </se-button>
              <span slot="actions" class="spacer"></span>
            `
          : nothing}
        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || !this.isValid(amount)}
          @click=${this.submit}
        >
          ${this.expense ? translate("save") : translate("create")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderSplit(amount: number | null) {
    const translate = this.localize;
    const resolved = this.resolved(amount);
    const suggested = this.suggested(amount);
    const total = resolved
      ? Object.values(resolved).reduce((sum, value) => sum + value, 0)
      : null;

    return html`
      <div>
        <div class="split-head">
          <label class="muted">${translate("split")}</label>
          ${this.renderRuleNote(suggested)}
        </div>

        <div class="split-hint">${translate("split_table_hint")}</div>

        <div class="table">
          ${this.members.map((member) => this.renderMemberRow(member, resolved, suggested))}
        </div>

        ${amount !== null
          ? html`
              <div class="total">
                <span class="muted">${translate("split_total")}</span>
                <span class=${`amount ${total === amount ? "positive" : "negative"}`}>
                  ${formatMoney(total ?? 0, this.group.currency, this.language)}
                  ${total === amount ? " ✓" : ` / ${formatMoney(amount, this.group.currency, this.language)}`}
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  /** Tell where the suggested amounts come from, and offer to go back to them. */
  private renderRuleNote(suggested: Record<string, number> | null) {
    if (suggested === null) {
      return nothing;
    }

    const category = this.categories.find((c) => c.id === this.categoryId);
    const source = category ? category.name : this.localize("group_rule");

    return html`
      <button class="reset" @click=${this.applyDefaultRule}>
        ${this.localize("apply_rule")} ${source}
      </button>
    `;
  }

  private renderMemberRow(
    member: Member,
    resolved: Record<string, number> | null,
    suggested: Record<string, number> | null,
  ) {
    const included = this.included.has(member.id);
    const share = resolved?.[member.id] ?? 0;
    const typed = (this.amounts[member.id] ?? "").trim() !== "";

    // An untouched row shows what the rule would give, in grey: the figure is
    // real, and typing over it replaces it.
    const hint = suggested?.[member.id];
    const placeholder =
      !typed && hint !== undefined ? centsToInput(hint) : "";

    return html`
      <div class=${`member-row ${included ? "" : "excluded"}`}>
        <input
          type="checkbox"
          .checked=${included}
          @change=${() => this.toggleMember(member.id)}
        />
        ${this.renderAvatar(member)}
        <span class="name">${member.name}</span>
        <se-field
          .value=${this.amounts[member.id] ?? ""}
          .suffix=${this.group.currency}
          .disabled=${!included}
          decimal
          placeholder=${placeholder || "—"}
          @value-changed=${(e: CustomEvent) => this.setAmount(member.id, e.detail.value)}
        ></se-field>
        <span class="resolved amount">
          ${included && resolved
            ? formatMoney(share, this.group.currency, this.language)
            : "—"}
        </span>
      </div>
    `;
  }

  private renderAvatar(member: Member) {
    return html`
      <div class="avatar" style=${`background:${member.color ?? colorFor(member.id)}`}>
        ${initials(member.name)}
      </div>
    `;
  }

  private toggleMember(memberId: string) {
    const next = new Set(this.included);

    if (next.has(memberId)) {
      next.delete(memberId);
      // Keep the typed amount out of the way while the member is excluded.
      const { [memberId]: _dropped, ...rest } = this.amounts;
      this.amounts = rest;
    } else {
      next.add(memberId);
    }

    this.included = next;
  }

  private setAmount(memberId: string, value: string) {
    this.amounts = { ...this.amounts, [memberId]: value };
  }

  /** Clear every typed amount so the category rule drives the table again. */
  private applyDefaultRule = () => {
    this.included = new Set(this.members.map((member) => member.id));
    this.amounts = {};
  };

  private isValid(amount: number | null): boolean {
    if (this.expenseTitle.trim() === "" || amount === null || amount <= 0) {
      return false;
    }

    if (!this.paidBy || this.included.size === 0) {
      return false;
    }

    // The table is valid exactly when it resolves: the resolver already checks
    // that the fixed amounts fit and that the shares add up.
    return this.resolved(amount) !== null;
  }

  private cancel = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };

  private submit = async () => {
    const amount = parseMoney(this.amountInput);

    if (amount === null) {
      return;
    }

    this.busy = true;
    this.error = undefined;

    const input: CreateExpenseInput = {
      group_id: this.group.id,
      title: this.expenseTitle.trim(),
      amount,
      paid_by_member_id: this.paidBy,
      expense_date: dateToIso(this.date),
      category_id: this.categoryId || null,
    };

    // Send the shares the table shows rather than the rule behind them: what
    // you see is what gets stored, and the resolver already agreed with the
    // backend on every cent.
    const resolved = this.resolved(amount);

    if (resolved === null) {
      this.busy = false;
      return;
    }

    input.shares = Object.entries(resolved).map(([member_id, value]) => ({
      member_id,
      amount: value,
    }));

    try {
      const expense = this.expense
        ? await this.api.updateExpense(this.expense.id, {
            title: input.title,
            amount: input.amount,
            paid_by_member_id: input.paid_by_member_id,
            expense_date: input.expense_date,
            category_id: input.category_id,
            shares: input.shares,
            split_rule: input.split_rule,
          })
        : await this.api.createExpense(input);

      this.dispatchEvent(
        new CustomEvent("expense-saved", {
          detail: { expense },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };

  /** Named `deleteExpense` because `remove` is taken by HTMLElement. */
  private deleteExpense = async () => {
    if (!this.expense) {
      return;
    }

    // Deleting an expense cannot be undone: ask once, in place.
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      return;
    }

    this.busy = true;
    this.error = undefined;

    try {
      await this.api.deleteExpense(this.expense.id);

      this.dispatchEvent(
        new CustomEvent("expense-deleted", { bubbles: true, composed: true }),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
      this.confirmingDelete = false;
    } finally {
      this.busy = false;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-expense-dialog": SeExpenseDialog;
  }
}
