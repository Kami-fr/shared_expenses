import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/se-button";
import "../components/se-currency-field";
import "../components/se-dialog";
import "../components/se-entity-history";
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
import { CURRENCIES, RATE_ONE } from "../services/currency";
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

  /** Which member you are, to fill in who paid. Null: nobody in this group. */
  @property({ type: String }) public meId: string | null = null;

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

  /** What it was paid in. The group's, unless said otherwise. */
  @state() private currency = "";

  /** The rate to convert at, in millionths. Null: not settled, cannot save. */
  @state() private rate: number | null = null;

  public static styles = [
    sharedStyles,
    css`
      .split-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
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

      /*
       * A hairline between filling the expense in and reading its past. The two
       * are different errands — one edits, the other only looks — and the column
       * ran them together. The stack gap gives it air on either side.
       */
      .rule {
        height: 1px;
        background: var(--divider-color, rgba(0, 0, 0, 0.12));
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    if (!this.expense) {
      // You, when the panel knows who you are: an expense is nearly always
      // entered by whoever just paid for it. The first member otherwise —
      // an account tied to nobody has no better guess to offer.
      this.paidBy = this.meId ?? this.members[0]?.id ?? "";

      // Where the group says new expenses start. Checked against the list
      // rather than trusted: a category deleted a moment ago would otherwise
      // preselect something that is not in the picker.
      const preferred = this.group.default_category_id;

      this.categoryId = this.categories.some((c) => c.id === preferred)
        ? preferred!
        : "";

      this.currency = this.group.currency;
      this.rate = RATE_ONE;

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

    this.currency = this.expense.currency;
    this.rate = this.expense.exchange_rate;
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

  /**
   * What the editor opens on: the category's rule, then the group's.
   *
   * Never null. Nothing above saying anything means an equal split, and that is
   * worth spelling out here — a null would read as "default rule", the one mode
   * this dialog does not offer, because saving freezes the rule anyway.
   */
  private defaultRule(): SplitRule {
    const category = this.categories.find((c) => c.id === this.categoryId);

    return (
      category?.split_rule ??
      this.group.split_rule ?? { envelope: null, participants: null, remainder: {} }
    );
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
              required
              decimal
              placeholder="85,42"
              @value-changed=${(e: CustomEvent) => (this.amountInput = e.detail.value)}
            >
              <!--
                Where the currency was only ever written, it is now chosen. It
                belongs against the figure it qualifies: a number and its unit
                are one thing, and putting the unit somewhere else was asking
                people to go looking for it.
              -->
              <select
                slot="suffix"
                class="currency"
                .value=${this.currency}
                aria-label=${translate("currency_label")}
                @change=${this.pickCurrency}
              >
                ${this.currencies().map(
                  (code) => html`
                    <option value=${code} ?selected=${code === this.currency}>
                      ${code}
                    </option>
                  `,
                )}
              </select>
            </se-field>

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

          <!-- Shows itself only when there is a rate to settle. -->
          <se-currency-field
            .api=${this.api}
            .localize=${this.localize}
            .groupId=${this.group.id}
            .groupCurrency=${this.group.currency}
            .currency=${this.currency}
            .on=${this.date}
            .amount=${amount}
            .language=${this.language}
            @rate-changed=${this.handleRate}
          ></se-currency-field>

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

          <!-- Only once there is a past to read: a new expense has none. -->
          ${this.expense
            ? html`
                <div class="rule"></div>
                <se-entity-history
                  .api=${this.api}
                  .localize=${this.localize}
                  .groupId=${this.group.id}
                  .entityId=${this.expense.id}
                  .members=${this.members}
                  .categories=${this.categories}
                  .currency=${this.group.currency}
                  .language=${this.language}
                ></se-entity-history>
              `
            : nothing}
        </div>

        ${this.confirmingDelete
          ? html`<div slot="banner" class="warning">
              ${translate("confirm_delete_expense")}
            </div>`
          : nothing}

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
          ?disabled=${this.busy || !this.canSave(amount)}
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
                  ${formatMoney(shares[member.id], this.currency, this.language)}
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
   * Opened on the category's rule rather than on "default rule", and no such
   * mode is offered here. Saving copies whatever is on screen onto the expense
   * — it always did — so a rule that merely said "whatever the category says"
   * was frozen at that instant anyway: change the category next month and this
   * expense would not budge. Naming the deferral was a promise nothing kept.
   *
   * Keyed on the category, so picking one rebuilds the editor from its rule:
   * the category fills the screen in, and it stays yours to overwrite.
   */
  private renderEditor(amount: number | null) {
    return keyed(
      this.categoryId,
      html`
        <se-split-rule-editor
          .localize=${this.localize}
          .members=${this.members}
          .rule=${this.rule ?? this.defaultRule()}
          .currency=${this.currency || this.group.currency}
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

  /** Every currency a rate can be had for, and the group's, which may not be. */
  private currencies(): string[] {
    const known = new Set([...CURRENCIES, this.group.currency, this.currency]);

    return [...known].sort();
  }

  /**
   * Change what the expense was paid in.
   *
   * The rate goes with it. Until the new one lands the expense cannot be saved
   * — which is the point: keeping the old currency's rate would convert the
   * amount by a number that has nothing to do with it.
   */
  private pickCurrency = (event: Event) => {
    this.currency = (event.target as HTMLSelectElement).value;
    this.rate = this.currency === this.group.currency ? RATE_ONE : null;
  };

  /**
   * Whether the expense can be saved.
   *
   * A foreign currency with no rate cannot: the backend would refuse it, and a
   * button that sends something doomed is worse than one that waits.
   */
  private canSave(amount: number | null): boolean {
    return this.isValid(amount) && this.rate !== null;
  }

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

  /** The currency field settled on something, or on nothing. */
  private handleRate = (event: CustomEvent) => {
    this.currency = event.detail.currency;
    this.rate = event.detail.rate;
  };

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
      currency: this.currency || this.group.currency,
      // The rate the panel showed and had accepted, so that what was agreed to
      // on screen is what lands in the balances.
      ...(this.rate !== null && this.rate !== RATE_ONE
        ? { exchange_rate: this.rate }
        : {}),
      split_rule: this.rule ?? this.defaultRule(),
    };

    // Everything the create sends, minus the group an expense cannot move
    // between. Spelled out field by field, this listed eight of the ten and
    // silently dropped the currency and its rate: an edit saved fine and came
    // back in the old currency, because `Partial` means a missing field is a
    // field nobody asked to change. Deriving it cannot drift.
    const { group_id: _group, ...changes } = input;

    try {
      const expense = this.expense
        ? await this.api.updateExpense(this.expense.id, changes)
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
