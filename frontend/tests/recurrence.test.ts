/**
 * When a recurring expense comes back, counted as the backend counts it.
 *
 * The panel only says the next date before there is a recurring expense to ask
 * (the backend sends it from then on), but a date said wrong there is a promise
 * broken a month later. The cases are the model's own: `test_recurring.py`.
 */

import { describe, expect, it } from "vitest";

import { localizer } from "../src/services/localize";
import {
  occurrence,
  recurringChanges,
  rhythm,
  shortDay,
  type RecurringFields,
} from "../src/services/recurrence";
import type { Recurring } from "../src/types";

describe("occurrence", () => {
  it("is the anchor itself at 0", () => {
    expect(occurrence("2026-08-01", 1, "month", 0)).toBe("2026-08-01");
  });

  it("counts days and weeks across a month's end", () => {
    expect(occurrence("2026-10-30", 3, "day", 1)).toBe("2026-11-02");
    expect(occurrence("2026-12-28", 2, "week", 1)).toBe("2027-01-11");
  });

  it("keeps the day of the month, and crosses the year", () => {
    expect(occurrence("2026-11-15", 2, "month", 1)).toBe("2027-01-15");
    expect(occurrence("2026-01-15", 1, "month", 12)).toBe("2027-01-15");
  });

  it("clamps the 31st to a shorter month, and finds it again after", () => {
    const rent = (index: number) => occurrence("2026-10-31", 1, "month", index);

    expect(rent(1)).toBe("2026-11-30");
    expect(rent(4)).toBe("2027-02-28");
    expect(rent(5)).toBe("2027-03-31");
  });

  it("knows a leap year", () => {
    expect(occurrence("2027-01-31", 1, "month", 13)).toBe("2028-02-29");
  });
});

describe("rhythm", () => {
  it("says one and many apart", () => {
    const english = localizer("en");

    expect(rhythm(1, "month", english)).toBe("Every month");
    expect(rhythm(2, "week", english)).toBe("Every 2 weeks");
    expect(rhythm(1, "day", localizer("fr"))).toBe("Tous les jours");
  });
});

describe("shortDay", () => {
  const now = new Date(2026, 9, 25);

  it("has no year this year, and does not move with the time zone", () => {
    expect(shortDay("2026-11-01", "en", now).replace(/\s/g, " ")).toBe("Sun, Nov 1");
  });

  it("says the year of any other", () => {
    expect(shortDay("2027-12-31", "en", now).replace(/\s/g, " ")).toBe("Fri, Dec 31, 2027");
    expect(shortDay("2025-11-03", "fr", now)).toContain("2025");
  });
});

describe("recurringChanges", () => {
  const rule = { envelope: null, participants: ["a", "b"], remainder: { members: null, fixed: {} } };

  const stored = {
    id: "r",
    group_id: "g",
    category_id: "c",
    title: "Loyer",
    description: null,
    amount: 120000,
    currency: "EUR",
    paid_by_member_id: "a",
    split_rule: null,
    every: 1,
    unit: "month",
    anchor: "2025-01-01",
    ends_on: "2025-12-31",
    paused: false,
    ended: true,
    next_due: null,
    waiting: 0,
    latest_amount: 120000,
    latest_date: "2025-12-01",
  } as unknown as Recurring;

  // What the dialog holds when it opened on `recurring` and nothing was touched.
  const untouched = (recurring: Recurring): RecurringFields => ({
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
  });

  it("sends nothing for an ended one opened and saved as it was", () => {
    expect(recurringChanges(stored, untouched(stored), { own: false, rule: null })).toEqual({});
  });

  it("sends only the new end when an ended one is extended, never the anchor", () => {
    const wanted = { ...untouched(stored), ends_on: "2026-12-31" };

    expect(recurringChanges(stored, wanted, { own: false, rule: null })).toEqual({
      ends_on: "2026-12-31",
    });
  });

  it("gives its own split back to the category's when the reader lets it", () => {
    const own = { ...stored, split_rule: rule } as Recurring;

    expect(recurringChanges(own, untouched(own), { own: true, rule })).toEqual({});
    expect(recurringChanges(own, untouched(own), { own: false, rule: null })).toEqual({
      split_rule: null,
    });
  });

  it("sends a split the reader set, and none the editor merely proposed", () => {
    expect(recurringChanges(stored, untouched(stored), { own: true, rule })).toEqual({
      split_rule: rule,
    });
    expect(recurringChanges(stored, untouched(stored), { own: false, rule })).toEqual({});
  });
});
