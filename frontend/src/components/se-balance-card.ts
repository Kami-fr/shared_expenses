import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { colorFor, formatMoney, initials } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Balance, Member } from "../types";

/**
 * The balances of a group, at a glance.
 *
 * Two members face each other, which reads instantly and covers the common
 * household case. Beyond two, a face-off would hide people, so it falls back to
 * a list carrying the same colours.
 */
@customElement("se-balance-card")
export class SeBalanceCard extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public balances: Balance[] = [];

  @property({ attribute: false }) public members: Member[] = [];

  @property({ type: String }) public currency = "EUR";

  @property({ type: String }) public language = "en";

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 16px 16px 8px;
      }

      .duel {
        display: flex;
        align-items: stretch;
        padding: 8px 12px 16px;
      }

      .side {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .side.right {
        justify-content: flex-end;
        text-align: right;
      }

      .side .body {
        min-width: 0;
      }

      .name {
        font-size: 15px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .verdict {
        font-size: 13px;
      }

      .figure {
        font-size: 22px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }

      .swap {
        display: flex;
        align-items: center;
        padding: 0 12px;
        color: var(--secondary-text-color);
        font-size: 20px;
        border-left: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-right: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
      }

      .row .name {
        flex: 1;
      }

      .row .verdict {
        text-align: right;
      }

      .settled {
        padding: 8px 16px 20px;
        text-align: center;
      }
    `,
  ];

  protected render() {
    const translate = this.localize;

    return html`
      <div class="card">
        <div class="head">
          <h3>${translate("current_balance")}</h3>
        </div>
        ${this.renderBody()}
      </div>
    `;
  }

  private renderBody() {
    const active = this.balances.filter((balance) => balance.amount !== 0);

    if (active.length === 0) {
      return html`<div class="settled muted">${this.localize("balance_settled")}</div>`;
    }

    // The face-off only tells the truth when the whole group is two people.
    if (this.balances.length === 2) {
      return this.renderDuel();
    }

    return html`<div>${active.map((balance) => this.renderRow(balance))}</div>`;
  }

  private renderDuel() {
    const sorted = [...this.balances].sort((a, b) => b.amount - a.amount);

    return html`
      <div class="duel">
        ${this.renderSide(sorted[0], false)}
        <div class="swap">⇄</div>
        ${this.renderSide(sorted[1], true)}
      </div>
    `;
  }

  private renderSide(balance: Balance, right: boolean) {
    const member = this.memberById(balance.member_id);
    const positive = balance.amount > 0;
    const tone = positive ? "positive" : "negative";

    const avatar = html`
      <div class="avatar" style=${`background:${member?.color ?? colorFor(balance.member_id)}`}>
        ${initials(member?.name ?? "?")}
      </div>
    `;

    const body = html`
      <div class="body">
        <div class="name">${member?.name ?? "?"}</div>
        <div class=${`verdict ${tone}`}>
          ${positive ? this.localize("must_receive") : this.localize("must_pay")}
        </div>
        <div class=${`figure ${tone}`}>
          ${formatMoney(Math.abs(balance.amount), this.currency, this.language)}
        </div>
      </div>
    `;

    return html`
      <div class=${`side ${right ? "right" : ""}`}>
        ${right ? nothing : avatar}${body}${right ? avatar : nothing}
      </div>
    `;
  }

  private renderRow(balance: Balance) {
    const member = this.memberById(balance.member_id);
    const positive = balance.amount > 0;
    const tone = positive ? "positive" : "negative";

    return html`
      <div class="row">
        <div class="avatar" style=${`background:${member?.color ?? colorFor(balance.member_id)}`}>
          ${initials(member?.name ?? "?")}
        </div>
        <span class="name">${member?.name ?? "?"}</span>
        <div>
          <div class=${`verdict ${tone}`}>
            ${positive ? this.localize("must_receive") : this.localize("must_pay")}
          </div>
          <div class=${`amount ${tone}`}>
            ${formatMoney(Math.abs(balance.amount), this.currency, this.language)}
          </div>
        </div>
      </div>
    `;
  }

  private memberById(id: string): Member | undefined {
    return this.members.find((member) => member.id === id);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-balance-card": SeBalanceCard;
  }
}
