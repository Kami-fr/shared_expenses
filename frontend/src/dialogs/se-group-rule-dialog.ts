import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-split-rule-editor";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Group, Member, SplitRule } from "../types";

/**
 * What the editor opens on when the group has never said anything.
 *
 * Spelled out rather than left null: a null reads as "default rule", and the
 * group falls back on nobody — it would be offering this very dialog's answer
 * back to it under another name. Saying nothing here *is* an equal split, so
 * that is what gets shown.
 */
const EQUAL: SplitRule = { envelope: null, participants: null, remainder: {} };

/**
 * The rule an expense falls back on when its category has none.
 *
 * It is the group's rule, and it has always been stored — nothing could set it.
 * An expense with no category at all lands here too, which is why it is offered
 * beside the categories rather than buried in the group's settings: it is one
 * of the rules, and the one everything else defers to.
 *
 * Fires `rule-saved` on success.
 */
@customElement("se-group-rule-dialog")
export class SeGroupRuleDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ type: String }) public language = "en";

  @state() private rule: SplitRule | null = null;

  /** New expenses start with no category. */
  @state() private isDefault = false;

  /** What that was when the dialog opened, so an untouched box writes nothing. */
  private wasDefault = false;

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      .switch {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 14px;
      }

      .switch input {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }

      .switch input[disabled] {
        cursor: default;
      }

      .hint {
        font-size: 12px;
        padding: 4px 0 0 32px;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    this.rule = this.group.split_rule;
    this.isDefault = this.group.default_category_id === null;
    this.wasDefault = this.isDefault;
  }

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog
        open
        heading=${translate("no_category_rule")}
        .localize=${this.localize}
        @dialog-closed=${this.cancel}
      >
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                ?disabled=${this.group.default_category_id === null}
                @change=${(e: Event) =>
                  (this.isDefault = (e.target as HTMLInputElement).checked)}
              />
              <span>${translate("default_category")}</span>
            </label>
            <div class="muted hint">${translate("default_category_hint")}</div>
          </div>

          <div class="muted">${translate("no_category_rule_hint")}</div>

          <se-split-rule-editor
            .localize=${this.localize}
            .members=${this.members}
            .rule=${this.group.split_rule ?? EQUAL}
            .currency=${this.group.currency}
            .language=${this.language}
            @rule-changed=${(e: CustomEvent) => (this.rule = e.detail.rule)}
          ></se-split-rule-editor>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy} @click=${this.submit}>
          ${translate("save")}
        </se-button>
      </se-dialog>
    `;
  }

  private cancel = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };

  private submit = async () => {
    this.busy = true;
    this.error = undefined;

    try {
      // Both live on the group, so they go together. Ticking this is the one
      // way back to no category once another has taken it; unticking it would
      // leave nothing chosen, which is the same thing, so it cannot be done —
      // the box disables itself once it is on.
      //
      // Sent only when the tick is new. A box that was already on says what the
      // group already says, and writing it back would hand a default category
      // chosen elsewhere since to nobody, in a dialog that never mentioned it.
      await this.api.updateGroup(this.group.id, {
        split_rule: this.rule,
        ...(this.isDefault && !this.wasDefault ? { default_category_id: null } : {}),
      });

      this.dispatchEvent(
        new CustomEvent("rule-saved", { bubbles: true, composed: true }),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-group-rule-dialog": SeGroupRuleDialog;
  }
}
