import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * A labelled dropdown.
 *
 * Fires `value-changed` with the selected value in `event.detail.value`.
 */
@customElement("se-select")
export class SeSelect extends LitElement {
  @property({ type: String }) public label = "";

  @property({ type: String }) public value = "";

  @property({ attribute: false }) public options: SelectOption[] = [];

  @property({ type: String }) public placeholder?: string;

  @property({ type: Boolean }) public disabled = false;

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

    select {
      width: 100%;
      background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      padding: 10px 12px;
      outline: none;
    }

    select:focus {
      border-color: var(--primary-color, #03a9f4);
    }

    /*
     * The list that drops down, which is not the box you can see.
     *
     * The popup is painted by the browser, and on a desktop it takes the
     * option's own background — not the select's. An option has none by
     * default, so the popup came out white while the text kept the theme's
     * near-white, and the choices were invisible until you hovered one.
     *
     * Never showed on a phone: there the popup is a system dialog that ignores
     * the page's CSS entirely and follows the OS theme, so it read fine.
     */
    option {
      background-color: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
  `;

  protected render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}
      <select .value=${this.value} ?disabled=${this.disabled} @change=${this.handleChange}>
        ${this.placeholder
          ? html`<option value="" ?selected=${!this.value}>${this.placeholder}</option>`
          : nothing}
        ${this.options.map(
          (option) => html`
            <option value=${option.value} ?selected=${option.value === this.value}>
              ${option.label}
            </option>
          `,
        )}
      </select>
    `;
  }

  private handleChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

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
    "se-select": SeSelect;
  }
}
