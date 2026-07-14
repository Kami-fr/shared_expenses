import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-icon";
import "./se-category-dialog";
import type { SharedExpensesApi } from "../services/api";
import { colorFor, formatMoney } from "../services/format";
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
                ${this.categories.length === 0
                  ? html`<div class="empty">${translate("no_categories")}</div>`
                  : this.categories.map((category) => this.renderRow(category))}
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
          <div class="name">${category.name}</div>
          <div class="muted">${this.describe(category)}</div>
        </div>
        <span class="chevron">›</span>
      </button>
    `;
  }

  /** Summarize a split rule in one line. */
  private describe(category: Category): string {
    const envelope = category.split_rule?.envelope;

    // No envelope means the whole expense is shared: the plain equal split.
    if (envelope == null) {
      return this.localize("rule_equal");
    }

    const shared = formatMoney(envelope, this.group.currency, this.language);

    return `${this.localize("rule_shares")} ${shared}`;
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
