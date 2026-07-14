import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import type { SharedExpensesApi } from "../services/api";
import {
  centsToInput,
  dateToIso,
  formatMoney,
  isoToDateInput,
  parseMoney,
  today,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Group, Member, Payment, Settlement } from "../types";

/**
 * Dialog recording or correcting a payment.
 *
 * Fires `payment-saved` on success and `payment-deleted` after a deletion.
 */
@customElement("se-payment-dialog")
export class SePaymentDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  /** Set to edit a recorded payment, leave out to record one. */
  @property({ attribute: false }) public payment?: Payment;

  /** Pre-fills the dialog from a suggested reimbursement. */
  @property({ attribute: false }) public settlement?: Settlement;

  @property({ type: String }) public language = "en";

  @state() private fromMember = "";

  @state() private toMember = "";

  @state() private amountInput = "";

  @state() private date = today();

  @state() private busy = false;

  @state() private error?: string;

  @state() private confirmingDelete = false;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.payment) {
      this.fromMember = this.payment.from_member_id;
      this.toMember = this.payment.to_member_id;
      this.amountInput = centsToInput(this.payment.amount);
      this.date = isoToDateInput(this.payment.payment_date);
      return;
    }

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
    const heading = this.payment ? translate("edit_payment") : translate("new_payment");

    return html`
      <se-dialog open heading=${heading} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <se-select
            .label=${translate("from_member")}
            .value=${this.fromMember}
            .options=${options}
            @value-changed=${(e: CustomEvent) => (this.fromMember = e.detail.value)}
          ></se-select>

          <se-select
            .label=${translate("to_member")}
            .value=${this.toMember}
            .options=${options}
            @value-changed=${(e: CustomEvent) => (this.toMember = e.detail.value)}
          ></se-select>

          <se-field
            .label=${translate("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            decimal
            required
            @value-changed=${(e: CustomEvent) => (this.amountInput = e.detail.value)}
          ></se-field>

          <se-field
            .label=${translate("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(e: CustomEvent) => (this.date = e.detail.value)}
          ></se-field>

          ${amount !== null && amount > 0
            ? html`<div class="muted">
                ${formatMoney(amount, this.group.currency, this.language)}
              </div>`
            : nothing}
        </div>

        ${this.confirmingDelete
          ? html`<div slot="banner" class="warning">
              ${translate("confirm_delete_payment")}
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

  private isValid(amount: number | null): boolean {
    return (
      amount !== null &&
      amount > 0 &&
      this.fromMember !== "" &&
      this.toMember !== "" &&
      this.fromMember !== this.toMember
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

    try {
      const payment = this.payment
        ? await this.api.updatePayment(this.payment.id, {
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount,
            payment_date: dateToIso(this.date),
          })
        : await this.api.createPayment({
            group_id: this.group.id,
            from_member_id: this.fromMember,
            to_member_id: this.toMember,
            amount,
            payment_date: dateToIso(this.date),
          });

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
