import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { colorFor, formatDayDate, initials } from "../services/format";
import { readChange, type HistoryContext } from "../services/history";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Member, Revision } from "../types";

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
   * Ids that can still be opened.
   *
   * Left out, nothing is clickable. Given, an entry pointing at one of these
   * fires `revision-picked` — the caller knows what it still holds, which this
   * list cannot: a deleted expense has revisions and no longer exists.
   */
  @property({ attribute: false }) public openable?: Set<string>;

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

      .when {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-left: auto;
        white-space: nowrap;
      }

      .what {
        font-size: 13px;
        color: var(--secondary-text-color);
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
    const canOpen = this.openable?.has(revision.entity_id) ?? false;

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
          <span class="when">${formatDayDate(revision.at, this.language)}</span>
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
   * Offered on a deletion, and only while the thing is still gone: `openable`
   * says what the group still holds, so a deletion whose id is back in it has
   * already been restored and there is nothing left to undo. A button that
   * would answer "already there" is a button not worth pressing.
   *
   * Left out entirely without `openable` — the caller is then showing a list it
   * has no facts about, and offering to act on it would be a guess.
   */
  private renderRestore(revision: Revision) {
    if (revision.action !== "deleted" || !this.openable) {
      return nothing;
    }

    if (this.openable.has(revision.entity_id) || !this.restorable) {
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

  /**
   * What happened, in one line.
   *
   * Reads as a sentence rather than a code: "modified the expense", and in the
   * group journal, which one.
   */
  private headline(revision: Revision): string {
    const translate = this.localize;

    const what =
      revision.entity_type === "expense"
        ? translate("the_expense")
        : translate("the_payment");

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
