import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { monthGrid, weekdayInitials } from "../services/calendar";
import { formatLongDay, formatMonthLong } from "../services/format";
import type { Localizer } from "../services/localize";
import { addMonths } from "../services/statistics-period";

/** One thing on a day: whose money, and whether it moved between members. */
export interface CalendarMark {
  colour: string;
  payment: boolean;
}

/** How many marks a day shows before it says "and more". */
const MARKS_SHOWN = 3;

/**
 * A month as a wall calendar: a dot on each day for each thing that happened.
 *
 * The list answers "what happened lately"; this answers "what happened on
 * the 18th", and shows at a glance a day with two of the same, or the week
 * the shopping was never written down. A dot per expense in the colour of
 * whoever paid, the colour the list draws down the side of the same row, and
 * an empty ring for money moved between members, which nobody spent.
 *
 * Only marks, never figures: a cell is a seventh of a phone, and the amounts
 * are one tap away, in the rows the page draws under it for the day picked.
 *
 * Fires `month-changed` and `day-picked` with the new value in `detail`; the
 * page owns both, as it owns the search.
 */
@customElement("se-calendar")
export class SeCalendar extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public language = "en";

  /** The month on screen, `YYYY-MM`. */
  @property({ type: String }) public month = "";

  /** The first and last months worth stepping to. */
  @property({ type: String }) public earliest = "";

  @property({ type: String }) public latest = "";

  @property({ type: String }) public today = "";

  @property({ type: String }) public selected: string | null = null;

  /** 0 for Sunday, as `Date.getDay` counts. */
  @property({ type: Number }) public firstDay = 1;

  @property({ attribute: false }) public marks = new Map<string, CalendarMark[]>();

  /** What the month cost, written out; nothing while a search filters it. */
  @property({ type: String }) public spent = "";

  public static styles = css`
    :host {
      display: block;
    }

    .calendar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 10px 10px;
    }

    /* The statistics' stepper, down to its round 40px targets. */
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 2px;
    }

    .now {
      min-width: 0;
      text-align: center;
    }

    .name {
      font-size: 16px;
      font-weight: 600;
    }

    .spent {
      margin-top: 2px;
      font-size: 13px;
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .step {
      width: 40px;
      height: 40px;
      flex: none;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0 3px;
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
      color: var(--primary-text-color);
      font-family: inherit;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

    .step:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .week,
    .grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 2px;
    }

    .week span {
      padding: 4px 0 2px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--secondary-text-color);
    }

    /* A day is a target: a seventh of the card wide, 52px tall. */
    .day {
      height: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 6px 0 0;
      border: none;
      border-radius: 10px;
      background: none;
      color: var(--disabled-text-color, #9e9e9e);
      font-family: inherit;
      cursor: pointer;
    }

    .number {
      width: 22px;
      border-radius: 50%;
      font-size: 14px;
      line-height: 22px;
      font-variant-numeric: tabular-nums;
    }

    .day.busy {
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .day.ahead {
      opacity: 0.6;
    }

    /* Today, ringed in grey: where you are, not what you picked. */
    .day.today .number {
      box-shadow: 0 0 0 1px var(--secondary-text-color);
    }

    /* The one day picked, and the only thing here in the theme's colour. */
    .day[aria-pressed="true"] {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 26%, transparent);
      color: var(--primary-color, #03a9f4);
      font-weight: 700;
    }

    .day:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -2px;
    }

    .marks {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 7px;
    }

    .dot,
    .ring {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      box-sizing: border-box;
    }

    .ring {
      border: 1.5px solid;
    }

    .more {
      font-size: 10px;
      line-height: 7px;
      color: var(--secondary-text-color);
    }

    /*
     * What the two marks mean. The reimbursements used to sit in a button
     * that hid them; it went, so their ring is read here like the dot.
     */
    .foot {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 16px;
      margin-top: 2px;
      padding: 10px 4px 0;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .legend .dot,
    .legend .ring {
      flex: none;
    }

    .legend .dot {
      background: var(--secondary-text-color);
    }

    .legend .ring {
      border-color: var(--secondary-text-color);
    }
  `;

  protected render() {
    const translate = this.localize;
    const name = formatMonthLong(this.month, this.language);
    const before = this.month > this.earliest;
    const after = this.month < this.latest;

    return html`
      <div class="calendar">
        <div class="stepper">
          <button
            class="step"
            aria-label=${translate("calendar_previous")}
            title=${translate("calendar_previous")}
            ?disabled=${!before}
            @click=${() => this.step(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div class="now">
            <div class="name">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
            ${this.spent
              ? html`<div class="spent">
                  ${translate("calendar_spent").replace("{amount}", this.spent)}
                </div>`
              : nothing}
          </div>
          <button
            class="step"
            aria-label=${translate("calendar_next")}
            title=${translate("calendar_next")}
            ?disabled=${!after}
            @click=${() => this.step(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div class="week" aria-hidden="true">
          ${weekdayInitials(this.language, this.firstDay).map((day) => html`<span>${day}</span>`)}
        </div>

        <div class="grid">
          ${monthGrid(this.month, this.firstDay).map((day) =>
            day === null ? html`<span></span>` : this.renderDay(day),
          )}
        </div>

        <div class="foot">
          <span class="legend"><span class="dot"></span>${translate("kind_expense")}</span>
          <span class="legend"><span class="ring"></span>${translate("calendar_payments")}</span>
        </div>
      </div>
    `;
  }

  private renderDay(day: string) {
    const marks = this.marks.get(day) ?? [];
    const classes = [
      "day",
      marks.length > 0 ? "busy" : "",
      day === this.today ? "today" : "",
      day > this.today ? "ahead" : "",
    ];

    return html`
      <button
        class=${classes.join(" ")}
        aria-pressed=${day === this.selected ? "true" : "false"}
        aria-label=${formatLongDay(day, this.language, this.today)}
        @click=${() => this.fire("day-picked", day)}
      >
        <span class="number">${Number(day.slice(8))}</span>
        <span class="marks" aria-hidden="true">
          ${marks.slice(0, MARKS_SHOWN).map((mark) =>
            mark.payment
              ? html`<span class="ring" style=${`border-color:${mark.colour}`}></span>`
              : html`<span class="dot" style=${`background:${mark.colour}`}></span>`,
          )}
          ${marks.length > MARKS_SHOWN ? html`<span class="more">+</span>` : nothing}
        </span>
      </button>
    `;
  }

  private step(delta: number) {
    this.fire("month-changed", addMonths(this.month, delta));
  }

  private fire(name: string, value: unknown) {
    this.dispatchEvent(
      new CustomEvent(name, { detail: { value }, bubbles: true, composed: true }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-calendar": SeCalendar;
  }
}
