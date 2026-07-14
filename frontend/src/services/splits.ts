/**
 * Split resolution, mirroring `helpers/splits.py`.
 *
 * The panel needs the resolved shares live, as the user types, so this has to
 * exist client side. It is a faithful port: the leftover cents go to the first
 * members, exactly like the backend, so what the dialog shows is what gets
 * stored. The parity harness checks both against the same cases.
 */

import type { Remainder, SplitRule } from "../types";

export interface ResolveInput {
  /** In cents. */
  amount: number;
  payerId: string;
  /** The pool the expense may be split between, in display order. */
  memberIds: string[];
  rule?: SplitRule | null;
}

/**
 * Resolve a rule into absolute shares in cents.
 *
 * Returns only non-zero shares, always adding up to `amount`. Returns null when
 * the rule cannot be resolved, rather than throwing: the caller is a dialog
 * showing a live preview of half-typed input.
 */
export function resolveShares(input: ResolveInput): Record<string, number> | null {
  const { amount, payerId, memberIds } = input;

  if (!Number.isInteger(amount) || amount <= 0) {
    return null;
  }

  const pool = [...new Set(memberIds)];

  if (pool.length === 0 || !pool.includes(payerId)) {
    return null;
  }

  const rule = input.rule ?? {};

  const envelope = resolveEnvelope(rule, amount);

  if (envelope === null) {
    return null;
  }

  const participants =
    rule.participants == null ? pool : [...new Set(rule.participants)];

  if (participants.some((id) => !pool.includes(id))) {
    return null;
  }

  const shared = participants.length === 0 ? 0 : envelope;
  const shares = distribute(shared, participants);

  const left = amount - shared;

  if (left > 0) {
    const rest = resolveRemainder(rule.remainder, left, payerId, pool);

    if (rest === null) {
      return null;
    }

    for (const [memberId, share] of Object.entries(rest)) {
      shares[memberId] = (shares[memberId] ?? 0) + share;
    }
  }

  const resolved: Record<string, number> = {};

  for (const [memberId, value] of Object.entries(shares)) {
    if (value !== 0) {
      resolved[memberId] = value;
    }
  }

  const total = Object.values(resolved).reduce((sum, value) => sum + value, 0);

  return total === amount ? resolved : null;
}

/** No envelope means the whole expense: the plain equal split. */
function resolveEnvelope(rule: SplitRule, amount: number): number | null {
  if (rule.envelope == null) {
    return amount;
  }

  if (rule.envelope < 0) {
    return null;
  }

  return Math.min(rule.envelope, amount);
}

/**
 * Return what each member owes out of what the envelope left behind.
 *
 * Same shape as the envelope, one level down. A member is written down for an
 * amount, or for a share of what is left, or for neither — and those left take
 * an equal part of whatever the first two did not claim.
 */
/** A whole, in hundredths of a percent. */
const FULL_PERCENT = 10_000;

function resolveRemainder(
  remainder: Remainder | undefined,
  left: number,
  payerId: string,
  pool: string[],
): Record<string, number> | null {
  const spec = remainder ?? {};
  const declaredFixed = spec.fixed ?? {};
  const declaredPercent = spec.percent ?? {};

  for (const [memberId, value] of Object.entries(declaredFixed)) {
    if (!pool.includes(memberId) || value < 0) {
      return null;
    }
  }

  for (const [memberId, value] of Object.entries(declaredPercent)) {
    if (!pool.includes(memberId) || value < 0) {
      return null;
    }
  }

  // Nobody named: the one who paid carries what is left.
  const members =
    spec.members == null ? [payerId] : [...new Set(spec.members)];

  if (members.length === 0 || members.some((id) => !pool.includes(id))) {
    return null;
  }

  const fixed: Record<string, number> = {};
  const percent: Record<string, number> = {};

  for (const memberId of members) {
    if (memberId in declaredFixed) {
      fixed[memberId] = declaredFixed[memberId];
    }

    if (memberId in declaredPercent) {
      percent[memberId] = declaredPercent[memberId];
    }
  }

  // Which of the two would win is a question with no honest answer.
  if (Object.keys(fixed).some((memberId) => memberId in percent)) {
    return null;
  }

  const percentTotal = Object.values(percent).reduce((sum, value) => sum + value, 0);

  if (percentTotal > FULL_PERCENT) {
    return null;
  }

  // Both come out of what the envelope left, so a share means a share of that
  // — not of what the fixed amounts happen to leave behind.
  const fromPercent: Record<string, number> = {};

  for (const [memberId, value] of Object.entries(percent)) {
    fromPercent[memberId] = Math.floor((left * value) / FULL_PERCENT);
  }

  const fixedTotal = Object.values(fixed).reduce((sum, value) => sum + value, 0);
  const claimed =
    fixedTotal + Object.values(fromPercent).reduce((sum, value) => sum + value, 0);

  if (claimed > left) {
    return null;
  }

  const shares: Record<string, number> = { ...fixed, ...fromPercent };

  const sharing = members.filter(
    (memberId) => !(memberId in fixed) && !(memberId in percent),
  );

  const rest = left - claimed;

  if (sharing.length > 0) {
    for (const [memberId, share] of Object.entries(distribute(rest, sharing))) {
      shares[memberId] = (shares[memberId] ?? 0) + share;
    }

    return shares;
  }

  if (rest === 0) {
    return shares;
  }

  // Nobody is left to take what the flooring lost. Shares claiming the whole of
  // it own those cents; anything else simply does not add up.
  if (percentTotal === FULL_PERCENT && Object.keys(percent).length > 0) {
    for (const [memberId, share] of Object.entries(
      distribute(rest, Object.keys(fromPercent)),
    )) {
      shares[memberId] = (shares[memberId] ?? 0) + share;
    }

    return shares;
  }

  return null;
}

/**
 * Split an amount as evenly as possible.
 *
 * The extra cents go to the first members, which is what the backend does.
 */
function distribute(amount: number, memberIds: string[]): Record<string, number> {
  if (amount <= 0 || memberIds.length === 0) {
    return {};
  }

  const base = Math.floor(amount / memberIds.length);
  const extra = amount % memberIds.length;

  const shares: Record<string, number> = {};

  memberIds.forEach((memberId, index) => {
    shares[memberId] = base + (index < extra ? 1 : 0);
  });

  return shares;
}
