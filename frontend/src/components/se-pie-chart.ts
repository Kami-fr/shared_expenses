import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

import { colorFor } from "../services/format";
import { sharedStyles } from "../styles/shared";

/** One wedge: what it is, what it is worth, and how to write it. */
export interface Slice {
  key: string;
  label: string;
  value: number;
  /** Already formatted: this component knows nothing of money. */
  text: string;
  color?: string;
}

const SIZE = 160;
const RADIUS = 70;
const CENTRE = SIZE / 2;

/** A full turn. `Math.TAU` is not a thing, however much it ought to be. */
const TURN = Math.PI * 2;

/**
 * A pie, drawn as SVG paths.
 *
 * No charting library: Home Assistant's CSP blocks anything loaded from
 * elsewhere. A pie is arcs, and arcs are arithmetic — what a library would add
 * here is a dependency, not a drawing.
 *
 * The legend is not decoration. A wedge says a proportion and nothing else, so
 * every one of them is named and priced beside it; the colours are only there
 * to tie the two together.
 */
@customElement("se-pie-chart")
export class SePieChart extends LitElement {
  @property({ attribute: false }) public slices: Slice[] = [];

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }

      .chart {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        justify-content: center;
      }

      svg {
        flex: 0 0 auto;
      }

      .legend {
        flex: 1;
        min-width: 160px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .entry {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        flex: 0 0 auto;
      }

      .label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .share {
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        min-width: 40px;
        text-align: right;
      }
    `,
  ];

  protected render() {
    const slices = this.slices.filter((slice) => slice.value > 0);
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);

    if (total <= 0) {
      return nothing;
    }

    return html`
      <div class="chart">
        <svg viewBox="0 0 ${SIZE} ${SIZE}" width=${SIZE} height=${SIZE} role="img">
          ${this.renderWedges(slices, total)}
        </svg>
        <div class="legend">
          ${slices.map(
            (slice) => html`
              <div class="entry">
                <span
                  class="dot"
                  style=${`background:${slice.color ?? colorFor(slice.key)}`}
                ></span>
                <span class="label" title=${slice.label}>${slice.label}</span>
                <span class="value">${slice.text}</span>
                <span class="share">${percent(slice.value, total)}</span>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  private renderWedges(slices: Slice[], total: number) {
    // A single slice is the whole circle, and an arc that goes all the way
    // round starts and ends at the same point: it would draw nothing at all.
    if (slices.length === 1) {
      const only = slices[0];

      return svg`
        <circle
          cx=${CENTRE}
          cy=${CENTRE}
          r=${RADIUS}
          fill=${only.color ?? colorFor(only.key)}
        ></circle>
      `;
    }

    let start = 0;

    return slices.map((slice) => {
      const angle = (slice.value / total) * TURN;
      const path = wedge(start, start + angle);

      start += angle;

      return svg`<path d=${path} fill=${slice.color ?? colorFor(slice.key)}></path>`;
    });
  }
}

/** The path of one wedge, from one angle to another, in radians. */
function wedge(from: number, to: number): string {
  const [x1, y1] = onCircle(from);
  const [x2, y2] = onCircle(to);

  // The flag that tells SVG which way round to go. Past a half turn there are
  // two arcs between the same two points, and it would draw the wrong one.
  const large = to - from > Math.PI ? 1 : 0;

  return `M ${CENTRE} ${CENTRE} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${x2} ${y2} Z`;
}

/** A point on the circle. Angles start at twelve o'clock and go clockwise. */
function onCircle(angle: number): [number, number] {
  const turned = angle - Math.PI / 2;

  return [
    CENTRE + RADIUS * Math.cos(turned),
    CENTRE + RADIUS * Math.sin(turned),
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "se-pie-chart": SePieChart;
  }
}

function percent(value: number, total: number): string {
  const share = (value / total) * 100;

  return `${share >= 10 ? Math.round(share) : share.toFixed(1)} %`;
}
