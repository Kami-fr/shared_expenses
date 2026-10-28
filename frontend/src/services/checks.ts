/**
 * What a person typing in a hurry gets wrong, found in a group's expenses.
 *
 * Four slips, each read off the expenses the page already holds: a figure far
 * from what the same shop usually costs (10,90 typed 109), one shop written
 * several ways ("Leclerc", "leclerc", "Lecelrc", "Leclerc drive"), the same
 * purchase entered twice, and a purchase filed under a category its shop is
 * never filed under. None of it is a rule broken; each is a question, and an
 * answer "this is right" is kept by the backend under the check's key, so the
 * same question is not asked twice.
 *
 * A key names exactly what was answered: an expense and the figure it held,
 * the spellings of a name, two expenses, an expense and its category. Change
 * any of those and it is a new question.
 */

import { isoToDateInput } from "./format";
import { foldTitle } from "./title-suggestions";
import type { Expense } from "../types";

export type CheckKind = "amount" | "names" | "duplicate" | "category";

export interface AmountCheck {
  kind: "amount";
  key: string;
  expense: Expense;
  /** What the same name usually costs: the middle of its other figures. */
  usual: number;
  /** Where the middle half of its other figures lie, from the lowest to the highest. */
  low: number;
  high: number;
  /** How many other figures that is read from. */
  times: number;
  /** The figure it most likely meant, when a slip of the decimal point explains it. */
  fix: number | null;
}

export interface Spelling {
  title: string;
  ids: string[];
}

export interface NamesCheck {
  kind: "names";
  key: string;
  /** Most used first: the first is the name proposed to keep. */
  spellings: Spelling[];
}

export interface DuplicateCheck {
  kind: "duplicate";
  key: string;
  /** Entered first, and kept. */
  first: Expense;
  /** Entered after it, the one offered for deleting. */
  second: Expense;
}

export interface CategoryCheck {
  kind: "category";
  key: string;
  expense: Expense;
  /** The category the same name is filed under almost every time. */
  usual: string;
  times: number;
}

export interface Checks {
  amounts: AmountCheck[];
  names: NamesCheck[];
  duplicates: DuplicateCheck[];
  categories: CategoryCheck[];
}

/** How far from the usual a figure has to be to be asked about: five times. */
const FAR = 5;

/** How many other figures a usual is read from, at the least. */
const ENOUGH = 3;

/** How much of a name's expenses one category has to hold to be its usual. */
const MOSTLY = 0.75;

/** The key of an answer, as the backend keeps it. */
export function answerKey(kind: CheckKind, key: string): string {
  return `${kind}|${key}`;
}

export function countChecks(checks: Checks): number {
  return (
    checks.amounts.length +
    checks.names.length +
    checks.duplicates.length +
    checks.categories.length
  );
}

/**
 * Every question worth asking about these expenses, less those answered.
 *
 * Only purchases are read: a refund is a purchase's echo and carries its
 * name, and its figure is whatever the shop gave back.
 */
export function findChecks(expenses: Expense[], answered: Set<string>): Checks {
  const purchases = expenses.filter((expense) => expense.amount > 0);
  const open = <T extends { kind: CheckKind; key: string }>(checks: T[]) =>
    checks.filter((check) => !answered.has(answerKey(check.kind, check.key)));

  return {
    amounts: open(findAmounts(purchases)),
    names: open(findNames(purchases)),
    duplicates: open(findDuplicates(purchases)),
    categories: open(findCategories(purchases)),
  };
}

/** Newest first, as the list runs. */
function newest(a: Expense, b: Expense): number {
  return b.expense_date.localeCompare(a.expense_date) || b.created_at.localeCompare(a.created_at);
}

function byName(purchases: Expense[]): Map<string, Expense[]> {
  const names = new Map<string, Expense[]>();

  for (const expense of purchases) {
    const name = foldTitle(expense.title);

    names.set(name, [...(names.get(name) ?? []), expense]);
  }

  return names;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

/**
 * The middle half of some figures, as a range a person can read: the lowest
 * and highest quarter left out, so one other slip does not stretch it.
 */
function middleHalf(values: number[]): [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const last = sorted.length - 1;

  return [sorted[Math.floor(last / 4)], sorted[Math.ceil((last * 3) / 4)]];
}

/**
 * A figure five times what the same name usually costs, or a fifth of it.
 *
 * Read against the others in the same currency, and only once there are
 * enough of them to have a usual at all. When the figure is the usual with
 * its decimal point slipped — 109,00 for 10,90, 1 090,00 for 10,90 — that is
 * offered as the fix; anything else is for a person to look at.
 */
export function findAmounts(purchases: Expense[]): AmountCheck[] {
  const checks: AmountCheck[] = [];

  for (const same of byName(purchases).values()) {
    for (const expense of same) {
      const others = same
        .filter((other) => other.id !== expense.id && other.currency === expense.currency)
        .map((other) => other.amount);

      if (others.length < ENOUGH) {
        continue;
      }

      const usual = median(others);
      const ratio = expense.amount / usual;

      if (ratio < FAR && ratio > 1 / FAR) {
        continue;
      }

      const fix =
        [expense.amount / 10, expense.amount / 100, expense.amount * 10, expense.amount * 100]
          .filter((figure) => Number.isInteger(figure) && figure >= usual * 0.8 && figure <= usual * 1.25)
          .sort((a, b) => Math.abs(a - usual) - Math.abs(b - usual))[0] ?? null;
      const [low, high] = middleHalf(others);

      checks.push({
        kind: "amount",
        key: `${expense.id}:${expense.amount}`,
        expense,
        usual,
        low,
        high,
        times: others.length,
        fix,
      });
    }
  }

  return checks.sort((a, b) => newest(a.expense, b.expense));
}

/** How many letters apart two words are: a typo is one or two. */
function distance(a: string, b: string, most: number): number {
  if (Math.abs(a.length - b.length) > most) {
    return most + 1;
  }

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }

    previous = current;
  }

  return previous[b.length];
}

