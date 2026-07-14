import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-menu-button";
import "../dialogs/se-group-dialog";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Group } from "../types";

/** Dashboard listing the groups. Fires `group-selected` on tap. */
@customElement("se-dashboard-page")
export class SeDashboardPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @state() private groups: Group[] = [];

  @state() private loading = true;

  @state() private error?: string;

  @state() private dialogOpen = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      /* The same banner the group page wears, from the same theme variables. */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 3;
      }

      .page {
        padding: 16px;
        max-width: 720px;
        margin: 0 auto;
      }

      .group {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        cursor: pointer;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        color: inherit;
      }

      .group + .group {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .group:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .badge {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex: 0 0 auto;
      }

      .info {
        flex: 1;
        min-width: 0;
      }

      .name {
        font-size: 16px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--secondary-text-color);
      }

      .archived-tag {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 720px;
        margin: 0 auto;
        padding: 8px 16px;
        min-height: 64px;
        box-sizing: border-box;
      }

      .header h1 {
        font-size: 18px;
        color: inherit;
      }

      .fab {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected render() {
    const translate = this.localize;

    if (this.loading) {
      return html`<div class="empty">${translate("loading")}</div>`;
    }

    return html`
      <div class="toolbar">
        <div class="header">
          <se-menu-button></se-menu-button>
          <h1>${translate("groups")}</h1>
        </div>
      </div>

      <div class="page">
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          ${this.groups.length === 0
            ? html`<div class="card">
                <div class="empty">${translate("no_groups")}</div>
              </div>`
            : html`<div class="card">
                ${this.groups.map((group) => this.renderGroup(group))}
              </div>`}

          <div class="fab">
            <se-button @click=${() => (this.dialogOpen = true)}>
              ${translate("new_group")}
            </se-button>
          </div>
        </div>
      </div>

      ${this.dialogOpen
        ? html`
            <se-group-dialog
              .api=${this.api}
              .localize=${this.localize}
              @dialog-cancelled=${() => (this.dialogOpen = false)}
              @group-created=${this.handleCreated}
            ></se-group-dialog>
          `
        : nothing}
    `;
  }

  private renderGroup(group: Group) {
    return html`
      <button class="group" @click=${() => this.select(group)}>
        <div class="badge" style=${group.color ? `background:${group.color}` : ""}>
          ${group.name.charAt(0).toUpperCase()}
        </div>
        <div class="info">
          <div class="name">${group.name}</div>
          ${group.description ? html`<div class="muted">${group.description}</div>` : nothing}
        </div>
        ${group.archived
          ? html`<span class="archived-tag">${this.localize("archived")}</span>`
          : nothing}
        <span class="chevron">›</span>
      </button>
    `;
  }

  private async load() {
    this.loading = true;
    this.error = undefined;

    try {
      this.groups = await this.api.listGroups();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.loading = false;
    }
  }

  private select(group: Group) {
    this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: group.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleCreated = (event: CustomEvent) => {
    this.dialogOpen = false;
    this.select(event.detail.group);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-dashboard-page": SeDashboardPage;
  }
}
