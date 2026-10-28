/**
 * What a new expense is probably called, from what the group already calls
 * its expenses.
 *
 * Typing "leclerc" once, "Leclerc" the next week and "Lecelrc" in a hurry
 * makes three shops of one: the statistics count them apart and the search
 * finds one of the three. Offering the name already in use while it is being
 * typed keeps the one spelling in the first place.
 */

import type { Expense } from "../types";

export interface TitleSuggestion {
  title: string;
  /** How many expenses already carry it, in any of its spellings. */
  count: number;
  /** The category it was filed under last time, if any. */
  categoryId: string | null;
}

/** How many letters are typed before anything is offered. */
const FROM = 2;

/**
 * A title reduced to what a person means by it: no case, no accents, single
 * spaces. "  LECLERC " and "leclerc" are one shop; "Électricité" and
 * "electricite" one bill.
 */
export function foldTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The names worth offering for what is typed, best first: those starting with
 * it before those holding it further in, then the most used, then the most
 * recent. Nothing until a couple of letters are in, and nothing once the
 * typed name is already one of them: it has been found.
 *
 * Each name is written the way it is written most often, and carries the
 * category of its latest use. Refunds are left out: "Retour Decathlon" is not
 * what anybody means to type when buying.
 */
export function suggestTitles(
  expenses: Expense[],
  typed: string,
  limit = 3,
): TitleSuggestion[] {
  const needle = foldTitle(typed);

  if (needle.length < FROM) {
    return [];
  }

  interface Name {
    spellings: Map<string, number>;
    count: number;
    latest: Expense;
  }

  const names = new Map<string, Name>();

  for (const expense of expenses) {
    if (expense.amount < 0) {
      continue;
    }

    const key = foldTitle(expense.title);
    const name = names.get(key) ?? { spellings: new Map(), count: 0, latest: expense };
    const spelling = expense.title.trim().replace(/\s+/g, " ");

    name.spellings.set(spelling, (name.spellings.get(spelling) ?? 0) + 1);
    name.count += 1;

    if (expense.expense_date > name.latest.expense_date) {
      name.latest = expense;
    }

    names.set(key, name);
  }

  if (names.has(needle)) {
    return [];
  }

  return [...names.entries()]
    .filter(([key]) => key.includes(needle))
    .sort(
      ([a, first], [b, second]) =>
        Number(b.startsWith(needle)) - Number(a.startsWith(needle)) ||
        second.count - first.count ||
        second.latest.expense_date.localeCompare(first.latest.expense_date),
    )
    .slice(0, limit)
    .map(([, name]) => ({
      title: [...name.spellings.entries()].sort((a, b) => b[1] - a[1])[0][0],
      count: name.count,
      categoryId: name.latest.category_id ?? null,
    }));
}

/**
 * Where what was typed sits in a title, as [before, match, after], so the
 * part typed can be drawn apart. Found on the folded title, which is as long
 * as the title character for character for every letter a title is written
 * in here; when it is not, the title comes back whole.
 */
export function splitOnMatch(title: string, typed: string): [string, string, string] {
  const folded = [...title].map((letter) => foldTitle(letter) || letter).join("");
  const needle = foldTitle(typed);
  const at = folded.toLowerCase().indexOf(needle);

  if (at < 0 || folded.length !== title.length) {
    return [title, "", ""];
  }

  return [title.slice(0, at), title.slice(at, at + needle.length), title.slice(at + needle.length)];
}
