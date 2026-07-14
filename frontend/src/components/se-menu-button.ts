import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./se-icon";

/**
 * The button that opens Home Assistant's sidebar.
 *
 * A custom panel gets no toolbar of its own: Home Assistant hides the sidebar
 * on a narrow screen and expects the panel to offer the way back. Without this
 * there is no way out of the panel on a phone.
 *
 * `hass-toggle-menu` is the event Home Assistant's own menu button fires; the
 * app shell listens for it above us.
 */
@customElement("se-menu-button")
export class SeMenuButton extends LitElement {
  public static styles = css`
    button {
      background: none;
      border: none;
      color: var(--primary-text-color);
      cursor: pointer;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      flex: 0 0 auto;
    }

    button:hover {
      background: var(--secondary-background-color, #f1f1f1);
    }
  `;

  protected render() {
    return html`
      <button aria-label="menu" @click=${this.toggle}>
        <se-icon plain .icon=${"mdi:menu"} fallback="☰" .size=${24}></se-icon>
      </button>
    `;
  }

  private toggle = () => {
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-menu-button": SeMenuButton;
  }
}
