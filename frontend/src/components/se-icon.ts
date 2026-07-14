import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A category icon in a coloured pill.
 *
 * Renders `ha-icon` when Home Assistant has registered it, which is the only
 * way to show an arbitrary `mdi:*` name without bundling the 1.5 MB of Material
 * Design Icons. Falls back to an initial when it is not available, so the panel
 * never shows an empty square.
 */
@customElement("se-icon")
export class SeIcon extends LitElement {
  /** A Material Design Icons name, for example `mdi:cart`. */
  @property({ type: String }) public icon?: string | null;

  /** Shown when there is no icon, or when `ha-icon` is unavailable. */
  @property({ type: String }) public fallback = "?";

  @property({ type: String }) public color = "#5c6b8a";

  @property({ type: Number }) public size = 40;

  /** Draw the glyph on its own, in the current text colour, with no pill. */
  @property({ type: Boolean }) public plain = false;

  public static styles = css`
    :host {
      display: block;
      flex: 0 0 auto;
    }

    .pill {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
    }

    ha-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bare {
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      line-height: 1;
    }
  `;

  protected render() {
    if (this.plain) {
      return html`
        <div
          class="bare"
          style=${`--mdc-icon-size: ${this.size}px; font-size: ${this.size}px;`}
        >
          ${this.renderContent()}
        </div>
      `;
    }

    // `--mdc-icon-size` takes a length: a percentage is invalid and silently
    // leaves the icon at its 24px default, which overflows a small pill.
    const style = `
      background: ${this.color};
      width: ${this.size}px;
      height: ${this.size}px;
      font-size: ${Math.round(this.size * 0.35)}px;
      --mdc-icon-size: ${Math.round(this.size * 0.55)}px;
    `;

    return html`
      <div class="pill" style=${style}>${this.renderContent()}</div>
    `;
  }

  private renderContent() {
    if (this.icon && this.hasHaIcon()) {
      return html`<ha-icon .icon=${this.icon}></ha-icon>`;
    }

    return html`<span>${this.fallback}</span>`;
  }

  /** `ha-icon` belongs to the Home Assistant frontend, not to this bundle. */
  private hasHaIcon(): boolean {
    return customElements.get("ha-icon") !== undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-icon": SeIcon;
  }
}
