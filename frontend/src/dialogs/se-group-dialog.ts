import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import type { SharedExpensesApi } from "../services/api";
import { CURRENCIES } from "../services/currency";
import { errorMessage, type Localizer, type LocalizeKey } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import { PERMISSIONS, type Group, type GroupRole, type Permission } from "../types";

/**
 * Dialog creating a project, or changing what it is and what it allows.
 *
 * Fires `group-created` on a creation and `group-saved` on an edit.
 */
@customElement("se-group-dialog")
export class SeGroupDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  /** Set to correct an existing group, leave out to create one. */
  @property({ attribute: false }) public group?: Group;

  /** What the reader is here. The switches are the admin's alone. */
  @property({ attribute: false }) public role: GroupRole | null = null;

  /**
   * The house's own currency, offered as the starting point for a new group.
   * Taken only if the rate service knows it; anything else falls back to EUR.
   */
  @property({ attribute: false }) public defaultCurrency?: string;

  @state() private name = "";

  @state() private description = "";

  @state() private currency = "EUR";

  /** What the project grants, as it stands in the dialog. */
  @state() private permissions = new Set<Permission>();

  /** Whether the project is on the dashboard, as it stands in the dialog. */
  @state() private exposed = false;

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      .switch {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px 0;
      }

      .switch input {
        margin-top: 2px;
        flex: 0 0 auto;
      }

      .switch .body {
        min-width: 0;
      }

      .switch .title {
        font-size: 14px;
      }

      .switch .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .section {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        padding-top: 12px;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.group) {
      this.name = this.group.name;
      this.description = this.group.description ?? "";
      this.currency = this.group.currency;
      this.permissions = new Set(this.group.permissions);
      this.exposed = this.group.exposed;
    } else if (this.defaultCurrency && CURRENCIES.includes(this.defaultCurrency)) {
      this.currency = this.defaultCurrency;
    }
  }

  protected render() {
    const translate = this.localize;

    const heading = this.group
      ? translate("edit_group")
      : translate("new_group");

    return html`
      <se-dialog open heading=${heading} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
          <se-field
            .label=${translate("group_name")}
            .value=${this.name}
            required
            placeholder="Appartement"
            @value-changed=${(e: CustomEvent) => (this.name = e.detail.value)}
          ></se-field>
          <se-field
            .label=${translate("description")}
            .value=${this.description}
            @value-changed=${(e: CustomEvent) => (this.description = e.detail.value)}
          ></se-field>

          <!--
            Picked, never typed: a rate can only be had for a currency the rate
            service knows, and "EURO" went in happily and left every foreign
            expense unsaveable.

            Offered on a creation only, and shown as a plain fact afterwards.
            What a group counts in is the unit its whole history is written in
            — every share, every balance, every converted amount. Changing it
            later converts nothing, so the same figures would simply be read in
            another currency, silently.
          -->
          ${this.group
            ? html`<div>
                <label class="muted">${translate("currency")}</label>
                <div>${this.currency}</div>
              </div>`
            : html`<se-select
                .label=${translate("currency")}
                .value=${this.currency}
                .options=${CURRENCIES.map((code) => ({ value: code, label: code }))}
                @value-changed=${(e: CustomEvent) => (this.currency = e.detail.value)}
              ></se-select>`}

          ${this.renderPermissions()} ${this.renderDashboard()}
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${this.group ? translate("save") : translate("create")}
        </se-button>
      </se-dialog>
    `;
  }

  /**
   * What the project lets its members do.
   *
   * The admin's alone, and shown to nobody else — not even greyed out. A member
   * has no say and no reason to study the list; what they may do, they find out
   * by the panel offering it or not.
   *
   * On a creation there is nothing to show: a new project allows everything,
   * and asking four questions before the first expense is asking them of
   * somebody who has no idea yet.
   */
  private renderPermissions() {
    if (!this.group || this.role !== "admin") {
      return nothing;
    }

    const translate = this.localize;

    return html`
      <div class="section">
        <h3>${translate("permissions")}</h3>
        <div class="muted">${translate("permissions_hint")}</div>

        ${PERMISSIONS.map(
          (permission) => html`
            <label class="switch">
              <input
                type="checkbox"
                .checked=${this.permissions.has(permission)}
                @change=${(event: Event) => this.toggle(permission, event)}
              />
              <span class="body">
                <span class="title">${translate(`perm_${permission}` as LocalizeKey)}</span>
                <span class="hint"
                  >${translate(`perm_${permission}_hint` as LocalizeKey)}</span
                >
              </span>
            </label>
          `,
        )}
      </div>
    `;
  }

  /**
   * Whether this project's figures go on the dashboard.
   *
   * The admin's alone, like the permissions, and for a heavier reason: this one
   * takes a wall down rather than moving one. So it says what it does before
   * anybody touches it, rather than after somebody notices.
   *
   * Home Assistant has no wall around entities. The machinery is there — an
   * entity policy per account — but nothing sets it and there is no interface
   * for it, so every account in the house reads every entity's state whatever
   * this integration thinks about who is in which project.
   */
  private renderDashboard() {
    if (!this.group || this.role !== "admin") {
      return nothing;
    }

    const translate = this.localize;

    return html`
      <div class="section">
        <h3>${translate("dashboard")}</h3>

        <label class="switch">
          <input
            type="checkbox"
            .checked=${live(this.exposed)}
            @change=${(event: Event) =>
              (this.exposed = (event.target as HTMLInputElement).checked)}
          />
          <span class="body">
            <span class="title">${translate("dashboard_on")}</span>
            <span class="hint">${translate("dashboard_on_hint")}</span>
          </span>
        </label>

        ${this.exposed ? nothing : html`<div class="muted">${translate("dashboard_hint")}</div>`}
      </div>
    `;
  }

  private toggle(permission: Permission, event: Event) {
    // A new Set, not a mutation: Lit compares by identity, and the same Set
    // handed back changed would render nothing at all.
    const next = new Set(this.permissions);

    if ((event.target as HTMLInputElement).checked) {
      next.add(permission);
    } else {
      next.delete(permission);
    }

    this.permissions = next;
  }

  private cancel = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };

  private submit = async () => {
    this.busy = true;
    this.error = undefined;

    const fields = {
      name: this.name.trim(),
      description: this.description.trim() || null,
    };

    try {
      // The currency goes in on a creation and is never sent again: an edit
      // that carried it would be an edit that could quietly restate every
      // figure in the group.
      //
      // The permissions go the other way — only on an edit, and only from the
      // admin, whose dialog is the only one that showed them. Sending them from
      // anybody else would be sending back whatever was loaded, which the
      // backend refuses outright, so the save would fail on a field nobody
      // touched.
      const group = this.group
        ? await this.api.updateGroup(this.group.id, {
            ...fields,
            ...(this.role === "admin"
              ? { permissions: [...this.permissions], exposed: this.exposed }
              : {}),
          })
        : await this.api.createGroup({ ...fields, currency: this.currency });

      this.dispatchEvent(
        new CustomEvent(this.group ? "group-saved" : "group-created", {
          detail: { group },
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
    "se-group-dialog": SeGroupDialog;
  }
}
