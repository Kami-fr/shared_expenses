import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-field";
import type { SharedExpensesApi } from "../services/api";
import { convert, formatRate, parseRate } from "../services/currency";
import { formatDayDate, formatMoney } from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { ExchangeRate } from "../types";

/**
 * Settle on a rate for the currency an expense was paid in.
 *
 * Shows nothing at all when that is the group's own currency, which is the
 * overwhelming case: there is no rate to settle, and a row saying "1 EUR = 1
 * EUR" is a row in everybody's way. The currency itself is picked beside the
 * amount, where the figure it qualifies is.
 *
 * Fires `rate-changed` with `{ currency, rate }` — the rate in millionths, or
 * null when there is not one yet and the expense cannot be saved.
 *
 * The rate is fetched, and the field left open: the service can be down, the
 * Pi offline, and neither is worth stopping someone entering a shop over. What
 * is offered instead always says how old it is.
 */
@customElement("se-currency-field")
export class SeCurrencyField extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  /** What the group keeps its books in: what everything converts to. */
  @property({ type: String }) public groupCurrency = "EUR";

  @property({ type: String }) public currency = "EUR";

  /** The day the rate is wanted for: the expense's own date. */
  @property({ type: String }) public on = "";

  /** What is being converted, in cents, for showing what it comes to. */
  @property({ type: Number }) public amount: number | null = null;

  @property({ type: String }) public language = "en";

  /**
   * The rate the expense was saved with, if it is an existing one. Frozen: it
   * settled the debt the day it was owed, so reopening the expense shows this,
   * not a rate fetched afresh today. Null for a new expense — nothing to keep.
   */
  @property({ type: Number }) public initialRate: number | null = null;

  /** The rate as fetched, if one was. */
  @state() private fetched?: ExchangeRate;

  /** A stored rate, held as authoritative until a fresh one is asked for. */
  @state() private frozen: number | null = null;

  /** The stored rate has just been taken up: skip the opening fetch once. */
  private hydrated = false;

  /** What is typed in the rate field, which always wins. */
  @state() private typed = "";

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      /*
       * No box of our own. Nearly every expense is in the group's own currency
       * and this field shows nothing at all — but an empty flex item still
       * counts for its parent's gap, so it opened a second gap above whatever
       * came next, and the description below sat too far down. display: contents
       * lets the rate block, when there is one, stand as the column's own child,
       * and lets nothing take up no room.
       */
      :host {
        display: contents;
      }

      /* The heading, and the retry pushed out to the far end. */
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .rate {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 130px;
        gap: 12px;
        align-items: end;
        margin-top: 6px;
      }

      .says {
        font-size: 13px;
        padding-top: 6px;
      }

      .says strong {
        font-variant-numeric: tabular-nums;
      }

      .stale {
        color: var(--warning-color, #ffa600);
      }

    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    // An existing foreign expense carries a frozen rate. Keep it rather than
    // refetch: it settled the debt the day the money was owed, and a rate that
    // has moved since is a fact about the market, not about what is owed.
    // "Try again", or changing the currency or the day, still asks for a fresh
    // one — the frozen rate is a default to keep, not a wall.
    if (this.initialRate !== null && this.currency !== this.groupCurrency) {
      this.frozen = this.initialRate;
      this.hydrated = true;
      return;
    }

    void this.load();
  }

  protected updated(changed: Map<string, unknown>): void {
    // The first update after taking up a stored rate: leave it untouched and
    // only say what it comes to. Every genuine change below still behaves as
    // ever — this guard fires once and clears itself.
    if (this.hydrated) {
      this.hydrated = false;
      this.emit();
      return;
    }

    // A rate typed for dollars means nothing once the picker says francs, so
    // it goes: what is on screen must always be about the currency named.
    if (changed.has("currency")) {
      this.typed = "";
      this.fetched = undefined;
      this.frozen = null;
      this.error = undefined;
    }

    // The pair or the day moved, so the rate is about something else now.
    if (changed.has("currency") || changed.has("on")) {
      void this.load();
    }

    // The amount only changes what it comes to, not the rate.
    if (changed.has("amount")) {
      this.emit();
    }
  }

  protected render() {
    // Nothing to settle, and nothing to show: the group's own money needs no
    // rate, and this is where nearly every expense lands.
    if (this.currency === this.groupCurrency) {
      return nothing;
    }

    return this.renderRate();
  }

  private renderRate() {
    const translate = this.localize;
    const rate = this.rate();

    return html`
      <div>
        <div class="row">
          <label class="muted">${translate("rate_heading")}</label>
          ${this.busy
            ? nothing
            : html`<button class="link" @click=${() => this.load(true)}>
                ${translate("rate_retry")}
              </button>`}
        </div>

        ${this.busy ? html`<div class="muted">${translate("loading")}</div>` : nothing}
        ${this.error ? html`<div class="warning">${this.error}</div>` : nothing}

        <div class="rate">
          <div class="says">${this.renderSays(rate)}</div>
          <se-field
            .label=${translate("rate_label")}
            .value=${this.typed || (rate === null ? "" : formatRate(rate))}
            decimal
            placeholder="0,87681"
            @value-changed=${(e: CustomEvent) => this.type(e.detail.value)}
          ></se-field>
        </div>
      </div>
    `;
  }

  /** What the rate is, where it comes from, and what the amount comes to. */
  private renderSays(rate: number | null) {
    const translate = this.localize;

    if (rate === null) {
      return html`<span class="muted">${translate("rate_needed")}</span>`;
    }

    const converted = this.amount === null ? null : convert(this.amount, rate);

    return html`
      ${this.fetched?.stale && !this.typed
        ? html`<div class="stale">
            ${translate("rate_stale")}
            ${formatDayDate(this.fetched.as_of, this.language, "UTC")}
          </div>`
        : nothing}
      <div>
        1 ${this.currency} = ${formatRate(rate)} ${this.groupCurrency}
        ${converted === null
          ? nothing
          : html`<br />${translate("converts_to")}
              <strong>
                ${formatMoney(converted, this.groupCurrency, this.language)}
              </strong>`}
      </div>
    `;
  }

  /**
   * The rate in force: what was typed, else what was fetched.
   *
   * Typing always wins, and it is why the field is there at all — the service
   * being down must never be the end of it.
   */
  private rate(): number | null {
    if (this.typed.trim()) {
      return parseRate(this.typed);
    }

    if (this.currency === this.groupCurrency) {
      return 1_000_000;
    }

    if (this.frozen !== null) {
      return this.frozen;
    }

    return this.fetched?.rate ?? null;
  }

  private type(value: string) {
    this.typed = value;
    this.emit();
  }

  private async load(again = false) {
    if (this.currency === this.groupCurrency || !this.on) {
      this.error = undefined;
      this.emit();

      return;
    }

    if (again) {
      this.typed = "";
    }

    // A fetch supersedes any frozen rate: asking for a fresh one is a choice.
    this.frozen = null;

    // What this fetch is about, kept for when it comes back. Someone who picks
    // the wrong currency and corrects it a second later has two of these out at
    // once, and they do not come back in order: a pair already in the table
    // answers in milliseconds while an unknown one is still out on the wire.
    // Without this, the late answer would be filed under the currency now on
    // screen, and the expense saved at another currency's rate.
    const asked = this.currency;
    const askedOn = this.on;

    this.busy = true;
    this.error = undefined;

    let answer: ExchangeRate | undefined;
    let failed: string | undefined;

    try {
      answer = await this.api.getExchangeRate(
        this.groupId,
        asked,
        this.groupCurrency,
        askedOn,
      );
    } catch (error) {
      // Nothing known and nothing reachable. Not a dead end: the field below
      // is open, and what is typed there is kept for the next expense — which
      // every message about a missing rate now says for itself, so there is no
      // longer one code worth singling out here.
      failed = errorMessage(error, this.localize);
    }

    // Asked about something else since: this answer is about nothing anyone is
    // looking at, and the fetch that is is still running and will say so.
    if (asked !== this.currency || askedOn !== this.on) {
      return;
    }

    this.fetched = answer;
    this.error = failed;
    this.busy = false;
    this.emit();
  }

  /**
   * Say where things stand.
   *
   * A null rate means the expense cannot be saved: the dialog disables its
   * button on it rather than sending something that would be refused.
   */
  private emit() {
    this.dispatchEvent(
      new CustomEvent("rate-changed", {
        detail: { currency: this.currency, rate: this.rate() },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-currency-field": SeCurrencyField;
  }
}
