/**
 * One expense as the group page lists it: the tile itself, for any host that
 * has to show an expense the way the list does.
 *
 * A plain function and a block of CSS, as `renderExpenseRow` is. That one is
 * the row cut down to what a dialog's picker can carry; this is the list's
 * own, every part of it, because a host showing it is asking about the very
 * expense somebody scrolled past — the check's "is this right?" — and the
 * answer starts with recognising it.
 *
 * The frame is the list's too: a button with the payer's colour down its side
 * when it may be opened, the same line without the press when it may not.
 * The page's payments share that frame, which is why the styles below hold
 * more than an expense needs.
 */

import { css, html, nothing } from "lit";

import "./se-icon";
import { renderAvatar } from "./avatar";
import { colorFor, colorOf, formatDayDate, formatMoney } from "../services/format";
import type { Localizer } from "../services/localize";
import type { Category, Expense, Member, Payment } from "../types";

/** What the tile needs to name the people and the marks it draws. */
export interface ExpenseTileContext {
  /** Members including those who left: one may still be down as paying. */
  members: Member[];
  categories: Category[];
  language: string;
  localize: Localizer;
  /** The group's currency: a figure in another one also says what it weighs in it. */
  currency: string;
  /** Which member is reading, if any: a payment is written from where they stand. */
  me?: string | null;
}

/**
 * A row of the list; `dated` false under a heading that already says the day.
 *
 * `before` is the same expense as it stood before a change, for the journal:
 * each part that moved then shows what it was, struck through, beside what it
 * became. The list never passes one, and draws exactly what it drew.
 */
export function renderExpenseTile(
  expense: Expense,
  context: ExpenseTileContext,
  editable: boolean,
  open: () => void,
  dated = true,
  before?: Expense,
) {
  const payer = context.members.find((member) => member.id === expense.paid_by_member_id);
  const category = context.categories.find((c) => c.id === expense.category_id);
  const moved = (field: keyof Expense) => before !== undefined && before[field] !== expense[field];
  const categoryName = (id: string | null) =>
    context.categories.find((c) => c.id === id)?.name ?? context.localize("no_category");
  const day = (value: string) => formatDayDate(value, context.language, "UTC");

  // Money a shop gave back. It is the one row here whose figure carries a
  // minus, and the avatar on the left is who received it rather than who paid.
  const refund = expense.amount < 0;
  const name = payer?.name ?? "?";

  return html`
    <button
      class=${`item ${editable ? "item-button" : "item-fixed"}`}
      style=${`border-left-color:${payer?.color ?? colorFor(expense.paid_by_member_id)}`}
      ?disabled=${!editable}
      @click=${open}
    >
      <span class="face">
        ${renderAvatar(
          payer,
          name,
          expense.paid_by_member_id,
          "",
          `${context.localize(refund ? "refunded_to" : "paid_by")} ${name}`,
        )}
        <!--
          What it was, on the corner of who paid for it, exactly as the journal
          marks the face that wrote a line. The category was a word in grey
          under the title and nothing else, so telling the bread from the
          weekly shopping meant reading every row — while the icon and colour
          it was given when it was created were only ever seen in the dialog
          where they were chosen.

          Hidden from screen readers: the name is still written underneath, in
          the reader's own language, and hearing it twice is not hearing it
          better.

          A glyph nearly filling the badge, as the journal's does. The default
          ratio is measured for a 34px pill and would leave a mark this small
          with a glyph too faint to tell a loaf from a barcode.
        -->
        ${category
          ? html`<se-icon
              class="pip"
              aria-hidden="true"
              .icon=${category.icon}
              .fallback=${category.name.charAt(0).toUpperCase()}
              .color=${colorOf(category, context.categories)}
              .size=${18}
              .glyph=${0.82}
            ></se-icon>`
          : nothing}
      </span>
      <div class="info">
        <div class="title">
          ${moved("title")
            ? html`<span class="was">${before!.title}</span><span class="now">${expense.title}</span>`
            : expense.title}
          <!--
            An occurrence of something that comes back: the rent, the
            subscription. Said by a mark rather than a word, the way the corner
            of the avatar says the category, and kept when the recurring
            expense has since been stopped — this one did come back.
          -->
          ${expense.recurring_id
            ? html`<span
                class="repeat"
                role="img"
                aria-label=${context.localize("repeats")}
                title=${context.localize("repeats")}
                ><se-icon plain .icon=${"mdi:repeat"} fallback="↻" .size=${15}></se-icon
              ></span>`
            : nothing}
        </div>
        <!--
          On its own line, under the shop. Beside the title it wrapped
          wherever the width ran out — "Two / tickets" — and moved under the
          title whole when the title was long, so one fact sat in two places.
        -->
        ${moved("description")
          ? html`<div class="note">
              ${before!.description ? html`<span class="was">${before!.description}</span>` : nothing}
              <span class="now">${expense.description ?? "—"}</span>
            </div>`
          : expense.description
            ? html`<div class="note">${expense.description}</div>`
            : nothing}
        <!--
          Nothing where there is no category. "No category" is a fact about
          the form, not about the shop: it named an absence, on every row that
          had one, and said nothing anybody needed.
        -->
        ${moved("category_id")
          ? html`<div class="muted">
              ${strike(categoryName(before!.category_id), categoryName(expense.category_id))}
            </div>`
          : category
            ? html`<div class="muted">${category.name}</div>`
            : nothing}
        ${moved("expense_date") && day(before!.expense_date) !== day(expense.expense_date)
          ? html`<div class="muted">
              ${strike(day(before!.expense_date), day(expense.expense_date))}
            </div>`
          : dated
            ? html`<div class="muted">
                ${formatDayDate(expense.expense_date, context.language, "UTC")}
              </div>`
            : nothing}
      </div>
      <div class="tail">
        <!--
          Money that left the group, or came back to it. Red on a purchase and
          green on a refund, for whoever is reading: this row is not a movement
          between two of you and so it has no side to be on. A reimbursement is
          the other case and takes its colour from the reader, which is what
          toneFor is for.

          So the two colours answer two different questions in the same list,
          and that is the point rather than an inconsistency: crossing the
          group's edge is a direction, moving inside it is a position.
        -->
        <span class="amount ${refund ? "positive" : "negative"}">
          <!--
            Without its minus. Only a refund is ever negative here, so the sign
            carried nothing the green was not already saying, and said it in the
            one place a figure is read for its size. Math.abs rather than a
            branch: a purchase is never negative, so there is nothing for it to
            do on one.
          -->
          ${moved("amount") || moved("currency")
            ? html`<span class="was"
                >${formatMoney(Math.abs(before!.amount), before!.currency, context.language)}</span
              >`
            : nothing}
          ${formatMoney(Math.abs(expense.amount), expense.currency, context.language)}
        </span>
        <!--
          What it weighs in the group, under what was handed over at the till.
          Both, because both are true and neither answers the other: 100 USD
          is what was paid, 87,68 EUR is what it costs whoever shares it.
        -->
        ${expense.currency === context.currency
          ? nothing
          : html`<span class="converted">
              ${formatMoney(
                Math.abs(expense.converted_amount),
                context.currency,
                context.language,
              )}
            </span>`}
        ${renderParticipants(expense, context, before)}
      </div>
    </button>
  `;
}

