/**
 * The group journal read as a story: what a thing looked like on either side
 * of a change, and which lines say the same thing several times over.
 *
 * A revision carries what moved and nothing else. "Amount 143,60 → 134,60"
 * was true and still left the reader asking which expense it was, who paid
 * it, who shared it — the rest of the thing, which the revision never held.
 * It is all here nonetheless: the thing as it stands now, and every revision
 * since, each one saying what its fields were before it. Walking back from
 * the present undoes them one by one and lands on the thing as it stood at
 * any line of the journal, without asking the backend anything.
 */

import { localToday } from "./calendar";
import type { Expense, Payment, Revision } from "../types";

/** A stored thing as its revisions spell it: field by field, shares as a map. */
export type State = Record<string, unknown>;

/** An expense as its revisions spell it: the shares as member → cents. */
export function expenseState(expense: Expense): State {
  return {
    ...expense,
    shares: Object.fromEntries(
      (expense.shares ?? []).map((share) => [share.member_id, share.amount]),
    ),
  };
}

/** A payment as its revisions spell it, which is how it is stored. */
export function paymentState(payment: Payment): State {
  return { ...payment };
}

/**
 * What a thing looked like right before one revision and right after it.
 *
 * Started from the thing as it stands — or, when it is gone, from what its
 * last deletion froze, which is the thing as it stood when it went — and
 * walked back through every later change to it. Then the revision itself is
 * applied one way or the other.
 *
 * Null on a side that never existed: before a creation, after a deletion. And
 * on both when nothing can be started from: a thing that is gone and whose
 * deletion predates the snapshots that froze it.
 */
export function statesAround(
  revisions: Revision[],
  revision: Revision,
  now: State | null,
): { before: State | null; after: State | null } {
  // Newest first, so the first deletion found is the last one made.
  const deletion = revisions.find(
    (candidate) => candidate.entity_id === revision.entity_id && candidate.action === "deleted",
  );
  const start = now ?? (deletion ? side(deletion, {}, "before") : null);

  if (start === null || (now === null && typeof start.amount !== "number")) {
    return { before: null, after: null };
  }

  const state: State = { id: revision.entity_id, ...start };

  for (const later of revisions.slice(0, revisions.indexOf(revision))) {
    if (later.entity_id === revision.entity_id && later.action === "updated") {
      for (const change of later.changes) {
        state[change.field] = change.before;
      }
    }
  }

  switch (revision.action) {
    case "updated":
      return { before: side(revision, state, "before"), after: side(revision, state, "after") };
    case "deleted":
      return { before: side(revision, state, "before"), after: null };
    default:
      return { before: null, after: side(revision, state, "after") };
  }
}

function side(revision: Revision, state: State, which: "before" | "after"): State {
  const result = { ...state };

  for (const change of revision.changes) {
    result[change.field] = change[which];
  }

  return result;
}

/**
 * An expense to draw from a state.
 *
 * Shaped on the expense as it stands, when there is one, so whatever the
 * revisions never held — the rate, the recurring it came from — is the one
 * the tile already knew. What it weighs in the group is scaled with its
 * amount, at the rate it has now: the tile shows it only for a foreign
 * currency, where a figure a few cents out says no less than none.
 */
export function expenseAt(state: State, like: Expense | undefined, currency: string): Expense {
  const amount = Number(state.amount);
  const paidIn = String(state.currency ?? like?.currency ?? currency);
  const shares = (state.shares ?? {}) as Record<string, number>;

  return {
    id: String(state.id ?? like?.id ?? ""),
    group_id: like?.group_id ?? "",
    category_id: (state.category_id as string | null) ?? null,
    title: String(state.title ?? like?.title ?? ""),
    description: (state.description as string | null) ?? null,
    amount,
    currency: paidIn,
    converted_amount: converted(amount, paidIn, currency, like),
    exchange_rate: like?.exchange_rate ?? 1,
    rate_as_of: like?.rate_as_of ?? null,
    refund_of: (state.refund_of as string | null) ?? null,
    paid_by_member_id: String(state.paid_by_member_id ?? like?.paid_by_member_id ?? ""),
    created_by_member_id: like?.created_by_member_id ?? null,
    expense_date: String(state.expense_date ?? like?.expense_date ?? ""),
    created_at: like?.created_at ?? "",
    shares: Object.entries(shares).map(([memberId, cents]) => ({
      id: "",
      expense_id: "",
      member_id: memberId,
      amount: cents,
      created_at: "",
    })),
    split_rule: like?.split_rule ?? null,
    recurring_id: like?.recurring_id ?? null,
  };
}

