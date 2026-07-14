import { LitElement, type PropertyValues, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-field";
import {
  centsToInput,
  colorFor,
  formatMoney,
  initials,
  parseMoney,
} from "../services/format";
import type { Localizer } from "../services/localize";
import { resolveShares } from "../services/splits";
import { sharedStyles } from "../styles/shared";
import type { Member, SplitRule } from "../types";

/** What a rule is previewed on, so the figures mean something. */
const SAMPLE = 8542;

/**
 * Editor for a default split rule.
 *
 * Two steps of the same shape: an amount shared equally between the members
 * ticked, then whatever is left, handed to the members ticked below, either
 * equally or by the amounts typed.
 *
 * Fires `rule-changed` with `event.detail.rule`, a SplitRule or null when the
 * expenses should simply be split equally.
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

  /** Skip the on/off toggle: a rule is always in force here. */
  @property({ type: Boolean }) public required = false;

  @state() private enabled = false;

  @state() private envelopeInput = "";

  @state() private participants: Set<string> = new Set();

  /** Members taking the remainder. None ticked means whoever paid takes it. */
  @state() private takers: Set<string> = new Set();

  @state() private amounts: Record<string, string> = {};

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
        padding: 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }

      .member-row .name {
        flex: 1;
        font-size: 14px;
      }

      .member-row se-field {
        width: 110px;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .preview {
        font-size: 13px;
        line-height: 1.6;
        padding: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f1f1f1);
      }

      .preview .line {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }

      .preview strong {
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    this.enabled = this.required || this.rule !== null;

    this.envelopeInput =
      this.rule?.envelope != null ? centsToInput(this.rule.envelope) : "";

    this.participants = new Set(
      this.rule?.participants ?? this.members.map((member) => member.id),
    );

    // On a real expense, show what will happen rather than leaving every box
    // clear: an unset remainder means the payer takes it, so tick them. On a
    // lasting category rule there is no payer yet, so it stays unset and reads
    // as "whoever pays".
    const takers = this.rule?.remainder?.members;

    this.takers = new Set(
      takers ?? (this.payerId ? [this.payerId] : []),
    );

    this.amounts = Object.fromEntries(
      Object.entries(this.rule?.remainder?.fixed ?? {}).map(([id, amount]) => [
        id,
        centsToInput(amount),
      ]),
    );
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has("payerId")) {
      return;
    }

    const previous = changed.get("payerId") as string | null | undefined;

    // While the remainder is still just "whoever paid", let it follow a change
    // of payer. Once it has been touched, it is a deliberate choice: leave it.
    const untouched =
      previous != null && this.takers.size === 1 && this.takers.has(previous);

    if (untouched && this.payerId) {
      this.takers = new Set([this.payerId]);
      this.amounts = {};
    }
  }

  protected updated(changed: PropertyValues): void {
    // Emitting from willUpdate would fight the render in progress.
    if (changed.has("payerId")) {
      this.emit();
    }
  }

  protected render() {
    const translate = this.localize;

    if (this.required) {
      return this.renderPanel();
    }

    return html`
      <label class="toggle">
        <input type="checkbox" .checked=${this.enabled} @change=${this.toggle} />
        <span class="label">${translate("split_rule_custom")}</span>
      </label>

      ${this.enabled
        ? this.renderPanel()
        : html`<div class="muted">${translate("split_rule_equal_hint")}</div>`}
    `;
  }

  /** What the preview runs on: the real expense, or a sample. */
  private get previewAmount(): number {
    return this.amount != null && this.amount > 0 ? this.amount : SAMPLE;
  }

  private renderPanel() {
    const translate = this.localize;
    const envelope = parseMoney(this.envelopeInput);

    // The remainder only exists once the envelope stops covering everything.
    const hasRemainder =
      this.envelopeInput.trim() !== "" &&
      envelope !== null &&
      envelope < this.previewAmount;

    return html`
      <div class="panel">
        <div>
          <se-field
            .label=${translate("envelope_label")}
            .value=${this.envelopeInput}
            .suffix=${this.currency}
            .helper=${translate("envelope_hint")}
            decimal
            placeholder=${translate("envelope_all")}
            @value-changed=${(e: CustomEvent) => this.setEnvelope(e.detail.value)}
          ></se-field>

          <div class="muted" style="margin-top:8px">
            ${translate("shared_between")}
          </div>
          ${this.members.map((member) => this.renderParticipant(member))}
        </div>

        ${hasRemainder ? this.renderRemainder() : nothing} ${this.renderPreview()}
      </div>
    `;
  }

  private renderParticipant(member: Member) {
    return html`
      <div class="member-row">
        <input
          type="checkbox"
          .checked=${this.participants.has(member.id)}
          @change=${() => this.toggleParticipant(member.id)}
        />
        ${this.renderAvatar(member)}
        <span class="name">${member.name}</span>
      </div>
    `;
  }

  private renderRemainder() {
    const translate = this.localize;

    return html`
      <div>
        <label class="muted">${translate("remainder_label")}</label>
        <div class="muted">${translate("remainder_hint")}</div>

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

  /**
   * Show the rule on a sample expense.
   *
   * Resolved by the same code the backend mirrors, so these are the real
   * figures rather than a hand-written approximation that could drift.
   */
  private renderPreview() {
    const payer =
      this.members.find((member) => member.id === this.payerId) ?? this.members[0];

    if (!payer) {
      return nothing;
    }

    const amount = this.previewAmount;

    const shares = resolveShares({
      amount,
      payerId: payer.id,
      memberIds: this.members.map((member) => member.id),
      rule: this.build(),
    });

    if (shares === null) {
      return html`<div class="preview negative">${this.localize("rule_invalid")}</div>`;
    }

    const money = (cents: number) => formatMoney(cents, this.currency, this.language);

    return html`
      <div class="preview">
        <div class="muted">
          ${this.localize("rule_preview_intro")} ${money(amount)}
          ${this.localize("rule_preview_paid_by")} ${payer.name} :
        </div>
        ${this.members.map(
          (member) => html`
            <div class="line">
              <span>${member.name}</span>
              <strong>${money(shares[member.id] ?? 0)}</strong>
            </div>
          `,
        )}
      </div>
    `;
  }

  /** The shares this rule resolves to, for the caller to store. */
  public resolved(): Record<string, number> | null {
    const payer =
      this.members.find((member) => member.id === this.payerId) ?? this.members[0];

    if (!payer || this.amount == null) {
      return null;
    }

    return resolveShares({
      amount: this.amount,
      payerId: payer.id,
      memberIds: this.members.map((member) => member.id),
      rule: this.build(),
    });
  }

  private renderAvatar(member: Member) {
    return html`
      <div class="avatar" style=${`background:${member.color ?? colorFor(member.id)}`}>
        ${initials(member.name)}
      </div>
    `;
  }

  private toggle(event: Event) {
    this.enabled = (event.target as HTMLInputElement).checked;
    this.emit();
  }

  private setEnvelope(value: string) {
    this.envelopeInput = value;
    this.emit();
  }

  private toggleParticipant(memberId: string) {
    this.participants = toggled(this.participants, memberId);
    this.emit();
  }

  private toggleTaker(memberId: string) {
    this.takers = toggled(this.takers, memberId);

    if (!this.takers.has(memberId)) {
      const { [memberId]: _dropped, ...rest } = this.amounts;
      this.amounts = rest;
    }

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

  /** Build the rule, or null when it would be an equal split anyway. */
  private build(): SplitRule | null {
    if (!this.enabled) {
      return null;
    }

    const typed = this.envelopeInput.trim();
    const envelope = typed === "" ? null : parseMoney(typed);

    const fixed: Record<string, number> = {};

    for (const [memberId, value] of Object.entries(this.amounts)) {
      if (!this.takers.has(memberId) || value.trim() === "") {
        continue;
      }

      const amount = parseMoney(value);

      if (amount !== null) {
        fixed[memberId] = amount;
      }
    }

    return {
      envelope,
      participants:
        this.participants.size === this.members.length ? null : [...this.participants],
      remainder: {
        // Nobody ticked: whoever paid takes the rest, the useful default.
        members: this.takers.size === 0 ? null : [...this.takers],
        fixed,
      },
    };
  }
}

function toggled(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

declare global {
  interface HTMLElementTagNameMap {
    "se-split-rule-editor": SeSplitRuleEditor;
  }
}