/**
 * A part that moved, read on one line: what it was, struck through, and what
 * it became in the accent colour. For the short ones, a category or a day;
 * a title or a figure takes a line of its own above, where it is read.
 */
function strike(was: string, now: string) {
  return html`<s>${was}</s> → <span class="now">${now}</span>`;
}

/**
 * A payment, said the way its kind reads, and from where you stand.
 *
 * The two kinds are one movement of money and differ only in words, so the
 * words are the whole job here: a debt shown as "Dupont → Michel" reads as
 * Dupont having paid, which is true of a loan and nonsense for a debt
 * somebody is only writing down.
 *
 * Which is why the names swap round by kind. The arrow always points at
 * whoever ends up with the money — a reimbursement has sent it, a debt owes
 * it — and on a debt the one who will pay is the one who owes, which is the
 * member on the receiving end of the stored payment.
 */
export function renderPaymentTile(
  payment: Payment,
  context: ExpenseTileContext,
  editable: boolean,
  open: () => void,
  dated = true,
  before?: Payment,
) {
  const debt = payment.kind === "debt";
  const moved = (field: keyof Payment) => before !== undefined && before[field] !== payment[field];
  const day = (value: string) => formatDayDate(value, context.language, "UTC");

  // Whose money leaves, and whose it becomes. The line reads payer → taker
  // whatever the kind; only which stored member is which changes.
  const payerId = debt ? payment.to_member_id : payment.from_member_id;
  const takerId = debt ? payment.from_member_id : payment.to_member_id;

  // The line is the payer's: on a reimbursement the one whose money left, on
  // a debt the one who owes it — a debt is somebody's, and it is theirs, not
  // the lender's.
  const payer = memberOf(payerId, context);
  const colour = payer?.color ?? colorFor(payerId);

  // The other end. A payment has exactly one, which is what makes it a
  // payment and not an expense.
  const taker = memberOf(takerId, context);
  const note = (entry: Payment) =>
    entry.description || context.localize(entry.kind === "debt" ? "a_debt" : "a_settlement");

  return html`
    <button
      class=${`item ${editable ? "item-button" : "item-fixed"}`}
      style=${`border-left-color:${colour}`}
      ?disabled=${!editable}
      @click=${open}
    >
      <span class="face">
        <!--
          Whose line it is, wearing the same face the expenses above and below
          it show. This was the kind's own icon at 36px and nothing else, so
          the one list where money moves between two people was the one list
          neither of them had a face in.
        -->
        ${renderAvatar(payer, payer?.name ?? "?", payerId, "", payer?.name ?? "?")}
        <!--
          Reimbursement or debt on the corner, exactly as an expense wears its
          category. It keeps the payer's colour, which the avatar behind it
          carries as well: the ring is what holds the two apart, and holding a
          mark apart from an avatar of its own colour is the whole reason that
          ring exists. Which of the two it is, the glyph says — a hand holding
          a coin for money still owed, two arrows for money that moved.

          Hidden from screen readers: the line underneath already says
          "Reimbursement" or "Debt" in the reader's own language.
        -->
        <se-icon
          class="pip"
          aria-hidden="true"
          .icon=${debt ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
          .fallback=${debt ? "→" : "⇄"}
          .color=${colour}
          .size=${18}
          .glyph=${0.82}
        ></se-icon>
      </span>
      <div class="info">
        <div class="title">
          ${nameFrom(context, payerId)} → ${nameFrom(context, takerId)}
        </div>
        <!--
          Where an expense shows its category: same grid, same reading. What
          somebody wrote about it wins the line — "Dette" is already said by
          the icon and the colour, and a note is only ever there because it
          said something they were not.
        -->
        <div class="muted">
          ${before && note(before) !== note(payment) ? strike(note(before), note(payment)) : note(payment)}
        </div>
        ${moved("payment_date") && day(before!.payment_date) !== day(payment.payment_date)
          ? html`<div class="muted">
              ${strike(day(before!.payment_date), day(payment.payment_date))}
            </div>`
          : dated
            ? html`<div class="muted">
                ${formatDayDate(payment.payment_date, context.language, "UTC")}
              </div>`
            : nothing}
      </div>
      <div class="tail">
        <span class="amount ${toneFor(context, payerId, takerId)}">
          ${moved("amount") || moved("currency")
            ? html`<span class="was"
                >${formatMoney(before!.amount, before!.currency, context.language)}</span
              >`
            : nothing}
          ${formatMoney(payment.amount, payment.currency, context.language)}
        </span>
        <!-- What it weighs in the group, exactly as on an expense. -->
        ${payment.currency === context.currency
          ? nothing
          : html`<span class="converted">
              ${formatMoney(
                payment.converted_amount,
                context.currency,
                context.language,
              )}
            </span>`}
        <!--
          Who it reaches, where an expense keeps the people who share it. The
          same stack and the same 26px, holding one face rather than several:
          a payment has one other end, and putting it anywhere else on the row
          would have been a fourth column for a list that reads in three.
        -->
        <div class="stack-avatars">
          ${renderAvatar(taker, taker?.name ?? "?", takerId, "small")}
        </div>
      </div>
    </button>
  `;
}

