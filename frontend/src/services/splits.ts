/**
 * Split resolution, mirroring `helpers/splits.py`.
 *
 * The panel needs the resolved shares live, as the user types, so this has to
 * exist client side. It is a faithful port: the leftover cents go to the first
 * participants, exactly like the backend, so what the dialog shows is what gets
 * stored. `tests/parity` checks both against the same cases.
 */

import type { SplitRule } from "../types";

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

  const rule = input.rule ?? null;
  const fixed = rule?.fixed ?? {};

  for (const [memberId, value] of Object.entries(fixed)) {
    if (!pool.includes(memberId) || value < 0) {
      return null;
    }
  }

  if (rule?.cap != null && rule.cap < 0) {
    return null;
  }

  const fixedTotal = Object.values(fixed).reduce((sum, value) => sum + value, 0);
  const distributable = amount - fixedTotal;

  if (distributable < 0) {
    return null;
  }

  const participants =
    rule?.participants == null ? pool : [...new Set(rule.participants)];

  if (participants.some((memberId) => !pool.includes(memberId))) {
    return null;
  }

  let envelope = distributable;

  if (rule?.cap != null) {
    envelope = Math.min(envelope, rule.cap);
  }

  if (participants.length === 0) {
    envelope = 0;
  }

  const shares: Record<string, number> = { ...fixed };

  for (const [memberId, share] of Object.entries(distribute(envelope, participants))) {
    shares[memberId] = (shares[memberId] ?? 0) + share;
  }

  const surplus = distributable - envelope;

  if (surplus !== 0) {
    // RemainderTarget.PAYER is the only target the backend supports.
    shares[payerId] = (shares[payerId] ?? 0) + surplus;
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
