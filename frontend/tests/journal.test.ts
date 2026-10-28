/**
 * The group journal read as a story: a thing on either side of a change,
 * rebuilt from the revisions alone, and runs of additions folded.
 *
 * The rebuild is the part worth pinning. It walks back from the present
 * through every later change, and a step taken in the wrong direction shows
 * the reader an expense that never existed — with a struck-through figure
 * that looks exactly as sure of itself as a right one.
 */

import { describe, expect, it } from "vitest";

import {
  expenseAt,
  expenseState,
  foldRuns,
  shareMoves,
  statesAround,
} from "../src/services/journal";
import type { Expense, Revision } from "../src/types";

let next = 0;

function revision(
  action: Revision["action"],
  changes: Revision["changes"],
  extra: Partial<Revision> = {},
): Revision {
  next += 1;

  return {
    id: `r${next}`,
    group_id: "g",
    entity_type: "expense",
    entity_id: "e1",
    entity_label: "Bakery",
    action,
    actor_user_id: "u1",
    changes,
    at: "2026-10-29T09:00:00+00:00",
    ...extra,
  };
}

const bakery: Expense = {
  id: "e1",
  group_id: "g",
  category_id: "food",
  title: "Bakery",
  description: null,
  amount: 1090,
  currency: "EUR",
  converted_amount: 1090,
  exchange_rate: 1,
  rate_as_of: null,
  refund_of: null,
  paid_by_member_id: "alex",
  created_by_member_id: "alex",
  expense_date: "2026-10-28T12:00:00+00:00",
  created_at: "2026-10-28T18:00:00+00:00",
  shares: [
    { id: "s1", expense_id: "e1", member_id: "alex", amount: 545, created_at: "" },
    { id: "s2", expense_id: "e1", member_id: "sam", amount: 545, created_at: "" },
  ],
  split_rule: null,
  recurring_id: null,
};

describe("statesAround", () => {
  it("undoes every later change before reading one", () => {
    // Newest first: the amount was fixed last, the title before it.
    const amount = revision("updated", [{ field: "amount", before: 10900, after: 1090 }]);
    const title = revision("updated", [{ field: "title", before: "Bakry", after: "Bakery" }]);
    const states = statesAround([amount, title], title, expenseState(bakery));

    expect(states.before).toMatchObject({ title: "Bakry", amount: 10900 });
    expect(states.after).toMatchObject({ title: "Bakery", amount: 10900 });
  });

  it("leaves another expense's changes alone", () => {
    const other = revision("updated", [{ field: "amount", before: 1, after: 2 }], { entity_id: "e2" });
    const own = revision("updated", [{ field: "title", before: "Bakry", after: "Bakery" }]);

    expect(statesAround([other, own], own, expenseState(bakery)).after).toMatchObject({ amount: 1090 });
  });

  it("starts a deleted expense from what its deletion froze", () => {
    const deletion = revision("deleted", [
      { field: "title", before: "Bakery", after: null },
      { field: "amount", before: 1090, after: null },
      { field: "paid_by_member_id", before: "alex", after: null },
    ]);
    const edit = revision("updated", [{ field: "amount", before: 990, after: 1090 }]);
    const gone = statesAround([deletion, edit], deletion, null);

    expect(gone).toMatchObject({ before: { id: "e1", amount: 1090 }, after: null });
    expect(statesAround([deletion, edit], edit, null).before).toMatchObject({ amount: 990 });
  });

  it("has nothing to start from when the deletion froze no figure", () => {
    const deletion = revision("deleted", []);

    expect(statesAround([deletion], deletion, null)).toEqual({ before: null, after: null });
  });

  it("has no before to an addition", () => {
    const creation = revision("created", [{ field: "amount", before: null, after: 1090 }]);

    expect(statesAround([creation], creation, expenseState(bakery)).before).toBeNull();
  });
});

describe("expenseAt", () => {
  it("draws the shares back as rows, and weighs a foreign figure at today's rate", () => {
    const dollars = { ...bakery, currency: "USD", amount: 1000, converted_amount: 900 };
    const drawn = expenseAt(
      { ...expenseState(dollars), amount: 2000, shares: { alex: 2000 } },
      dollars,
      "EUR",
    );

    expect(drawn.converted_amount).toBe(1800);
    expect(drawn.shares?.map((share) => [share.member_id, share.amount])).toEqual([["alex", 2000]]);
  });
});

describe("shareMoves", () => {
  it("says one figure for an even split that lost somebody", () => {
    expect(
      shareMoves({ a: 2210, b: 2210, c: 2210, d: 2210 }, { a: 2947, b: 2947, d: 2946 }),
    ).toEqual({ out: ["c"], in: [], each: { before: 2210, after: 2947 }, moved: [] });
  });

  it("names each part that moved when the split is not even", () => {
    expect(shareMoves({ a: 500, b: 500 }, { a: 700, b: 300 })).toEqual({
      out: [],
      in: [],
      each: null,
      moved: [
        { member: "a", before: 500, after: 700 },
        { member: "b", before: 500, after: 300 },
      ],
    });
  });
});

describe("foldRuns", () => {
  const added = (actor: string, at = "2026-10-29T09:00:00+00:00") =>
    revision("created", [], { entity_id: `x${next}`, actor_user_id: actor, at });
  const kinds = (items: ReturnType<typeof foldRuns>) => items.map((item) => item.kind);

  it("gathers additions in a row by one person on one day, from two", () => {
    expect(kinds(foldRuns([added("u1"), added("u1"), added("u1"), added("u2")]))).toEqual(["run", "one"]);
    expect(kinds(foldRuns([added("u1"), added("u1")]))).toEqual(["run"]);
  });

  it("breaks a run at another action, and gathers that one too", () => {
    const edit = () => revision("updated", []);

    expect(kinds(foldRuns([added("u1"), added("u1"), edit(), edit(), added("u1")]))).toEqual([
      "run",
      "run",
      "one",
    ]);
  });

  it("gathers whatever was added in a row: the group set up with its categories", () => {
    const category = revision("created", [], { entity_type: "category" });
    const payment = revision("created", [], { entity_type: "payment" });
    const items = foldRuns([added("u1"), payment, added("u1"), category]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "run" });
  });

  it("keeps skipped dates apart: each is said with its own recurring expense", () => {
    const skipped = () => revision("skipped", [], { entity_type: "recurring" });

    expect(kinds(foldRuns([skipped(), skipped()]))).toEqual(["one", "one"]);
  });

  it("breaks a run at midnight", () => {
    const items = foldRuns([
      added("u1", "2026-10-29T09:00:00"),
      added("u1", "2026-10-29T08:00:00"),
      added("u1", "2026-10-28T23:00:00"),
    ]);

    expect(kinds(items)).toEqual(["run", "one"]);
  });
});
