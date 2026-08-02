import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { expenseRowStyles, renderExpenseRow } from "./expense-row";
import { colorFor } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Member } from "../types";

/**
 * Picks the purchase a refund gives money back on.
 *
 * Fires `value-changed` with an expense id, or an empty string for none.
 *
 * Not an `se-select`, and that is the whole point of it existing: a native
 * `<option>` carries text and nothing else, on every platform. A purchase is
 * recognised by the face that paid it and the mark of what it was — which is how
 * the list on the group page reads — so the choices here are those same rows.
 * Reading "Intermarché · 18,48 €" out of a dropdown means matching a string
 * against a list you just scrolled past; seeing the row means recognising it.
 */
@customElement("se-expense-picker")
export class SeExpensePicker extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public label = "";

  /** The chosen expense's id, or "" for none. */
  @property({ type: String }) public value = "";

  /** What to offer. Already filtered by the caller: purchases, never refunds. */
  @property({ attribute: false }) public expenses: Expense[] = [];

  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  @property({ type: String }) public language = "en";

  /** Shown when nothing is chosen, and as the row that chooses nothing. */
  @property({ type: String }) public placeholder = "";

  @state() private open = false;

  public static styles = [
    sharedStyles,
    expenseRowStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }

      .field {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        padding: 6px 10px;
        color: inherit;
        font-family: inherit;
        font-size: 16px;
        text-align: left;
        cursor: pointer;
      }

      .field:focus-visible {
        outline: none;
        border-color: var(--primary-color, #03a9f4);
      }

      /*
       * Over the dialog's own content, and scrollable: a household has hundreds
       * of expenses and the newest is the one being refunded, so the list opens
       * on them and never grows past a phone's screen.
       */
      .list {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        max-height: 264px;
        overflow-y: auto;
        margin-top: 4px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.24);
      }

      /* The frame around the row: a button with the payer's colour down it. */
      .row {
        width: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        border-left: 3px solid transparent;
        color: inherit;
        font-family: inherit;
        padding: 8px 10px;
        cursor: pointer;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row:hover,
      .row.chosen {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .none {
        color: var(--secondary-text-color);
      }

      /*
       * A link that is held over a purchase the list does not offer. Never the
       * placeholder's grey: grey says there is nothing here, and there is
       * something here — the id is still the value, and still goes out on the
       * next save. The colour a warning is written in, for the same reason.
       */
      .gone {
        color: var(--error-color, #db4437);
      }

      /* Under the field, where the way through to the purchase also sits. */
      .cut {
        margin-top: 6px;
      }
    `,
  ];

  protected render() {
    const chosen = this.expenses.find((expense) => expense.id === this.value);

    // Held, and not on offer: the purchase has been turned into a refund since,
    // or deleted, or belongs to a project this reader cannot see. Drawn as
    // itself and not as "nothing chosen" — the two are not the same fact, and
    // the second one leaves the reader with an error about an expense over a
    // field saying there is no expense, and no field to clear.
    const gone = chosen === undefined && this.value !== "";

    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}

      <button
        class="field expense-row"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => (this.open = !this.open)}
      >
        ${chosen
          ? renderExpenseRow(chosen, this)
          : html`<span class=${gone ? "gone" : "none"}>
              ${gone ? this.localize("refund_of_missing") : this.placeholder}
            </span>`}
      </button>

      ${this.open
        ? html`
            <div class="list" role="listbox">
              <button class="row none" role="option" @click=${() => this.choose("")}>
                ${this.placeholder}
              </button>
              ${this.expenses.map(
                (expense) => html`
                  <button
                    class=${`row expense-row ${expense.id === this.value ? "chosen" : ""}`}
                    role="option"
                    aria-selected=${expense.id === this.value ? "true" : "false"}
                    style=${`border-left-color:${this.colourOf(expense)}`}
                    @click=${() => this.choose(expense.id)}
                  >
                    ${renderExpenseRow(expense, this)}
                  </button>
                `,
              )}
            </div>
          `
        : nothing}

      <!--
        The way to cut a link nothing else can reach. Opening the list and
        picking "no expense in particular" does the same thing, but a reader
        told the purchase is not there has no reason to go looking through a
        list of purchases for the way to say so. The value is left alone until
        they press it: a deleted purchase that gets restored is meant to find
        its refund still naming it.
      -->
      ${gone
        ? html`
            <button class="link cut" @click=${() => this.choose("")}>
              ${this.localize("refund_of_unlink")}
            </button>
          `
        : nothing}
    `;
  }

  private colourOf(expense: Expense): string {
    const payer = this.members.find(
      (member) => member.id === expense.paid_by_member_id,
    );

    return payer?.color ?? colorFor(expense.paid_by_member_id);
  }

  private choose(value: string) {
    this.open = false;

    if (value === this.value) {
      return;
    }

    this.value = value;

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-expense-picker": SeExpensePicker;
  }
}
