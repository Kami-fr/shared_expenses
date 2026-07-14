import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-bar-chart";
import "./se-pie-chart";
import type { Bar } from "./se-bar-chart";
import type { Slice } from "./se-pie-chart";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, formatMoney, formatMonth, initials } from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, GroupStatistics, Member } from "../types";

/** Everything, ever. Not a year, so it can never collide with one. */
const ALL = "all";

/**
 * What the group spent, cut three ways.
 *
 * Reimbursements are left out throughout: moving money between members is not
 * spending it, and counting it would say the household spent 100 on a 90 shop.
 *
 * Fetches once, on connect. Its dialog is built when opened and thrown away
 * when closed, so that is every time it is looked at.
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
        gap: var(--se-gap);
      }

      .totals {
        display: flex;
        gap: 12px;
        padding: 16px;
      }

      .total {
        flex: 1;
        min-width: 0;
      }

      .total .figure {
        font-size: 22px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }

      .period {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 12px 16px;
      }

      .period button {
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: none;
        color: var(--secondary-text-color);
        border-radius: 16px;
        padding: 6px 14px;
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
      }

      .period button[aria-pressed="true"] {
        background: var(--primary-color, #03a9f4);
        border-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      .member {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
      }

      .member + .member {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .member .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 15px;
      }

      .member .figures {
        text-align: right;
        font-size: 13px;
        white-space: nowrap;
      }

      .member .figures strong {
        font-variant-numeric: tabular-nums;
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
      return html`<div class="card"><div class="empty">${translate("loading")}</div></div>`;
    }

    if (this.result.years.length === 0) {
      return html`<div class="card">
        <div class="empty">${translate("no_expenses")}</div>
      </div>`;
    }

    return html`
      <div class="card">
        ${this.renderPeriod()} ${this.renderTotals()}
      </div>

      ${this.renderCategories()}
      ${this.renderCard("by_month", this.monthBars())}
      ${this.renderMembers()}
    `;
  }

  private renderPeriod() {
    const translate = this.localize;

    return html`
      <div class="period">
        <button
          aria-pressed=${this.period === ALL}
          @click=${() => this.pick(ALL)}
        >
          ${translate("period_all")}
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

  private renderTotals() {
    const translate = this.localize;
    const mine = this.result!.by_member.find((item) => item.member_id === this.meId);

    return html`
      <div class="totals">
        <div class="total">
          <div class="muted">${translate("total_spent")}</div>
          <div class="figure">${this.money(this.result!.total)}</div>
        </div>
        ${mine
          ? html`
              <div class="total">
                <div class="muted">${translate("your_share")}</div>
                <div class="figure">${this.money(mine.share)}</div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  /**
   * Where the money went, as a whole cut up.
   *
   * A pie, because that is the question a breakdown by category asks: what
   * share of the month was food? Months get bars instead — a run of months is
   * read as time, and time is not a thing you cut into wedges.
   */
  private renderCategories() {
    const slices = this.categorySlices();

    if (slices.length === 0) {
      return nothing;
    }

    return html`
      <div class="card">
        <h3 class="section-title">${this.localize("by_category")}</h3>
        <se-pie-chart .slices=${slices}></se-pie-chart>
      </div>
    `;
  }

  private renderCard(title: "by_month", bars: Bar[]) {
    if (bars.length === 0) {
      return nothing;
    }

    return html`
      <div class="card">
        <h3 class="section-title">${this.localize(title)}</h3>
        <se-bar-chart .bars=${bars}></se-bar-chart>
      </div>
    `;
  }

  /**
   * Who paid, against who consumed.
   *
   * Two figures rather than one: paying is not consuming, and the whole point
   * of the app is that the two differ. Their gap is the balance.
   */
  private renderMembers() {
    const translate = this.localize;
    const items = this.result!.by_member;

    if (items.length === 0) {
      return nothing;
    }

    return html`
      <div class="card">
        <h3 class="section-title">${translate("by_member")}</h3>
        ${items.map((item) => {
          const member = this.members.find((m) => m.id === item.member_id);
          const name = member?.name ?? "?";

          return html`
            <div class="member">
              <div
                class="avatar"
                style=${`background:${member?.color ?? colorFor(item.member_id)}`}
              >
                ${initials(name)}
              </div>
              <span class="name">${name}</span>
              <div class="figures">
                <div>
                  ${translate("paid_total")} <strong>${this.money(item.paid)}</strong>
                </div>
                <div class="muted">
                  ${translate("consumed")} <strong>${this.money(item.share)}</strong>
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private categorySlices(): Slice[] {
    return this.result!.by_category.map((item) => {
      const category = this.categories.find((c) => c.id === item.category_id);

      return {
        key: item.category_id ?? "none",
        label: category?.name ?? this.localize("no_category"),
        value: item.total,
        text: this.money(item.total),
        color: category?.color ?? undefined,
      };
    });
  }

  private monthBars(): Bar[] {
    return this.result!.by_month.map((item) => ({
      key: item.month,
      label: formatMonth(item.month, this.language),
      value: item.total,
      text: this.money(item.total),
    }));
  }

  private money(cents: number): string {
    return formatMoney(cents, this.currency, this.language);
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
