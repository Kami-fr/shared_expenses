import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-icon";
import "./se-category-dialog";
import "./se-group-rule-dialog";
import type { SharedExpensesApi } from "../services/api";
import { colorFor } from "../services/format";
import { describeRule } from "../services/split-summary";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Group, Member } from "../types";

/**
 * The categories of a group, and the way into editing one.
 *
 * Fires `categories-changed` on close when something was saved.
 */
@customElement("se-categories-dialog")
export class SeCategoriesDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ type: String }) public language = "en";

  @state() private categories: Category[] = [];

  @state() private editing?: Category;

  @state() private creating = false;

  /** The rule for expenses with no category is open. */
  @state() private editingGroupRule = false;

  @state() private loading = true;

  @state() private error?: string;

  @state() private dirty = false;

  public static styles = [
    sharedStyles,
    css`
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        width: 100%;
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        text-align: left;
        font-family: inherit;
      }

      .row + .row {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .row .info {
        flex: 1;
        min-width: 0;
      }

      .row .name {
        font-size: 14px;
        font-weight: 500;
      }

      .chevron {
        color: var(--secondary-text-color);
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected render() {
    const translate = this.localize;

    if (this.editingGroupRule) {
      return html`
        <se-group-rule-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${() => (this.editingGroupRule = false)}
          @rule-saved=${this.handleGroupRuleSaved}
        ></se-group-rule-dialog>
      `;
    }

    // The editor takes over the screen: one dialog at a time.
    if (this.creating || this.editing) {
      return html`
        <se-category-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.members}
          .category=${this.editing}
          .language=${this.language}
          @dialog-cancelled=${this.closeEditor}
          @category-saved=${this.handleSaved}
        ></se-category-dialog>
      `;
    }

    return html`
      <se-dialog open heading=${translate("categories")} @dialog-closed=${this.close}>
        ${this.loading
          ? html`<div class="empty">${translate("loading")}</div>`
          : html`
              <div>
                ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
                ${this.renderNoCategory()}
                ${this.categories.map((category) => this.renderRow(category))}
                ${this.categories.length === 0
                  ? html`<div class="empty">${translate("no_categories")}</div>`
                  : nothing}
              </div>
            `}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
        <se-button slot="actions" @click=${() => (this.creating = true)}>
          ${translate("new_category")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderRow(category: Category) {
    return html`
      <button class="row" @click=${() => (this.editing = category)}>
        <se-icon
          .icon=${category.icon}
          .fallback=${category.name.charAt(0).toUpperCase()}
          .color=${category.color ?? colorFor(category.id)}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${category.name}
            ${this.group.default_category_id === category.id
              ? html`<span class="tag">${this.localize("default_category_tag")}</span>`
              : nothing}
          </div>
          <div class="muted">${this.describe(category)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }

  /**
   * The rule an expense with no category falls back on.
   *
   * Sits with the categories because that is what it is: the rule for the ones
   * that have none, and the one every category without its own defers to. It
   * was stored from the first day and nothing could ever set it.
   */
  private renderNoCategory() {
    return html`
      <button class="row" @click=${() => (this.editingGroupRule = true)}>
        <se-icon
          .icon=${"mdi:tag-off-outline"}
          fallback="—"
          .color=${"var(--secondary-text-color, #727272)"}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${this.localize("no_category")}
            ${this.group.default_category_id === null
              ? html`<span class="tag">${this.localize("default_category_tag")}</span>`
              : nothing}
          </div>
          <div class="muted">
            ${describeRule(
              this.group.split_rule,
              this.localize,
              this.group.currency,
              this.language,
            )}
          </div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }

  /**
   * What a category does to an expense, in one line.
   *
   * A category with no rule of its own is not an equal split: it hands the
   * expense to the group's rule, which may be anything. Saying "equal shares"
   * there was a guess, and a wrong one the moment the group rule was not that.
   */
  private describe(category: Category): string {
    if (category.split_rule === null) {
      return this.localize("rule_from_group");
    }

    return describeRule(
      category.split_rule,
      this.localize,
      this.group.currency,
      this.language,
    );
  }

  private async load() {
    this.error = undefined;

    try {
      this.categories = await this.api.listCategories(this.group.id);
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.loading = false;
    }
  }

  /**
   * The group rule changed, so the page must hear about it.
   *
   * This dialog holds a copy of the group; the page owns it. Rather than patch
   * the copy, say so and let the page reload — an expense saved a moment later
   * resolves against the rule, and it must be the stored one.
   */
  private handleGroupRuleSaved = () => {
    this.editingGroupRule = false;

    this.dispatchEvent(
      new CustomEvent("categories-changed", { bubbles: true, composed: true }),
    );
  };

  private closeEditor = () => {
    this.creating = false;
    this.editing = undefined;
  };

  private handleSaved = async () => {
    this.dirty = true;
    this.closeEditor();
    await this.load();
  };

  private close = () => {
    this.dispatchEvent(
      new CustomEvent(this.dirty ? "categories-changed" : "dialog-cancelled", {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-categories-dialog": SeCategoriesDialog;
  }
}
