import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-history";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Group, Member, Revision } from "../types";

/**
 * Everything that happened in the group, newest first.
 *
 * The one place a deletion can be read: an expense's own history goes with it,
 * so "who removed the 40 EUR petrol?" has nowhere else to be answered.
 */
@customElement("se-history-dialog")
export class SeHistoryDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  /** Members including those who left: the past needs names on it. */
  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  /**
   * The ids still there to open.
   *
   * Handed in rather than worked out here: the page holds the expenses and the
   * payments, and a revision cannot say whether what it describes still exists
   * — a deletion is exactly the case where it does not.
   */
  @property({ attribute: false }) public openable?: Set<string>;

  @property({ type: String }) public language = "en";

  @state() private revisions?: Revision[];

  @state() private error?: string;

  public static styles = sharedStyles;

  public connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  protected render() {
    const translate = this.localize;

    return html`
      <se-dialog open heading=${translate("group_history")} @dialog-closed=${this.close}>
        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderBody() {
    if (this.error) {
      return nothing;
    }

    if (!this.revisions) {
      return html`<div class="muted">${this.localize("loading")}</div>`;
    }

    return html`
      <se-history
        withSubject
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .openable=${this.openable}
        .currency=${this.group.currency}
        .language=${this.language}
      ></se-history>
    `;
  }

  private async load() {
    try {
      this.revisions = await this.api.listRevisions(this.group.id);
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    }
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-history-dialog": SeHistoryDialog;
  }
}
