import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-history";
import type { SharedExpensesApi } from "../services/api";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Group, Member, Payment, Revision } from "../types";

/**
 * The names a deletion froze that can make what it took away yours.
 *
 * The keys of an expense and of a payment do not overlap, so asking for all
 * four and taking what is there says the right thing without a branch. The
 * same four `ensure_may_restore` asks of the same frozen state.
 */
const RESTORE_FIELDS = [
  "created_by_member_id",
  "paid_by_member_id",
  "from_member_id",
  "to_member_id",
];

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
   * What the project still holds.
   *
   * Handed in rather than worked out here: the page has them, and a revision
   * cannot say whether what it describes still exists — a deletion is exactly
   * the case where it does not. They also carry the amount and the payer, which
   * is what tells one entry from another.
   */
  @property({ attribute: false }) public expenses: Expense[] = [];

  @property({ attribute: false }) public payments: Payment[] = [];

  /** Which of them this reader may open rather than only read. The page's rule. */
  @property({ attribute: false }) public openable: string[] = [];

  /**
   * Who is reading, and whether the project lets them touch what is not theirs.
   *
   * The two halves of the same rule `openable` was built from, handed in raw
   * because the page cannot apply it here: it holds what the project still has,
   * and a restore is about what it no longer has. Only the revisions know that,
   * and they are loaded here.
   */
  @property({ type: String }) public meId: string | null = null;

  @property({ type: Boolean }) public mayEditOthers = false;

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
      <se-dialog
        open
        heading=${translate("group_history")}
        .localize=${this.localize}
        @dialog-closed=${this.close}
      >
        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
        ${this.renderBody()}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderBody() {
    // Keyed on what arrived, not on the error above it: a restore that was
    // refused sets the same field as a journal that never loaded, and blanking
    // the body on both took away the very entry that was being read — with no
    // way back short of closing the dialog. A load that failed shows the error
    // line alone rather than a "loading" that will never end.
    if (!this.revisions) {
      return this.error
        ? nothing
        : html`<div class="muted">${this.localize("loading")}</div>`;
    }

    return html`
      <se-history
        withSubject
        .restorable=${this.restorable()}
        .localize=${this.localize}
        .revisions=${this.revisions}
        .members=${this.members}
        .categories=${this.categories}
        .expenses=${this.expenses}
        .payments=${this.payments}
        .openable=${this.openable}
        .currency=${this.group.currency}
        .language=${this.language}
        @revision-restored=${this.restore}
      ></se-history>
    `;
  }

  /**
   * Which deleted entries this reader may bring back, by id.
   *
   * The same rule as editing one, which is what the backend applies to a
   * restore: yours when you entered it or it was about you, anybody's when the
   * project lets its members touch what is not theirs. Asked of the deletion,
   * because there is no row left to ask — it froze exactly these names, the way
   * se-history reads the amount off it.
   *
   * A deletion from before there were snapshots does not say who entered it, so
   * it only reads as yours when the money was. The backend reads the very same
   * frozen state, so the two say the same thing rather than nearly the same.
   */
  private restorable(): string[] {
    const ids: string[] = [];
    // Newest first, and only the latest deletion of a thing decides: one
    // brought back, changed hands and deleted again has an older deletion still
    // naming somebody the restore no longer belongs to. The backend asks the
    // latest too.
    const asked = new Set<string>();

    for (const revision of this.revisions ?? []) {
      if (revision.action !== "deleted" || asked.has(revision.entity_id)) {
        continue;
      }

      asked.add(revision.entity_id);

      if (this.mayRestore(revision)) {
        ids.push(revision.entity_id);
      }
    }

    return ids;
  }

  /** Whether the state a deletion froze names this reader. */
  private mayRestore(revision: Revision): boolean {
    if (this.mayEditOthers) {
      return true;
    }

    if (this.meId === null) {
      return false;
    }

    const frozen = new Map(revision.changes.map((change) => [change.field, change.before]));

    return RESTORE_FIELDS.some((field) => frozen.get(field) === this.meId);
  }

  /**
   * Bring back what a deletion took away.
   *
   * The page is told, and it is the page that reloads: the expense is back in
   * the balances and in the list, and this dialog holds neither. It closes,
   * because what it was showing has just changed underneath it and the honest
   * place to see the result is the list it came back into.
   */
  private restore = async (event: CustomEvent) => {
    const { entityType, entityId } = event.detail;

    this.error = undefined;

    try {
      if (entityType === "expense") {
        await this.api.restoreExpense(this.group.id, entityId);
      } else {
        await this.api.restorePayment(this.group.id, entityId);
      }

      this.dispatchEvent(
        new CustomEvent("history-restored", { bubbles: true, composed: true }),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    }
  };

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
