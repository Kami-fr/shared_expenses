import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import { formatMoney } from "../services/format";
import type { Localizer } from "../services/localize";
import { rhythm, shortDay, varies, whoPays } from "../services/recurrence";
import { sharedStyles } from "../styles/shared";
import type { Group, Member, Recurring } from "../types";

/**
 * Every expense of the group that comes back, and where each one stands.
 *
 * A list and nothing else: changing one opens the expense dialog on it, which
 * already knows how to fill an expense in. Fires `recurring-picked` with the
 * one pressed, and only for the ones this reader may change.
 */
@customElement("se-recurring-dialog")
export class SeRecurringDialog extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public recurring: Recurring[] = [];

  /** Members including those who left: one may still be down as paying. */
  @property({ attribute: false }) public members: Member[] = [];

  /** Which ones this reader may change: the group page's rule, not this one's. */
  @property({ attribute: false }) public editable: string[] = [];

  @property({ type: String }) public meId: string | null = null;

  @property({ type: String }) public language = "en";

  public static styles = [
    sharedStyles,
    css`
      .list {
        display: flex;
        flex-direction: column;
      }

      .entry {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border: none;
        background: none;
        color: inherit;
        font-family: inherit;
        text-align: left;
        width: 100%;
      }

      .entry + .entry {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      button.entry {
        cursor: pointer;
      }

      button.entry:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .line {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }

      .name {
        font-size: 15px;
        font-weight: 500;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .amount {
        flex: none;
      }

      .due {
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        font-weight: 500;
      }

      .status {
        font-size: 13px;
      }

      .chevron {
        flex: none;
        color: var(--secondary-text-color);
      }

      .hint {
        font-size: 13px;
        padding-top: 4px;
      }
    `,
  ];

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog
        open
        heading=${translate("recurring_expenses")}
        .localize=${this.localize}
        @dialog-closed=${this.close}
      >
        ${this.recurring.length === 0
          ? html`<div class="empty">${translate("no_recurring")}</div>`
          : html`
              <div class="list">${this.sorted().map((item) => this.renderEntry(item))}</div>
              <div class="muted hint">${translate("recurring_list_hint")}</div>
            `}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  /**
   * What is waiting first, then what comes soonest, then what is not coming:
   * the order somebody opening this wants to read it in.
   */
  private sorted(): Recurring[] {
    const rank = (item: Recurring) =>
      item.waiting > 0 ? 0 : item.paused || item.ended ? 2 : 1;

    return [...this.recurring].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.next_due ?? "").localeCompare(b.next_due ?? "") ||
        a.title.localeCompare(b.title, this.language),
    );
  }

  private renderEntry(item: Recurring) {
    const translate = this.localize;
    const payer = this.members.find((member) => member.id === item.paid_by_member_id);

    // The figure it will most likely come to: last time's when that moves, with
    // the sign that says it is a guess.
    const figure = varies(item)
      ? `≈ ${formatMoney(item.latest_amount!, item.currency, this.language)}`
      : formatMoney(item.amount, item.currency, this.language);

    const body = html`
      <div class="info">
        <div class="line">
          <span class="name">${item.title}</span>
          <span class="amount">${figure}</span>
        </div>
        <div class="muted status">
          ${rhythm(item.every, item.unit, translate)} ·
          ${whoPays(item, payer?.name ?? "?", this.meId, translate)}
        </div>
        ${this.renderState(item)}
      </div>
    `;

    if (!this.editable.includes(item.id)) {
      return html`<div class="entry">${body}</div>`;
    }

    return html`
      <button class="entry" @click=${() => this.pick(item)}>
        ${body}
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  private renderState(item: Recurring) {
    const translate = this.localize;

    if (item.ended) {
      return html`<div class="muted status">${translate("status_ended")}</div>`;
    }

    if (item.paused) {
      return html`<div class="muted status">${translate("status_paused")}</div>`;
    }

    if (item.next_due === null) {
      return nothing;
    }

    const day = shortDay(item.next_due, this.language);

    return item.waiting > 0
      ? html`<div class="due">
          ${translate("recurring_waiting_since").replace("{date}", day)}
        </div>`
      : html`<div class="muted status">
          ${translate("recurring_next").replace("{date}", day)}
        </div>`;
  }

  private pick(item: Recurring) {
    this.dispatchEvent(
      new CustomEvent("recurring-picked", {
        detail: { recurringId: item.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-recurring-dialog": SeRecurringDialog;
  }
}
