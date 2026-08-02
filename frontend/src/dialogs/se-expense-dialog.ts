import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "../components/se-button";
import "../components/se-currency-field";
import "../components/se-dialog";
import "../components/se-expense-picker";
import "../components/se-entity-history";
import "../components/se-field";
import "../components/se-segmented";
import "../components/se-select";
import "../components/se-split-rule-editor";
import { expenseRowStyles, renderExpenseRow } from "../components/expense-row";
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
import { apportion, CURRENCIES, RATE_ONE } from "../services/currency";
import { resolveShares } from "../services/splits";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Group, Member, SplitRule } from "../types";

/**
 * Whether two sets of shares put the same figures on the same people.
 *
 * Nobody's share is zero on either side: the resolver leaves out whoever takes
 * nothing, so a member absent from one and down for nothing in the other are
 * saying the same thing. Shares that could not be resolved at all count as
 * different from anything, including from each other — there is nothing there
 * to call the same.
 */
function sameShares(
  left: Record<string, number> | null,
  right: Record<string, number> | null,
): boolean {
  if (left === null || right === null) {
    return false;
  }

  const held = (shares: Record<string, number>) =>
    Object.entries(shares).filter(([, amount]) => amount !== 0);

  const ours = held(left);

  return (
    ours.length === held(right).length &&
    ours.every(([memberId, amount]) => right[memberId] === amount)
  );
}

