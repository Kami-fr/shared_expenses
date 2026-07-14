import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

/** A button following the Home Assistant look. */
@customElement("se-button")
export class SeButton extends LitElement {
  @property({ type: String }) public variant: "filled" | "text" | "danger" = "filled";

  @property({ type: Boolean }) public disabled = false;

  @property({ type: String }) public icon?: string;

  public static styles = css`
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 16px;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease;
      width: 100%;
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      opacity: 0.85;
    }

    .filled {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .text {
      background: none;
      color: var(--primary-color, #03a9f4);
    }

    .danger {
      background: none;
      color: var(--error-color, #db4437);
    }
  `;

  protected render() {
    return html`
      <button class=${this.variant} ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.icon ? html`<span aria-hidden="true">${this.icon}</span>` : nothing}
        <slot></slot>
      </button>
    `;
  }

  private handleClick(event: Event) {
    if (this.disabled) {
      event.stopPropagation();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-button": SeButton;
  }
}
