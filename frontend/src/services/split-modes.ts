/**
 * The three ways people say how an expense is shared, and the rule each writes.
 *
 * The stored model is an envelope and a remainder: powerful, and meaningless to
 * anyone filling in a shop. These are what people actually mean. This module is
 * the only place the two vocabularies meet.
 *
 * Pure on purpose. Reopening an expense reads its rule back as a mode, and
 * saving writes that mode back out as a rule; if the round trip is not exact,
 * simply reopening an expense and pressing save would move the money. That is
 * testable here, and only here.
 */

import { parseMoney } from "./format";
import type { SplitRule } from "../types";

export type Mode = "default" | "equal" | "exact" | "partial" | "custom";

/**
 * What the figures of `exact` are typed in.
 *
 * The two are one mode: "Antonin owes 5" and "Antonin owes 40%" are the same
 * sentence about the same person, and only the unit differs. The rule stores
 * them apart because they behave apart — one follows the amount, the other does
 * not — but nobody filling in an expense thinks of that as two decisions.
 */
export type Unit = "money" | "percent";

/** A whole, in hundredths of a percent. */
export const FULL_PERCENT = 10_000;

/** Everything the editor holds while a mode is being filled in. */
export interface ModeState {
  /** Who takes part. In `exact`, who is down for something. */
  participants: Set<string>;
  /** The amount shared up front, as typed, in `partial`. */
  envelopeInput: string;
  /** What each is down for, as typed, in `exact`. */
  amounts: Record<string, string>;
  /** What share each takes, as typed, when `exact` is in percent. */
  percents: Record<string, string>;
  /** Which of the two the figures of `exact` are in. */
  unit: Unit;
  /** Who takes what is left, in `partial`. Empty means whoever paid. */
  restTo: string;
  /** Who takes what is left, in `custom`. Empty means whoever paid. */
  takers: Set<string>;
  /** Everyone the expense could involve. */
  memberIds: string[];
}

/**
 * Read a stored rule back as the mode that would have written it.
 *
 * No rule is not an equal split: it is the absence of one, which sends the
 * expense to its category's rule, and that category's to the group's. Saying
 * "equal shares" there was a guess that came out wrong the moment the rule it
 * deferred to was anything else.
 *
 * The plain modes cannot say everything the model can — a rest split between
 * several people, or an amount and a share side by side. Those rules exist, and
 * reading one as something simpler would rewrite it the moment the expense was
 * saved again. They read as `custom`, which says the model in full.
 */
export function modeOf(rule: SplitRule | null): Mode {
  if (rule === null) {
    return "default";
  }

  const shares = Object.keys(rule.remainder?.percent ?? {});
  const amounts = Object.keys(rule.remainder?.fixed ?? {});

  // Amounts and shares side by side is more than any plain mode can say, and
  // reading it as either would drop the other.
  if (shares.length > 0 && amounts.length > 0) {
    return "custom";
  }

  // Nothing shared up front: the whole expense is what people are down for,
  // in one unit or the other.
  if (rule.envelope === 0) {
    return "exact";
  }

  // A share of what an envelope left is more than the plain modes can say.
  if (shares.length > 0) {
    return "custom";
  }

  const takers = rule.remainder?.members ?? [];
  const fixed = Object.keys(rule.remainder?.fixed ?? {});

  // Nothing shared up front, so the remainder never comes into play: whoever
  // it names would take a share of nothing. A null envelope with no exact
  // figures is a plain equal split, however its inert remainder happens to
  // read — and it always reads as the payer, because the backend pins them
  // onto every rule's remainder so "everyone" cannot draw in whoever joins
  // later. Requiring no takers here read that pinned payer as a "partial",
  // and reopening any equal split then landed on the wrong mode.
  if (rule.envelope == null && fixed.length === 0) {
    return "equal";
  }

  // From here an envelope is actually set. `partial` puts what is left on one
  // person and nothing else; anything more belongs to the full editor, or
  // saving would quietly drop it.
  if (takers.length <= 1 && fixed.length === 0) {
    return "partial";
  }

  return "custom";
}

