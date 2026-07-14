import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import type { SharedExpensesApi } from "../services/api";
import { CURRENCIES } from "../services/currency";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Group } from "../types";

/**
 * Dialog creating a group, or correcting the name it was given.
 *
 * Fires `group-created` on a creation and `group-saved` on an edit.
 */
@customElement("se-group-dialog")
export class SeGroupDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  /** Set to correct an existing group, leave out to create one. */
  @property({ attribute: false }) public group?: Group;

  @state() private name = "";

  @state() private description = "";

  @state() private currency = "EUR";

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();

    if (this.group) {
      this.name = this.group.name;
      this.description = this.group.description ?? "";
      this.currency = this.group.currency;
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
      const group = this.group
        ? await this.api.updateGroup(this.group.id, fields)
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
