import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-split-rule-editor";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Group, Member, SplitRule } from "../types";

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

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();
    this.rule = this.group.split_rule;
  }

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog
        open
        heading=${translate("no_category_rule")}
        @dialog-closed=${this.cancel}
      >
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <div class="muted">${translate("no_category_rule_hint")}</div>

          <se-split-rule-editor
            .localize=${this.localize}
            .members=${this.members}
            .rule=${this.group.split_rule}
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
      await this.api.updateGroup(this.group.id, { split_rule: this.rule });

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
