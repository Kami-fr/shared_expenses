import { LitElement, type PropertyValues, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-field";
import "./se-select";
import { colorFor, formatMoney, initials, parseMoney } from "../services/format";
import type { Localizer } from "../services/localize";
import { resolveShares } from "../services/splits";
import {
  FULL_PERCENT,
  modeOf,
  parsePercent,
  ruleFor,
  stateOf,
  type Mode,
  type Unit,
} from "../services/split-modes";
import { sharedStyles } from "../styles/shared";
import type { Member, SplitRule } from "../types";

/** What a rule is previewed on, so the figures mean something. */
const SAMPLE = 8542;

/**
 * Every way of saying it, in the order they are reached for.
 *
 * `custom` is last and always there. It is the only one that can put an amount
 * shared up front *and* exact figures on what is left — 10 shared, then 8 for
 * one and 4 for the other — so hiding it would take that away.
 */
/**
 * The modes worth keeping as a lasting rule.
 *
 * `exact` is not one of them. A rule applies to amounts it has never seen, and
 * "Antonin owes 20" makes every expense under 20 impossible to enter — the
 * backend refuses it, rightly, because there is nothing left to take it out of.
 * An envelope says nearly the same thing and caps itself: 20 shared on a 15
 * expense is 7,50 each.
 *
 * It is still offered to a rule that already is one, so an old rule can be read
 * and changed rather than silently rewritten.
 */
const LASTING: Mode[] = ["equal", "exact", "partial", "custom"];

/**
 * Editor for a split rule.
 *
 * Fires `rule-changed` with `event.detail.rule`, a SplitRule or null when the
 * expense should simply be split equally.
 */
@customElement("se-split-rule-editor")
export class SeSplitRuleEditor extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public rule: SplitRule | null = null;

  @property({ type: String }) public currency = "EUR";

  @property({ type: String }) public language = "en";

  /**
   * The expense being split, in cents.
   *
   * Left out, the rule is a lasting default and gets previewed on a sample.
   * Given, the preview shows the real shares of that very expense.
   */
  @property({ type: Number }) public amount: number | null = null;

  /** Who pays, when previewing a real expense: the rest falls back to them. */
  @property({ type: String }) public payerId: string | null = null;

  /**
   * What this rule defers to when it says nothing, if anything does.
   *
   * An expense falls back on its category, a category on the group. The group
   * falls back on nobody: there, saying nothing *is* an equal split, so
   * offering "default rule" would be offering the same thing twice under two
   * names.
   */
  @property({ type: String }) public inherits?: "category" | "group";

  @state() private mode: Mode = "equal";

  /** Who takes part. In `partial`, who shares the amount put in. */
  @state() private participants: Set<string> = new Set();

  @state() private envelopeInput = "";

  /** What each is down for, in `exact`. Empty means an equal share of it. */
  @state() private amounts: Record<string, string> = {};

  /** What share each takes, in percent. Empty means an equal share of it. */
  @state() private percents: Record<string, string> = {};

  /** Which unit the figures of `exact` are typed in. */
  @state() private unit: Unit = "money";

  /** Who takes what is left, in `partial`. Empty means whoever paid. */
  @state() private restTo = "";

  /** Who takes what is left, in `custom`. Empty means whoever paid. */
  @state() private takers: Set<string> = new Set();

  public static styles = [
    sharedStyles,
    css`
      .toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .toggle .label {
        flex: 1;
      }

      .panel {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 3px 0;
      }

      .member-row .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      /* What this row comes to, next to the person it happens to. */
      .member-row .share {
        font-size: 13px;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .member-row se-field {
        width: 116px;
      }

      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .units {
        display: flex;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        overflow: hidden;
        flex: 0 0 auto;
      }

      .units button {
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

      /* An example, set apart from the rule it is an example of. */
      .example {
        font-size: 12px;
        font-style: italic;
        padding: 4px 0 6px;
      }

      .total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 8px 0 0;
        font-size: 14px;
        font-variant-numeric: tabular-nums;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
        flex: 0 0 auto;
      }

      .rest {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 14px;
      }

      .rest se-select {
        min-width: 150px;
        flex: 1;
      }

      .rest .figure {
        font-variant-numeric: tabular-nums;
        font-weight: 500;
      }

      .warn {
        font-size: 13px;
        color: var(--error-color, #db4437);
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    this.mode = modeOf(this.rule);

    const state = stateOf(
      this.rule,
      this.members.map((member) => member.id),
      this.payerId,
    );

    this.participants = state.participants;
    this.envelopeInput = state.envelopeInput;
    this.amounts = state.amounts;
    this.percents = state.percents;
    this.unit = state.unit;
    this.takers = state.takers;
    this.restTo = this.mode === "partial" ? state.restTo : "";
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has("payerId")) {
      return;
    }

    const previous = changed.get("payerId") as string | null | undefined;

    // While the rest is still going to whoever paid, let it follow a change of
    // payer. Once pointed at someone, it is a choice: leave it.
    if (previous != null && this.restTo === previous) {
      this.restTo = this.payerId ?? "";
    }
  }

  protected firstUpdated(): void {
    // Announce the rule straight away: a caller showing a summary of it has
    // nothing to show until the user touches something otherwise.
    this.emit();
  }

  protected updated(changed: PropertyValues): void {
    // Emitting from willUpdate would fight the render in progress.
    if (changed.has("payerId")) {
      this.emit();
    }
  }

  protected render() {
    return this.renderPanel();
  }

  /** What the panel works on: the real expense, or a sample to stand for one. */
  private get previewAmount(): number {
    return this.amount != null && this.amount > 0 ? this.amount : SAMPLE;
  }

  private renderPanel() {
    const translate = this.localize;
    const shares = this.shares();

    return html`
      <div class="panel">
        <se-select
          .label=${translate("split_how")}
          .value=${this.mode}
          .options=${this.offered().map((mode) => ({
            value: mode,
            label: translate(`split_${mode}`),
          }))}
          @value-changed=${(e: CustomEvent) => this.pick(e.detail.value as Mode)}
        ></se-select>

        ${this.mode === "default" ? this.renderDefault() : nothing}
        ${this.mode === "equal" ? this.renderEqual(shares) : nothing}
        ${this.mode === "exact" ? this.renderExact(shares) : nothing}
        ${this.mode === "partial" ? this.renderPartial(shares) : nothing}
        ${this.mode === "custom" ? this.renderCustom(shares) : nothing}
        ${shares === null
          ? html`<div class="warn">${translate("rule_invalid")}</div>`
          : nothing}
      </div>
    `;
  }

  /** What can be picked here, and what this rule already happens to be. */
  private offered(): Mode[] {
    const modes = this.inherits ? (["default", ...LASTING] as Mode[]) : [...LASTING];

    return modes.includes(this.mode) ? modes : [...modes, this.mode];
  }

  /** Nothing to fill in: the rule is somebody else's. */
  private renderDefault() {
    return html`
      <div>
        <div class="muted">
          ${this.localize(
            this.inherits === "category" ? "default_from_category" : "default_from_group",
          )}
        </div>
        <div class="muted example">${this.localize("split_default_example")}</div>
      </div>
    `;
  }

  /** Tick who is in. What each pays shows next to them, live. */
  private renderEqual(shares: Record<string, number> | null) {
    return html`
      <div>
        <div class="muted">${this.localize("split_equal_hint")}</div>
        <div class="muted example">${this.localize("split_equal_example")}</div>
        ${this.members.map(
          (member) => html`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(member.id)}
                @change=${() => this.toggleParticipant(member.id)}
              />
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              <span class="share">${this.shareOf(shares, member.id)}</span>
            </div>
          `,
        )}
      </div>
    `;
  }

  /**
   * What each one owes, in money or as a share.
   *
   * One panel, one switch. "Antonin owes 5" and "Antonin owes 40%" are the same
   * sentence about the same person; only the unit differs, and that is a switch,
   * not a second thing to go and find in a list.
   *
   * They do behave apart — a share follows the amount, a figure does not — which
   * is why the rule keeps them apart. That is the rule's business, not yours.
   */
  private renderExact(shares: Record<string, number> | null) {
    const translate = this.localize;
    const percent = this.unit === "percent";
    const total = this.percentTotal();

    return html`
      <div>
        <div class="head">
          <div>
            <div class="muted">
              ${translate(percent ? "split_percent_hint" : "split_exact_hint")}
            </div>
            <div class="muted example">
              ${translate(percent ? "split_percent_example" : "split_exact_example")}
            </div>
          </div>
          <div class="units" role="group">
            <button
              aria-pressed=${!percent}
              @click=${() => this.setUnit("money")}
            >
              ${this.currency}
            </button>
            <button
              aria-pressed=${percent}
              @click=${() => this.setUnit("percent")}
            >
              %
            </button>
          </div>
        </div>

        ${this.members.map(
          (member) => html`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(member.id)}
                @change=${() => this.toggleParticipant(member.id)}
              />
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              ${percent
                ? html`<span class="share">${this.shareOf(shares, member.id)}</span>`
                : nothing}
              <!--
                In money, an empty field says in grey what it would come to:
                that is what a placeholder is for, and it answers the only
                question the mode raises. In percent the figure needs its own
                column, the field being the share itself.
              -->
              <se-field
                .value=${(percent ? this.percents : this.amounts)[member.id] ?? ""}
                .suffix=${percent ? "%" : this.currency}
                .disabled=${!this.participants.has(member.id)}
                decimal
                placeholder=${percent
                  ? "—"
                  : this.shareOf(shares, member.id) ||
                    this.localize("split_the_rest_short")}
                @value-changed=${(e: CustomEvent) =>
                  percent
                    ? this.setPercent(member.id, e.detail.value)
                    : this.setAmount(member.id, e.detail.value)}
              ></se-field>
            </div>
          `,
        )}

        ${percent
          ? html`
              <div class="total">
                <span class="muted">${translate("split_percent_total")}</span>
                <strong class=${total > FULL_PERCENT ? "negative" : ""}>
                  ${(total / 100).toFixed(total % 100 === 0 ? 0 : 2)} %
                </strong>
              </div>
              ${total > FULL_PERCENT
                ? html`<div class="warn">${translate("split_percent_over")}</div>`
                : nothing}
            `
          : nothing}
      </div>
    `;
  }

  /**
   * Switch the unit, dropping what was typed in the other.
   *
   * 40 EUR is not 40%, and carrying the figures across would turn one into the
   * other without a word — a different expense, silently.
   */
  private setUnit(unit: Unit) {
    if (unit === this.unit) {
      return;
    }

    this.unit = unit;
    this.amounts = {};
    this.percents = {};

    this.emit();
  }

  /** What has been claimed so far, in hundredths of a percent. */
  private percentTotal(): number {
    let total = 0;

    for (const [memberId, value] of Object.entries(this.percents)) {
      if (!this.participants.has(memberId)) {
        continue;
      }

      total += parsePercent(value) ?? 0;
    }

    return total;
  }

  private setPercent(memberId: string, value: string) {
    this.percents = { ...this.percents, [memberId]: value };
    this.emit();
  }

  /** An amount shared between some; whatever is left goes to one person. */
  private renderPartial(shares: Record<string, number> | null) {
    const translate = this.localize;
    const envelope = parseMoney(this.envelopeInput);
    const left =
      envelope === null ? null : Math.max(this.previewAmount - envelope, 0);

    return html`
      <div>
        <div class="muted example">${translate("split_partial_example")}</div>
        <se-field
          .label=${translate("split_shared_amount")}
          .value=${this.envelopeInput}
          .suffix=${this.currency}
          decimal
          placeholder="5,00"
          @value-changed=${(e: CustomEvent) => this.setEnvelope(e.detail.value)}
        ></se-field>

        <div class="muted" style="margin-top:10px">
          ${translate("split_shared_between")}
        </div>
        ${this.members.map(
          (member) => html`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(member.id)}
                @change=${() => this.toggleParticipant(member.id)}
              />
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              <span class="share">${this.shareOf(shares, member.id)}</span>
            </div>
          `,
        )}
      </div>

      <div class="rest">
        <span>
          ${translate("split_rest_for")}
          ${left === null
            ? nothing
            : html`<span class="figure">(${this.money(left)})</span>`}
        </span>
        <se-select
          .value=${this.restTo}
          .placeholder=${translate("split_rest_payer")}
          .options=${this.members.map((m) => ({ value: m.id, label: m.name }))}
          @value-changed=${(e: CustomEvent) => this.setRestTo(e.detail.value)}
        ></se-select>
      </div>
    `;
  }

  /**
   * The model in full: an amount shared, and what is left, to whoever and by
   * however much.
   *
   * Only reached by opening a rule that needs it. This is the editor as it was,
   * kept because such rules exist — a category rule written before the modes,
   * say — and rewriting one as something simpler would move real money.
   */
  private renderCustom(shares: Record<string, number> | null) {
    const translate = this.localize;

    return html`
      <div>
        <div class="muted">${translate("split_custom_hint")}</div>
        <div class="muted example">${translate("split_custom_example")}</div>
      </div>

      <se-field
        .label=${translate("split_shared_amount")}
        .value=${this.envelopeInput}
        .suffix=${this.currency}
        .helper=${translate("split_shared_all_hint")}
        decimal
        placeholder=${translate("split_shared_all")}
        @value-changed=${(e: CustomEvent) => this.setEnvelope(e.detail.value)}
      ></se-field>

      <div>
        <div class="muted">${translate("split_shared_between")}</div>
        ${this.members.map(
          (member) => html`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.participants.has(member.id)}
                @change=${() => this.toggleParticipant(member.id)}
              />
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              <span class="share">${this.shareOf(shares, member.id)}</span>
            </div>
          `,
        )}
      </div>

      <div>
        <div class="muted">${translate("split_rest_between")}</div>
        <div class="muted">${translate("split_rest_between_hint")}</div>
        ${this.members.map(
          (member) => html`
            <div class="member-row">
              <input
                type="checkbox"
                .checked=${this.takers.has(member.id)}
                @change=${() => this.toggleTaker(member.id)}
              />
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              <se-field
                .value=${this.amounts[member.id] ?? ""}
                .suffix=${this.currency}
                .disabled=${!this.takers.has(member.id)}
                decimal
                placeholder="—"
                @value-changed=${(e: CustomEvent) =>
                  this.setAmount(member.id, e.detail.value)}
              ></se-field>
            </div>
          `,
        )}
      </div>
    `;
  }

  private toggleTaker(memberId: string) {
    const next = new Set(this.takers);

    if (next.has(memberId)) {
      next.delete(memberId);

      const { [memberId]: _dropped, ...rest } = this.amounts;
      this.amounts = rest;
    } else {
      next.add(memberId);
    }

    this.takers = next;
    this.emit();
  }

  /** The rule as filled in, for the caller to store alongside the shares. */
  public currentRule(): SplitRule | null {
    return this.build();
  }

  /** The shares this rule resolves to, for the caller to store. */
  public resolved(): Record<string, number> | null {
    if (this.amount == null) {
      return null;
    }

    return this.shares(this.amount);
  }

  /**
   * What the rule comes to, run through the resolver the backend mirrors.
   *
   * Never worked out by hand here: these figures are the ones that get stored,
   * and a second opinion on them is exactly how a panel starts lying.
   */
  private shares(amount = this.previewAmount): Record<string, number> | null {
    const payer =
      this.members.find((member) => member.id === this.payerId) ?? this.members[0];

    if (!payer) {
      return null;
    }

    return resolveShares({
      amount,
      payerId: payer.id,
      memberIds: this.members.map((member) => member.id),
      rule: this.build(),
    });
  }

  private shareOf(shares: Record<string, number> | null, memberId: string): string {
    if (shares === null) {
      return "";
    }

    return shares[memberId] ? this.money(shares[memberId]) : "—";
  }

  private money(cents: number): string {
    return formatMoney(cents, this.currency, this.language);
  }

  private renderAvatar(member: Member) {
    return html`
      <div class="avatar" style=${`background:${member.color ?? colorFor(member.id)}`}>
        ${initials(member.name)}
      </div>
    `;
  }

  /**
   * Switch mode, carrying over what the next one can still use.
   *
   * An amount shared up front means something to `partial` and to `custom`, so
   * it survives between them; the figures typed mean the whole expense in
   * `exact` and only what is left in `custom`, so they never cross. Anything a
   * mode cannot hold is dropped rather than kept out of sight, where it would
   * come back unasked in a rule that no longer mentions it.
   */
  private pick(mode: Mode) {
    if (mode === this.mode) {
      return;
    }

    const previous = this.mode;

    this.mode = mode;

    if (mode !== "partial" && mode !== "custom") {
      this.envelopeInput = "";
    }

    if (mode !== "exact" && mode !== "custom") {
      this.amounts = {};
    }

    if (mode !== "exact") {
      this.percents = {};
    }

    // The amounts of `exact` are on the whole expense, those of `custom` on
    // what is left of it. Same field, different money.
    if ((mode === "exact") !== (previous === "exact")) {
      this.amounts = {};
    }

    if (mode === "exact" && this.participants.size === 0) {
      this.participants = new Set(this.members.map((member) => member.id));
    }

    if (mode === "partial") {
      // One person takes the rest here. Coming from custom, the first ticked is
      // the closest thing to what was meant.
      this.restTo = this.restTo || [...this.takers][0] || this.payerId || "";
    }

    if (mode === "custom" && this.takers.size === 0) {
      const rest = this.restTo || this.payerId;

      this.takers = rest ? new Set([rest]) : new Set();
    }

    if (mode !== "partial") {
      this.restTo = "";
    }

    this.emit();
  }

  private setEnvelope(value: string) {
    this.envelopeInput = value;
    this.emit();
  }

  private setRestTo(value: string) {
    this.restTo = value;
    this.emit();
  }

  private toggleParticipant(memberId: string) {
    const next = new Set(this.participants);

    if (next.has(memberId)) {
      next.delete(memberId);

      const { [memberId]: _dropped, ...rest } = this.amounts;
      this.amounts = rest;

      const { [memberId]: _share, ...others } = this.percents;
      this.percents = others;
    } else {
      next.add(memberId);
    }

    this.participants = next;
    this.emit();
  }

  private setAmount(memberId: string, value: string) {
    this.amounts = { ...this.amounts, [memberId]: value };
    this.emit();
  }

  private emit() {
    this.dispatchEvent(
      new CustomEvent("rule-changed", {
        detail: { rule: this.build() },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private build(): SplitRule | null {
    return ruleFor(this.mode, {
      participants: this.participants,
      envelopeInput: this.envelopeInput,
      amounts: this.amounts,
      percents: this.percents,
      unit: this.unit,
      restTo: this.restTo,
      takers: this.takers,
      memberIds: this.members.map((member) => member.id),
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-split-rule-editor": SeSplitRuleEditor;
  }
}
