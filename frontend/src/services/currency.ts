/**
 * Converting money, without ever leaving the integers.
 *
 * A mirror of `helpers/currency.py`, line for line, and checked against it: the
 * panel shows what an expense comes to before it is saved, and the backend
 * stores it. If the two disagree by a cent, the figure someone accepted is not
 * the figure that lands in the balances.
 *
 * A float would be close enough for a weather forecast and not for this.
 */

/** A rate of one, in millionths. 0.87681 is 876_810. */
export const RATE_ONE = 1_000_000;

/**
 * The most a rate can be, so a typo cannot turn 5 EUR into a fortune.
 *
 * A hundred thousand units per unit. Wide enough for every pair the list below
 * offers — a group counting in rupiah asks some twenty thousand of them for a
 * pound, and a ceiling under that would leave that group unable to record a
 * foreign expense at all, by hand or by fetched rate. Narrow enough to still
 * catch the typo it is here for: a rate pasted in millionths, 876810 for
 * 0,87681, is refused as it always was.
 */
export const RATE_MAX = RATE_ONE * 100_000;

/**
 * The currencies the European Central Bank publishes, which is what the rate
 * service serves.
 *
 * Held here rather than fetched: the list changes about once a decade, and one
 * more network call on every dialog to learn what everybody already knows is
 * not a trade worth making. A currency it does not list simply cannot be had a
 * rate for, so offering it would be offering a dead end.
 */
export const CURRENCIES = [
  "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP",
  "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR",
  "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD",
  "ZAR",
];

/** Whether this could be a rate at all. */
export function isValidRate(rate: number): boolean {
  return Number.isInteger(rate) && rate > 0 && rate <= RATE_MAX;
}

/**
 * Return `amount` at `rate`, in the cents of the other currency.
 *
 * Rounded half up, in integers: adding half a millionth before the floor is the
 * same as rounding, without a float ever being involved. `Math.round` would not
 * do either — it rounds .5 away from zero for positives, which happens to agree
 * here, but on a value already through a float division the half is not a half
 * any more.
 *
 * Returns null where the backend would refuse.
 */
export function convert(amount: number, rate: number): number | null {
  if (!Number.isInteger(amount) || amount < 0 || !isValidRate(rate)) {
    return null;
  }

  return Math.floor((amount * rate + RATE_ONE / 2) / RATE_ONE);
}

/**
 * Return `total`, divided in the same proportions as `amounts`.
 *
 * A mirror of `apportion` in `helpers/currency.py`, and checked against it. The
 * panel needs it to open a refund on the split the purchase was borne under: 40
 * shared 30/10 and 20 given back is 15/5, whatever produced the 30/10 in the
 * first place — which is why this reads the shares rather than the rule that made
 * them. A refund of the whole thing comes back to exactly the original shares.
 *
 * Divided exactly: the cents that flooring leaves over go to the largest
 * remainders first, and a tie between those starts on the member the total points
 * at rather than on the first, so the same expense always resolves the same way
 * without one member bearing every odd cent. Same rotation as the split resolver,
 * same reason.
 *
 * Returns null where the backend would refuse, rather than throwing: the caller
 * is a dialog showing a live preview of half-typed input.
 */
export function apportion(
  amounts: Record<string, number>,
  total: number,
): Record<string, number> | null {
  const entries = Object.entries(amounts);

  if (entries.length === 0 || !Number.isInteger(total)) {
    return null;
  }

  if (entries.some(([, value]) => !Number.isInteger(value))) {
    return null;
  }

  // A refund makes the whole trip the other way, shares and total together. Two
  // pulling against each other is a caller that has lost track of which way the
  // money went, not a rounding question. A refund too small to convert to a cent
  // still went that way, so a zero total between negative shares goes round too.
  if (total < 0 || (total === 0 && entries.some(([, value]) => value < 0))) {
    if (entries.some(([, value]) => value > 0)) {
      return null;
    }

    const mirrored = apportion(
      Object.fromEntries(entries.map(([id, value]) => [id, -value])),
      -total,
    );

    if (mirrored === null) {
      return null;
    }

    return Object.fromEntries(
      Object.entries(mirrored).map(([id, value]) => [id, -value]),
    );
  }

  if (entries.some(([, value]) => value < 0)) {
    return null;
  }

  const whole = entries.reduce((sum, [, value]) => sum + value, 0);

  if (whole <= 0) {
    return null;
  }

  const count = entries.length;

  // Which member a tie starts on: the quotient, exactly as the backend does it.
  // Python's % is never negative and JavaScript's can be, hence the + count.
  const start = Math.floor(total / count) % count;

  const shares: Record<string, number> = {};

  entries.forEach(([id, value]) => {
    shares[id] = Math.floor((value * total) / whole);
  });

  const left =
    total - Object.values(shares).reduce((sum, value) => sum + value, 0);

  // Built by map and sorted in one breath, so the harness that strips the types
  // out of this file has no annotation of its own to understand here.
  const ranked = entries
    .map(([id, value], index) => ({
      id,
      remainder: (value * total) % whole,
      rank: (index - start + count) % count,
    }))
    .sort((a, b) => b.remainder - a.remainder || a.rank - b.rank);

  for (const { id } of ranked.slice(0, left)) {
    shares[id] += 1;
  }

  return shares;
}

/**
 * Read a rate typed as "0,87681" into millionths.
 *
 * Parsed by hand rather than through parseFloat: 0.1 is not 0.1 in binary, and
 * a rate that arrives a millionth short quietly costs somebody a cent.
 */
export function parseRate(value: string): number | null {
  const text = value.trim().replace(",", ".");

  if (!text) {
    return null;
  }

  const match = /^(\d*)(?:\.(\d*))?$/.exec(text);

  if (!match) {
    return null;
  }

  const [, whole, fraction = ""] = match;

  if (!whole && !fraction) {
    return null;
  }

  // Six digits, no more: a seventh would be silently dropped.
  if (fraction.length > 6) {
    return null;
  }

  const scaled =
    Number(whole || "0") * RATE_ONE + Number(fraction.padEnd(6, "0") || "0");

  return isValidRate(scaled) ? scaled : null;
}

/** Return a rate as it would be typed. */
export function formatRate(rate: number): string {
  const whole = Math.floor(rate / RATE_ONE);
  const fraction = rate % RATE_ONE;

  if (fraction === 0) {
    return String(whole);
  }

  return `${whole}.${String(fraction).padStart(6, "0")}`.replace(/0+$/, "");
}
