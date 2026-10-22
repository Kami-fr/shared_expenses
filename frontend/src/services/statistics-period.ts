/**
 * Which stretch of time the statistics are read over, and how to move through it.
 *
 * Months are `YYYY-MM` strings throughout, the keys the backend writes them in,
 * and compared as strings: in that shape alphabetical order is time order, so
 * there is no date to build and no time zone to get wrong on the way.
 *
 * Pure on purpose: what a period covers, where it steps to and what it is
 * compared with are the questions most likely to be subtly wrong, and they are
 * checked by `frontend/tests/statistics-period.test.ts` without a browser.
 */

import type { MonthTotal } from "../types";

export type Period =
  | { kind: "month"; month: string }
  | { kind: "year"; year: number }
  | { kind: "all" };

/** How many months the trend shows at most: a year, which fits a phone. */
export const TREND_MONTHS = 12;

/** The month `delta` months after this one, across years either way. */
export function addMonths(month: string, delta: number): string {
  const [year, index] = month.split("-").map(Number);
  const count = year * 12 + (index - 1) + delta;
  const newYear = Math.floor(count / 12);

  return `${String(newYear).padStart(4, "0")}-${String(count - newYear * 12 + 1).padStart(2, "0")}`;
}

/** How many months from `first` to `last`, both counted. */
export function monthsBetween(first: string, last: string): number {
  const [firstYear, firstIndex] = first.split("-").map(Number);
  const [lastYear, lastIndex] = last.split("-").map(Number);

  return (lastYear - firstYear) * 12 + (lastIndex - firstIndex) + 1;
}

/** What a month cost, and nothing for a month nobody spent in. */
export function totalOf(months: readonly MonthTotal[], month: string): number {
  return months.find((item) => item.month === month)?.total ?? 0;
}

/**
 * Where the page opens: the last month anything was spent in.
 *
 * Not the calendar's month, which on the 1st is empty and would open the page
 * on nothing. A group that has spent nothing yet has no month to open on.
 */
export function openingPeriod(months: readonly MonthTotal[]): Period {
  const last = months.at(-1);

  return last ? { kind: "month", month: last.month } : { kind: "all" };
}

/**
 * The period one step before or after, or null past either end.
 *
 * A month steps through every month from the first expense to the last, the
 * empty ones included — a month with nothing spent is a fact, not a gap to
 * jump over. A year steps through the years that hold an expense.
 */
export function stepPeriod(
  period: Period,
  delta: -1 | 1,
  months: readonly MonthTotal[],
  years: readonly number[],
): Period | null {
  if (period.kind === "month") {
    const first = months[0]?.month;
    const last = months.at(-1)?.month;
    const next = addMonths(period.month, delta);

    if (!first || !last || next < first || next > last) {
      return null;
    }

    return { kind: "month", month: next };
  }

  if (period.kind === "year") {
    const sorted = [...years].sort((a, b) => a - b);
    const next = sorted[sorted.indexOf(period.year) + delta];

    return next === undefined ? null : { kind: "year", year: next };
  }

  return null;
}

/** Whether a month falls inside the period. */
export function inPeriod(month: string, period: Period): boolean {
  if (period.kind === "month") {
    return month === period.month;
  }

  if (period.kind === "year") {
    return month.startsWith(`${String(period.year).padStart(4, "0")}-`);
  }

  return true;
}

/**
 * How many months of history the period covers, for an average per month.
 *
 * Only the months the group has existed for: a year the group started in
 * October is three months long, and dividing by twelve would make its first
 * quarter look like a frugal year.
 */
export function periodSpan(period: Period, months: readonly MonthTotal[]): number {
  const first = months[0]?.month;
  const last = months.at(-1)?.month;

  if (period.kind === "month" || !first || !last) {
    return 1;
  }

  if (period.kind === "year") {
    const year = String(period.year).padStart(4, "0");
    const from = `${year}-01` > first ? `${year}-01` : first;
    const to = `${year}-12` < last ? `${year}-12` : last;

    return Math.max(1, monthsBetween(from, to));
  }

  return monthsBetween(first, last);
}

/**
 * The change from one figure to another, as a fraction, for `Intl` to write.
 *
 * Null when there is nothing to compare with: against zero every change is
 * infinite, and against a month that came out refunded it points the wrong way.
 */
export function change(current: number, before: number): number | null {
  if (before <= 0) {
    return null;
  }

  return (current - before) / before;
}

/**
 * The months the trend draws, every one of them, the empty ones at zero.
 *
 * At most a year, never before the first expense, and always holding the
 * period: the year ending on the last month spent in, unless the period lies
 * further back, in which case the year starting on it.
 */
export function trendWindow(
  months: readonly MonthTotal[],
  period: Period,
  size: number = TREND_MONTHS,
): MonthTotal[] {
  const first = months[0]?.month;
  const latest = months.at(-1)?.month;

  if (!first || !latest) {
    return [];
  }

  let end = latest;

  if (period.kind === "month" && period.month < addMonths(latest, -(size - 1))) {
    end = addMonths(period.month, size - 1);
  } else if (period.kind === "year") {
    const december = `${String(period.year).padStart(4, "0")}-12`;
    end = december < latest ? december : latest;
  }

  const start = addMonths(end, -(size - 1)) > first ? addMonths(end, -(size - 1)) : first;
  const window: MonthTotal[] = [];

  for (let month = start; month <= end; month = addMonths(month, 1)) {
    window.push({ month, total: totalOf(months, month) });
  }

  return window;
}

/** The average of a run of months, empty ones counted as the zero they are. */
export function averageOf(window: readonly MonthTotal[]): number {
  if (window.length === 0) {
    return 0;
  }

  return Math.round(window.reduce((sum, item) => sum + item.total, 0) / window.length);
}
