/**
 * One expense drawn as the group page draws it, at the size a dialog can carry.
 *
 * A plain function and a block of CSS rather than an element, exactly as
 * `renderAvatar` is: rendered inline, it inherits each host's own frame — a
 * button in the picker, a line in a folded section — and the row itself stays
 * the same row wherever it is read.
 *
 * That sameness is the whole point of it existing once. A purchase is
 * recognised by the face that paid it and the mark of what it was, and a reader
 * who has just scrolled past it on the group page must not have to take it in
 * twice. The order it reads in, the note's size, the day underneath: all of it
 * is the page's, copied down to the numbers.
 */

import { html, nothing, type TemplateResult } from "lit";
import { css } from "lit";

import "./se-icon";
import { renderAvatar } from "./avatar";
import { colorOf, formatDayDate, formatMoney } from "../services/format";
import type { Category, Expense, Member } from "../types";

/** What the row needs to name the people and the marks it draws. */
export interface ExpenseRowContext {
  members: Member[];
  categories: Category[];
  language: string;
}

export function renderExpenseRow(
  expense: Expense,
  context: ExpenseRowContext,
): TemplateResult {
  const payer = context.members.find(
    (member) => member.id === expense.paid_by_member_id,
  );
  const category = context.categories.find((item) => item.id === expense.category_id);

  return html`
    <span class="face">
      ${renderAvatar(payer, payer?.name ?? "?", expense.paid_by_member_id)}
      ${category
        ? html`<se-icon
            class="pip"
            aria-hidden="true"
            .icon=${category.icon}
            .fallback=${category.name.charAt(0).toUpperCase()}
            .color=${colorOf(category, context.categories)}
            .size=${14}
            .glyph=${0.82}
          ></se-icon>`
        : nothing}
    </span>
    <!--
      The shop, then what was written about it, then the day — the group page's
      own order, and kept deliberately. A row that reordered the same facts
      would make somebody read it twice: once to find it, once to be sure it is
      the one they just scrolled past.

      The description is here because the group page shows it too, and because
      two visits to the same shop in one week are told apart by nothing else.
    -->
    <span class="info">
      <span class="what">
        ${expense.title}
        ${expense.description
          ? html`<span class="note">${expense.description}</span>`
          : nothing}
      </span>
      <span class="when">${formatDayDate(expense.expense_date, context.language)}</span>
    </span>
    <!--
      The size, never the sign. A refund's minus is dropped here as it is on the
      group page: these rows are read in a place that has already said which way
      the money went — a picker offering purchases, a section headed "refunds" —
      so a minus would be the one thing on the row saying nothing new, in the
      one place a figure is read for how big it is.
    -->
    <span class="figure">
      ${formatMoney(Math.abs(expense.amount), expense.currency, context.language)}
    </span>
  `;
}

/**
 * The row's own geometry and parts, for a host to include.
 *
 * The frame around it is the host's: the picker draws a button with a colour
 * down its side, the expense dialog a plain line. What a reader recognises the
 * row by is here.
 */
export const expenseRowStyles = css`
  .expense-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    text-align: left;
  }

  /* The pair the group page draws: a face, with what it was on its corner. */
  .expense-row .face {
    position: relative;
    flex: 0 0 auto;
    line-height: 0;
  }

  .expense-row .avatar {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .expense-row .pip {
    position: absolute;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color, #fff);
  }

  /* Two lines, so the shop and the day never fight for the same one. */
  .expense-row .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* What it was, carrying the line, exactly as on the group page. */
  .expense-row .what {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .expense-row .when {
    font-size: 12px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /*
   * What somebody wrote about it, in the group page's own note: smaller and
   * quieter than the shop it follows, so the two are told apart without either
   * being decorated. Copied down to the 6px, since a row that styled the same
   * fact differently would read as a different fact.
   */
  .expense-row .note {
    font-size: 12px;
    font-weight: 400;
    color: var(--secondary-text-color);
    margin-left: 6px;
  }

  .expense-row .figure {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
  }
`;
