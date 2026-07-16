import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-icon";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, formatMoney, formatMonth, initials } from "../services/format";
import { errorMessage, type Key, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, GroupStatistics, Member } from "../types";

/** Everything, ever. Not a year, so it can never collide with one. */
const ALL = "all";

/** What the uncategorised is drawn in, when a category would carry its own colour. */
const NO_CATEGORY_COLOUR = "#8a9099";

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

  @state() private error?: string;

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

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (!this.result) {
      return html`<div class="panel"><div class="empty">${translate("loading")}</div></div>`;
    }

    if (this.result.years.length === 0) {
      return html`<div class="panel"><div class="empty">${translate("no_expenses")}</div></div>`;
    }

    return html`
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

    return html`
      <div class="insight">
        <se-icon
          plain
          .size=${20}
          .icon=${topCategory?.icon}
          .fallback=${""}
          style=${`color:${topCategory?.color ?? "var(--primary-color)"}`}
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

    const biggest = result.by_category[0].total || 1;

    return html`
      <div class="panel">
        <div class="sec">${this.localize("stat_where")}</div>
        ${result.by_category.map((item) => {
          const category = this.category(item.category_id);
          const colour = category?.color ?? NO_CATEGORY_COLOUR;

          return html`
            <div class="cat">
              <div
                class="chip"
                style=${`background:color-mix(in srgb, ${colour} 15%, transparent);color:${colour}`}
              >
                <se-icon plain .size=${20} .icon=${category?.icon} .fallback=${""}></se-icon>
              </div>
              <div class="cb">
                <div class="t">
                  <span class="nm">${this.categoryName(item.category_id)}</span>
                  <span class="amt">${this.money(item.total)}</span>
                </div>
                <div class="track">
                  <i
                    style=${`width:${Math.max(3, (item.total / biggest) * 100)}%;background:${colour}`}
                  ></i>
                </div>
              </div>
              <div class="pc">${Math.round((item.total / result.total) * 100)}%</div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private renderMonths() {
    const result = this.result!;

    if (result.by_month.length === 0) {
      return nothing;
    }

    const peak = result.by_month.reduce((a, b) => (b.total > a.total ? b : a));
    const tallest = peak.total || 1;

    return html`
      <div class="panel">
        <div class="sec">${this.localize("by_month")}</div>
        <div class="months">
          ${result.by_month.map((item) => {
            const isPeak = item.month === peak.month;

            return html`
              <div class="mo ${isPeak ? "pk" : ""}">
                <div class="mv">${this.money(item.total)}</div>
                <div class="bx" style=${`height:${(item.total / tallest) * 100}%`}></div>
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
                  <div
                    class="avatar"
                    style=${`background:${member?.color ?? colorFor(item.member_id)}`}
                  >
                    ${initials(name)}
                  </div>
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
    this.error = undefined;

    try {
      this.result = await this.api.getStatistics(
        this.groupId,
        this.period === ALL ? null : Number(this.period),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-statistics": SeStatistics;
  }
}
