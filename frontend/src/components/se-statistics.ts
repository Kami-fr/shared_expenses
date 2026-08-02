import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-icon";
import type { SharedExpensesApi } from "../services/api";
import { colorOf, formatMoney, formatMonth } from "../services/format";
import { errorMessage, type Key, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, CategoryTotal, GroupStatistics, Member } from "../types";
import { renderAvatar } from "./avatar";

/** Everything, ever. Not a year, so it can never collide with one. */
const ALL = "all";

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
 * One reading, top to bottom: what was spent, what it says at a glance, where it
 * went, when, and by whom against for whom. Fetches once on connect, and again
 * whenever the period changes.
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

  @state() private period: string = ALL;

  /** The period the figures on screen are for — not one that failed on the way. */
  private loaded: string = ALL;

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

      /* The period picker, as one segmented control rather than a row of pills:
         a single choice among a few, which is what a segmented control is for. */
      .seg {
        display: inline-flex;
        align-self: flex-start;
        max-width: 100%;
        overflow-x: auto;
        gap: 2px;
        padding: 3px;
        border-radius: 12px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .seg button {
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        padding: 6px 13px;
        border-radius: 9px;
        cursor: pointer;
        white-space: nowrap;
      }

      .seg button[aria-pressed="true"] {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
      }

      .panel {
        background: var(--card-background-color, #fff);
        border-radius: var(--se-radius, 14px);
        box-shadow: var(--ha-card-box-shadow, 0 1px 2px rgba(20, 30, 40, 0.08));
        padding: 16px;
      }

      /* The hero. Follows the user's theme rather than a colour of our own, so
         it sits in whatever Home Assistant is wearing. */
      .hero {
        background: linear-gradient(
          150deg,
          var(--primary-color, #03a9f4),
          var(--dark-primary-color, #0277bd)
        );
        color: var(--text-primary-color, #fff);
      }

      .hero .lbl {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        opacity: 0.85;
      }

      .hero .big {
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -1px;
        margin: 2px 0 12px;
        font-variant-numeric: tabular-nums;
      }

      .pills {
        display: flex;
        gap: 10px;
      }

      .pill {
        flex: 1;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.16);
      }

      .pill .k {
        font-size: 11.5px;
        opacity: 0.85;
      }

      .pill .v {
        font-size: 17px;
        font-weight: 700;
        margin-top: 1px;
        font-variant-numeric: tabular-nums;
      }

      .pill .sub {
        font-size: 11px;
        opacity: 0.8;
        margin-top: 1px;
        font-variant-numeric: tabular-nums;
      }

      /* The one sentence worth reading before the charts. */
      .insight {
        display: flex;
        gap: 11px;
        align-items: center;
        padding: 13px 14px;
        border-radius: 14px;
        background: var(--secondary-background-color, #eef4f0);
        background: color-mix(
          in srgb,
          var(--primary-color, #03a9f4) 10%,
          var(--card-background-color, #fff)
        );
      }

      .insight p {
        font-size: 13.5px;
        line-height: 1.45;
        color: var(--primary-text-color);
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

      .cb .t {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 14.5px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .cb .t .nm {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cb .t .amt {
        font-variant-numeric: tabular-nums;
        flex: none;
      }

      .track {
        height: 7px;
        border-radius: 4px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
        overflow: hidden;
      }

      .track i {
        display: block;
        height: 100%;
        border-radius: 4px;
      }

      .pc {
        width: 34px;
        flex: none;
        text-align: right;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      /* When, as bars: a run of months is read as time, and each month keeps its
         own figure above it. */
      .months {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        height: 108px;
      }

      .mo {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        height: 100%;
        justify-content: flex-end;
      }

      .mo .bx {
        width: 100%;
        min-height: 3px;
        border-radius: 6px 6px 3px 3px;
        background: color-mix(
          in srgb,
          var(--primary-color, #03a9f4) 22%,
          transparent
        );
      }

      .mo.pk .bx {
        background: var(--primary-color, #03a9f4);
      }

      .mo .ml {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .mo .mv {
        font-size: 10px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .mo.pk .mv {
        color: var(--primary-color, #03a9f4);
        font-weight: 700;
      }

      /* Who paid against who consumed, as cards: their gap is the balance, said
         in the words the rest of the app says it in. */
      .mem {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .mcard {
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
        border-radius: 14px;
        padding: 13px;
      }

      .mcard .top {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 10px;
      }

      .mcard .nm {
        font-size: 14.5px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .kv {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        color: var(--secondary-text-color);
        margin-bottom: 5px;
      }

      .kv b {
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }

      .bal {
        margin-top: 9px;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        border-radius: 9px;
        padding: 7px 4px;
        font-variant-numeric: tabular-nums;
      }

      .bal.up {
        color: var(--se-positive);
        background: color-mix(in srgb, var(--se-positive) 14%, transparent);
      }

      .bal.dn {
        color: var(--se-negative);
        background: color-mix(in srgb, var(--se-negative) 14%, transparent);
      }

      .bal.even {
        color: var(--secondary-text-color);
        background: var(--divider-color, rgba(0, 0, 0, 0.06));
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
    if (!this.result) {
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
      ${this.renderPeriod()} ${this.renderHero()} ${this.renderInsight()}
      ${this.renderCategories()} ${this.renderMonths()} ${this.renderMembers()}
    `;
  }

  private renderPeriod() {
    return html`
      <div class="seg" role="group">
        <button aria-pressed=${this.period === ALL} @click=${() => this.pick(ALL)}>
          ${this.localize("period_all")}
        </button>
        ${this.result!.years.map(
          (year) => html`
            <button
              aria-pressed=${this.period === String(year)}
              @click=${() => this.pick(String(year))}
            >
              ${year}
            </button>
          `,
        )}
      </div>
    `;
  }

  private renderHero() {
    const result = this.result!;
    const mine = result.by_member.find((item) => item.member_id === this.meId);
    const average = result.count > 0 ? Math.round(result.total / result.count) : 0;

    return html`
      <div class="panel hero">
        <div class="lbl">${this.localize("total_spent")}</div>
        <div class="big">${this.money(result.total)}</div>
        <div class="pills">
          ${mine
            ? html`<div class="pill">
                <div class="k">${this.localize("your_share")}</div>
                <div class="v">${this.money(mine.share)}</div>
              </div>`
            : nothing}
          <div class="pill">
            <div class="k">${this.localize("expenses")}</div>
            <div class="v">${result.count}</div>
            ${result.count > 0
              ? html`<div class="sub">
                  ${this.fill("stat_avg", { amount: this.money(average) })}
                </div>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * The one line worth reading first: the dominant category, and the peak month.
   *
   * Shown only when it has something to say — categories spread evenly, or a
   * single month, leave it out rather than state the obvious.
   */
  private renderInsight() {
    const result = this.result!;

    if (result.total <= 0) {
      return nothing;
    }

    const parts: string[] = [];
    const top = result.by_category[0];

    if (top) {
      const share = top.total / result.total;
      const name = this.categoryName(top.category_id);

      if (share >= 0.5) {
        parts.push(this.fill("stat_insight_half", { cat: name }));
      } else if (share >= 0.34) {
        parts.push(
          this.fill("stat_insight_mostly", {
            cat: name,
            pct: String(Math.round(share * 100)),
          }),
        );
      }
    }

    if (result.by_month.length >= 2) {
      const peak = result.by_month.reduce((a, b) => (b.total > a.total ? b : a));
      parts.push(
        this.fill("stat_insight_peak", {
          month: formatMonth(peak.month, this.language),
          amount: this.money(peak.total),
        }),
      );
    }

    if (parts.length === 0) {
      return nothing;
    }

    const topCategory = top ? this.category(top.category_id) : undefined;
    // The dominant category can be the uncategorised one: give it the same
    // struck tag it wears below, not the blank the missing icon would leave.
    const topIcon =
      top && !topCategory ? NO_CATEGORY_ICON : topCategory?.icon;

    return html`
      <div class="insight">
        <se-icon
          plain
          .size=${20}
          .icon=${topIcon}
          .fallback=${""}
          style=${`color:${top ? this.categoryColour(top.category_id) : "var(--primary-color)"}`}
        ></se-icon>
        <p>${parts.join(" ")}</p>
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
          style=${`background:color-mix(in srgb, ${colour} 15%, transparent);color:${colour}`}
        >
          <se-icon plain .size=${20} .icon=${icon} .fallback=${fallback}></se-icon>
        </div>
        <div class="cb">
          <div class="t">
            <span class="nm">${this.categoryName(item.category_id)}</span>
            <span class="amt">${this.money(item.total)}</span>
          </div>
          <div class="track">
            <i
              style=${`width:${Math.max(3, (Math.abs(item.total) / biggest) * 100)}%;background:${colour}`}
            ></i>
          </div>
        </div>
        <!--
          Never below nothing, and never a share of nothing. A category refunded
          past what it cost comes out negative, and a share of what the group
          spent cannot be: "-12 %" is not a fact about anything. A period that
          came out refunded to the last cent has no total to take a share of at
          all, and dividing by it would print "Infinity%" or "NaN%" on the row.
          Nothing is hidden by flooring either — the bar beside it is drawn on
          the size, and the figure on the row carries its own minus.
        -->
        <div class="pc">
          ${total > 0 ? Math.max(0, Math.round((item.total / total) * 100)) : 0}%
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

  private renderMonths() {
    const result = this.result!;

    if (result.by_month.length === 0) {
      return nothing;
    }

    const peak = result.by_month.reduce((a, b) => (b.total > a.total ? b : a));

    // At least one, so a run of months that all came out refunded cannot turn
    // every bar upside down by dividing by a negative peak.
    const tallest = Math.max(peak.total, 1);

    return html`
      <div class="panel">
        <div class="sec">${this.localize("by_month")}</div>
        <div class="months">
          ${result.by_month.map((item) => {
            const isPeak = item.month === peak.month;

            return html`
              <div class="mo ${isPeak ? "pk" : ""}">
                <div class="mv">${this.money(item.total)}</div>
                <div
                  class="bx"
                  style=${`height:${Math.max(0, (item.total / tallest) * 100)}%`}
                ></div>
                <div class="ml">${formatMonth(item.month, this.language)}</div>
              </div>
            `;
          })}
        </div>
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
        <div class="sec">${this.localize("by_member")}</div>
        <div class="mem">
          ${result.by_member.map((item) => {
            const member = this.members.find((m) => m.id === item.member_id);
            const name = member?.name ?? "?";
            const balance = item.paid - item.share;

            return html`
              <div class="mcard">
                <div class="top">
                  ${renderAvatar(member, name, item.member_id)}
                  <span class="nm">${name}</span>
                </div>
                <div class="kv">
                  <span>${this.localize("paid_total")}</span><b>${this.money(item.paid)}</b>
                </div>
                <div class="kv">
                  <span>${this.localize("consumed")}</span><b>${this.money(item.share)}</b>
                </div>
                ${this.renderBalance(balance)}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderBalance(balance: number) {
    if (balance > 0) {
      return html`<div class="bal up">
        ${this.fill("stat_owed", { amount: this.money(balance) })}
      </div>`;
    }

    if (balance < 0) {
      return html`<div class="bal dn">
        ${this.fill("stat_owes", { amount: this.money(-balance) })}
      </div>`;
    }

    return html`<div class="bal even">${this.localize("stat_even")}</div>`;
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

  private pick(period: string) {
    if (period === this.period) {
      return;
    }

    this.period = period;
    void this.load();
  }

  private async load() {
    const asked = this.period;

    this.error = undefined;

    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        asked === ALL ? null : Number(asked),
      );
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
