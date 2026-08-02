import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-currency-field";
import "../components/se-dialog";
import "../components/se-entity-history";
import "../components/se-expense-picker";
import "../components/se-field";
import "../components/se-segmented";
import "../components/se-select";
import type { CreatePaymentInput, SharedExpensesApi } from "../services/api";
import { CURRENCIES, RATE_ONE } from "../services/currency";
import {
  centsToInput,
  dateToIso,
  isoToDateInput,
  parseMoney,
  today,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type {
  Category,
  Expense,
  Group,
  Member,
  Payment,
  PaymentKind,
  Settlement,
} from "../types";

/**
 * Dialog recording or correcting a payment.
 *
 * Fires `payment-saved` on success, `payment-deleted` after a deletion, and
 * `open-expense` when the reader asks for the expense this payment is about.
 */
@customElement("se-payment-dialog")
export class SePaymentDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  /** Set to edit a recorded payment, leave out to record one. */
  @property({ attribute: false }) public payment?: Payment;

  /**
   * Every expense of the group, so a payment can name what it was about.
   *
   * All of them, purchases and refunds alike. A payment is not a share of what
   * it names — one handover settles a month of them, and "here is your part of
   * what Decathlon sent back" is a sentence somebody will want to write.
   */
  @property({ attribute: false }) public expenses: Expense[] = [];

  /** For the marks on the rows the picker offers. */
  @property({ attribute: false }) public categories: Category[] = [];

  /** Which expenses this reader may open. The page owns that rule. */
  @property({ attribute: false }) public openable: string[] = [];

  /** Pre-fills the dialog from a suggested reimbursement. */
  @property({ attribute: false }) public settlement?: Settlement;

  /** What the dialog opens on. A debt, when the plus was dragged for one. */
  @property({ type: String }) public initialKind: PaymentKind = "reimbursement";

  @property({ type: String }) public language = "en";

  /**
   * Whoever is out of pocket, whichever kind this is.
   *
   * On a reimbursement they settled up; on a debt they lent. The two read as
   * opposites and store the same, which is the one thing to hold on to here:
   * the fields swap round on screen, the model never does.
   */
  @state() private fromMember = "";

  @state() private toMember = "";

  @state() private amountInput = "";

  @state() private description = "";

  /** Folded away until asked for: most of them are self-evident. */
  @state() private showDescription = false;

  @state() private date = today();

  @state() private busy = false;

  @state() private error?: string;

  @state() private confirmingDelete = false;

  @state() private kind: PaymentKind = "reimbursement";

  /** What it was handed over in. The group's, unless said otherwise. */
  @state() private currency = "";

  /** The rate to convert at, in millionths. Null: not settled, cannot save. */
  @state() private rate: number | null = null;

  /** The expense this is about, or "" for none. */
  @state() private expenseId = "";

  /**
   * Whether the reader has changed anything that leaving would throw away.
   *
   * Set by the gestures themselves, as the expense dialog sets its own and for
   * the same reason: the currency field hands back a rate the moment it mounts,
   * so a form compared against what is stored looks edited before it is touched.
   */
  @state() private touched = false;

  /** The expense a jump is armed on, asked for and not yet confirmed. */
  @state() private leavingTo?: string;

  public static styles = [
    sharedStyles,
    css`
      /* The way to the expense, under the field that names it, as the expense
         dialog wears its own and "+ add a description" wears its. */
      .jump {
        margin-top: 6px;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.payment) {
      this.fromMember = this.payment.from_member_id;
      this.toMember = this.payment.to_member_id;
      this.amountInput = centsToInput(this.payment.amount);
      this.date = isoToDateInput(this.payment.payment_date);
      this.kind = this.payment.kind;
      this.currency = this.payment.currency;
      this.rate = this.payment.exchange_rate;
      this.description = this.payment.description ?? "";
      this.expenseId = this.payment.expense_id ?? "";

      // Unfolded when there is one: hiding what somebody wrote behind a link
      // saying "add" would read as there being nothing there.
      this.showDescription = this.description !== "";

      return;
    }

    this.kind = this.initialKind;
    this.currency = this.group.currency;
    this.rate = RATE_ONE;

    if (this.settlement) {
      this.fromMember = this.settlement.from_member_id;
      this.toMember = this.settlement.to_member_id;
      this.amountInput = centsToInput(this.settlement.amount);
      return;
    }

    if (this.members.length > 0) {
      this.fromMember = this.members[0].id;
      this.toMember = this.members[1]?.id ?? "";
    }
  }

  protected render() {
    const translate = this.localize;
    const amount = parseMoney(this.amountInput);
    const options = this.members.map((member) => ({ value: member.id, label: member.name }));
    const debt = this.kind === "debt";

    const heading = this.payment
      ? translate(debt ? "edit_debt" : "edit_payment")
      : translate(debt ? "new_debt" : "new_payment");

    return html`
      <se-dialog
        open
        heading=${heading}
        .localize=${this.localize}
        @dialog-closed=${this.cancel}
      >
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <se-segmented
            .label=${translate("kind_label")}
            .value=${this.kind}
            .options=${[
              { value: "reimbursement", label: translate("kind_reimbursement") },
              { value: "debt", label: translate("kind_debt") },
            ]}
            @value-changed=${this.pickKind}
          ></se-segmented>

          <!--
            The two halves of one sentence, so they sit on one line and read as
            one. The fields swap round, the model does not: a debt names who
            owes first, because that is the sentence; whoever is owed is stored
            as the payer either way, being the one out of pocket.
          -->
          <div class="pair">
            <se-select
              .label=${translate(debt ? "debt_who_owes" : "from_member")}
              .value=${debt ? this.toMember : this.fromMember}
              .options=${options}
              @value-changed=${this.pickFirstMember}
            ></se-select>

            <se-select
              .label=${translate(debt ? "debt_to_whom" : "to_member")}
              .value=${debt ? this.fromMember : this.toMember}
              .options=${options}
              @value-changed=${this.pickSecondMember}
            ></se-select>
          </div>

          <div class="pair">
            <se-field
              .label=${translate("amount")}
              .value=${this.amountInput}
              decimal
              required
              @value-changed=${(e: CustomEvent) =>
                this.typed("amountInput", e.detail.value)}
            >
              <!-- Chosen against the figure it qualifies, as on an expense. -->
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

          <!-- Shows itself only when there is a rate to settle. -->
          <se-currency-field
            .api=${this.api}
            .localize=${this.localize}
            .groupId=${this.group.id}
            .groupCurrency=${this.group.currency}
            .currency=${this.currency}
            .on=${this.date}
            .amount=${amount}
            .initialRate=${this.payment?.exchange_rate ?? null}
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

          <!--
            What the money was about, when it was about one thing. After the
            description and before the past, which is where the expense dialog
            keeps the same picker: what a thing is comes first, what it refers
            to after.

            The placeholder is the refund's own — the same sentence says the
            same thing on both sides, and a second key holding a synonym is how
            one screen ends up wording a fact differently from another.
          -->
          <div>
            <se-expense-picker
              .localize=${this.localize}
              .label=${translate("payment_expense")}
              .placeholder=${translate("refund_of_nothing")}
              .value=${this.expenseId}
              .expenses=${this.expenses}
              .members=${this.members}
              .categories=${this.categories}
              .language=${this.language}
              @value-changed=${this.pickExpense}
            ></se-expense-picker>
            ${this.renderJump()}
          </div>

          <!-- Only once there is a past to read: a new one has none. -->
          ${this.payment
            ? html`
                <se-entity-history
                  .api=${this.api}
                  .localize=${this.localize}
                  .groupId=${this.group.id}
                  .entityId=${this.payment.id}
                  .members=${this.members}
                  .currency=${this.group.currency}
                  .paidIn=${this.payment.currency}
                  .language=${this.language}
                ></se-entity-history>
              `
            : nothing}
        </div>

        ${this.confirmingDelete
          ? html`<div slot="banner" class="warning">
              ${translate(
                this.kind === "debt"
                  ? "confirm_delete_debt"
                  : "confirm_delete_payment",
              )}
            </div>`
          : nothing}

        <!-- Only while what was armed is still what the link points at. -->
        ${this.leavingTo !== undefined && this.leavingTo === this.expenseId
          ? html`<div slot="banner" class="warning">
              ${translate("confirm_leave_entry")}
            </div>`
          : nothing}

        ${this.payment
          ? html`
              <se-button
                slot="actions"
                variant="danger"
                ?disabled=${this.busy}
                @click=${this.deletePayment}
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
          ${this.payment ? translate("save") : translate("create")}
        </se-button>
      </se-dialog>
    `;
  }

  /**
   * Whether the payment can be saved.
   *
   * A foreign currency with no rate cannot: the backend would refuse it, and a
   * button that sends something doomed is worse than one that waits.
   */
  private isValid(amount: number | null): boolean {
    return (
      amount !== null &&
      amount > 0 &&
      this.rate !== null &&
      this.fromMember !== "" &&
      this.toMember !== "" &&
      this.fromMember !== this.toMember
    );
  }

  /** Every currency a rate can be had for, and the group's, which may not be. */
  private currencies(): string[] {
    return [...new Set([...CURRENCIES, this.group.currency, this.currency])].sort();
  }

  /**
   * Change what was handed over.
   *
   * The rate goes with it: keeping the old currency's would convert the amount
   * by a number that has nothing to do with it. Until the new one lands the
   * payment cannot be saved, which is the point.
   */
  private pickCurrency = (event: Event) => {
    this.currency = (event.target as HTMLSelectElement).value;
    this.rate = this.currency === this.group.currency ? RATE_ONE : null;
    this.touched = true;
  };

  /**
   * The currency field settled on something, or on nothing.
   *
   * It says so the moment it mounts, before anybody has touched anything, so
   * this counts as an edit only when the figure actually moves.
   */
  private handleRate = (event: CustomEvent) => {
    if (event.detail.currency !== this.currency || event.detail.rate !== this.rate) {
      this.touched = true;
    }

    this.currency = event.detail.currency;
    this.rate = event.detail.rate;
  };

  /** Take what somebody typed into a field, and remember that they typed it. */
  private typed(
    field: "amountInput" | "date" | "description",
    value: string,
  ): void {
    this[field] = value;
    this.touched = true;
  }

  /**
   * The first field of the sentence: who owes on a debt, who paid otherwise.
   *
   * Which member that is swaps with the kind and the model never does, so the
   * two handlers read the kind rather than being told which end they are.
   */
  private pickFirstMember = (event: CustomEvent) => {
    if (this.kind === "debt") {
      this.toMember = event.detail.value;
    } else {
      this.fromMember = event.detail.value;
    }

    this.touched = true;
  };

  private pickSecondMember = (event: CustomEvent) => {
    if (this.kind === "debt") {
      this.fromMember = event.detail.value;
    } else {
      this.toMember = event.detail.value;
    }

    this.touched = true;
  };

  /**
   * Change what this is, and keep the sentence on screen where it was.
   *
   * The first field is "who owes" on a debt and "who paid" on a reimbursement:
   * the same person, and the opposite direction of money. So the members swap
   * with the kind, and the names stay exactly where they sit — changing a label
   * must not make people jump between fields, and "Michel owes Dupont" has to
   * become "Michel paid Dupont", never "Dupont paid Michel".
   */
  private pickKind = (event: CustomEvent) => {
    const kind = event.detail.value as PaymentKind;

    if (kind === this.kind) {
      return;
    }

    this.kind = kind;
    this.touched = true;
    [this.fromMember, this.toMember] = [this.toMember, this.fromMember];
  };

  /** Take the expense this is about, or take the link off. */
  private pickExpense = (event: CustomEvent) => {
    this.expenseId = event.detail.value;
    this.touched = true;

    // Whatever was armed was armed on the expense that has just been replaced.
    this.leavingTo = undefined;
  };

  /**
   * The way through to the expense this payment is about.
   *
   * Only when there is somewhere to go: an expense since deleted, or one this
   * reader may not open, gets no link at all. A link that does nothing is worse
   * than a line of plain text.
   */
  private renderJump() {
    if (this.expenseId === "" || !this.openable.includes(this.expenseId)) {
      return nothing;
    }

    const armed = this.leavingTo === this.expenseId;

    return html`
      <button class="link jump" @click=${() => this.jumpTo(this.expenseId)}>
        ${this.localize(armed ? "confirm_leave" : "open_expense")}
      </button>
    `;
  }

  /**
   * Open the expense, closing this on the way.
   *
   * Dialog to dialog, as the journal goes and as a refund goes to its purchase.
   * Asked about first when there is something to lose: cancelling says "leave"
   * and this says "open that one", and somebody who has just corrected a figure
   * is not asking for it to be thrown away.
   */
  private jumpTo(expenseId: string) {
    if (this.leavingTo !== expenseId && this.touched) {
      this.leavingTo = expenseId;

      // One question at a time: both speak in the banner.
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

    const input: CreatePaymentInput = {
      group_id: this.group.id,
      from_member_id: this.fromMember,
      to_member_id: this.toMember,
      amount,
      payment_date: dateToIso(this.date),
      description: this.description.trim() || null,
      currency: this.currency || this.group.currency,
      kind: this.kind,
      // The rate the panel showed and had accepted, whatever it comes to — one
      // included, a shop or a friend quoting 1:1 being a rate somebody typed.
      // Left out, the backend fetches its own on a create and keeps the one
      // already stored on an edit, so the correction does nothing at all. Sent
      // only for foreign money, since the group's own currency converts by
      // nothing.
      ...(this.rate !== null &&
      (this.currency || this.group.currency) !== this.group.currency
        ? { exchange_rate: this.rate }
        : {}),
      // Null and not omitted: on an update, leaving it out would keep a link
      // the reader has just taken off.
      expense_id: this.expenseId || null,
    };

    // Everything the create sends, minus the group a payment cannot move
    // between. Written out twice, the two lists agreed today and only today:
    // the expense dialog had the same shape and quietly stopped sending the
    // currency, so an edit came back in the old one. Deriving it cannot drift.
    const { group_id: _group, ...changes } = input;

    try {
      const payment = this.payment
        ? await this.api.updatePayment(this.payment.id, changes)
        : await this.api.createPayment(input);

      this.dispatchEvent(
        new CustomEvent("payment-saved", {
          detail: { payment },
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

  /** Asks first: a settlement removed puts a debt back on someone. */
  private deletePayment = async () => {
    if (!this.payment) {
      return;
    }

    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      this.leavingTo = undefined;
      return;
    }

    this.busy = true;
    this.error = undefined;

    try {
      await this.api.deletePayment(this.payment.id);

      this.dispatchEvent(
        new CustomEvent("payment-deleted", { bubbles: true, composed: true }),
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
    "se-payment-dialog": SePaymentDialog;
  }
}
