import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

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
        <input
          .type=${this.type}
          .value=${this.value}
          .placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          inputmode=${this.decimal ? "decimal" : nothing}
          @input=${this.handleInput}
        />
        ${this.suffix ? html`<span class="suffix">${this.suffix}</span>` : nothing}
      </div>
      ${this.helper ? html`<div class="helper">${this.helper}</div>` : nothing}
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