/**
 * Whether two names, already folded, are one shop written two ways: spaces
 * put in or left out ("le clerc"), a slip of a letter or two in one word, or
 * words added after the other ("leclerc" and "leclerc drive").
 *
 * A slip is looked for word by word, in one word only, and only in a word
 * long enough to have one: "Aug rent" and "Jul rent" are two months, and
 * "Bar" and "Car" two places, though each pair is two letters apart.
 */
function sameShop(a: string, b: string): boolean {
  if (a.replace(/ /g, "") === b.replace(/ /g, "")) {
    return true;
  }

  const [short, long] = a.length <= b.length ? [a, b] : [b, a];

  if (short.length >= 4 && long.startsWith(`${short} `)) {
    return true;
  }

  const first = a.split(" ");
  const second = b.split(" ");

  if (first.length !== second.length) {
    return false;
  }

  const apart = first
    .map((word, index) => [word, second[index]])
    .filter(([one, other]) => one !== other);

  if (apart.length !== 1) {
    return false;
  }

  const [[one, other]] = apart;
  const shorter = Math.min(one.length, other.length);
  const slips = shorter >= 8 ? 2 : shorter >= 5 ? 1 : 0;

  return slips > 0 && distance(one, other, slips) <= slips;
}

/**
 * One shop written several ways, gathered into one question: case, accents
 * and spaces, a letter slipped, words added. Linked in chains, so "Leclerc",
 * "leclerc" and "Leclerc drive" make one question and not three.
 */
export function findNames(purchases: Expense[]): NamesCheck[] {
  const spellings = new Map<string, Spelling>();

  for (const expense of [...purchases].sort(newest)) {
    const title = expense.title.trim().replace(/\s+/g, " ");
    const spelling = spellings.get(title) ?? { title, ids: [] };

    spelling.ids.push(expense.id);
    spellings.set(title, spelling);
  }

  const all = [...spellings.values()];
  const folded = all.map((spelling) => foldTitle(spelling.title));
  const parent = all.map((_, index) => index);
  const root = (index: number): number =>
    parent[index] === index ? index : (parent[index] = root(parent[index]));

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (folded[i] === folded[j] || sameShop(folded[i], folded[j])) {
        parent[root(i)] = root(j);
      }
    }
  }

  const shops = new Map<number, Spelling[]>();

  all.forEach((spelling, index) => {
    shops.set(root(index), [...(shops.get(root(index)) ?? []), spelling]);
  });

  return [...shops.values()]
    .filter((shop) => shop.length > 1)
    .map((shop) => {
      const sorted = [...shop].sort((a, b) => b.ids.length - a.ids.length);

      return {
        kind: "names" as const,
        key: sorted.map((spelling) => spelling.title).sort().join("\n"),
        spellings: sorted,
      };
    })
    .sort((a, b) => count(b) - count(a));
}

function count(check: NamesCheck): number {
  return check.spellings.reduce((sum, spelling) => sum + spelling.ids.length, 0);
}

/**
 * The same purchase twice: same name, same figure and currency, same day,
 * same payer. The one entered later is offered for deleting.
 */
export function findDuplicates(purchases: Expense[]): DuplicateCheck[] {
  const seen = new Map<string, Expense[]>();

  for (const expense of purchases) {
    const twin = [
      foldTitle(expense.title),
      expense.amount,
      expense.currency,
      isoToDateInput(expense.expense_date),
      expense.paid_by_member_id,
    ].join("|");

    seen.set(twin, [...(seen.get(twin) ?? []), expense]);
  }

  const checks: DuplicateCheck[] = [];

  for (const same of seen.values()) {
    const entered = [...same].sort((a, b) => a.created_at.localeCompare(b.created_at));

    for (let index = 1; index < entered.length; index++) {
      checks.push({
        kind: "duplicate",
        key: [entered[index - 1].id, entered[index].id].sort().join(":"),
        first: entered[index - 1],
        second: entered[index],
      });
    }
  }

  return checks.sort((a, b) => newest(a.second, b.second));
}

/**
 * A purchase filed apart from where its name is filed three times in four,
 * or filed nowhere when its name always is somewhere.
 */
export function findCategories(purchases: Expense[]): CategoryCheck[] {
  const checks: CategoryCheck[] = [];

  for (const same of byName(purchases).values()) {
    const filed = new Map<string, number>();

    for (const expense of same) {
      if (expense.category_id) {
        filed.set(expense.category_id, (filed.get(expense.category_id) ?? 0) + 1);
      }
    }

    const [usual, times] = [...filed.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];

    if (times < ENOUGH || times / same.length < MOSTLY) {
      continue;
    }

    for (const expense of same) {
      if (expense.category_id !== usual) {
        checks.push({
          kind: "category",
          key: `${expense.id}:${expense.category_id ?? ""}`,
          expense,
          usual,
          times,
        });
      }
    }
  }

  return checks.sort((a, b) => newest(a.expense, b.expense));
}
