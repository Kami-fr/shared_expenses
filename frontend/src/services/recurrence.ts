/**
 * The rhythm of a recurring expense: when its occurrences fall, and in words.
 *
 * The dates are the backend's to decide and it sends the one that matters, the
 * next one waiting. This is only for what the panel says before there is a
 * recurring expense to ask — "next on the 1st of November" under the switch
 * that is about to set one up — so it counts exactly as `occurrence` does in
 * the model, and is checked against the same awkward months.
 */

import type { UpdateRecurringInput } from "./api";
import type { Key } from "./localize";
import type { RecurrenceUnit, Recurring, SplitRule } from "../types";

/**
 * The day occurrence `index` falls on, the anchor being 0. All `YYYY-MM-DD`.
 *
 * Counted from the anchor every time, never from the occurrence before: rent on
 * the 31st falls on the 30th in November and the 28th in February, and only
 * counting from the anchor lets March find the 31st again.
 */
export function occurrence(
  anchor: string,
  every: number,
  unit: RecurrenceUnit,
  index: number,
): string {
  const [year, month, day] = anchor.split("-").map(Number);

  if (unit === "month") {
    const months = month - 1 + index * every;
    const targetYear = year + Math.floor(months / 12);
    const targetMonth = (months % 12) + 1;
    // Day 0 of the month after is the last day of this one.
    const last = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();

    return isoDay(new Date(Date.UTC(targetYear, targetMonth - 1, Math.min(day, last))));
  }

  const step = unit === "week" ? 7 * every : every;

  return isoDay(new Date(Date.UTC(year, month - 1, day + index * step)));
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "Every month", "Every 2 weeks": a rhythm, opening a line. */
export function rhythm(
  every: number,
  unit: RecurrenceUnit,
  translate: (key: Key) => string,
): string {
  if (every === 1) {
    return translate(`every_${unit}`);
  }

  return translate(`every_${unit}s`).replace("{n}", String(every));
}

/**
 * A day as a sentence carries it: "Fri, Oct 24", "ven. 24 oct.".
 *
 * No year when it is this year's, which is nearly always: the next date is
 * weeks away, and the year would be the widest part of a line that has a
 * phone's width to fit in. Any other year says so — an end set for December
 * next year, or rent waiting since last autumn, read without it as if close.
 * Read at noon UTC, the way the panel writes a day, so no time zone moves it.
 */
export function shortDay(day: string, language: string, now = new Date()): string {
  const date = new Date(`${day}T12:00:00Z`);

  return new Intl.DateTimeFormat(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(date.getUTCFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(date);
}

/** "Priya pays", or "You pay" when it is yours. */
export function whoPays(
  recurring: Recurring,
  name: string,
  meId: string | null,
  translate: (key: Key) => string,
): string {
  if (recurring.paid_by_member_id === meId) {
    return translate("recurring_you_pay");
  }

  return translate("recurring_pays").replace("{name}", name);
}

/**
 * Whether its figure moves from one time to the next.
 *
 * Read off what happened rather than asked when it was set up: the last one
 * confirmed differs from what it proposes. Rent never does, and is added in one
 * tap; the electricity does, and is checked first, against last time's figure.
 */
export function varies(recurring: Recurring): boolean {
  return recurring.latest_amount !== null && recurring.latest_amount !== recurring.amount;
}

/** What the dialog holds for a recurring expense, the split aside. */
export type RecurringFields = Required<Omit<UpdateRecurringInput, "split_rule">>;

/**
 * What saving a recurring expense sends: only what differs from it.
 *
 * Only that, because the rhythm is not idempotent: sent again as it stood,
 * "every month" would still re-anchor on the next date, and rent anchored on
 * the 31st and next due on the 30th of November would fall on the 30th for
 * ever after.
 *
 * The next date is compared with what the dialog opened on, which is the
 * anchor once it has ended and the backend sends none: compared with nothing,
 * the anchor would go out as a "new" next date and every occurrence since the
 * first would be waiting again.
 *
 * The split goes when it is the reader's own and differs, or as null when the
 * recurring expense had its own and the reader let the category's take over
 * again — picking another category does that, and the editor shows it.
 */
export function recurringChanges(
  recurring: Recurring,
  wanted: RecurringFields,
  split: { own: boolean; rule: SplitRule | null },
): UpdateRecurringInput {
  const stored: RecurringFields = {
    title: recurring.title,
    description: recurring.description,
    amount: recurring.amount,
    currency: recurring.currency,
    paid_by_member_id: recurring.paid_by_member_id,
    category_id: recurring.category_id,
    every: recurring.every,
    unit: recurring.unit,
    ends_on: recurring.ends_on,
    paused: recurring.paused,
    next_due: recurring.next_due ?? recurring.anchor,
  };

  const changes: UpdateRecurringInput = Object.fromEntries(
    Object.entries(wanted).filter(
      ([key, value]) => value !== stored[key as keyof RecurringFields],
    ),
  );

  if (split.own) {
    if (JSON.stringify(split.rule) !== JSON.stringify(recurring.split_rule)) {
      changes.split_rule = split.rule;
    }
  } else if (recurring.split_rule !== null) {
    changes.split_rule = null;
  }

  return changes;
}
