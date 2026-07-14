import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";

/** Dialog adding a member to a group. Fires `member-created` on success. */
@customElement("se-member-dialog")
export class SeMemberDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @state() private name = "";

  @state() private busy = false;

  @state() private error?: string;

  public static styles = sharedStyles;

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog open heading=${translate("new_member")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
          <se-field
            .label=${translate("member_name")}
            .value=${this.name}
            required
            @value-changed=${(e: CustomEvent) => (this.name = e.detail.value)}
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
      const member = await this.api.createMember({
        name: this.name.trim(),
        group_id: this.groupId,
      });

      this.dispatchEvent(
        new CustomEvent("member-created", {
          detail: { member },
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
    "se-member-dialog": SeMemberDialog;
  }
}
