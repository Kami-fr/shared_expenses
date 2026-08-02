import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-icon";
import "./se-category-dialog";
import "./se-group-rule-dialog";
import type { SharedExpensesApi } from "../services/api";
import { colorOf, sortByName } from "../services/format";
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

  /**
   * Whether the project lets this reader change the group itself.
   *
   * Handed on to the editor, where the default category lives: it is stored on
   * the group, and managing the categories does not grant it. The same switch
   * decides whether the rule for expenses with no category opens at all — it
   * is the group's rule, and saving it is a command on the group.
   */
  @property({ type: Boolean }) public mayManageGroup = false;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ type: String }) public language = "en";

  @state() private categories: Category[] = [];

  /**
   * The group as the server last gave it, which the page's copy may not be.
   *
   * Kept here rather than written back into `group`: that property belongs to
   * the page, and lit-html re-commits an object binding on every parent render.
   * Home Assistant hands the panel a new `hass` on every state change, so the
   * page's copy — not reloaded until this dialog closes — would land back on
   * top a frame later and take the reloaded one with it.
   */
  @state() private current?: Group;

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

      /*
       * A row you may read but not rewrite.
       *
       * Never greyed out: the rule is true and worth reading, it is simply not
       * yours to change. Only the pointer goes, so nothing invites a press that
       * would do nothing.
       */
      .row-fixed {
        cursor: default;
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

  /** The group everything here reads from: the reloaded copy once there is one. */
  private get shown(): Group {
    return this.current ?? this.group;
  }

  protected render() {
    const translate = this.localize;

    if (this.editingGroupRule) {
      return html`
        <se-group-rule-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.shown}
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
          .group=${this.shown}
          .mayManageGroup=${this.mayManageGroup}
          .members=${this.members}
          .category=${this.editing}
          .categories=${this.categories}
          .language=${this.language}
          @dialog-cancelled=${this.closeEditor}
          @category-saved=${this.handleSaved}
        ></se-category-dialog>
      `;
    }

    return html`
      <se-dialog
        open
        heading=${translate("categories")}
        .localize=${this.localize}
        @dialog-closed=${this.close}
      >
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
          .color=${colorOf(category, this.categories)}
          .size=${34}
        ></se-icon>
        <div class="info">
          <div class="name">
            ${category.name}
            ${this.shown.default_category_id === category.id
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
   *
   * Opened only by a reader who may change the group: that rule lives on the
   * group, and managing the categories does not grant it. Shown all the same,
   * because what an uncategorised expense does is worth knowing either way.
   */
  private renderNoCategory() {
    const body = html`
      <se-icon
        .icon=${"mdi:tag-off-outline"}
        fallback="—"
        .color=${"var(--secondary-text-color, #727272)"}
        .size=${34}
      ></se-icon>
      <div class="info">
        <div class="name">
          ${this.localize("no_category")}
          ${this.shown.default_category_id === null
            ? html`<span class="tag">${this.localize("default_category_tag")}</span>`
            : nothing}
        </div>
        <div class="muted">
          ${describeRule(
            this.shown.split_rule,
            this.localize,
            this.shown.currency,
            this.language,
          )}
        </div>
      </div>
      ${this.mayManageGroup ? html`<span class="chevron">›</span>` : nothing}
    `;

    // A button only when there is somewhere to go: a row that looks clickable
    // and could only ever be refused is worse than a plain one.
    return this.mayManageGroup
      ? html`<button class="row" @click=${() => (this.editingGroupRule = true)}>
          ${body}
        </button>`
      : html`<div class="row row-fixed">${body}</div>`;
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
      this.shown.currency,
      this.language,
    );
  }

  /**
   * The categories, and the group they hang off.
   *
   * The group comes back too because the default category is stored on it, and
   * saving a category is what moves it. A copy that missed the move would tag
   * the wrong row here, and tell the rule dialog that a new expense still opens
   * on no category when another one has taken that over.
   */
  private async load() {
    this.error = undefined;

    try {
      const [group, categories] = await Promise.all([
        this.api.getGroup(this.group.id),
        this.api.listCategories(this.group.id),
      ]);

      this.current = group;
      this.categories = sortByName(categories, this.language);
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
