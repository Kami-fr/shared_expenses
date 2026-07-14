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

/** The most a rate can be, so a typo cannot turn 5 EUR into a fortune. */
export const RATE_MAX = RATE_ONE * 10_000;

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
