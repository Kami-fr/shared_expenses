import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  colorFor,
  firstName,
  formatDayDate,
  formatMoney,
  initials,
} from "../services/format";
import { readChange, type HistoryContext } from "../services/history";
import type { Key, Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type {
  Category,
  Expense,
  Member,
  Payment,
  Revision,
  RevisionEntity,
} from "../types";

/**
 * What each kind of entry is about, in words.
 *
 * Typed on the entity, so a kind added to the backend and forgotten here is
 * caught by the compiler rather than read as the wrong noun by somebody.
 */
const SUBJECTS: Record<RevisionEntity, Key> = {
  expense: "the_expense",
  payment: "the_payment",
  group: "the_group",
  category: "the_category",
  member: "the_member",
};

/**
 * A list of revisions, newest first.
 *
 * The same list serves one expense and the whole group, so it never assumes
 * everything it shows still exists: a deleted expense is named by the label
 * frozen on its revision, and an id it cannot place reads as "?" rather than
 * leaking a ULID.
 */
@customElement("se-history")
export class SeHistory extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public revisions: Revision[] = [];

  /** Members including those who left: the past needs names on it. */
  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  @property({ type: String }) public currency = "EUR";

  @property({ type: String }) public language = "en";

  /** Show what each revision is about. Off inside one expense's own history. */
  @property({ type: Boolean }) public withSubject = false;

  /**
   * What the group still holds. Left out, nothing is clickable.
   *
   * Two things come from these, and they used to be a `Set` of ids that only
   * answered the first. Whether an entry can be opened — a deleted expense has
   * revisions and no longer exists — and what it is about: a revision carries
   * what moved, so an entry that changed a date says nothing about the amount
   * or the payer, which is exactly what somebody needs to know which expense
   * they are reading about.
   */
  @property({ attribute: false }) public expenses: Expense[] = [];

  @property({ attribute: false }) public payments: Payment[] = [];

  /**
   * Whether to offer bringing a deleted entry back.
   *
   * Off inside one expense's own history: you got there from the expense, so it
   * exists, so nothing on that page was ever deleted. On in the group journal,
   * which is the only place a deleted expense can still be seen at all.
   */
  @property({ type: Boolean }) public restorable = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .entry {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        align-items: flex-start;
      }

      .entry + .entry {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .entry-button {
        border: none;
        background: none;
        color: inherit;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
      }

      .entry-button:hover {
        background: var(--secondary-background-color, #f6f6f6);
      }

      .chevron {
        color: var(--secondary-text-color);
        align-self: center;
      }

      .body {
        flex: 1;
        min-width: 0;
      }

      .head {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .who {
        font-size: 14px;
        font-weight: 500;
      }

      /* The date, and the money under it. Pushed to the edge together. */
      .stamp {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex: 0 0 auto;
      }

      .when {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .sum {
        font-size: 13px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .what {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      /* Whose the figure below is. One word, so it never pushes the money. */
      .whose {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      /* Reads as a link, on the line whose deletion it undoes. See .link. */
      .restore {
        margin-top: 4px;
      }

      .change {
        font-size: 13px;
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: baseline;
      }

      .field {
        color: var(--secondary-text-color);
        min-width: 90px;
      }

      .before {
        text-decoration: line-through;
        color: var(--secondary-text-color);
      }

      .arrow {
        color: var(--secondary-text-color);
      }

      .after {
        font-weight: 500;
      }

      .entry .avatar {
        width: 28px;
        height: 28px;
        font-size: 11px;
      }
    `,
  ];

  protected render() {
    if (this.revisions.length === 0) {
      return html`<div class="empty">${this.localize("no_history")}</div>`;
    }

    return html`${this.revisions.map((revision) => this.renderEntry(revision))}`;
  }

  private renderEntry(revision: Revision) {
    const actor = this.actorOf(revision);
    const name = actor?.name ?? this.localize("someone");
    const canOpen = this.stillThere(revision) !== undefined;
    const facts = this.withSubject ? this.subjectOf(revision) : null;

    const body = html`
      <div
        class="avatar"
        style=${`background:${actor?.color ?? colorFor(revision.actor_user_id ?? revision.id)}`}
      >
        ${initials(name)}
      </div>
      <div class="body">
        <div class="head">
          <span class="who">${name}</span>
          <!--
            When, whose, how much — stacked on the right, where the expense list
            keeps its figures too. An amount belongs at the edge a reader scans
            for one, and the name belongs beside it rather than in a sentence of
            its own: "Paid by Antonin" on its own line said one word of use and
            three of ceremony.
          -->
          <span class="stamp">
            <span class="when">${formatDayDate(revision.at, this.language)}</span>
            ${facts
              ? html`<span class="whose">${facts.whose}</span>
                  <span class="sum">${facts.money}</span>`
              : nothing}
          </span>
        </div>
        <div class="what">${this.headline(revision)}</div>
        ${this.renderChanges(revision)} ${this.renderRestore(revision)}
      </div>
      ${canOpen ? html`<span class="chevron">›</span>` : nothing}
    `;

    // A button only when there is somewhere to go: an entry that looks
    // clickable and does nothing is worse than a plain one.
    return canOpen
      ? html`<button class="entry entry-button" @click=${() => this.pick(revision)}>
          ${body}
        </button>`
      : html`<div class="entry">${body}</div>`;
  }

  private pick(revision: Revision) {
    this.dispatchEvent(
      new CustomEvent("revision-picked", {
        detail: { entityType: revision.entity_type, entityId: revision.entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Bring back what this line took away.
   *
   * Offered on a deletion, and only while the thing is still gone.
   */
  private renderRestore(revision: Revision) {
    // Only what can be brought back. A member who left and a deleted category
    // are absent from the lists too, and would look restorable on that alone.
    // They are not: a member comes back by being ticked again, a category by
    // being made again, and neither is undone from a journal.
    if (revision.entity_type !== "expense" && revision.entity_type !== "payment") {
      return nothing;
    }

    if (revision.action !== "deleted" || !this.restorable) {
      return nothing;
    }

    // Already back: nothing left to undo, and a button answering "it is
    // already there" is not worth pressing.
    if (this.stillThere(revision) !== undefined) {
      return nothing;
    }

    return html`
      <button class="link restore" @click=${() => this.restore(revision)}>
        ${this.localize("restore_entry")}
      </button>
    `;
  }

  private restore(revision: Revision) {
    this.dispatchEvent(
      new CustomEvent("revision-restored", {
        detail: { entityType: revision.entity_type, entityId: revision.entity_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The expense or payment an entry is about, while the group still holds it. */
  private stillThere(revision: Revision): Expense | Payment | undefined {
    if (revision.entity_type === "expense") {
      return this.expenses.find((expense) => expense.id === revision.entity_id);
    }

    if (revision.entity_type === "payment") {
      return this.payments.find((payment) => payment.id === revision.entity_id);
    }

    return undefined;
  }

  /**
   * What the entry is about: the money, and whose it is.
   *
   * A revision carries what moved, and nothing else. So an entry that changed a
   * date says "changed the expense" and then "Date, the 3rd → the 4th", and
   * whoever reads it a month later has no idea which 40 euros that was. The
   * amount and the person are what tell one shop from another.
   *
   * Read off the expense as it stands, not as it stood: this is here to point
   * at a thing, not to describe a past. The line above already says what moved.
   * A deleted one has no "as it stands", so the deletion is asked instead — the
   * only place it is still written down, and it froze exactly this.
   *
   * Null inside one expense's own history, like the title beside it: you got
   * there from the expense, and telling you which expense it is is telling you
   * what you just pressed.
   */
  private subjectOf(revision: Revision): { money: string; whose: string } | null {
    const live = this.stillThere(revision);

    if (live) {
      return {
        money: formatMoney(live.amount, live.currency, this.language),
        whose: this.whoseOf(live),
      };
    }

    return this.subjectFromDeletion(revision);
  }

  /**
   * Who the money is about: the payer, or both parties to a payment.
   *
   * The name and nothing else. It sits between a date and an amount, where
   * every line is one fact, and "Paid by" would be the only ceremony in the
   * column — a name next to a figure is already read as whose figure it is.
   */
  private whoseOf(entry: Expense | Payment): string {
    if ("paid_by_member_id" in entry) {
      return this.nameOf(entry.paid_by_member_id);
    }

    return `${this.nameOf(entry.from_member_id)} → ${this.nameOf(entry.to_member_id)}`;
  }

  /**
   * The same facts, for something the group no longer holds.
   *
   * Its own deletion froze them, and this list has it: every revision of the
   * group is here, so the deletion of the thing this entry is about is a few
   * rows down. An entry from before there were snapshots may be missing the
   * amount, in which case there is nothing honest to show and nothing is shown.
   */
  private subjectFromDeletion(
    revision: Revision,
  ): { money: string; whose: string } | null {
    if (revision.entity_type !== "expense" && revision.entity_type !== "payment") {
      return null;
    }

    const deletion = this.revisions.find(
      (candidate) =>
        candidate.entity_id === revision.entity_id && candidate.action === "deleted",
    );

    if (!deletion) {
      return null;
    }

    const frozen = new Map(deletion.changes.map((change) => [change.field, change.before]));
    const amount = frozen.get("amount");

    if (typeof amount !== "number") {
      return null;
    }

    const currency = String(frozen.get("currency") ?? this.currency);
    const payer = frozen.get("paid_by_member_id");

    const whose =
      typeof payer === "string"
        ? this.nameOf(payer)
        : `${this.nameOf(String(frozen.get("from_member_id")))} → ${this.nameOf(
            String(frozen.get("to_member_id")),
          )}`;

    return { money: formatMoney(amount, currency, this.language), whose };
  }

  /** What a member goes by, or "?" rather than a ULID leaking into a column. */
  private nameOf(memberId: string): string {
    const found = this.members.find((member) => member.id === memberId);

    return found ? firstName(found.name) : "?";
  }

  /**
   * What happened, in one line.
   *
   * Reads as a sentence rather than a code: "modified the expense", and in the
   * group journal, which one.
   */
  private headline(revision: Revision): string {
    const translate = this.localize;

    // Named per kind rather than "expense or else payment", which is what this
    // was until the journal grew to hold the project itself, its categories and
    // its people — and which read "the reimbursement" for every one of them.
    const what = translate(SUBJECTS[revision.entity_type]);

    const verb = translate(`history_${revision.action}`);
    const subject = this.withSubject && revision.entity_label ? ` "${revision.entity_label}"` : "";

    return `${verb} ${what}${subject}`;
  }

  /**
   * The changes, dropping the ones this version cannot say.
   *
   * Only what moved gets spelled out. A creation lists everything it was born
   * with, which on the group journal would drown out the changes that actually
   * mean something; a deletion takes every field there is, so naming them one
   * by one says only what "deleted" already said; and a restore is a deletion
   * read backwards. What a thing holds can be read on the thing itself — and
   * for a deletion, on the restore that brings it back.
   */
  private renderChanges(revision: Revision) {
    if (revision.action !== "updated") {
      return nothing;
    }

    const context: HistoryContext = {
      localize: this.localize,
      members: this.members,
      categories: this.categories,
      currency: this.currency,
      language: this.language,
    };

    const readable = revision.changes
      .map((change) => readChange(change, context))
      .filter((change) => change !== null);

    return html`
      ${readable.map(
        (change) => html`
          <div class="change">
            <span class="field">${change.label}</span>
            ${change.before === null
              ? nothing
              : html`<span class="before">${change.before}</span>
                  <span class="arrow">→</span>`}
            ${change.after === null
              ? html`<span class="after">—</span>`
              : html`<span class="after">${change.after}</span>`}
          </div>
        `,
      )}
    `;
  }

  /** The member behind the account that made the change, if we can place them. */
  private actorOf(revision: Revision): Member | undefined {
    if (!revision.actor_user_id) {
      return undefined;
    }

    return this.members.find((member) => member.user_id === revision.actor_user_id);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-history": SeHistory;
  }
}
