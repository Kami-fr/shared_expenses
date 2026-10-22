import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-icon";
import type { SharedExpensesApi } from "../services/api";
import { colorOf, formatMoney, formatMonthLong } from "../services/format";
import { errorMessage, type Key, type Localizer } from "../services/localize";
import {
  type Period,
  addMonths,
  averageOf,
  change,
  inPeriod,
  openingPeriod,
  periodSpan,
  stepPeriod,
  totalOf,
  trendWindow,
} from "../services/statistics-period";
import { sharedStyles } from "../styles/shared";
import type { Category, CategoryTotal, GroupStatistics, Member } from "../types";
import { renderAvatar } from "./avatar";

/** What the uncategorised is drawn in, when a category would carry its own colour. */
const NO_CATEGORY_COLOUR = "#8a9099";

/**
 * The mark for the uncategorised, the same the categories screen wears for it:
 * a tag struck through. Without it the chip was a bare coloured square — a hole
 * where every other row has a glyph — and "no category" is a thing to show, not
 * a thing missing.
 */
const NO_CATEGORY_ICON = "mdi:tag-off-outline";

/**
 * What the group spent, cut three ways.
 *
 * Reimbursements are left out throughout: moving money between members is not
 * spending it, and counting it would say the household spent 100 on a 90 shop.
 *
 * One reading, top to bottom: which stretch of time, what it cost and how that
 * compares, where it went, how it sits among the months around it, and who paid
 * against whose share it was. It opens on the last month anything was spent in,
 * because a household counts in months — "what did October cost?" — and the
 * calendar's own month is empty on the 1st.
 */
