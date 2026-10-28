/**
 * The typing slips the check asks about, and the ones it must leave alone.
 *
 * A check that cries wolf is switched off, so the second half of each
 * describe matters as much as the first: an electricity bill that moves, two
 * coffees on the same morning, "Bar" beside "Car".
 */

import { describe, expect, it } from "vitest";

import {
  answerKey,
  countChecks,
  findAmounts,
  findCategories,
  findChecks,
  findDuplicates,
  findNames,
} from "../src/services/checks";
import type { Expense } from "../src/types";

let next = 0;

function bought(title: string, amount: number, day: string, extra: Partial<Expense> = {}): Expense {
  next += 1;

  return {
    id: `e${next}`,
    title,
    amount,
    currency: "EUR",
    category_id: "groceries",
    paid_by_member_id: "alex",
    expense_date: `${day}T12:00:00+00:00`,
    created_at: `${day}T18:${String(next % 60).padStart(2, "0")}:00+00:00`,
    split_rule: {},
    ...extra,
  } as Expense;
}

const weekly = (title: string, amount: number) =>
  ["2026-09-02", "2026-09-09", "2026-09-16", "2026-09-23"].map((day) => bought(title, amount, day));

describe("findAmounts", () => {
  it("asks about 109,00 where 10,90 is usual, and offers 10,90", () => {
    const slip = bought("Boulangerie", 10_900, "2026-10-17");
    const [check] = findAmounts([...weekly("Boulangerie", 1090), slip]);

    expect(check.expense).toBe(slip);
    expect(check.usual).toBe(1090);
    expect(check.times).toBe(4);
    expect(check.fix).toBe(1090);
  });

  it("offers no fix when no slip of the point explains the figure", () => {
    const [check] = findAmounts([...weekly("Boulangerie", 1090), bought("Boulangerie", 7700, "2026-10-17")]);

    expect(check.fix).toBeNull();
  });

  it("leaves a bill that moves, and a name seen too seldom", () => {
    const bills = [6400, 7200, 16_412, 9100].map((amount, index) =>
      bought("Electricity", amount, `2026-0${index + 5}-24`),
    );

    expect(findAmounts(bills)).toEqual([]);
    expect(findAmounts([bought("Rare", 100, "2026-01-01"), bought("Rare", 10_000, "2026-02-01")])).toEqual([]);
  });

  it("reads figures in the expense's own currency only", () => {
    const abroad = weekly("Taxi", 1500).map((expense) => ({ ...expense, currency: "GBP" }));

    expect(findAmounts([...abroad, bought("Taxi", 15_000, "2026-10-01")])).toEqual([]);
  });
});

describe("findNames", () => {
  it("gathers case, spaces, a slipped letter and words added into one question", () => {
    const [check, ...more] = findNames([
      ...weekly("Leclerc", 1090),
      bought("leclerc ", 1250, "2026-09-30"),
      bought("Leclrc", 990, "2026-10-07"),
      bought("Leclerc drive", 4500, "2026-10-08"),
    ]);

    expect(more).toEqual([]);
    expect(check.spellings.map((spelling) => spelling.title)).toEqual([
      "Leclerc",
      expect.any(String),
      expect.any(String),
      expect.any(String),
    ]);
    expect(check.spellings[0].ids).toHaveLength(4);
    expect(new Set(check.spellings.map((spelling) => spelling.title))).toEqual(
      new Set(["Leclerc", "leclerc", "Leclrc", "Leclerc drive"]),
    );
  });

  it("takes a name with its spaces put in or left out", () => {
    expect(findNames([bought("Le Clerc", 1, "2026-10-01"), bought("Leclerc", 1, "2026-10-02")])).toHaveLength(1);
  });

  it("leaves names that only look alike", () => {
    expect(findNames([bought("Bar", 500, "2026-10-01"), bought("Car", 500, "2026-10-02")])).toEqual([]);
    expect(findNames([bought("Aug rent", 500, "2026-08-01"), bought("Jul rent", 500, "2026-07-01")])).toEqual([]);
    expect(findNames([bought("Courses", 500, "2026-10-01"), bought("Couches", 500, "2026-10-02")])).toEqual([]);
  });

  it("keys a question on its spellings, whatever order they came in", () => {
    const one = findNames([bought("Leclerc", 1, "2026-10-01"), bought("leclerc", 1, "2026-10-02")]);
    const two = findNames([bought("leclerc", 1, "2026-10-01"), bought("Leclerc", 1, "2026-10-02")]);

    expect(one[0].key).toBe(two[0].key);
  });
});

describe("findDuplicates", () => {
  it("asks about the same purchase twice, offering the one entered later", () => {
    const first = bought("Netflix", 1349, "2026-10-06");
    const second = bought("netflix", 1349, "2026-10-06");
    const [check] = findDuplicates([second, first]);

    expect(check.first).toBe(first);
    expect(check.second).toBe(second);
  });

  it("leaves two coffees paid by two people, or on two days", () => {
    expect(
      findDuplicates([
        bought("Café", 250, "2026-10-06"),
        bought("Café", 250, "2026-10-06", { paid_by_member_id: "emma" }),
        bought("Café", 250, "2026-10-07"),
      ]),
    ).toEqual([]);
  });
});

describe("findCategories", () => {
  it("asks about the one filed apart, and the one filed nowhere", () => {
    const leisure = bought("Leclerc", 4820, "2026-09-12", { category_id: "leisure" });
    const nowhere = bought("Leclerc", 1100, "2026-10-20", { category_id: null });
    const usual = [...weekly("Leclerc", 1090), ...weekly("Leclerc", 1200)];
    const checks = findCategories([...usual, leisure, nowhere]);

    expect(checks.map((check) => check.expense)).toEqual([nowhere, leisure]);
    expect(checks.every((check) => check.usual === "groceries" && check.times === 8)).toBe(true);
  });

  it("leaves a name filed under two categories as often", () => {
    const split = [
      ...weekly("Amazon", 2000).slice(0, 2),
      ...weekly("Amazon", 2000).slice(0, 2).map((expense) => ({ ...expense, category_id: "home" })),
    ];

    expect(findCategories(split)).toEqual([]);
  });
});

describe("findChecks", () => {
  it("leaves out what was answered, and refunds altogether", () => {
    const slip = bought("Boulangerie", 10_900, "2026-10-17");
    const expenses = [...weekly("Boulangerie", 1090), slip, bought("Boulangerie", -10_900, "2026-10-18")];
    const all = findChecks(expenses, new Set());

    expect(countChecks(all)).toBe(1);

    const answered = new Set([answerKey("amount", all.amounts[0].key)]);

    expect(countChecks(findChecks(expenses, answered))).toBe(0);
  });

  it("asks again once the figure answered for has changed", () => {
    const slip = bought("Boulangerie", 10_900, "2026-10-17");
    const answered = new Set([answerKey("amount", `${slip.id}:10900`)]);
    const changed = { ...slip, amount: 9_900 };

    expect(findChecks([...weekly("Boulangerie", 1090), changed], answered).amounts).toHaveLength(1);
  });
});
