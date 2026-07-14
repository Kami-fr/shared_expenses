import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import "../components/se-split-rule-editor";
import type { CreateExpenseInput, SharedExpensesApi } from "../services/api";
import {
  centsToInput,
  dateToIso,
  formatMoney,
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

  @state() private description = "";

  @state() private amountInput = "";

  @state() private paidBy = "";

  @state() private date = today();

  @state() private categoryId = "";

  /** The split, as the editor last reported it. */
  @state() private rule: SplitRule | null = null;

  @state() private busy = false;

  @state() private error?: string;

  @state() private confirmingDelete = false;

  /** The split editor is open. Collapsed, only its result shows.  */
  @state() private editingSplit = false;

  /** The description field is showing. Hidden until asked for, or filled. */
  @state() private showDescription = false;

  public static styles = [
    sharedStyles,
    css`
      /* Two per row where they fit; one per row when the screen is narrow. */
      .pair {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 380px) {
        .pair {
          grid-template-columns: 1fr;
        }
      }

      .split-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
        padding: 0;
      }

      .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        font-size: 13px;
        padding: 6px 0 2px;
      }

      .who strong {
        font-variant-numeric: tabular-nums;
        margin-left: 4px;
      }

      .editor[hidden] {
        display: none;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    if (!this.expense) {
      if (this.members.length > 0) {
        this.paidBy = this.members[0].id;
      }

      return;
    }

    this.expenseTitle = this.expense.title;
    this.description = this.expense.description ?? "";
    this.amountInput = centsToInput(this.expense.amount);
    this.paidBy = this.expense.paid_by_member_id;
    this.date = isoToDateInput(this.expense.expense_date);
    this.categoryId = this.expense.category_id ?? "";

    // The rule it was actually filled in with, kept alongside the shares. It
    // names its members, so re-resolving gives the stored shares back and
    // whoever joined since stays out of it.
    this.rule = this.expense.split_rule ?? this.ruleFromStoredShares();
    this.showDescription = this.description !== "";
  }

  /**
   * Reproduce the stored shares as a rule.
   *
   * Only for expenses saved before the rule was kept: spelling every amount out
   * is the one reading that cannot be wrong.
   */
  private ruleFromStoredShares(): SplitRule | null {
    const shares = (this.expense?.shares ?? []).filter((s) => s.amount !== 0);

    if (shares.length === 0) {
      return null;
    }

    return {
      envelope: 0,
      remainder: {
        members: shares.map((share) => share.member_id),
        fixed: Object.fromEntries(
          shares.map((share) => [share.member_id, share.amount]),
        ),
      },
    };
  }

  /** The rule of the category, then of the group, as the backend would pick. */
  private defaultRule(): SplitRule | null {
    const category = this.categories.find((c) => c.id === this.categoryId);

    return category?.split_rule ?? this.group.split_rule ?? null;
  }

  /**
   * The shares the split comes out as.
   *
   * Resolved from this dialog's own state rather than asked of the editor:
   * during a render the editor still holds the previous amount, so it would
   * answer one keystroke behind. Same resolver either way — the one the backend
   * is checked against.
   */
  private resolved(amount: number | null): Record<string, number> | null {
    if (amount === null || !this.paidBy || this.members.length === 0) {
      return null;
    }

    return resolveShares({
      amount,
      payerId: this.paidBy,
      memberIds: this.members.map((member) => member.id),
      rule: this.rule ?? this.defaultRule(),
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

          <div class="pair">
            <se-field
              .label=${translate("amount")}
              .value=${this.amountInput}
              .suffix=${this.group.currency}
              required
              decimal
              placeholder="85,42"
              @value-changed=${(e: CustomEvent) => (this.amountInput = e.detail.value)}
            ></se-field>

            <se-field
              .label=${translate("date")}
              type="date"
              .value=${this.date}
              @value-changed=${(e: CustomEvent) => (this.date = e.detail.value)}
            ></se-field>
          </div>

          <div class="pair">
            <se-select
              .label=${translate("paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((m) => ({ value: m.id, label: m.name }))}
              @value-changed=${(e: CustomEvent) => (this.paidBy = e.detail.value)}
            ></se-select>

            <se-select
              .label=${translate("category")}
              .value=${this.categoryId}
              .placeholder=${translate("no_category")}
              .options=${this.categories.map((c) => ({ value: c.id, label: c.name }))}
              @value-changed=${this.pickCategory}
            ></se-select>
          </div>

          ${this.showDescription
            ? html`
                <se-field
                  .label=${translate("description")}
                  .value=${this.description}
                  placeholder=${translate("description_placeholder")}
                  @value-changed=${(e: CustomEvent) =>
                    (this.description = e.detail.value)}
                ></se-field>
              `
            : html`
                <button class="link" @click=${() => (this.showDescription = true)}>
                  + ${translate("add_description")}
                </button>
              `}

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
                ${this.confirmingDelete
                  ? translate("confirm_delete")
                  : translate("delete")}
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

  /**
   * The split: its result always, its controls on request.
   *
   * The editor is the tallest thing here and the least often touched, since the
   * category rule usually does the job. So it stays folded away — but what it
   * resolves to is always on screen, because that is the part you must see
   * before saving.
   */
  private renderSplit(amount: number | null) {
    const translate = this.localize;

    return html`
      <div>
        <div class="split-head">
          <label class="muted">${translate("split")}</label>
          <button class="link" @click=${() => (this.editingSplit = !this.editingSplit)}>
            ${this.editingSplit ? translate("done") : translate("edit_split")}
          </button>
        </div>

        ${this.editingSplit ? nothing : this.renderSummary(amount)}

        <!-- Kept mounted while folded: it owns the rule and resolves it. -->
        <div class="editor" ?hidden=${!this.editingSplit}>
          ${this.renderEditor(amount)}
        </div>
      </div>
    `;
  }

  private renderSummary(amount: number | null) {
    const shares = this.resolved(amount);

    if (shares === null) {
      return html`
        <div class="summary muted">
          ${amount === null
            ? this.localize("split_needs_amount")
            : this.localize("rule_invalid")}
        </div>
      `;
    }

    return html`
      <div class="summary">
        ${this.members
          .filter((member) => shares[member.id])
          .map(
            (member) => html`
              <span class="who">
                ${member.name}
                <strong>
                  ${formatMoney(shares[member.id], this.group.currency, this.language)}
                </strong>
              </span>
            `,
          )}
      </div>
    `;
  }

  /**
   * The same editor the category rule uses, on the real amount.
   *
   * Keyed on the category so picking one rebuilds it from that category's rule:
   * the default fills the screen in, and stays yours to overwrite.
   */
  private renderEditor(amount: number | null) {
    return keyed(
      this.categoryId,
      html`
        <se-split-rule-editor
          required
          .localize=${this.localize}
          .members=${this.members}
          .rule=${this.rule ?? this.defaultRule()}
          .currency=${this.group.currency}
          .language=${this.language}
          .amount=${amount}
          .payerId=${this.paidBy}
          @rule-changed=${(e: CustomEvent) => (this.rule = e.detail.rule)}
        ></se-split-rule-editor>
      `,
    );
  }

  private pickCategory = (event: CustomEvent) => {
    this.categoryId = event.detail.value;

    // Let the new category's rule take over: the editor is rebuilt from it.
    this.rule = null;
  };

  private isValid(amount: number | null): boolean {
    if (this.expenseTitle.trim() === "" || amount === null || amount <= 0) {
      return false;
    }

    if (!this.paidBy || this.members.length === 0) {
      return false;
    }

    // Valid exactly when the split resolves: the resolver already checks that
    // the amounts fit and that the shares add up.
    return this.resolved(amount) !== null;
  }

  private cancel = () => {
    this.dispatchEvent(
      new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }),
    );
  };

  private submit = async () => {
    const amount = parseMoney(this.amountInput);

    // Send the shares shown rather than the rule behind them: what you see is
    // what gets stored, and the resolver agrees with the backend on every cent.
    const shares = this.resolved(amount);

    if (amount === null || !shares) {
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
      description: this.description.trim() || null,
      shares: Object.entries(shares).map(([member_id, value]) => ({
        member_id,
        amount: value,
      })),
      // The shares are the truth, but the rule has to travel with them, or
      // reopening the expense could only ever spell the amounts back out.
      split_rule: this.rule ?? this.defaultRule(),
    };

    try {
      const expense = this.expense
        ? await this.api.updateExpense(this.expense.id, {
            title: input.title,
            amount: input.amount,
            paid_by_member_id: input.paid_by_member_id,
            expense_date: input.expense_date,
            category_id: input.category_id,
            description: input.description,
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
