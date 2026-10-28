/**
 * The names a new expense is offered while its title is typed.
 *
 * The point is one spelling per shop, so what counts as the same name, and
 * which spelling stands for it, is what is pinned here.
 */

import { describe, expect, it } from "vitest";

import { foldTitle, splitOnMatch, suggestTitles } from "../src/services/title-suggestions";
import type { Expense } from "../src/types";

let next = 0;

function expense(title: string, day: string, category: string | null = "groceries", amount = 1090): Expense {
  next += 1;

  return {
    id: `e${next}`,
    title,
    amount,
    expense_date: `${day}T12:00:00+00:00`,
    category_id: category,
  } as Expense;
}

const GROUP = [
  expense("Leclerc", "2026-10-01"),
  expense("Leclerc", "2026-10-08"),
  expense("leclerc ", "2026-10-15"),
  expense("LECLERC", "2026-10-20", "leisure"),
  expense("Leclerc station", "2026-10-03", "transport", 6200),
  expense("Électricité", "2026-09-24", "utilities", 16412),
  expense("Electricité", "2026-08-24", "utilities", 15000),
  expense("Retour Leclerc", "2026-10-21", "groceries", -1090),
];

describe("foldTitle", () => {
  it("reads past case, accents and stray spaces", () => {
    expect(foldTitle("  LECLERC  Drive ")).toBe("leclerc drive");
    expect(foldTitle("Électricité")).toBe("electricite");
  });
});

describe("suggestTitles", () => {
  it("offers nothing before two letters", () => {
    expect(suggestTitles(GROUP, "l")).toEqual([]);
    expect(suggestTitles(GROUP, " ")).toEqual([]);
  });

  it("counts every spelling as one name, written the commonest way", () => {
    const [first] = suggestTitles(GROUP, "lec");

    expect(first.title).toBe("Leclerc");
    expect(first.count).toBe(4);
  });

  it("puts names starting with what is typed before those holding it", () => {
    expect(suggestTitles(GROUP, "lec").map((name) => name.title)).toEqual([
      "Leclerc",
      "Leclerc station",
      "Électricité",
    ]);
  });

  it("matches without accents either way", () => {
    expect(suggestTitles(GROUP, "elec").map((name) => name.title)).toEqual(["Électricité"]);
    expect(suggestTitles(GROUP, "élec")[0].count).toBe(2);
  });

  it("carries the category of the latest use", () => {
    expect(suggestTitles(GROUP, "lecl")[0].categoryId).toBe("leisure");
  });

  it("stops once the name typed is one already in use", () => {
    expect(suggestTitles(GROUP, "leclerc")).toEqual([]);
    expect(suggestTitles(GROUP, "LECLERC ")).toEqual([]);
  });

  it("leaves refunds out", () => {
    expect(suggestTitles(GROUP, "retour")).toEqual([]);
  });

  it("offers three at most", () => {
    const many = ["Pain", "Pain bio", "Pain de mie", "Pain complet"].map((title) =>
      expense(title, "2026-10-01"),
    );

    expect(suggestTitles(many, "pai")).toHaveLength(3);
  });
});

describe("splitOnMatch", () => {
  it("finds what was typed in the title as written", () => {
    expect(splitOnMatch("Électricité", "elec")).toEqual(["", "Élec", "tricité"]);
    expect(splitOnMatch("Leclerc station", "STAT")).toEqual(["Leclerc ", "stat", "ion"]);
  });

  it("gives the title back whole when it is not there", () => {
    expect(splitOnMatch("Leclerc", "xyz")).toEqual(["Leclerc", "", ""]);
  });
});
