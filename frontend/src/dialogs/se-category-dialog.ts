import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-color-picker";
import "../components/se-icon-picker";
import "../components/se-split-rule-editor";
import type { SharedExpensesApi } from "../services/api";
import { colorFor } from "../services/format";
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

  @state() private color: string | null = null;

  @state() private rule: SplitRule | null = null;

  /** This category is where a new expense starts. */
  @state() private isDefault = false;

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();

    this.isDefault =
      this.category !== undefined &&
      this.group.default_category_id === this.category.id;

    if (this.category) {
      this.name = this.category.name;
      this.icon = this.category.icon ?? "";
      this.color = this.category.color;
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

          <se-icon-picker
            .localize=${this.localize}
            .label=${translate("icon")}
            .value=${this.icon}
            .color=${this.effectiveColor()}
            @value-changed=${(e: CustomEvent) => (this.icon = e.detail.value)}
          ></se-icon-picker>

          <se-color-picker
            .localize=${this.localize}
            .label=${translate("color")}
            .value=${this.color}
            .fallback=${this.autoColor()}
            @value-changed=${(e: CustomEvent) => (this.color = e.detail.value)}
          ></se-color-picker>

          <div>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.isDefault}
                @change=${(e: Event) =>
                  (this.isDefault = (e.target as HTMLInputElement).checked)}
              />
              <span>${translate("default_category")}</span>
            </label>
            <div class="muted hint">${translate("default_category_hint")}</div>
          </div>

          <div>
            <label class="muted">${translate("default_split")}</label>
            <se-split-rule-editor
              inherits="group"
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

  /** What the category is shown in: the chosen colour, or the automatic one. */
  private effectiveColor(): string {
    return this.color ?? this.autoColor();
  }

  /**
   * The colour the app would pick on its own.
   *
   * Keyed on the id, so a category being created has none yet: fall back to the
   * name, which at least stays put while typing.
   */
  private autoColor(): string {
    return colorFor(this.category?.id ?? this.name);
  }

  /**
   * Say whether this is the group's default, if that changed.
   *
   * The flag lives on the group, not the category — there is one of it, and a
   * category cannot know it is the chosen one. Saved after the category itself,
   * because a category being created has no id until then.
   */
  private async saveDefault(categoryId: string) {
    const was = this.group.default_category_id === categoryId;

    if (was === this.isDefault) {
      return;
    }

    await this.api.updateGroup(this.group.id, {
      default_category_id: this.isDefault ? categoryId : null,
    });
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
      color: this.color,
      split_rule: this.rule,
    };

    try {
      const category = this.category
        ? await this.api.updateCategory(this.category.id, changes)
        : await this.api.createCategory({ group_id: this.group.id, ...changes });

      await this.saveDefault(category.id);

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
