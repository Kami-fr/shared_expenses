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
 * Same shape as the envelope, one level down: a member with an amount takes
 * exactly that, the others share what is still left equally.
 */
function resolveRemainder(
  remainder: Remainder | undefined,
  left: number,
  payerId: string,
  pool: string[],
): Record<string, number> | null {
  const spec = remainder ?? {};
  const declared = spec.fixed ?? {};

  for (const [memberId, value] of Object.entries(declared)) {
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

  for (const memberId of members) {
    if (memberId in declared) {
      fixed[memberId] = declared[memberId];
    }
  }

  const fixedTotal = Object.values(fixed).reduce((sum, value) => sum + value, 0);

  if (fixedTotal > left) {
    return null;
  }

  const sharing = members.filter((memberId) => !(memberId in fixed));

  if (sharing.length === 0) {
    return fixedTotal === left ? fixed : null;
  }

  const shares: Record<string, number> = { ...fixed };

  for (const [memberId, share] of Object.entries(
    distribute(left - fixedTotal, sharing),
  )) {
    shares[memberId] = (shares[memberId] ?? 0) + share;
  }

  return shares;
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
