import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface QuickAction {
  key: string;
  label: string;
  symbol: string;
  color: string;
}

/**
 * The row of coloured shortcuts on the overview.
 *
 * Fires `action` with `event.detail.key`.
 */
@customElement("se-quick-actions")
export class SeQuickActions extends LitElement {
  @property({ attribute: false }) public actions: QuickAction[] = [];

  public static styles = css`
    :host {
      display: block;
    }

    .row {
      display: flex;
      justify-content: space-around;
      gap: 4px;
      padding: 16px 8px;
    }

    button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-family: inherit;
      color: var(--primary-text-color);
    }

    .bubble {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      transition: transform 0.12s ease;
    }

    button:hover .bubble {
      transform: scale(1.06);
    }

    .label {
      font-size: 12px;
      line-height: 1.25;
      text-align: center;
    }
  `;

  protected render() {
    return html`
      <div class="row">
        ${this.actions.map(
          (action) => html`
            <button @click=${() => this.emit(action.key)} aria-label=${action.label}>
              <div class="bubble" style=${`background:${action.color}`}>
                ${action.symbol}
              </div>
              <span class="label">${action.label}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private emit(key: string) {
    this.dispatchEvent(
      new CustomEvent("action", { detail: { key }, bubbles: true, composed: true }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-quick-actions": SeQuickActions;
  }
}
