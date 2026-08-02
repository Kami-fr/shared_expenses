import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-history";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Member, Revision } from "../types";

/**
 * The history of one expense or payment, folded away until asked for.
 *
 * Fetched on opening rather than with the dialog: most of the time an expense
 * is opened to fix a typo, and its past is not what the dialog is for. Fetched
 * once, then kept — reopening the section must not hit the connection again.
 */
@customElement("se-entity-history")
export class SeEntityHistory extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public entityId!: string;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  @property({ type: String }) public currency = "EUR";

  /** What this one was paid in, which the group's currency is not always. */
  @property({ type: String }) public paidIn = "";

  @property({ type: String }) public language = "en";

  @state() private open = false;

  @state() private revisions?: Revision[];

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

    `,
  ];

  protected render() {
    const translate = this.localize;

    return html`
      <div>
        <div class="head">
          <label class="muted">${translate("history")}</label>
          <button class="link" @click=${this.toggle}>
            ${this.open ? translate("done") : translate("see_all")}
          </button>
        </div>

        ${this.open ? this.renderBody() : nothing}
      </div>
    `;
  }

  private renderBody() {
    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (this.busy || !this.revisions) {
      return html`<div class="muted">${this.localize("loading")}</div>`;
    }

    return html`
      <se-history
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .currency=${this.currency}
        .paidIn=${this.paidIn}
        .language=${this.language}
      ></se-history>
    `;
  }

  private toggle = async () => {
    this.open = !this.open;

    if (!this.open || this.revisions || this.busy) {
      return;
    }

    this.busy = true;
    this.error = undefined;

    try {
      this.revisions = await this.api.listEntityRevisions(this.groupId, this.entityId);
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-entity-history": SeEntityHistory;
  }
}
