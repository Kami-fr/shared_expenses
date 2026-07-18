import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { formatMoney } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Balance, Member, Settlement } from "../types";
import { renderAvatar } from "./avatar";

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

  /** A heading of one's own, if given: the group's name on a dashboard of
   * several. Empty keeps the plain "Current balance" the panel shows. */
  @property({ type: String }) public heading = "";

  /**
   * Whether the header links out to the group, as it does on a dashboard.
   *
   * On the panel the group is already open, so the header is a plain title. On a
   * dashboard the card is a window onto a group that lives elsewhere, so its
   * title opens it and a button jumps straight to a new expense — the two things
   * a glance at the balances makes you want to do next. The card, which owns the
   * navigation, does the walking; this only says where to.
   */
  @property({ type: Boolean }) public linked = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      /* On a dashboard the card stands on its own, so it wears the hairline a
         native Home Assistant card does; in the panel it sits among others that
         already have their frame, so only the linked one takes it. Themed, so a
         border-less theme keeps it border-less. */
      :host([linked]) .card {
        border: var(--ha-card-border-width, 1px) solid
          var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      }

      .head {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 16px 16px 8px;
      }

      /* On a dashboard the title is a link out to the group; it keeps looking
         like the heading it replaced, and takes the width so the button sits
         at the far end. */
      .head .open {
        flex: 1;
        min-width: 0;
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        text-align: left;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .head .open h3 {
        margin: 0;
      }

      .head .add {
        flex: 0 0 auto;
        border: none;
        border-radius: 8px;
        padding: 6px 12px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      .duel {
        display: flex;
        align-items: stretch;
        padding: 8px 12px 16px;
      }

      /*
       * Half the card each, and a container so the figure can size itself to
       * what it actually got.
       *
       * Safe to contain: this is flex 1 1 0%, so its width already comes from
       * the layout and never from what is inside it.
       */
      .side {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        container-type: inline-size;
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

      /*
       * As big as it can be and still fit the half of the card it was given.
       *
       * An amount is one unbreakable token: Intl separates the thousands with a
       * non-breaking space, so there is no break to take, no ellipsis worth
       * putting on a number, and nothing in CSS to catch it. At a fixed 22px it
       * simply ran over the divider and onto the other side — and not only in
       * theory: 2 238,77 € spilled 8px on a 380px phone, which is an ordinary
       * balance on an ordinary phone.
       *
       * So the type gives way to the figure rather than the figure to the type.
       * tabular-nums makes every digit the same width, so the count of
       * characters is what the width is proportional to; 46px is the avatar and
       * the gap it sits behind, the only other claim on the side. The factor
       * was measured, and leaves a margin: a 22px figure runs about 0.47px per
       * character per pixel of type.
       *
       * min(), so nothing is ever shrunk that had the room: a phone shrinks,
       * a desktop keeps its 22px.
       */
      .figure {
        font-size: min(22px, calc((100cqw - 46px) * 2 / var(--chars, 10)));
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
        white-space: nowrap;
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

      /*
       * A line of the balance is also the way to clear it.
       *
       * Every one of them stands for a transfer someone has to make, so it
       * opens the reimbursement filled in with itself: the figure you are
       * looking at is the one you are about to pay.
       */
      .line-button {
        width: 100%;
        border: none;
        background: none;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        text-align: left;
        cursor: pointer;
      }

      .line-button:hover:not([disabled]) {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .line-button[disabled] {
        cursor: default;
      }

      .mine {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 14px;
      }

      .mine .chevron {
        margin-left: auto;
        color: var(--secondary-text-color);
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

    const title = this.heading || translate("current_balance");

    return html`
      <div class="card">
        <div class="head">
          ${this.linked
            ? html`
                <button class="open" title=${translate("open_group")} @click=${this.open}>
                  <h3>${title}</h3>
                </button>
                <button class="add" @click=${this.add}>
                  + ${translate("action_add_expense")}
                </button>
              `
            : html`<h3>${title}</h3>`}
        </div>
        ${this.renderBody()}
      </div>
    `;
  }

  private open = () => {
    this.dispatchEvent(
      new CustomEvent("open-group", { bubbles: true, composed: true }),
    );
  };

  private add = () => {
    this.dispatchEvent(
      new CustomEvent("add-expense", { bubbles: true, composed: true }),
    );
  };

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

  /**
   * Ask to record the reimbursement a line stands for.
   *
   * The dialog opens filled in with it, which is the whole trick: the figure
   * you are looking at is the one you are about to pay, so nothing needs
   * retyping — and nothing can be mistyped either.
   */
  private settle(settlement: Settlement) {
    this.dispatchEvent(
      new CustomEvent("settle-up", {
        detail: { settlement },
        bubbles: true,
        composed: true,
      }),
    );
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
      <button
        class="mine line-button"
        title=${translate("settle_up")}
        @click=${() => this.settle(settlement)}
      >
        ${renderAvatar(other, name, otherId)}
        <div class="sentence">
          ${owing
            ? html`${translate("you_owe")} ${figure} ${translate("to")} ${name}`
            : html`${name} ${translate("owes_you")} ${figure}`}
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }

  /** One transfer, as a gesture to make: who pays, to whom, how much. */
  private renderTransfer(settlement: Settlement) {
    return html`
      <button
        class="transfer line-button"
        title=${this.localize("settle_up")}
        @click=${() => this.settle(settlement)}
      >
        ${this.renderParty(settlement.from_member_id)}
        <span class="arrow">→</span>
        ${this.renderParty(settlement.to_member_id)}
        <span class="amount">
          ${formatMoney(settlement.amount, this.currency, this.language)}
        </span>
      </button>
    `;
  }

  private renderParty(memberId: string) {
    const member = this.memberById(memberId);
    const name = member?.name ?? "?";

    return html`
      <span class="party" title=${name}>
        ${renderAvatar(member, name, memberId)}
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

    // With two balances there is exactly one transfer to make, and the duel is
    // both sides of it: pressing it records that very reimbursement.
    const only = this.settlements[0];

    return html`
      <button
        class="duel line-button"
        title=${this.localize("settle_up")}
        ?disabled=${only === undefined}
        @click=${() => only && this.settle(only)}
      >
        ${this.renderSide(first, false)}
        <div class="swap">⇄</div>
        ${this.renderSide(second, true)}
      </button>
    `;
  }

  private renderSide(balance: Balance, right: boolean) {
    const member = this.memberById(balance.member_id);
    const positive = balance.amount > 0;
    const tone = positive ? "positive" : "negative";

    const avatar = renderAvatar(member, member?.name ?? "?", balance.member_id);

    // How long the figure is, for the CSS that has to make it fit. Interpolated
    // rather than left to the text: whitespace around it would be counted too.
    const figure = formatMoney(Math.abs(balance.amount), this.currency, this.language);

    const body = html`
      <div class="body">
        <div class="name">${member?.name ?? "?"}</div>
        <div class=${`verdict ${tone}`}>${this.verdict(balance, positive)}</div>
        <div class=${`figure ${tone}`} style=${`--chars:${figure.length}`}>${figure}</div>
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
        ${renderAvatar(member, member?.name ?? "?", balance.member_id)}
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
