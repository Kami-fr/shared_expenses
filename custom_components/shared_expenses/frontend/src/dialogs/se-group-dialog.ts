import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";

/** Dialog creating a group. Fires `group-created` on success. */
@customElement("se-group-dialog")
export class SeGroupDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @state() private name = "";

  @state() private description = "";

  @state() private currency = "EUR";

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog open heading=${translate("new_group")} @dialog-closed=${this.cancel}>
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
          <se-field
            .label=${translate("currency")}
            .value=${this.currency}
            @value-changed=${(e: CustomEvent) =>
              (this.currency = e.detail.value.toUpperCase())}
          ></se-field>
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button
          slot="actions"
          ?disabled=${this.busy || this.name.trim() === ""}
          @click=${this.submit}
        >
          ${translate("create")}
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
      const group = await this.api.createGroup({
        name: this.name.trim(),
        currency: this.currency.trim() || "EUR",
        description: this.description.trim() || null,
      });

      this.dispatchEvent(
        new CustomEvent("group-created", {
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