/** A payment to draw from a state, shaped on the one standing when there is one. */
export function paymentAt(state: State, like: Payment | undefined, currency: string): Payment {
  const amount = Number(state.amount);
  const paidIn = String(state.currency ?? like?.currency ?? currency);

  return {
    id: String(state.id ?? like?.id ?? ""),
    group_id: like?.group_id ?? "",
    description: (state.description as string | null) ?? null,
    from_member_id: String(state.from_member_id ?? like?.from_member_id ?? ""),
    to_member_id: String(state.to_member_id ?? like?.to_member_id ?? ""),
    kind: (state.kind as Payment["kind"]) ?? like?.kind ?? "reimbursement",
    created_by_member_id: like?.created_by_member_id ?? null,
    amount,
    currency: paidIn,
    payment_date: String(state.payment_date ?? like?.payment_date ?? ""),
    created_at: like?.created_at ?? "",
    converted_amount: converted(amount, paidIn, currency, like),
    exchange_rate: like?.exchange_rate ?? 1,
    rate_as_of: like?.rate_as_of ?? null,
    expense_id: (state.expense_id as string | null) ?? null,
  };
}

function converted(
  amount: number,
  paidIn: string,
  currency: string,
  like: { amount: number; converted_amount: number } | undefined,
): number {
  if (paidIn === currency || !like || like.amount === 0) {
    return amount;
  }

  return Math.round((like.converted_amount * amount) / like.amount);
}

/**
 * Who started or stopped sharing, and what the others' parts went from and to.
 *
 * Said as "each 22,10 → 29,47" when everyone still sharing moved alike, which
 * is what an even split does when somebody leaves it; one figure per person
 * otherwise, and only for those whose part moved.
 */
export function shareMoves(
  before: Record<string, number>,
  after: Record<string, number>,
): {
  out: string[];
  in: string[];
  each: { before: number; after: number } | null;
  moved: { member: string; before: number; after: number }[];
} {
  const sharing = (shares: Record<string, number>) =>
    Object.keys(shares).filter((member) => shares[member] !== 0);
  const then = sharing(before);
  const now = sharing(after);
  const staying = now.filter((member) => then.includes(member));
  const moved = staying
    .filter((member) => before[member] !== after[member])
    .map((member) => ({ member, before: before[member], after: after[member] }));

  // Even within a cent: 88,40 in three is 29,47 + 29,47 + 29,46.
  const even = (values: number[]) => Math.max(...values) - Math.min(...values) <= 1;
  const each =
    moved.length > 1 &&
    moved.length === staying.length &&
    even(moved.map((move) => move.before)) &&
    even(moved.map((move) => move.after))
      ? { before: moved[0].before, after: moved[0].after }
      : null;

  return {
    out: then.filter((member) => !now.includes(member)),
    in: now.filter((member) => !then.includes(member)),
    each,
    moved: each ? [] : moved,
  };
}

/** One line of the journal, or several additions read as one. */
export type JournalItem =
  | { kind: "one"; revision: Revision }
  | { kind: "run"; revisions: Revision[] };

/** How many additions in a row it takes to fold them into one line. */
const RUN = 3;

/**
 * The journal's lines, with additions in a row folded together.
 *
 * Things added one after another by the same person on the same day — a
 * receipt typed in, a month caught up on, the group set up with its
 * categories and its people — are one thing they did, and twenty identical
 * "added the expense" lines buried the one deletion in among them. Three or
 * more fold, whatever they are; two still read fine apart.
 */
export function foldAdditions(revisions: Revision[]): JournalItem[] {
  const items: JournalItem[] = [];
  let run: Revision[] = [];

  const close = () => {
    if (run.length >= RUN) {
      items.push({ kind: "run", revisions: run });
    } else {
      items.push(...run.map((revision) => ({ kind: "one" as const, revision })));
    }

    run = [];
  };

  for (const revision of revisions) {
    const joins =
      revision.action === "created" &&
      (run.length === 0 ||
        (run[0].actor_user_id === revision.actor_user_id &&
          journalDay(run[0].at) === journalDay(revision.at)));

    if (!joins) {
      close();
    }

    if (revision.action === "created") {
      run.push(revision);
    } else {
      items.push({ kind: "one", revision });
    }
  }

  close();

  return items;
}

/** The reader's own calendar day a revision was made on, as `YYYY-MM-DD`. */
export function journalDay(at: string): string {
  return localToday(new Date(at));
}