/**
 * Dialog creating or editing an expense.
 *
 * Fires `expense-saved` on success and `expense-deleted` after a deletion, and
 * `open-expense` when the reader asks for the purchase a refund answers.
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

  /**
   * Every expense of the group, so a refund can name the purchase it answers.
   *
   * Handed in rather than fetched: the page holds them already, and the picker
   * needs their shares to open a refund on the split they were borne under.
   */
  @property({ attribute: false }) public expenses: Expense[] = [];

  /**
   * The refunds that name this expense, when it is a purchase.
   *
   * Handed in already filtered: the page holds every expense of the group, so
   * "how much of this came back" costs nothing to know and needs no command of
   * its own.
   */
  @property({ attribute: false }) public refunds: Expense[] = [];

  /**
   * Which expenses this reader may open, by id.
   *
   * Whether an entry may be opened is the page's rule and stays there — it
   * takes the group's permissions and your role, neither of which this dialog
   * has any business knowing. The answer comes for every expense of the group
   * rather than for one, because the purchase a refund names is chosen here and
   * the page cannot know in advance which it will be.
   */
  @property({ attribute: false }) public openable: string[] = [];

  /** Which member you are, to fill in who paid. Null: nobody in this group. */
  @property({ type: String }) public meId: string | null = null;

  @property({ type: String }) public language = "en";

  /** Named `expenseTitle` because `title` is taken by HTMLElement. */
  @state() private expenseTitle = "";

  @state() private description = "";

  /**
   * The amount as typed, always a size and never a direction.
   *
   * Which way the money went is `refunding` and nothing else. It used to be the
   * minus sign in this field, which worked and could not be discovered: nothing
   * on screen said a shop's refund was enterable at all, and the one figure a
   * reader checks twice was carrying a second meaning.
   */
  @state() private amountInput = "";

  /**
   * Whether this is money a shop gave back rather than money it took.
   *
   * The whole of the direction, and the model still stores it as the sign of
   * the amount — a refund is the same expense with the money going the other
   * way, which is what lets one resolver serve both.
   */
  @state() private refunding = false;

  @state() private paidBy = "";

  @state() private date = today();

  @state() private categoryId = "";

  /** The split, as the editor last reported it. */
  @state() private rule: SplitRule | null = null;

  /** The purchase a refund gives money back on, or "" for none. */
  @state() private refundOf = "";

  /** Whether the refunds of this purchase are unfolded. Closed, as history is. */
  @state() private showRefunds = false;

  /**
   * The expense a jump is armed on, once asked for and not yet confirmed.
   *
   * Held as the id rather than as a flag, so arming a jump and then asking for
   * a different one re-arms rather than going straight there.
   */
  @state() private leavingTo?: string;

  /**
   * Whether the reader has changed anything that leaving would throw away.
   *
   * Set by the gestures themselves rather than worked out by comparing the form
   * against what is stored, which was tried and is wrong twice over: the
   * currency field hands back a rate the moment it mounts, and an expense saved
   * before the odd cents were made to rotate re-resolves a cent away from its
   * own stored shares. Both would have armed the warning on a dialog nobody had
   * touched — and a warning that cries wolf is one nobody reads.
   *
   * The two things that speak for themselves are handled where they arrive: a
   * rate only counts when it actually moves, and a rule only when the shares it
   * comes out as move.
   */
  @state() private touched = false;

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
    expenseRowStyles,
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
       * A hairline where the column changes errand: the general fields, then
       * how they are split, then — when editing — the past being read. The
       * three ran into one another, and the stack gap gives each rule air on
       * either side. Drawn between general and split for every expense, since a
       * new one has that boundary too; the one before the history only when
       * there is a history.
       */
      .rule {
        height: 1px;
        background: var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /* A label and the link that unfolds it, as se-entity-history wears. */
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      /*
       * The frame a refund's row sits in here. The picker's is a button with
       * the payer's colour down its side, because there it is a choice; this
       * one is a line, held apart from its neighbours the way the picker's list
       * holds its own.
       */
      .refund {
        padding: 8px 0;
      }

      .refund + .refund {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /* A line that leads somewhere, dressed as the journal dresses its own. */
      .refund-button {
        width: 100%;
        border: none;
        background: none;
        color: inherit;
        cursor: pointer;
      }

      .refund-button:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      /*
       * Armed, and wearing the colour of the banner that has just appeared over
       * the dialog. The delete says what it is about to do by changing the word
       * on its button; a row has no word of its own to change — every part of it
       * is a fact about the refund — so it says it in the one way left, and says
       * it in the same colour as the sentence asking about it.
       */
      .refund-button.arming {
        color: var(--error-color, #db4437);
      }

      .chevron {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
      }

      /*
       * The way to the purchase, under the field that names it. On its own
       * line, as "+ add a description" is: a link tucked against the side of a
       * field reads as part of the control rather than as somewhere to go.
       */
      .jump {
        margin-top: 6px;
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

    // The stored sign is read once, here, and turned back into the two things
    // it stands for: a size in the field and a direction in the selector.
    this.refunding = this.expense.amount < 0;
    this.amountInput = centsToInput(Math.abs(this.expense.amount));

    this.refundOf = this.expense.refund_of ?? "";
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
        // Sizes, like every figure in a rule: a rule says how something is
        // shared, never which way it went. The refund puts that back on.
        fixed: Object.fromEntries(
          shares.map((share) => [share.member_id, Math.abs(share.amount)]),
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
    return this.resolvedWith(this.rule ?? this.defaultRule(), amount);
  }

  /** The same, on a rule that is not this dialog's yet. */
  private resolvedWith(
    rule: SplitRule,
    amount: number | null,
  ): Record<string, number> | null {
    if (amount === null || !this.paidBy || this.members.length === 0) {
      return null;
    }

    return resolveShares({
      amount,
      payerId: this.paidBy,
      memberIds: this.members.map((member) => member.id),
      rule,
    });
  }

  /**
   * What is being saved: the size typed, pointed by the selector.
   *
   * The one place the two are put back together, because everything downstream
   * — the split, the summary, what the backend stores — works on a signed
   * figure. `Math.abs` on the way in as well: a size pasted with a minus still
   * on it is a size.
   */
  private signedAmount(): number | null {
    const size = parseMoney(this.amountInput);

    if (size === null) {
      return null;
    }

    return this.refunding ? -Math.abs(size) : Math.abs(size);
  }

  protected render() {
    const translate = this.localize;

    const amount = this.signedAmount();
    const refund = this.refunding;

    const heading = this.expense
      ? translate(refund ? "edit_refund" : "edit_expense")
      : translate(refund ? "new_refund" : "new_expense");

    return html`
      <se-dialog open heading=${heading} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <!--
            Which way the money went, asked outright and first, the way the
            payment dialog asks what it is looking at. It was the minus sign on
            the amount and nothing else: it worked, and there was no way to find
            out it worked — a shop's refund is a thing this panel does, and
            nothing on screen said so. Typing one still does it; it now moves
            this instead of hiding in the figure.
          -->
          <se-segmented
            .label=${translate("kind_label")}
            .value=${this.refunding ? "refund" : "expense"}
            .options=${[
              { value: "expense", label: translate("kind_expense") },
              { value: "refund", label: translate("kind_shop_refund") },
            ]}
            @value-changed=${this.pickWay}
          ></se-segmented>

          <se-field
            .label=${translate("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder=${refund ? "Retour Decathlon" : "Courses Carrefour"}
            @value-changed=${(e: CustomEvent) =>
              this.typed("expenseTitle", e.detail.value)}
          ></se-field>

          <div class="pair">
            <se-field
              .label=${translate("amount")}
              .value=${this.amountInput}
              required
              decimal
              placeholder="85,42"
              @value-changed=${this.setAmount}
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
              @value-changed=${(e: CustomEvent) => this.typed("date", e.detail.value)}
            ></se-field>
          </div>

          <div class="pair">
            <!-- Whoever is out of pocket for it, or whoever got the money. -->
            <se-select
              .label=${translate(refund ? "refunded_to" : "paid_by")}
              .value=${this.paidBy}
              .options=${this.members.map((m) => ({ value: m.id, label: m.name }))}
              @value-changed=${(e: CustomEvent) => this.typed("paidBy", e.detail.value)}
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
            .amount=${amount === null ? null : Math.abs(amount)}
            .initialRate=${this.expense?.exchange_rate ?? null}
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
                    this.typed("description", e.detail.value)}
                ></se-field>
              `
            : html`
                <button class="link" @click=${() => (this.showDescription = true)}>
                  + ${translate("add_description")}
                </button>
              `}

          <!-- Between filling the expense in and how it is split: always. -->
          <div class="rule"></div>

          <!--
            Only on a refund. A purchase answers no other purchase, so there is
            nothing to ask on one — and asking anyway would put a field nobody
            can use on every expense anybody ever enters.

            It used to wait for a figure as well, because the figure was the only
            thing that said which way the money went. The selector says it now,
            so the field comes with the intention rather than after it: pick the
            purchase first and its words, its category and its split arrive
            before the amount is typed, which is the order somebody refunding
            something actually works in.

            Purchases only, and never this expense itself: a refund of a refund
            says nothing anybody means, and the backend refuses both.
          -->
          ${this.refunding
            ? html`
                <div>
                  <se-expense-picker
                    .localize=${this.localize}
                    .label=${translate("refund_of")}
                    .placeholder=${translate("refund_of_nothing")}
                    .value=${this.refundOf}
                    .expenses=${this.expenses.filter(
                      (item) => item.amount > 0 && item.id !== this.expense?.id,
                    )}
                    .members=${this.members}
                    .categories=${this.categories}
                    .language=${this.language}
                    @value-changed=${this.pickRefundOf}
                  ></se-expense-picker>
                  ${this.renderJump()}
                </div>
              `
            : nothing}

          ${this.renderSplit(amount)}

          <!--
            What has already come back on this purchase, folded away as the
            history is and for the same reason: most of the time an expense is
            opened to fix a typo, and this is not what the dialog is for. Nothing
            at all when nothing has come back — an empty section would announce a
            question the reader had not asked.

            The total is on the head, since that is the whole of what most people
            want: 6,95 spent, 2,00 back. Unfolding is for which ones and when.
          -->
          ${this.refunds.length > 0
            ? html`
                <div class="rule"></div>
                <div>
                  <div class="head">
                    <label class="muted">
                      ${translate("refunds")} ·
                      ${formatMoney(
                        this.refunds.reduce(
                          (sum, refund) => sum + Math.abs(refund.converted_amount),
                          0,
                        ),
                        this.group.currency,
                        this.language,
                      )}
                    </label>
                    <button
                      class="link"
                      @click=${() => (this.showRefunds = !this.showRefunds)}
                    >
                      ${this.showRefunds ? translate("done") : translate("see_all")}
                    </button>
                  </div>

                  <!--
                    The same row the picker offers and the group page lists,
                    rather than a sentence spelling the same three facts out in
                    grey. A refund is recognised by the face that took the money
                    back and the mark of what it was, and it was recognisable
                    everywhere but here — the one place it is read beside the
                    purchase it answers.
                  -->
                  ${this.showRefunds
                    ? this.refunds.map((item) => this.renderRefund(item))
                    : nothing}
                </div>
              `
            : nothing}

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
              ${translate(refund ? "confirm_delete_refund" : "confirm_delete_expense")}
            </div>`
          : nothing}

        <!-- Only while what was armed is still somewhere on screen. -->
        ${this.leavingTo !== undefined &&
        this.visibleTargets(refund).includes(this.leavingTo)
          ? html`<div slot="banner" class="warning">
              ${translate("confirm_leave_entry")}
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

        <!--
          Kept mounted while folded: it owns the rule and resolves it. On the
          size of it, never on the sign — a rule shares 30 the same way whether
          the shop took it or gave it back, and the editor would otherwise have
          to spell out an envelope and percentages of a negative number.
        -->
        <div class="editor" ?hidden=${!this.editingSplit}>
          ${this.renderEditor(amount === null ? null : Math.abs(amount))}
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
    // Keyed on the purchase as well as the category, because the editor reads
    // the rule once and never again: it takes its mode in connectedCallback and
    // its willUpdate watches only the payer. Picking a purchase hands it a rule
    // it would otherwise never look at — the summary above would show the
    // envelope while "Modify" underneath still said equal shares.
    return keyed(
      `${this.categoryId}|${this.refundOf}`,
      html`
        <se-split-rule-editor
          .localize=${this.localize}
          .members=${this.members}
          .rule=${this.rule ?? this.defaultRule()}
          .currency=${this.currency || this.group.currency}
          .language=${this.language}
          .amount=${amount}
          .payerId=${this.paidBy}
          @rule-changed=${this.takeRule}
        ></se-split-rule-editor>
      `,
    );
  }

  /** Take what somebody typed into a field, and remember that they typed it. */
  private typed(
    field: "expenseTitle" | "description" | "date" | "paidBy",
    value: string,
  ): void {
    this[field] = value;
    this.touched = true;
  }

  private pickCategory = (event: CustomEvent) => {
    this.categoryId = event.detail.value;
    this.touched = true;

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
    this.touched = true;
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

  /**
   * Whether what is on screen makes an expense.
   *
   * Either sign will do; nothing at all will not. Zero is not a small expense,
   * it is no expense, and a minus on its own is somebody halfway through typing.
   */
  private isValid(amount: number | null): boolean {
    if (this.expenseTitle.trim() === "" || amount === null || amount === 0) {
      return false;
    }

    if (!this.paidBy || this.members.length === 0) {
      return false;
    }

    // Valid exactly when the split resolves: the resolver already checks that
    // the amounts fit and that the shares add up.
    return this.resolved(amount) !== null;
  }

  /**
   * The currency field settled on something, or on nothing.
   *
   * It says so the moment it mounts, before anybody has touched anything —
   * taking up a stored rate and announcing what it comes to. So this counts as
   * an edit only when the figure actually moves: a rate that arrives equal to
   * the one already held is the field reporting, not somebody typing.
   */
  private handleRate = (event: CustomEvent) => {
    if (
      event.detail.currency !== this.currency ||
      event.detail.rate !== this.rate
    ) {
      this.touched = true;
    }

    this.currency = event.detail.currency;
    this.rate = event.detail.rate;
  };

  /**
   * Take the amount, and keep a refund's split in step with it.
   *
   * The split a purchase is borrowed for is held as exact amounts, so it stops
   * adding up the moment the figure above it changes. Re-apportioned on every
   * keystroke rather than only when the purchase is picked: typing 20 after
   * choosing a 40 expense is the ordinary way round, not the exception.
   */
  private setAmount = (event: CustomEvent) => {
    const typed = event.detail.value as string;

    // A minus was how a refund was entered before there was anything else, and
    // it stays a way of entering one: whoever has the habit keeps it, and the
    // gesture now shows up in the selector rather than living in the figure.
    // The sign is taken out of the field, so the two never say different things.
    this.refunding = this.refunding || typed.includes("-");
    this.amountInput = typed.replace(/-/g, "");

    this.touched = true;
    this.applyRefundSplit();
  };

  /**
   * Change which way the money went.
   *
   * Turning a refund back into an expense lets its purchase go, and the split
   * with it. The rule on screen is the purchase's own, borrowed when it was
   * named; keeping it on an expense that no longer answers anything would leave
   * somebody's shopping split by a rule they never chose and cannot see the
   * reason for. Null is what `pickCategory` leaves too, and it means "open on
   * the category's rule again".
   */
  private pickWay = (event: CustomEvent) => {
    const refunding = event.detail.value === "refund";

    if (refunding === this.refunding) {
      return;
    }

    this.refunding = refunding;
    this.touched = true;

    if (!refunding) {
      this.refundOf = "";
      this.leavingTo = undefined;
      this.rule = null;
    }
  };

  /** Take a purchase to give money back on, and open on the way it was borne. */
  private pickRefundOf = (event: CustomEvent) => {
    this.refundOf = event.detail.value;
    this.touched = true;

    // Whatever was armed was armed on the purchase that has just been replaced,
    // and picking one is itself an edit — so the question has to be put again.
    this.leavingTo = undefined;

    const purchase = this.expenses.find((item) => item.id === this.refundOf);

    if (purchase !== undefined) {
      // The shop hands it back to whoever paid, unless somebody says otherwise.
      this.paidBy = purchase.paid_by_member_id;

      // The purchase's own words. A refund of the bakery is about the bakery, and
      // retyping the shop's name under a figure that already names it is work
      // nobody should be given. The sign and the colour are what tell the two
      // rows apart; the words are the same words.
      //
      // Only into empty fields: anything already typed was typed on purpose, and
      // "Retour Decathlon" is a better title than "Decathlon" for whoever wrote
      // it.
      if (this.expenseTitle.trim() === "") {
        this.expenseTitle = purchase.title;
      }

      // The category follows outright, where the words only fill a gap. A new
      // expense opens on the group's default rather than on nothing, so "only
      // when empty" would never fire here and the refund would sit in whatever
      // category the group happens to favour — money back on the bakery counted
      // against the shopping. Taken rather than offered, and it is one dropdown
      // away if the purchase was filed somewhere the refund is not.
      this.categoryId = purchase.category_id ?? "";

      if (this.description.trim() === "" && purchase.description) {
        this.description = purchase.description;

        // Unfolded, or it would sit behind a link saying "add a description"
        // while holding one.
        this.showDescription = true;
      }

      // The whole of it, which is what a refund usually is — and never more than
      // the purchase, which the backend refuses anyway. A smaller figure already
      // typed is left alone: a partial refund is a deliberate thing to have said.
      const typed = parseMoney(this.amountInput);

      if (typed === null || Math.abs(typed) > purchase.amount) {
        // The size of it. The selector already says which way it goes, and it
        // says "refund" or this picker would not be on screen.
        this.amountInput = centsToInput(purchase.amount);
        this.currency = purchase.currency;
        this.rate =
          purchase.currency === this.group.currency ? RATE_ONE : null;
      }
    }

    this.applyRefundSplit();
  };

  /**
   * Open the refund on the split its purchase was borne under.
   *
   * **The rule first, and the shares only as a fallback.** A purchase's rule is
   * what was meant — "equally", "60/40", "10 of it between the two of you" — and
   * resolving it against the refund gives what anybody would expect: 15,00 given
   * back on something shared equally is 7,50 and 7,50.
   *
   * Reading the stored shares instead gets that wrong, and the reason is worth
   * writing down. 6,95 split equally between two is 3,48 and 3,47, because one
   * cent will not divide. Those are not proportions anybody chose, they are a
   * rounding; taken as a ratio and stretched, they come out 7,51 and 7,49, and
   * the further the refund is from the purchase the worse the drift.
   *
   * So the shares are the fallback, for the one case a rule cannot answer:
   * amounts typed in by hand, whose rule re-resolves to the purchase's own
   * figures and so refuses any smaller total. There `apportion` is exactly right
   * — 40 borne 30/10 with 20 given back is 15/5 — because those ratios really
   * were chosen.
   *
   * Either way the result is written as a rule of exact amounts, that being the
   * vocabulary the split editor and the backend share, and its figures are in
   * whatever currency the refund is typed in: both helpers need only the ratios,
   * so nothing is converted twice.
   *
   * A default and not a lock: the editor underneath stays open, and the moment
   * somebody touches it their rule replaces this one.
   */
  private applyRefundSplit(): void {
    const purchase = this.expenses.find((item) => item.id === this.refundOf);
    const amount = this.signedAmount();

    if (purchase === undefined || amount === null || amount >= 0) {
      return;
    }

    const rule = this.refundRule(purchase, Math.abs(amount));

    if (rule !== null) {
      this.rule = rule;
    }
  }

  /**
   * The rule a refund of `size` should open on, the way its purchase was borne.
   *
   * **The purchase's own rule, handed over as a rule** — not resolved into the
   * figures it happens to produce. That distinction is the whole of this method.
   * Writing the figures down instead gives the same summary and a different
   * answer under "Modify": an expense shared equally would open its editor on two
   * hand-typed amounts, saying somebody chose 3,48 and 3,47 when what they chose
   * was "equally". Reopen it on a rule and it says what it meant.
   *
   * A purchase with no rule of its own was split equally by whatever the category
   * or the group said at the time. That is spelled out here rather than left
   * null, since null would fall through to *this* dialog's default, which is the
   * rule in force today and not the one that was applied then.
   *
   * The fallback is for the one case a rule cannot answer: amounts typed in by
   * hand, whose rule re-resolves to the purchase's own figures and so refuses any
   * smaller total. There the stored shares really are the proportions somebody
   * chose, so `apportion` scales them and they are written back as amounts —
   * which is what they were.
   *
   * Null when neither can answer, leaving the split as the reader left it rather
   * than replacing it with a guess.
   */
  private refundRule(purchase: Expense, size: number): SplitRule | null {
    const resolvable =
      resolveShares({
        amount: size,
        payerId: purchase.paid_by_member_id,
        memberIds: this.members.map((member) => member.id),
        rule: purchase.split_rule,
      }) !== null;

    if (resolvable) {
      // An empty envelope is the whole expense shared between everybody, which
      // is the plain equal split a ruleless purchase was borne under.
      return (
        purchase.split_rule ?? {
          envelope: null,
          participants: null,
          remainder: { members: null, fixed: {}, percent: {} },
        }
      );
    }

    const borne: Record<string, number> = {};

    for (const share of purchase.shares ?? []) {
      if (share.amount !== 0) {
        borne[share.member_id] = share.amount;
      }
    }

    const spread = apportion(borne, size);

    if (spread === null) {
      return null;
    }

    // Every figure in a rule is a size and never a direction: the resolver owes
    // each share the other way round on a refund, on both sides of the wire.
    return {
      envelope: 0,
      participants: null,
      remainder: { members: Object.keys(spread), fixed: spread, percent: {} },
    };
  }

  /**
   * The way through to the purchase this refund gives money back on.
   *
   * The refund has named it and shown it since the picker arrived, and there
   * was no way to go and read it — the one thing somebody looking at a refund
   * of 15,00 wants next is what the 60,00 was.
   *
   * Only when there is somewhere to go: a purchase since deleted, or one this
   * reader may not open, gets no link at all. A link that does nothing is worse
   * than a line of plain text, which is what the journal decided too.
   */
  private renderJump() {
    if (!this.mayOpen(this.refundOf)) {
      return nothing;
    }

    const armed = this.leavingTo === this.refundOf;

    return html`
      <button class="link jump" @click=${() => this.jumpTo(this.refundOf)}>
        ${this.localize(armed ? "confirm_leave" : "open_purchase")}
      </button>
    `;
  }

  /**
   * One refund of this purchase, and the way through to it.
   *
   * The other end of the same journey: a purchase says what has come back on
   * it, and "which one was that" is the question the section raises by
   * answering the first one. A button only when there is somewhere to go, and
   * a chevron to say so — the journal's rule, and the journal's mark for it.
   */
  private renderRefund(refund: Expense) {
    const row = renderExpenseRow(refund, this);

    if (!this.mayOpen(refund.id)) {
      return html`<div class="refund expense-row">${row}</div>`;
    }

    const armed = this.leavingTo === refund.id;

    return html`
      <button
        class=${`refund refund-button expense-row ${armed ? "arming" : ""}`}
        @click=${() => this.jumpTo(refund.id)}
      >
        ${row}
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  /** Whether an expense is there to be opened, and this reader's to open. */
  private mayOpen(expenseId: string): boolean {
    return expenseId !== "" && this.openable.includes(expenseId);
  }

  /**
   * The jumps that can be asked for from where the dialog currently stands.
   *
   * What is armed has to still be on screen. Picking another purchase, turning
   * the amount back round, or folding the refunds away all leave a warning
   * standing over a question nobody is being asked any more.
   */
  private visibleTargets(isRefund: boolean): string[] {
    const targets = isRefund ? [this.refundOf] : [];

    if (this.showRefunds) {
      targets.push(...this.refunds.map((refund) => refund.id));
    }

    return targets.filter((id) => this.mayOpen(id));
  }

  /**
   * Open another expense, closing this one on the way.
   *
   * Dialog to dialog, as the journal already goes: two stacked would leave no
   * way back that is not a guess, and the purchase you asked for is inside the
   * one opening.
   *
   * Asked about first when there is something to lose. Leaving by Cancel or by
   * the phone's back button drops what was typed and always has — but those say
   * "leave" and this says "open that one", and somebody who has just corrected
   * an amount is not asking for it to be thrown away. Armed once, in place, the
   * way a deletion is.
   */
  private jumpTo(expenseId: string) {
    if (this.leavingTo !== expenseId && this.touched) {
      this.leavingTo = expenseId;

      // One question at a time. Both are armed in place and both speak in the
      // banner, so a delete waiting to be confirmed and a jump waiting to be
      // confirmed would stack two warnings over one dialog.
      this.confirmingDelete = false;

      return;
    }

    this.dispatchEvent(
      new CustomEvent("open-expense", {
        detail: { expenseId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Take the split the editor reports, and notice whether it is news.
   *
   * The editor announces its rule from `firstUpdated`, before anybody has
   * touched anything, and again whenever the payer moves — so taking every
   * `rule-changed` as an edit would arm the warning on a dialog nobody has
   * typed into. What it announces is compared by the shares it comes out as:
   * the same cents on the same people is not a change anybody made, whatever
   * shape the rule has been rewritten into on the way.
   */
  private takeRule = (event: CustomEvent) => {
    const rule = event.detail.rule as SplitRule | null;
    const amount = this.signedAmount();

    if (
      !sameShares(
        this.resolvedWith(rule ?? this.defaultRule(), amount),
        this.resolved(amount),
      )
    ) {
      this.touched = true;
    }

    this.rule = rule;
  };

  private cancel = () => {
    this.dispatchEvent(
      new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }),
    );
  };

  private submit = async () => {
    const amount = this.signedAmount();

    // Send the shares shown rather than the rule behind them: what you see is
    // what gets stored, and the resolver agrees with the backend on every cent.
    const shares = this.resolved(amount);

    if (amount === null || amount === 0 || !shares) {
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
      // Null and not omitted: on an update, leaving it out would keep a link the
      // reader has just taken off. And null whenever the amount is not negative,
      // so turning a refund back into a purchase does not leave it named.
      refund_of: amount < 0 ? this.refundOf || null : null,
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
      this.leavingTo = undefined;
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
