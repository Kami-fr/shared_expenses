import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { PALETTE } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";

/**
 * Pick a colour, or leave it to the app.
 *
 * Fires `value-changed` with a hex colour, or null for automatic.
 */
@customElement("se-color-picker")
export class SeColorPicker extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public label = "";

  /** A hex colour, or null to let the app pick a stable one. */
  @property({ type: String }) public value: string | null = null;

  /** The colour used when none is chosen, so "Auto" shows the real thing. */
  @property({ type: String }) public fallback = "#5c6b8a";

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }

      .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      button {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 15px;
        line-height: 1;
      }

      button[aria-pressed="true"] {
        border-color: var(--primary-text-color);
      }

      .auto {
        position: relative;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
    `,
  ];

  protected render() {
    const translate = this.localize;

    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}

      <div class="swatches">
        <button
          class="auto"
          title=${translate("color_auto")}
          aria-pressed=${this.value === null}
          style=${`background:${this.fallback}`}
          @click=${() => this.pick(null)}
        >
          ${translate("color_auto_short")}
        </button>

        ${PALETTE.map(
          (color) => html`
            <button
              aria-pressed=${this.value === color}
              title=${color}
              style=${`background:${color}`}
              @click=${() => this.pick(color)}
            >
              ${this.value === color ? "✓" : ""}
            </button>
          `,
        )}
      </div>
    `;
  }

  private pick(color: string | null) {
    this.value = color;

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: color },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-color-picker": SeColorPicker;
  }
}
