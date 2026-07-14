import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { colorFor, formatMoney, initials } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Balance, Member, Settlement } from "../types";

/**
 * What you owe, and what the rest of the group owes.
 *
 * Answers "what do I do?" first, because that is what the card is opened for.
 * Yours reads as a sentence — you owe Stéphane 30 — and the others follow
 * underneath, as transfers.
 *
 * A transfer, never a net balance: "Antonin must pay 30" never said to whom,
 * and someone owing two people at once has a total matching no transfer they
 * could actually make. It only worked with two, where the balance is the
 * transfer.
 *
 * With no member tied to the account looking — a tablet in the kitchen, an
 * admin passing by — there is no "you", so it falls back to the group's own
 * view: the face-off with two, the transfers beyond.
 */
@customElement("se-balance-card")
export class SeBalanceCard extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public balances: Balance[] = [];

  /** Who pays whom: the shortest way to clear the balances above. */
  @property({ attribute: false }) public settlements: Settlement[] = [];

  @property({ attribute: false }) public members: Member[] = [];

  /** Which member you are, or null when the account is nobody in this group. */
  @property({ type: String }) public meId: string | null = null;

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
        min-width: 0;
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

      .mine {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 14px;
      }

      .sentence {
        font-size: 15px;
        line-height: 1.5;
      }

      .sentence .figure {
        font-size: 18px;
        margin: 0 2px;
      }

      /*
       * The rest of the group, set back from yours: still there to read, never
       * competing with the line you opened the card for.
       */
      .others {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        padding: 4px 0 4px;
        font-size: 13px;
      }

      .others .party .avatar {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .others .transfer {
        padding: 8px 16px;
      }

      .others .transfer + .transfer {
        border-top: none;
      }

      .others .name,
      .others .amount {
        font-size: 13px;
      }

      .transfer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
      }

      .transfer + .transfer {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      /* Both names share what is left once the amount has its room. */
      .party {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .party .avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }

      .arrow {
        color: var(--secondary-text-color);
        flex: 0 0 auto;
      }

      .transfer .amount {
        font-size: 15px;
        font-weight: 600;
        white-space: nowrap;
        flex: 0 0 auto;
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

    // Balances that do not settle would leave the card blank while money is
    // plainly owed. Say what is owed rather than nothing.
    if (this.settlements.length === 0) {
      return html`<div>${active.map((balance) => this.renderRow(balance))}</div>`;
    }

    // Two people owing each other is the whole story: the one transfer to make,
    // both sides of it at once. Judged on the non-zero balances rather than the
    // member count — someone who left with nothing outstanding is still listed,
    // and must not spoil the duel.
    if (active.length === 2) {
      return this.renderDuel(active);
    }

    if (this.meId === null) {
      return this.renderGroupView();
    }

    const mine = this.settlements.filter(
      (settlement) =>
        settlement.from_member_id === this.meId || settlement.to_member_id === this.meId,
    );

    const others = this.settlements.filter((settlement) => !mine.includes(settlement));

    return html`
      ${mine.length === 0
        ? html`<div class="settled muted">${this.localize("you_are_settled")}</div>`
        : mine.map((settlement) => this.renderMine(settlement))}
      ${others.length === 0
        ? nothing
        : html`
            <div class="others">
              ${others.map((settlement) => this.renderTransfer(settlement))}
            </div>
          `}
    `;
  }

  /** No "you" to speak from: show the transfers as the group's own business. */
  private renderGroupView() {
    return html`
      <div>${this.settlements.map((settlement) => this.renderTransfer(settlement))}</div>
    `;
  }

  /** Your own line, as a sentence: the one thing you came to find out. */
  private renderMine(settlement: Settlement) {
    const translate = this.localize;
    const owing = settlement.from_member_id === this.meId;
    const otherId = owing ? settlement.to_member_id : settlement.from_member_id;
    const other = this.memberById(otherId);
    const name = other?.name ?? "?";

    const figure = html`
      <strong class=${`figure ${owing ? "negative" : "positive"}`}>
        ${formatMoney(settlement.amount, this.currency, this.language)}
      </strong>
    `;

    return html`
      <div class="mine">
        <div class="avatar" style=${`background:${other?.color ?? colorFor(otherId)}`}>
          ${initials(name)}
        </div>
        <div class="sentence">
          ${owing
            ? html`${translate("you_owe")} ${figure} ${translate("to")} ${name}`
            : html`${name} ${translate("owes_you")} ${figure}`}
        </div>
      </div>
    `;
  }

  /** One transfer, as a gesture to make: who pays, to whom, how much. */
  private renderTransfer(settlement: Settlement) {
    return html`
      <div class="transfer">
        ${this.renderParty(settlement.from_member_id)}
        <span class="arrow">→</span>
        ${this.renderParty(settlement.to_member_id)}
        <span class="amount">
          ${formatMoney(settlement.amount, this.currency, this.language)}
        </span>
      </div>
    `;
  }

  private renderParty(memberId: string) {
    const member = this.memberById(memberId);
    const name = member?.name ?? "?";

    return html`
      <span class="party" title=${name}>
        <span
          class="avatar"
          style=${`background:${member?.color ?? colorFor(memberId)}`}
          >${initials(name)}</span
        >
        <span class="name">${name}</span>
      </span>
    `;
  }

  /**
   * The two of you, facing each other.
   *
   * You go on the left, where reading starts, so the side you look at first is
   * yours whichever way the money goes. Without a "you" — a tablet in the
   * kitchen — whoever is owed leads, as the group's own way of putting it.
   */
  private renderDuel(active: Balance[]) {
    const mine = active.find((balance) => balance.member_id === this.meId);

    const [first, second] = mine
      ? [mine, active.find((balance) => balance !== mine)!]
      : [...active].sort((a, b) => b.amount - a.amount);

    return html`
      <div class="duel">
        ${this.renderSide(first, false)}
        <div class="swap">⇄</div>
        ${this.renderSide(second, true)}
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
        <div class=${`verdict ${tone}`}>${this.verdict(balance, positive)}</div>
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

  /**
   * What a side of the duel is about, addressed to whoever is reading.
   *
   * Your own side speaks to you — "You owe" rather than "Antonin owes" about
   * yourself, which is how a balance sheet talks, not a person.
   */
  private verdict(balance: Balance, positive: boolean): string {
    const translate = this.localize;

    if (balance.member_id === this.meId) {
      return positive ? translate("you_are_owed") : translate("you_owe");
    }

    return positive ? translate("must_receive") : translate("must_pay");
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