/**
 * A member's name, or "you" when it is yours.
 *
 * The balance card has always been written from where you stand — "on te
 * doit", not "Stéphane doit recevoir". The list underneath it was not, so the
 * same fact was told twice in two voices, and finding yourself in a row meant
 * spotting your own name among the others first.
 */
function nameFrom(context: ExpenseTileContext, id: string): string {
  if (id === context.me) {
    return context.localize("you");
  }

  return memberOf(id, context)?.name ?? "?";
}

/**
 * What a movement of money does to you, in one colour.
 *
 * Green when it comes your way, red when it leaves you — the reading the
 * balance card already trained. Kind has nothing to do with it: a debt owed
 * to you is money coming, and every debt used to be red on the grounds that a
 * debt is a bad thing, which is only true of the ones you owe.
 *
 * Neither, when the line is not about you: two other people settling up is a
 * fact, not good news or bad. Same when no member is you at all — an admin
 * looking in, a tablet in the kitchen. There is no point of view to take.
 */
function toneFor(context: ExpenseTileContext, payerId: string, takerId: string): string {
  const me = context.me;

  if (me === takerId) {
    return "positive";
  }

  return me === payerId ? "negative" : "neutral";
}

/** A member of the group, or of its past. */
function memberOf(id: string, context: ExpenseTileContext): Member | undefined {
  return context.members.find((member) => member.id === id);
}

/**
 * The members actually sharing the expense, stacked like on a receipt.
 *
 * Against `before`, the faces of both: one who stopped sharing stays in the
 * stack, faded, where they stood, and one who started is ringed. A face simply
 * missing from the second of two stacks is the one difference the eye does not
 * find.
 */
