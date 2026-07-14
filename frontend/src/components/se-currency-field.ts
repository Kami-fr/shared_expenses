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

  /** The rate as fetched, if one was. */
  @state() private fetched?: ExchangeRate;

  /** What is typed in the rate field, which always wins. */
  @state() private typed = "";

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
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

      .link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
        padding: 0;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected updated(changed: Map<string, unknown>): void {
    // A rate typed for dollars means nothing once the picker says francs, so
    // it goes: what is on screen must always be about the currency named.
    if (changed.has("currency")) {
      this.typed = "";
      this.fetched = undefined;
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
            ${formatDayDate(this.fetched.as_of, this.language)}
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

    this.busy = true;
    this.error = undefined;

    try {
      this.fetched = await this.api.getExchangeRate(
        this.groupId,
        this.currency,
        this.groupCurrency,
        this.on,
      );
    } catch (error) {
      // Nothing known and nothing reachable. Not a dead end: the field below
      // is open, and what is typed there is kept for the next expense.
      this.fetched = undefined;
      this.error =
        (error as { code?: string })?.code === "exchange_rate_unavailable"
          ? this.localize("rate_unavailable")
          : errorMessage(error, this.localize);
    } finally {
      this.busy = false;
      this.emit();
    }
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
