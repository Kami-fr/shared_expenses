import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-split-rule-editor";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Group, Member, SplitRule } from "../types";

/**
 * Dialog creating or editing a category and its default split rule.
 *
 * Fires `category-saved` on success.
 */
@customElement("se-category-dialog")
export class SeCategoryDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  /** Set to edit an existing category, leave out to create one. */
  @property({ attribute: false }) public category?: Category;

  @property({ type: String }) public language = "en";

  @state() private name = "";

  @state() private icon = "";

  @state() private rule: SplitRule | null = null;

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.category) {
      this.name = this.category.name;
      this.icon = this.category.icon ?? "";
      this.rule = this.category.split_rule;
    }
  }

  protected render() {
    const translate = this.localize;
    const heading = this.category ? translate("edit_category") : translate("new_category");

    return html`
      <se-dialog open heading=${heading} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <se-field
            .label=${translate("category_name")}
            .value=${this.name}
            required
            placeholder="Courses"
            @value-changed=${(e: CustomEvent) => (this.name = e.detail.value)}
          ></se-field>

          <se-field
            .label=${translate("icon")}
            .value=${this.icon}
            .helper=${translate("icon_hint")}
            placeholder="mdi:cart"
            @value-changed=${(e: CustomEvent) => (this.icon = e.detail.value)}
          ></se-field>

          <div>
            <label class="muted">${translate("default_split")}</label>
            <se-split-rule-editor
              .localize=${this.localize}
              .members=${this.members}
              .rule=${this.rule}
              .currency=${this.group.currency}
              .language=${this.language}
              @rule-changed=${(e: CustomEvent) => (this.rule = e.detail.rule)}
            ></se-split-rule-editor>
          </div>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${this.category ? translate("save") : translate("create")}
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

    const changes = {
      name: this.name.trim(),
      icon: this.icon.trim() || null,
      split_rule: this.rule,
    };

    try {
      const category = this.category
        ? await this.api.updateCategory(this.category.id, changes)
        : await this.api.createCategory({ group_id: this.group.id, ...changes });

      this.dispatchEvent(
        new CustomEvent("category-saved", {
          detail: { category },
          bubbles: true,
          composed: true,
        }),
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
    "se-category-dialog": SeCategoryDialog;
  }
}