function renderParticipants(expense: Expense, context: ExpenseTileContext, before?: Expense) {
  const sharing = (entry: Expense) =>
    (entry.shares ?? []).filter((share) => share.amount !== 0).map((share) => share.member_id);
  const now = sharing(expense);
  const then = before ? sharing(before) : now;
  const ids = [...then, ...now.filter((id) => !then.includes(id))];

  if (ids.length === 0) {
    return nothing;
  }

  return html`
    <div class="stack-avatars">
      ${ids.map((id) => {
        const member = context.members.find((item) => item.id === id);
        const mark = !now.includes(id) ? " out" : !then.includes(id) ? " in" : "";

        return renderAvatar(member, member?.name ?? "?", id, `small${mark}`);
      })}
    </div>
  `;
}

/**
 * The tile's frame and parts, for a host to include after `sharedStyles`
 * (the avatar, the figure's colours and the grey lines are there).
 */
export const expenseTileStyles = css`
  /*
   * A row, with whose money left drawn down its side.
   *
   * The avatar already carries the colour, but it is a 36px circle among
   * others: the list reads as a run of rows, not as a run of people. A rule
   * the height of the row groups them at a glance, without adding a word to
   * a line that has three already.
   *
   * The colour is never the only thing saying it — the avatar and its
   * tooltip stay, which matters to anyone who reads colour poorly.
   */
  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px 14px 12px;
    border-left: 4px solid transparent;
  }

  .item + .item {
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .item .info {
    flex: 1;
    min-width: 0;
  }

  .item .title {
    font-size: 15px;
    font-weight: 500;
  }

  .converted {
    display: block;
    font-size: 12px;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }

  /*
   * A row you can press. Only the button's own borders go: a blanket
   * "border: none" would take the payer's colour with them, .item carrying
   * it as a border and this rule coming after.
   */
  .item-button {
    border-top: none;
    border-right: none;
    border-bottom: none;
    background: none;
    color: inherit;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
  }

  .item-button:hover {
    background: var(--secondary-background-color, #f6f6f6);
  }

  /*
   * A row you may read but not rewrite: somebody else's, in a project that
   * does not let its members touch what is not theirs.
   *
   * Never greyed out. The line is true, it is somebody's money and it is
   * worth reading — it is simply not yours to change. Dimming it would say
   * it mattered less, which is a different thing and a false one. Only the
   * pointer and the hover go, so nothing invites a press that would do
   * nothing.
   */
  .item-fixed {
    border-top: none;
    border-right: none;
    border-bottom: none;
    background: none;
    color: inherit;
    opacity: 1;
    width: 100%;
    text-align: left;
    font-family: inherit;
    cursor: default;
  }

  .note {
    font-size: 12px;
    font-weight: 400;
    color: var(--secondary-text-color);
    overflow-wrap: anywhere;
  }

  .tail {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  /* Holds the face and its mark together, so the pair scrolls as one. */
  .face {
    position: relative;
    flex: 0 0 auto;
    line-height: 0;
  }

  /*
   * The category on the corner of the face rather than in a column of its
   * own — the journal's arrangement, see se-history. Who paid and what for
   * are one glance, and a third circle in the row would have been paid for
   * by the width of the title.
   *
   * It also settles the row with no category: nothing is drawn and nothing
   * has to be held open for it, where a column would have needed a blank
   * kept in it to stop the titles going ragged.
   *
   * The ring is the card's own background and not a colour: it is what keeps
   * an orange mark on an orange avatar from reading as one shape.
   */
  .face .pip {
    position: absolute;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
  }

  .stack-avatars {
    display: flex;
  }

  /* Inline-flex, not inline: se-icon is a block, and a block inside an
     inline span breaks the line — the mark fell under the title. */
  .repeat {
    display: inline-flex;
    color: var(--secondary-text-color);
    margin-left: 4px;
    vertical-align: middle;
  }

  .stack-avatars .avatar.small {
    width: 26px;
    height: 26px;
    font-size: 10px;
    border: 2px solid var(--card-background-color, #fff);
  }

  .stack-avatars .avatar.small + .avatar.small {
    margin-left: -8px;
  }

  /*
   * The journal's reading of a change, on the tile as it now stands. What a
   * part was sits struck through above it, in grey and smaller, so the eye
   * lands on what it became; the new value takes the accent, the one colour
   * this panel keeps for "this is the one".
   */
  .was {
    display: block;
    font-size: 12px;
    font-weight: 400;
    color: var(--secondary-text-color);
    text-decoration: line-through;
  }

  .now {
    color: var(--primary-color, #03a9f4);
  }

  .stack-avatars .avatar.small.out {
    opacity: 0.3;
  }

  .stack-avatars .avatar.small.in {
    box-shadow: 0 0 0 2px var(--primary-color, #03a9f4);
  }
`;