/** Write a mode out as the rule the backend stores. */
export function ruleFor(mode: Mode, state: ModeState): SplitRule | null {
  // The only mode that writes nothing, and the only one that means to: an
  // expense with no rule takes its category's, a category with none the
  // group's.
  if (mode === "default") {
    return null;
  }

  if (mode === "equal") {
    // Spelled out even when it is everyone, which resolves the same as no rule
    // but does not mean it: this one says "equal shares, whatever the category
    // says", and it must survive being stored next to a category that says
    // otherwise.
    return {
      envelope: null,
      participants:
        state.participants.size === state.memberIds.length
          ? null
          : [...state.participants],
      remainder: {},
    };
  }

  if (mode === "exact") {
    return {
      envelope: 0,
      remainder:
        state.unit === "percent"
          ? { members: [...state.participants], percent: percentOf(state) }
          : { members: [...state.participants], fixed: fixedOf(state) },
    };
  }

  const envelope =
    state.envelopeInput.trim() === "" ? null : parseMoney(state.envelopeInput.trim());

  const participants =
    state.participants.size === state.memberIds.length
      ? null
      : [...state.participants];

  if (mode === "custom") {
    return {
      envelope,
      participants,
      remainder: {
        // Nobody ticked: whoever paid takes it, which the model says with null.
        members: state.takers.size === 0 ? null : [...state.takers],
        fixed: fixedOf(state, state.takers),
        // Written back untouched. The panel offers no way to type a share here
        // — the `percent` mode is where that lives — but a rule that arrived
        // with some keeps them: dropping what an editor cannot show is how a
        // save quietly rewrites what people owe.
        percent: percentOf(state, state.takers),
      },
    };
  }

  return {
    envelope,
    participants,
    // Nobody named: whoever paid takes it, which the model says with null.
    remainder: { members: state.restTo ? [state.restTo] : null, fixed: {} },
  };
}

/**
 * Fill the editor's state in from a rule, ready for its mode.
 *
 * The counterpart of `ruleFor`: together they are the round trip that reopening
 * an expense depends on.
 */
export function stateOf(
  rule: SplitRule | null,
  memberIds: string[],
  payerId: string | null,
): ModeState {
  const mode = modeOf(rule);

  // In `exact`, the ticks are who takes the remainder — which is the whole
  // expense here. An unset remainder does not mean nobody: it means whoever
  // paid, and reading it as an empty list would take the expense off them and
  // leave it on no one at all.
  const takers =
    rule?.remainder?.members ?? (payerId ? [payerId] : []);

  const participants =
    mode === "exact" ? new Set(takers) : new Set(rule?.participants ?? memberIds);

  return {
    participants,
    takers: new Set(takers),
    envelopeInput: rule?.envelope != null ? centsToText(rule.envelope) : "",
    amounts: Object.fromEntries(
      Object.entries(rule?.remainder?.fixed ?? {}).map(([id, amount]) => [
        id,
        centsToText(amount),
      ]),
    ),
    percents: Object.fromEntries(
      Object.entries(rule?.remainder?.percent ?? {}).map(([id, share]) => [
        id,
        percentToText(share),
      ]),
    ),
    // One taker is a person to name. Several is a shape this editor has no room
    // for, so the rest falls back to whoever paid — as `partial` reads it.
    restTo:
      mode === "partial" && rule?.remainder?.members?.length === 1
        ? rule.remainder.members[0]
        : payerId ?? "",
    // Whichever the rule was written in. A rule with neither is an equal split
    // dressed as `exact`, and money is the one to offer first.
    unit: Object.keys(rule?.remainder?.percent ?? {}).length > 0 ? "percent" : "money",
    memberIds,
  };
}

/** The amounts typed, kept only for whoever they can still apply to. */
function fixedOf(
  state: ModeState,
  among: Set<string> = state.participants,
): Record<string, number> {
  const fixed: Record<string, number> = {};

  for (const [memberId, value] of Object.entries(state.amounts)) {
    if (!among.has(memberId) || value.trim() === "") {
      continue;
    }

    const amount = parseMoney(value);

    if (amount !== null) {
      fixed[memberId] = amount;
    }
  }

  return fixed;
}

/** The shares typed, kept only for whoever they can still apply to. */
function percentOf(
  state: ModeState,
  among: Set<string> = state.participants,
): Record<string, number> {
  const percent: Record<string, number> = {};

  for (const [memberId, value] of Object.entries(state.percents)) {
    if (!among.has(memberId) || value.trim() === "") {
      continue;
    }

    const share = parsePercent(value);

    if (share !== null) {
      percent[memberId] = share;
    }
  }

  return percent;
}

/**
 * Read a share as hundredths of a percent.
 *
 * "33,33" becomes 3333. Never a float: a percentage of money is money, and
 * money that has been through a float is money nobody can add up.
 */
export function parsePercent(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");

  if (trimmed === "") {
    return null;
  }

  const share = Number(trimmed);

  if (!Number.isFinite(share)) {
    return null;
  }

  return Math.round(share * 100);
}

/** The other way round, for a field to hold. */
export function percentToText(share: number): string {
  // Whole percents are the common case and read better without the noise.
  return share % 100 === 0 ? String(share / 100) : (share / 100).toFixed(2);
}

/** Cents as a money input holds them. Local, so the round trip is closed. */
function centsToText(cents: number): string {
  return (cents / 100).toFixed(2);
}
