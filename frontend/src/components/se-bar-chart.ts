import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { sharedStyles } from "../styles/shared";

/** One bar: what it is, what it is worth, and how it should be written. */
export interface Bar {
  key: string;
  label: string;
  value: number;
  /** Already formatted: this component knows nothing of money. */
  text: string;
  color?: string;
}

/**
 * Bars, as plain elements.
 *
 * No charting library: Home Assistant's CSP blocks anything loaded from
 * elsewhere, and a bar is a div whose width is a percentage. What a library
 * would add here is a dependency, not a drawing.
 *
 * Scaled on the biggest bar rather than on the total, so the smallest one is
 * still visible when one line dwarfs the rest — the reading is a comparison
 * between bars, and the figures are written next to each anyway.
 */
@customElement("se-bar-chart")
export class SeBarChart extends LitElement {
  @property({ attribute: false }) public bars: Bar[] = [];

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .bar {
        padding: 8px 16px;
      }

      .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 4px;
      }

      .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        white-space: nowrap;
      }

      .track {
        height: 8px;
        border-radius: 4px;
        background: var(--secondary-background-color, #f1f1f1);
        overflow: hidden;
      }

      .fill {
        height: 100%;
        border-radius: 4px;
        background: var(--primary-color, #03a9f4);
        /* A bar of nothing still shows as a sliver rather than vanishing. */
        min-width: 2px;
      }
    `,
  ];

  protected render() {
    if (this.bars.length === 0) {
      return nothing;
    }

    const largest = Math.max(...this.bars.map((bar) => bar.value), 0);

    return html`
      ${this.bars.map(
        (bar) => html`
          <div class="bar">
            <div class="head">
              <span class="label" title=${bar.label}>${bar.label}</span>
              <span class="value">${bar.text}</span>
            </div>
            <div class="track">
              <div
                class="fill"
                style=${`width:${percent(bar.value, largest)}%${
                  bar.color ? `;background:${bar.color}` : ""
                }`}
              ></div>
            </div>
          </div>
        `,
      )}
    `;
  }
}

/** Everything at zero means no bar is bigger than another: draw none of them. */
function percent(value: number, largest: number): number {
  if (largest <= 0) {
    return 0;
  }

  return (value / largest) * 100;
}

declare global {
  interface HTMLElementTagNameMap {
    "se-bar-chart": SeBarChart;
  }
}
