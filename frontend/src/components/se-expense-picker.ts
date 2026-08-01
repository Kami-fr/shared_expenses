import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-icon";
import { renderAvatar } from "./avatar";
import { colorFor, formatDayDate, formatMoney } from "../services/format";
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

      /* The group page's own row, at the size a dropdown can carry. */
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        background: none;
        border: none;
        border-left: 3px solid transparent;
        color: inherit;
        font-family: inherit;
        font-size: 14px;
        text-align: left;
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

      /* The pair the group page draws: a face, with what it was on its corner. */
      .face {
        position: relative;
        flex: 0 0 auto;
        line-height: 0;
      }

      .face .avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }

      .face .pip {
        position: absolute;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        border: 2px solid var(--card-background-color, #fff);
      }

      .info {
        flex: 1;
        min-width: 0;
      }

      .title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .when {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .figure {
        flex: 0 0 auto;
        font-variant-numeric: tabular-nums;
      }

      .none {
        color: var(--secondary-text-color);
      }
    `,
  ];

  protected render() {
    const chosen = this.expenses.find((expense) => expense.id === this.value);

    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}

      <button
        class="field"
        aria-haspopup="listbox"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${() => (this.open = !this.open)}
      >
        ${chosen
          ? this.renderExpense(chosen)
          : html`<span class="none">${this.placeholder}</span>`}
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
                    class=${`row ${expense.id === this.value ? "chosen" : ""}`}
                    role="option"
                    aria-selected=${expense.id === this.value ? "true" : "false"}
                    style=${`border-left-color:${this.colourOf(expense)}`}
                    @click=${() => this.choose(expense.id)}
                  >
                    ${this.renderExpense(expense)}
                  </button>
                `,
              )}
            </div>
          `
        : nothing}
    `;
  }

  /** One purchase, as the group page draws it. */
  private renderExpense(expense: Expense) {
    const payer = this.members.find(
      (member) => member.id === expense.paid_by_member_id,
    );
    const category = this.categories.find((item) => item.id === expense.category_id);

    return html`
      <span class="face">
        ${renderAvatar(payer, payer?.name ?? "?", expense.paid_by_member_id)}
        ${category
          ? html`<se-icon
              class="pip"
              aria-hidden="true"
              .icon=${category.icon}
              .fallback=${category.name.charAt(0).toUpperCase()}
              .color=${category.color ?? colorFor(category.id)}
              .size=${14}
              .glyph=${0.82}
            ></se-icon>`
          : nothing}
      </span>
      <span class="info">
        <span class="title">${expense.title}</span>
        <span class="when">${formatDayDate(expense.expense_date, this.language)}</span>
      </span>
      <span class="figure">
        ${formatMoney(expense.amount, expense.currency, this.language)}
      </span>
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
