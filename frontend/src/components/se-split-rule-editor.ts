import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-field";
import { colorFor, formatMoney, initials, parseMoney } from "../services/format";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Member, SplitRule } from "../types";

/**
 * Editor for a default split rule.
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

  @state() private enabled = false;

  @state() private participants: Set<string> = new Set();

  @state() private capInput = "";

  @state() private fixedInputs: Record<string, string> = {};

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
        line-height: 1.5;
        padding: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, #f1f1f1);
      }

      .preview strong {
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    this.enabled = this.rule !== null;

    this.participants = new Set(
      this.rule?.participants ?? this.members.map((member) => member.id),
    );

    this.capInput = this.rule?.cap != null ? (this.rule.cap / 100).toFixed(2) : "";

    this.fixedInputs = Object.fromEntries(
      Object.entries(this.rule?.fixed ?? {}).map(([id, amount]) => [
        id,
        (amount / 100).toFixed(2),
      ]),
    );
  }

  protected render() {
    const translate = this.localize;

    return html`
      <label class="toggle">
        <input type="checkbox" .checked=${this.enabled} @change=${this.toggle} />
        <span class="label">${translate("split_rule_custom")}</span>
      </label>

      ${this.enabled ? this.renderPanel() : html`<div class="muted">${translate("split_rule_equal_hint")}</div>`}
    `;
  }

  private renderPanel() {
    const translate = this.localize;

    return html`
      <div class="panel">
        <div>
          <label class="muted">${translate("participants")}</label>
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
              </div>
            `,
          )}
        </div>

        <se-field
          .label=${translate("cap_label")}
          .value=${this.capInput}
          .suffix=${this.currency}
          .helper=${translate("cap_hint")}
          decimal
          placeholder=${translate("no_cap")}
          @value-changed=${(e: CustomEvent) => this.setCap(e.detail.value)}
        ></se-field>

        <div>
          <label class="muted">${translate("fixed_amounts")}</label>
          <div class="muted">${translate("fixed_amounts_hint")}</div>
          ${this.members.map(
            (member) => html`
              <div class="member-row">
                ${this.renderAvatar(member)}
                <span class="name">${member.name}</span>
                <se-field
                  .value=${this.fixedInputs[member.id] ?? ""}
                  .suffix=${this.currency}
                  decimal
                  placeholder="—"
                  @value-changed=${(e: CustomEvent) =>
                    this.setFixed(member.id, e.detail.value)}
                ></se-field>
              </div>
            `,
          )}
        </div>

        ${this.renderPreview()}
      </div>
    `;
  }

  private renderPreview() {
    const cap = parseMoney(this.capInput);

    if (cap === null || cap <= 0 || this.participants.size === 0) {
      return nothing;
    }

    // Show the rule on a sample expense, the way the backend resolves it.
    const sample = 8542;
    const fixedTotal = Object.values(this.fixedInputs).reduce(
      (sum, value) => sum + (parseMoney(value) ?? 0),
      0,
    );
    const distributable = sample - fixedTotal;

    if (distributable <= 0) {
      return nothing;
    }

    const envelope = Math.min(distributable, cap);
    const share = Math.floor(envelope / this.participants.size);
    const surplus = distributable - envelope;

    const money = (cents: number) => formatMoney(cents, this.currency, this.language);

    return html`
      <div class="preview">
        ${this.localize("rule_preview_intro")} <strong>${money(sample)}</strong>:
        <strong>${money(envelope)}</strong> ${this.localize("rule_preview_shared")}
        (${this.participants.size} × ~<strong>${money(share)}</strong>),
        ${this.localize("rule_preview_rest")} <strong>${money(surplus)}</strong>
        ${this.localize("rule_preview_to_payer")}
      </div>
    `;
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

  private toggleParticipant(memberId: string) {
    const next = new Set(this.participants);

    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      next.add(memberId);
    }

    this.participants = next;
    this.emit();
  }

  private setCap(value: string) {
    this.capInput = value;
    this.emit();
  }

  private setFixed(memberId: string, value: string) {
    this.fixedInputs = { ...this.fixedInputs, [memberId]: value };
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

    const fixed: Record<string, number> = {};

    for (const [memberId, value] of Object.entries(this.fixedInputs)) {
      const amount = parseMoney(value);

      if (amount !== null && amount > 0) {
        fixed[memberId] = amount;
      }
    }

    const cap = parseMoney(this.capInput);

    const everyone = this.participants.size === this.members.length;

    return {
      participants: everyone ? null : [...this.participants],
      fixed,
      cap: cap !== null && cap > 0 ? cap : null,
      remainder: "payer",
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-split-rule-editor": SeSplitRuleEditor;
  }
}
