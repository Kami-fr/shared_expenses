import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./se-icon";
import { renderAvatar } from "./avatar";
import { firstName, formatDayDate, formatMoney } from "../services/format";
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
 * What happened, as a mark rather than a word.
 *
 * The line underneath already says it in the reader's language, so this is not
 * here to be read: it is here so that forty lines can be searched with the eye
 * instead of one at a time. Three meanings and three colours — it appeared, it
 * changed, it went away — because a legend of four would need looking up, which
 * is the opposite of the point.
 *
 * A restore is a deletion undone, so it wears the colour of a thing that is
 * there and the glyph of a thing that came back.
 *
 * The fallback is not decoration: `se-icon` draws it when Home Assistant has
 * not registered `ha-icon`, and a badge showing "?" would be worse than none.
 */
const ACTIONS: Record<
  Revision["action"],
  { icon: string; color: string; fallback: string }
> = {
  created: { icon: "mdi:plus", color: "var(--se-positive)", fallback: "+" },
  updated: { icon: "mdi:pencil", color: "var(--primary-color, #03a9f4)", fallback: "~" },
  deleted: { icon: "mdi:trash-can-outline", color: "var(--se-negative)", fallback: "×" },
  restored: { icon: "mdi:restore", color: "var(--se-positive)", fallback: "↺" },
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

  /**
   * What the entries here were paid in, when the list is one thing's own.
   *
   * `currency` above is the group's: what the shares and the default split are
   * counted in. An amount is what was handed over, in whatever it was handed
   * over — not always the same. The group journal reads that off the expense
   * itself, since it holds them all; one expense's own history holds nothing
   * but its revisions, so it is told.
   */
  @property({ type: String }) public paidIn = "";

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
   * Which of them this reader may open, by id. Left out, nothing is clickable.
   *
   * Still being there is not enough: somebody else's expense, in a project that
   * does not let its members touch what is not theirs, is a row the list below
   * refuses to open — and the journal is not a way round it. Whose rule that is
   * stays with the page, which knows the group's permissions and your role.
   */
  @property({ attribute: false }) public openable: string[] = [];

  /**
   * Which deleted entries this reader may bring back, by id.
   *
   * Empty inside one expense's own history: you got there from the expense, so
   * it exists, so nothing on that page was ever deleted. Filled in the group
   * journal, which is the only place a deleted expense can still be seen at
   * all — and filled with what this reader may undo rather than with all of it,
   * since the backend asks of a restore exactly what it asks of an edit. Whose
   * rule that is stays with whoever holds the deletions, like `openable`.
   */
  @property({ attribute: false }) public restorable: string[] = [];

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

      /* Holds the face and the mark together, so the pair scrolls as one. */
      .actor {
        position: relative;
        flex: 0 0 auto;
        line-height: 0;
      }

      /*
        Sitting on the corner of the face rather than in a column of its own:
        who did it and what they did are one glance, and a third column on a
        phone would have been paid for by the words.

        The ring is the list's own background, not a colour: it is what keeps a
        red mark on a red avatar from reading as one shape.
      */
      .pip {
        position: absolute;
        right: -6px;
        bottom: -6px;
        border-radius: 50%;
        border: 2px solid var(--card-background-color, #fff);
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
    const canOpen =
      this.stillThere(revision) !== undefined &&
      this.openable.includes(revision.entity_id);
    const facts = this.withSubject ? this.subjectOf(revision) : null;

    const mark = ACTIONS[revision.action];

    const body = html`
      <span class="actor">
        <!--
          The same face the rest of the panel shows: their Home Assistant photo
          where they have one, their coloured initials otherwise. This drew the
          initials and only the initials, so the one list where knowing who did
          something matters most was the one list nobody was recognisable in.

          Seeded on the account rather than the member, since a change can
          outlive whoever made it: the revision keeps the account, and a colour
          has to come from somewhere even when the member is gone.
        -->
        ${renderAvatar(actor, name, revision.actor_user_id ?? revision.id)}
        <!--
          Hidden from a screen reader on purpose: the sentence below says the
          same thing in words, and hearing it twice is not being told it better.
        -->
        <se-icon
          class="pip"
          aria-hidden="true"
          .icon=${mark.icon}
          .color=${mark.color}
          .fallback=${mark.fallback}
          .size=${15}
          .glyph=${0.82}
        ></se-icon>
      </span>
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
   * Offered on a deletion, only while the thing is still gone, and only to
   * somebody the backend would let do it.
   */
  private renderRestore(revision: Revision) {
    // Only what can be brought back. A member who left and a deleted category
    // are absent from the lists too, and would look restorable on that alone.
    // They are not: a member comes back by being ticked again, a category by
    // being made again, and neither is undone from a journal.
    if (revision.entity_type !== "expense" && revision.entity_type !== "payment") {
      return nothing;
    }

    if (
      revision.action !== "deleted" ||
      !this.restorable.includes(revision.entity_id)
    ) {
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
   * Its own deletion froze them, and this list has it. An entry from before
   * there were snapshots may be missing the amount, in which case there is
   * nothing honest to show and nothing is shown.
   */
  private subjectFromDeletion(
    revision: Revision,
  ): { money: string; whose: string } | null {
    const frozen = this.frozenOf(revision);

    if (!frozen) {
      return null;
    }

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

  /**
   * What the deletion of this entry's thing froze, field by field.
   *
   * The only place a thing the group no longer holds is still written down, and
   * this list has it: every revision of the group is here, so the deletion of
   * whatever an entry is about is a few rows down. Newest first, so the first
   * one found is the last one — a thing brought back and deleted again froze
   * itself twice, and only the later state is the one that is gone now.
   *
   * Null when nothing here can be frozen that way: an entry about the project,
   * a category or a member, or a thing that was never deleted.
   */
  private frozenOf(revision: Revision): Map<string, unknown> | null {
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

    return new Map(deletion.changes.map((change) => [change.field, change.before]));
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
      amountCurrency: this.amountCurrencyOf(revision),
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

  /**
   * What an amount on this entry is counted in, on each side of the arrow.
   *
   * The group's currency is what the shares and the balances are in; the amount
   * is what was handed over, in whatever was handed over. Asked of the expense
   * itself, the way the stamp on the right of the same row is — a line reading
   * "50,00 € → 60,00 €" beside a stamp reading "$60.00" is the same figure in
   * two currencies, and the euro one was never owed. Where the list does not
   * hold the thing to ask, `paidIn` was told it.
   *
   * When the revision moved the currency too, it froze both, and each side is
   * read in its own. What is gone is asked of its own deletion, exactly as the
   * stamp is — anything else states one currency in the line and another two
   * centimetres to its right, on the same row, about the same figure.
   *
   * A deletion froze the currency as it stood at the end, so an update older
   * than a later currency move still reads in the final one. Strictly it is the
   * `before` of that move that this wants; it is a change of a change of a
   * currency, and the deletion is right in every other case.
   */
  private amountCurrencyOf(revision: Revision): { before: string; after: string } {
    const moved = revision.changes.find((change) => change.field === "currency");
    const frozen = this.frozenOf(revision)?.get("currency");
    const own =
      this.stillThere(revision)?.currency ||
      (typeof frozen === "string" ? frozen : "") ||
      this.paidIn ||
      this.currency;

    return {
      before: typeof moved?.before === "string" ? moved.before : own,
      after: typeof moved?.after === "string" ? moved.after : own,
    };
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
