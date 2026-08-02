import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-statistics";
import type { SharedExpensesApi } from "../services/api";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Group, Member } from "../types";

/**
 * What the group spent, on demand.
 *
 * A dialog rather than a destination: figures are read now and then, unlike the
 * list you come back to every day. It fetches on opening, so it is never stale
 * — closing and reopening is the refresh.
 */
@customElement("se-statistics-dialog")
export class SeStatisticsDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  /** Members including those who left: they spent, and it still counts. */
  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  @property({ type: String }) public meId: string | null = null;

  @property({ type: String }) public language = "en";

  public static styles = sharedStyles;

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog
        open
        heading=${translate("statistics")}
        .localize=${this.localize}
        @dialog-closed=${this.close}
      >
        <se-statistics
          .api=${this.api}
          .localize=${this.localize}
          .groupId=${this.group.id}
          .members=${this.members}
          .categories=${this.categories}
          .meId=${this.meId}
          .currency=${this.group.currency}
          .language=${this.language}
        ></se-statistics>

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-statistics-dialog": SeStatisticsDialog;
  }
}