@customElement("se-statistics")
export class SeStatistics extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  /** Members including those who left: they spent, and it still counts. */
  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  /** Which member you are, to point out your own share. */
  @property({ type: String }) public meId: string | null = null;

  @property({ type: String }) public currency = "EUR";

  @property({ type: String }) public language = "en";

  @state() private result?: GroupStatistics;

  /** The period asked for; none until the months are known to pick one from. */
  @state() private period?: Period;

  /** The period the figures on screen are for — not one that failed on the way. */
  private loaded?: Period;

  @state() private error?: string;

  /** Whether "where it went" is drawn as a disc rather than a run of bars. */
  @state() private pie = readPieStyle();

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Which kind of period, as one segmented control across the width: a
         single choice among three, which is what a segmented control is for. */
      .seg {
        display: flex;
        gap: 2px;
        padding: 3px;
        border-radius: 12px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .seg button {
        flex: 1;
        min-width: 0;
        min-height: 36px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        padding: 6px 8px;
        border-radius: 9px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .seg button[aria-pressed="true"] {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
      }

      /* Which month or year, with a step either way. */
      .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .stepper .now {
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .step:disabled {
        opacity: 0.35;
        cursor: default;
      }

      /* Each section on a surface of its own. The dialog is drawn in the card
         colour, so a card in that same colour with a theme's shadow — which a
         dark theme commonly turns off — left the whole page one flat sheet on a
         phone, and the sections ran into each other. Mixed from the theme's own
         text and card colours, so the step is there in a light theme, a dark one
         and whatever a household wears, and a hairline makes it a boundary. */
      .panel {
        background: var(--secondary-background-color, #f2f2f2);
        background: color-mix(
          in srgb,
          var(--primary-text-color, #212121) 5%,
          var(--card-background-color, #fff)
        );
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: var(--se-radius, 14px);
        padding: 16px;
      }

      /* What the period cost, the first thing read: tinted with the theme's own
         colour so the page has somewhere to start, without the block of solid
         colour it used to be, which drowned the figure it was there to carry. */
      .hero {
        background: color-mix(
          in srgb,
          var(--primary-color, #03a9f4) 13%,
          var(--card-background-color, #fff)
        );
        border-color: color-mix(in srgb, var(--primary-color, #03a9f4) 35%, transparent);
      }

      .hero .lbl {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .hero .big {
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.5px;
        margin: 2px 0 2px;
        font-variant-numeric: tabular-nums;
      }

      .hero .cmp {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /* More spent is the figure to notice, less is the good news; the sign in
         the text says which, the colour only repeats it. */
      .hero .cmp.up {
        color: var(--se-negative);
        font-weight: 600;
      }

      .hero .cmp.down {
        color: var(--se-positive);
        font-weight: 600;
      }

      .mine {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
      }

      .mine .k {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .mine .v {
        font-size: 17px;
        font-weight: 600;
        margin-top: 2px;
        font-variant-numeric: tabular-nums;
      }

      .sec {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        margin-bottom: 14px;
      }

      /* A section title with something to set on its right. */
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .head .sec {
        margin-bottom: 0;
      }

      .head .aside {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /* Which chart, on the switch the split editor puts the currency and the
         percent on: two halves, the one in use filled. Glyphs rather than
         words, so it says the same thing in every language. */
      .units {
        display: flex;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        overflow: hidden;
        flex: 0 0 auto;
      }

      .units button {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 13px;
        padding: 5px 12px;
        cursor: pointer;
      }

      .units button[aria-pressed="true"] {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      /* The same figures as a disc, for whoever reads a proportion faster as an
         angle than as a length. The list below it stays the legend. */
      .pie {
        display: block;
        width: 176px;
        height: 176px;
        max-width: 100%;
        margin: 0 auto 14px;
        filter: drop-shadow(0 2px 4px rgba(20, 30, 40, 0.2));
      }

      /* Each wedge is cut from its neighbours by a line in the card's own
         colour, so the disc reads as a set of pieces rather than one ring of
         paint. */
      .pie path,
      .pie circle {
        stroke: var(--card-background-color, #fff);
        /* In the square's units too: 1.4 is the 3px the crop was drawn at. */
        stroke-width: 1.4;
        stroke-linejoin: round;
      }

      .pie text {
        /* Drawn in the square's units, so the cropped box magnifies it: 6.2
           here is the 13px it was before the crop. */
        font-size: 6.2px;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: central;
        font-variant-numeric: tabular-nums;
      }

      /* Where the money went: a ranking of bars, biggest first. A bar answers
         "how much of it" faster than a wedge does on a phone. */
      .cat {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cat + .cat {
        margin-top: 14px;
      }

      .chip {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cb {
        flex: 1;
        min-width: 0;
      }

      /* Name, then what it cost and its share of the whole on one line: the
         share sits against the figure it is a share of, not in a column of its
         own that a long name pushes out of line. */
      .cb .t {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-size: 14.5px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .cb .t .nm {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cb .t .amt {
        font-variant-numeric: tabular-nums;
        flex: none;
      }

      .cb .t .pc {
        flex: none;
        min-width: 34px;
        text-align: right;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .track {
        height: 7px;
        border-radius: 4px;
        background: color-mix(in srgb, var(--primary-text-color, #212121) 12%, transparent);
        overflow: hidden;
      }

      .track i {
        display: block;
        height: 100%;
        border-radius: 4px;
      }

      /* A year of months as bars, no figure on them: twelve figures do not fit
         a phone, and the one being read is in the title above. Each bar is the
         way to that month. */
      .trend {
        position: relative;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 112px;
      }

      .trend button {
        flex: 1;
        min-width: 0;
        height: 100%;
        display: flex;
        align-items: flex-end;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
      }

      .trend .bx {
        width: 100%;
        min-height: 3px;
        border-radius: 5px 5px 2px 2px;
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
      }

      .trend button[aria-pressed="true"] .bx {
        background: var(--primary-color, #03a9f4);
      }

      .trend .avg {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 2px dashed var(--secondary-text-color);
        opacity: 0.6;
        pointer-events: none;
      }

      /* Each month named under its bar, short: an initial alone left J, J and
         J to be told apart by position. Measured at 360 pixels, the longest
         abbreviation in the eight languages ("mars") is a hair wider than its
         bar, so each name is centred on the bar and allowed past its edges; two
         neighbours' halves still fit in a bar and a gap. The year is written
         where it turns, and under the first month, so a run that crosses
         January says which side is which. */
      .letters {
        display: flex;
        gap: 4px;
        margin-top: 6px;
      }

      .letters > span {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 10px;
        line-height: 1.25;
        white-space: nowrap;
        color: var(--secondary-text-color);
      }

      .letters > span.on {
        color: var(--primary-text-color);
        font-weight: 700;
      }

      .letters .yr {
        font-size: 9px;
        opacity: 0.8;
      }

      .legend {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .legend::before {
        content: "";
        width: 18px;
        border-top: 2px dashed var(--secondary-text-color);
      }

      /* Who paid against whose share it was. The gap between the two is said as
         a gap: a debt is the group page's to tell, since only it counts the
         reimbursements that settle one. */
      .who {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .who + .who {
        margin-top: 14px;
      }

      .who .mid {
        flex: 1;
        min-width: 0;
      }

      /* Two lines, each a pair: the name and the gap, then what was paid and
         borne and what the gap means. The words for the gap run long in some
         languages ("weniger als der eigene Anteil"); kept in a column of their
         own they squeezed the figures beside them onto three lines, so they
         share the second line and drop below it only when they must. */
      .who .r1,
      .who .r2 {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        column-gap: 10px;
      }

      .who .r2 {
        flex-wrap: wrap;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .who .nm {
        min-width: 0;
        font-size: 14.5px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .who .ps {
        font-variant-numeric: tabular-nums;
      }

      .who .gw {
        margin-left: auto;
        font-size: 11px;
      }

      .who .gap {
        flex: none;
        font-size: 14.5px;
        font-variant-numeric: tabular-nums;
      }

      .who .gap.more {
        color: var(--se-positive);
      }

      .who .gap.less {
        color: var(--se-negative);
      }

      .note {
        margin-top: 14px;
        font-size: 12px;
        line-height: 1.45;
        color: var(--secondary-text-color);
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected render() {
    const translate = this.localize;

    // Nothing has ever come through: the error is all there is to show.
    if (!this.result || !this.period) {
      if (this.error) {
        return html`<div class="error">${this.error}</div>`;
      }

      return html`<div class="panel"><div class="empty">${translate("loading")}</div></div>`;
    }

    if (this.result.years.length === 0) {
      return html`<div class="panel"><div class="empty">${translate("no_expenses")}</div></div>`;
    }

    // A period that failed to load takes the error and nothing else: the figures
    // of the period that did load are still worth reading, and the picker above
    // them is the only way to ask for another one — dropping it would leave the
    // screen with no way forward but closing the dialog.
    return html`
      ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
      ${this.renderPeriod()} ${this.renderHero()} ${this.renderCategories()}
      ${this.renderTrend()} ${this.renderMembers()}
    `;
  }

  private renderPeriod() {
    const period = this.period!;
    const result = this.result!;
    const kinds: [Period["kind"], Key][] = [
      ["month", "period_month"],
      ["year", "period_year"],
      ["all", "period_all"],
    ];

    const before = stepPeriod(period, -1, result.months, result.years);
    const after = stepPeriod(period, 1, result.months, result.years);

    return html`
      <div class="seg" role="group">
        ${kinds.map(
          ([kind, key]) => html`
            <button aria-pressed=${period.kind === kind} @click=${() => this.pickKind(kind)}>
              ${this.localize(key)}
            </button>
          `,
        )}
      </div>
      ${period.kind === "all"
        ? nothing
        : html`
            <div class="stepper">
              <button
                class="step"
                aria-label=${this.localize("stat_previous")}
                title=${this.localize("stat_previous")}
                ?disabled=${!before}
                @click=${() => before && this.pick(before)}
              >
                ${chevron("M15 18l-6-6 6-6")}
              </button>
              <span class="now">${this.periodName(period)}</span>
              <button
                class="step"
                aria-label=${this.localize("stat_next")}
                title=${this.localize("stat_next")}
                ?disabled=${!after}
                @click=${() => after && this.pick(after)}
              >
                ${chevron("M9 18l6-6-6-6")}
              </button>
            </div>
          `}
    `;
  }

  private renderHero() {
    const result = this.result!;
    const period = this.period!;
    const mine = result.by_member.find((item) => item.member_id === this.meId);

    let label: string;
    let comparison: unknown = nothing;

    if (period.kind === "month") {
      label = this.fill("stat_spent_month", {
        month: formatMonthLong(period.month, this.language),
      });

      const previous = addMonths(period.month, -1);
      const moved = change(result.total, totalOf(result.months, previous));

      if (moved !== null) {
        comparison = html`<div class="cmp ${moved > 0 ? "up" : moved < 0 ? "down" : ""}">
          ${this.fill("stat_change", {
            change: this.percent(moved),
            month: formatMonthLong(previous, this.language, false),
          })}
        </div>`;
      }
    } else {
      label =
        period.kind === "year"
          ? this.fill("stat_spent_year", { year: String(period.year) })
          : this.localize("stat_spent_all");

      const span = periodSpan(period, result.months);

      comparison = html`<div class="cmp">
        ${this.fill("stat_per_month", { amount: this.money(Math.round(result.total / span)) })}
      </div>`;
    }

    return html`
      <div class="panel hero">
        <div class="lbl">${label}</div>
        <div class="big">${this.money(result.total)}</div>
        ${comparison}
        ${mine
          ? html`<div class="mine">
              <div>
                <div class="k">${this.localize("your_share")}</div>
                <div class="v">${this.money(mine.share)}</div>
              </div>
              <div>
                <div class="k">${this.localize("stat_you_paid")}</div>
                <div class="v">${this.money(mine.paid)}</div>
              </div>
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderCategories() {
    const result = this.result!;

    if (result.by_category.length === 0) {
      return nothing;
    }

    return html`
      <div class="panel">
        <div class="head">
          <div class="sec">${this.localize("stat_where")}</div>
          ${this.renderChartStyle()}
        </div>
        ${this.pie ? this.renderPie() : this.renderBars()}
      </div>
    `;
  }

  /** The switch between the two charts, remembered by the browser it is set in. */
  private renderChartStyle() {
    const bars = this.localize("stat_chart_bars");
    const pie = this.localize("stat_chart_pie");

    return html`
      <div class="units" role="group">
        <button
          aria-pressed=${!this.pie}
          aria-label=${bars}
          title=${bars}
          @click=${() => this.setPie(false)}
        >
          <se-icon plain .size=${16} .icon=${"mdi:chart-bar"}></se-icon>
        </button>
        <button
          aria-pressed=${this.pie}
          aria-label=${pie}
          title=${pie}
          @click=${() => this.setPie(true)}
        >
          <se-icon plain .size=${16} .icon=${"mdi:chart-pie"}></se-icon>
        </button>
      </div>
    `;
  }

  /** Biggest first, each against the biggest, so the ranking is the shape. */
  private renderBars() {
    const result = this.result!;
    const biggest = this.biggestCategory();

    return html`${result.by_category.map((item) =>
      this.renderCategoryRow(item, biggest, result.total),
    )}`;
  }

  /**
   * What every bar is drawn against.
   *
   * On size, so a category that came out refunded still draws a bar as long as
   * what it gave back. The figure beside it carries the minus; a bar of negative
   * length draws nothing at all, which would read as "no expense".
   */
  private biggestCategory(): number {
    return (
      Math.max(...this.result!.by_category.map((item) => Math.abs(item.total))) || 1
    );
  }

  /**
   * The same figures as a disc, each category a wedge in its own colour, laid
   * out clockwise from noon and from the biggest, since the list already
   * arrives sorted. Its share is written on it where there is room to write it,
   * and the rows below stay the legend, whole: a wedge alone says nothing about
   * what it is, and the ones too small to carry a figure say least of all.
   */
  private renderPie() {
    const result = this.result!;
    const slices = result.by_category.filter((item) => item.total > 0);
    const biggest = this.biggestCategory();

    // The disc adds up to what it draws, not to what the group spent. Refunds
    // pull the total under the sum of the categories still standing, and the
    // wedges would then run past the full turn and lie on top of each other.
    // The rows below are the legend of this disc, so they are written against
    // this same total: a legend that disagrees with the thing it explains is
    // worse than either figure alone.
    const total = slices.reduce((sum, item) => sum + item.total, 0) || 1;
    let cursor = 0;

    return html`
      <!-- The disc is drawn in a 100-square but only fills its middle, so the
           box is cropped to the disc and a hair for the stroke: the geometry
           stays plain to read, and no dead margin is paid for on screen. -->
      <svg class="pie" viewBox="9 9 82 82" aria-hidden="true">
        ${slices.map((item, index) => {
          const colour = this.categoryColour(item.category_id);
          const share = item.total / total;
          const start = cursor;

          // The last wedge closes on the full turn exactly: adding up one slice
          // at a time otherwise leaves a hairline of nothing showing at the end.
          const end = index === slices.length - 1 ? 360 : start + share * 360;
          cursor = end;

          // A wedge that is the whole disc has no middle to sit beside: its
          // figure belongs in the centre, not adrift at the bottom of it.
          const [x, y] =
            end - start >= 359.999 ? [50, 50] : pointAt((start + end) / 2, LABEL_RADIUS);

          return svg`
            ${wedge(start, end, colour)}
            ${share >= LABEL_MIN_SHARE
              ? svg`<text x=${x} y=${y} fill=${inkOn(colour)}>
                  ${Math.round(share * 100)}%
                </text>`
              : nothing}
          `;
        })}
      </svg>
      ${result.by_category.map((item) => this.renderCategoryRow(item, biggest, total))}
    `;
  }

  /**
   * One category, the same line under either chart: its mark, its name, what it
   * cost, its bar, and what share of everything that is.
   *
   * The bar stays under the disc, where it used to be left off on the grounds
   * that the wedge had already said it. It has not: the disc draws only what
   * came out positive and writes a figure on a wedge only where there is room
   * for one, so the smallest categories — the ones a ranking is read for — were
   * a colour and nothing else. And a row that gains and loses a part of itself
   * depending on the chart above it makes the two lists read as two different
   * lists, which they are not.
   *
   * The share is taken against a total handed in rather than one read here: the
   * bars are read against what the group spent, and the disc's legend against
   * what the disc draws, which refunds pull apart.
   */
  private renderCategoryRow(item: CategoryTotal, biggest: number, total: number) {
    const category = this.category(item.category_id);
    const colour = this.categoryColour(item.category_id);

    // A real category shows its icon, or its initial where it has none;
    // the uncategorised shows the struck tag rather than an empty chip.
    const icon = category ? category.icon : NO_CATEGORY_ICON;
    const fallback = category ? category.name.charAt(0).toUpperCase() : "";

    return html`
      <div class="cat">
        <div
          class="chip"
          style=${`background:color-mix(in srgb, ${colour} 24%, transparent);color:${colour}`}
        >
          <se-icon plain .size=${20} .icon=${icon} .fallback=${fallback}></se-icon>
        </div>
        <div class="cb">
          <div class="t">
            <span class="nm">${this.categoryName(item.category_id)}</span>
            <span class="amt">${this.money(item.total)}</span>
            <!--
              Never below nothing, and never a share of nothing. A category refunded
              past what it cost comes out negative, and a share of what the group
              spent cannot be: "-12 %" is not a fact about anything. A period that
              came out refunded to the last cent has no total to take a share of at
              all, and dividing by it would print "Infinity%" or "NaN%" on the row.
              Nothing is hidden by flooring either — the bar below it is drawn on
              the size, and the figure beside it carries its own minus.
            -->
            <span class="pc">
              ${this.percent(total > 0 ? Math.max(0, item.total / total) : 0, false)}
            </span>
          </div>
          <div class="track">
            <i
              style=${`width:${Math.max(3, (Math.abs(item.total) / biggest) * 100)}%;background:${colour}`}
            ></i>
          </div>
        </div>
      </div>
    `;
  }

  private setPie(pie: boolean) {
    if (pie === this.pie) {
      return;
    }

    this.pie = pie;
    rememberPieStyle(pie);
  }

  /**
   * The months around the period, as bars to compare it with and to go to.
   *
   * A year at most, from the first expense on, empty months drawn at nothing
   * rather than left out: a gap in the run would read as the months on either
   * side being neighbours. The dashed line is the average of what is drawn.
   */
  private renderTrend() {
    const result = this.result!;
    const period = this.period!;
    const window = trendWindow(result.months, period);

    // One month is not a trend, and its bar would only repeat the total above.
    if (window.length < 2) {
      return nothing;
    }

    const tallest = Math.max(...window.map((item) => item.total), 1);
    const average = averageOf(window);
    const short = new Intl.DateTimeFormat(this.language, { month: "short" });

    return html`
      <div class="panel">
        <div class="head">
          <div class="sec">${this.localize("stat_trend")}</div>
          ${period.kind === "month"
            ? html`<span class="aside">${this.money(totalOf(result.months, period.month))}</span>`
            : nothing}
        </div>
        <div class="trend">
          ${average > 0
            ? html`<div class="avg" style=${`bottom:${(average / tallest) * 100}%`}></div>`
            : nothing}
          ${window.map(
            (item) => html`
              <button
                aria-pressed=${inPeriod(item.month, period)}
                aria-label=${`${formatMonthLong(item.month, this.language)}: ${this.money(item.total)}`}
                title=${`${formatMonthLong(item.month, this.language)}: ${this.money(item.total)}`}
                @click=${() => this.pick({ kind: "month", month: item.month })}
              >
                <div class="bx" style=${`height:${Math.max(0, (item.total / tallest) * 100)}%`}></div>
              </button>
            `,
          )}
        </div>
        <div class="letters" aria-hidden="true">
          ${window.map((item, position) => {
            const [year, index] = item.month.split("-").map(Number);

            // The dot some languages abbreviate with ("oct.") is a character
            // the bar has no room for, and says nothing a short name does not.
            return html`<span class=${inPeriod(item.month, period) ? "on" : ""}>
              ${short.format(new Date(year, index - 1, 1)).replace(/\.$/, "")}
              ${position === 0 || index === 1 ? html`<span class="yr">${year}</span>` : nothing}
            </span>`;
          })}
        </div>
        ${average > 0
          ? html`<div class="legend">
              ${this.fill("stat_average", { amount: this.money(average) })}
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderMembers() {
    const result = this.result!;

    if (result.by_member.length === 0) {
      return nothing;
    }

    return html`
      <div class="panel">
        <div class="sec">${this.localize("stat_who_paid")}</div>
        ${result.by_member.map((item) => {
          const member = this.members.find((m) => m.id === item.member_id);
          const name = member?.name ?? "?";
          const gap = item.paid - item.share;
          const way = gap > 0 ? "more" : gap < 0 ? "less" : "";

          return html`
            <div class="who">
              ${renderAvatar(member, name, item.member_id)}
              <div class="mid">
                <div class="r1">
                  <span class="nm">${name}</span>
                  <b class="gap ${way}">
                    ${gap > 0 ? "+" : gap < 0 ? "−" : ""}${this.money(Math.abs(gap))}
                  </b>
                </div>
                <div class="r2">
                  <span class="ps">
                    ${this.fill("stat_paid_share", {
                      paid: this.money(item.paid),
                      share: this.money(item.share),
                    })}
                  </span>
                  <span class="gw">
                    ${this.localize(gap > 0 ? "stat_more" : gap < 0 ? "stat_less" : "stat_exact")}
                  </span>
                </div>
              </div>
            </div>
          `;
        })}
        <div class="note">${this.localize("stat_not_settling")}</div>
      </div>
    `;
  }

  private category(id: string | null): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  /**
   * What a category is drawn in, here and nowhere else.
   *
   * Its own colour when it chose one, and otherwise a stable one drawn from its
   * id — the same trick a member without a colour gets for their initials. A
   * category left on the default would otherwise share the neutral grey with
   * the uncategorised, and a chart of grey bars says nothing about which is
   * which. The uncategorised keeps that grey: it is the absence of a category,
   * not one more of them.
   */
  private categoryColour(id: string | null): string {
    const category = this.category(id);

    if (!category) {
      return NO_CATEGORY_COLOUR;
    }

    return colorOf(category, this.categories);
  }

  private categoryName(id: string | null): string {
    return this.category(id)?.name ?? this.localize("no_category");
  }

  private money(cents: number): string {
    return formatMoney(cents, this.currency, this.language);
  }

  /** A translation with `{placeholders}` filled in — the grammar stays in the string. */
  private fill(key: Key, params: Record<string, string>): string {
    let text = this.localize(key);

    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, value);
    }

    return text;
  }

  /**
   * A fraction as the language writes a percentage: "−17 %", "+9%".
   *
   * Signed for a change, where which way it went is the point; plain for a
   * share, which is never below nothing.
   */
  private percent(fraction: number, signed = true): string {
    return new Intl.NumberFormat(this.language, {
      style: "percent",
      maximumFractionDigits: 0,
      signDisplay: signed ? "exceptZero" : "auto",
    }).format(fraction);
  }

  /** The period as the stepper names it, opening its line. */
  private periodName(period: Period): string {
    if (period.kind === "month") {
      const name = formatMonthLong(period.month, this.language);

      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    return period.kind === "year" ? String(period.year) : this.localize("period_all");
  }

  /**
   * Switch between a month, a year and everything, keeping to the same time.
   *
   * From a month, the year it is in; from a year, the last month spent in that
   * year. Jumping back to today on every switch would lose the place somebody
   * had stepped back to.
   */
  private pickKind(kind: Period["kind"]) {
    const period = this.period!;
    const months = this.result!.months;

    if (kind === period.kind) {
      return;
    }

    if (kind === "all") {
      this.pick({ kind: "all" });
    } else if (kind === "year") {
      this.pick({
        kind: "year",
        year: period.kind === "month" ? Number(period.month.slice(0, 4)) : this.result!.years[0],
      });
    } else {
      const within =
        period.kind === "year" ? months.filter((item) => inPeriod(item.month, period)) : months;

      this.pick(openingPeriod(within));
    }
  }

  private pick(period: Period) {
    if (this.period && JSON.stringify(period) === JSON.stringify(this.period)) {
      return;
    }

    this.period = period;
    void this.load();
  }

  private async load() {
    this.error = undefined;

    try {
      // The first time, the months are not known yet, and the month to open on
      // is the last of them: everything is asked for first, which answers with
      // every month whatever it covers.
      if (!this.period) {
        const everything = await this.api.getStatistics(this.groupId);
        const opening = openingPeriod(everything.months);

        if (opening.kind === "all") {
          this.result = everything;
          this.period = this.loaded = opening;

          return;
        }

        this.period = opening;
      }

      const asked = this.period;
      const result = await this.api.getStatistics(
        this.groupId,
        asked.kind === "month"
          ? { month: asked.month }
          : asked.kind === "year"
            ? { year: asked.year }
            : {},
      );

      // Another period was picked while this one was on its way; its own answer
      // is coming, and this one would only flash past before it.
      if (asked !== this.period) {
        return;
      }

      this.result = result;
      this.loaded = asked;
    } catch (error) {
      this.error = errorMessage(error, this.localize);

      // Back to the period still on screen. The picker would otherwise point at
      // figures it never got, and pick() — which ignores a period already
      // chosen — would refuse the tap that asks for it again.
      this.period = this.loaded;
    }
  }
}

/** A chevron for the steppers, drawn here so it shows with or without Home Assistant's icons. */
function chevron(path: string) {
  return html`<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d=${path}></path>
  </svg>`;
}

/** The disc, in the 100-square the pie is drawn in. */
const PIE_RADIUS = 40;

/** How far out a share is written: inside the wedge, clear of both edges. */
const LABEL_RADIUS = 26;

/** Under this, the wedge is narrower than the figure would be. Left unwritten. */
const LABEL_MIN_SHARE = 0.07;

/** Where an angle lands, clockwise from noon rather than from three o'clock. */
function pointAt(degrees: number, radius: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;

  return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)];
}

/**
 * One wedge, from one angle to another.
 *
 * A whole turn is a circle rather than a path: an arc that starts where it ends
 * draws nothing at all, so a group spending on one category alone would show an
 * empty disc.
 */
function wedge(start: number, end: number, colour: string) {
  if (end - start >= 359.999) {
    return svg`<circle cx="50" cy="50" r=${PIE_RADIUS} fill=${colour}></circle>`;
  }

  const [x1, y1] = pointAt(start, PIE_RADIUS);
  const [x2, y2] = pointAt(end, PIE_RADIUS);
  const wide = end - start > 180 ? 1 : 0;

  return svg`<path
    d=${`M 50 50 L ${x1} ${y1} A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${wide} 1 ${x2} ${y2} Z`}
    fill=${colour}
  ></path>`;
}

/**
 * Ink that stands out on a wedge of this colour.
 *
 * A category picks its own colour, and white on a pale yellow is unreadable.
 * The eye weighs green most and blue least, so the figure is weighed the same
 * way, and anything past the middle takes dark ink instead.
 */
function inkOn(colour: string): string {
  const hex = colour.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex;

  const value = Number.parseInt(full, 16);

  if (full.length !== 6 || Number.isNaN(value)) {
    return "#fff";
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.62
    ? "rgba(0, 0, 0, 0.75)"
    : "#fff";
}

/**
 * Which chart the categories are drawn as, remembered per browser.
 *
 * A display preference, not group data: it belongs to the screen looking, the
 * way the last group opened does, and every access is guarded since a browser
 * with storage disabled throws outright. Forgetting it costs one flick.
 */
const PIE_KEY = "shared_expenses.stat_pie";

function readPieStyle(): boolean {
  try {
    return window.localStorage.getItem(PIE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberPieStyle(pie: boolean): void {
  try {
    window.localStorage.setItem(PIE_KEY, pie ? "1" : "0");
  } catch {
    // Not being able to remember is not worth breaking the page over.
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-statistics": SeStatistics;
  }
}
