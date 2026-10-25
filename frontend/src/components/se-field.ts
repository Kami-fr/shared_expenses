import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { formatNumericDay } from "../services/format";

/**
 * A labelled input.
 *
 * Fires `value-changed` with the raw string value in `event.detail.value`.
 */
@customElement("se-field")
export class SeField extends LitElement {
  @property({ type: String }) public label = "";

  @property({ type: String }) public value = "";

  @property({ type: String }) public type: "text" | "number" | "date" = "text";

  @property({ type: String }) public placeholder = "";

  @property({ type: String }) public suffix?: string;

  @property({ type: String }) public helper?: string;

  @property({ type: Boolean }) public required = false;

  @property({ type: Boolean }) public disabled = false;

  /** Show the decimal keypad on mobile. Named to avoid HTMLElement.inputMode. */
  @property({ type: Boolean }) public decimal = false;

  /** The panel's language, which a date is written in. */
  @property({ type: String }) public language = "en";

  public static styles = css`
    :host {
      display: block;
    }

    label {
      display: block;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    .wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      padding: 0 12px;
      transition: border-color 0.15s ease;
    }

    .wrapper:focus-within {
      border-color: var(--primary-color, #03a9f4);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: none;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      padding: 10px 0;
    }

    .day {
      position: relative;
      flex: 1;
      min-width: 0;
      font-size: 16px;
      padding: 10px 0;
      color: var(--primary-text-color);
    }

    /* The browser's own date input, unseen over the day it holds: a tap still
       opens its calendar, but what is read is the panel's writing of it. */
    .day input {
      position: absolute;
      inset: 0;
      opacity: 0;
      padding: 0;
      cursor: pointer;
    }

    .suffix {
      color: var(--secondary-text-color);
      font-size: 14px;
      white-space: nowrap;
    }

    .helper {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
  `;

  protected render() {
    return html`
      ${this.label ? html`<label>${this.label}${this.required ? " *" : ""}</label>` : nothing}
      <div class="wrapper">
        ${this.type === "date" ? this.renderDay() : this.renderInput()}
        ${this.suffix ? html`<span class="suffix">${this.suffix}</span>` : nothing}
        <!-- For a suffix that does something, where a word would sit. -->
        <slot name="suffix"></slot>
      </div>
      ${this.helper ? html`<div class="helper">${this.helper}</div>` : nothing}
    `;
  }

  /**
   * A day, written in the panel's language, over the browser's date input.
   *
   * The browser writes a date input in its own language, not the panel's: a
   * phone set to American English showed 10/24/2026 in a French panel, month
   * first, to somebody reading the day first everywhere else on the page.
   */
  private renderDay() {
    return html`
      <div class="day">
        <span>${this.value ? formatNumericDay(this.value, this.language) : html`&nbsp;`}</span>
        <input
          type="date"
          .value=${this.value}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          @click=${this.openCalendar}
          @input=${this.handleInput}
        />
      </div>
    `;
  }

  /**
   * The calendar, wherever the field is touched.
   *
   * Unseen, the input's own little segments would take a click on a computer
   * and change a figure nobody can see being changed.
   */
  private openCalendar(event: Event) {
    const input = event.target as HTMLInputElement;

    try {
      input.showPicker?.();
    } catch {
      // Refused without a fresh tap, or by an older browser: the input keeps
      // its own behaviour, which still opens the calendar on a phone.
    }
  }

  private renderInput() {
    return html`
      <input
        .type=${this.type}
        .value=${this.value}
        .placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        inputmode=${this.decimal ? "decimal" : nothing}
        @input=${this.handleInput}
      />
    `;
  }

  private handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

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
    "se-field": SeField;
  }
}
