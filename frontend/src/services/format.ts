/** Formatting helpers. Amounts are handled in cents everywhere. */

/** Format an amount in cents, e.g. 8542 -> "85,42 €". */
export function formatMoney(cents: number, currency: string, language: string): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Format an amount in cents with an explicit sign, for balances. */
export function formatSignedMoney(
  cents: number,
  currency: string,
  language: string,
): string {
  const formatted = formatMoney(Math.abs(cents), currency, language);

  if (cents > 0) {
    return `+${formatted}`;
  }

  return cents < 0 ? `-${formatted}` : formatted;
}

/** Parse a typed amount into cents. Accepts "12", "12.5", "12,50". */
export function parseMoney(value: string): number | null {
  const normalized = value.trim().replace(",", ".").replace(/\s/g, "");

  if (normalized === "" || !/^-?\d*\.?\d*$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (Number.isNaN(amount)) {
    return null;
  }

  // Round to avoid 12.29 * 100 landing on 1228.9999.
  return Math.round(amount * 100);
}

/**
 * Format an ISO date with its weekday, e.g. "Lun. 15 juil. 2026".
 *
 * Which day of the week it was is what tells a Saturday shop from a Monday one
 * at a glance, and no amount of staring at "15 juil." gives you that.
 */
export function formatDayDate(iso: string, language: string): string {
  const formatted = new Intl.DateTimeFormat(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

  // French yields a lowercase "lun." mid-sentence; this one opens a line.
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Return today as `YYYY-MM-DD`, for date inputs. */
export function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/** Turn a `YYYY-MM-DD` input value into an ISO timestamp for the backend. */
export function dateToIso(value: string): string {
  return new Date(`${value}T12:00:00`).toISOString();
}

/** Turn an ISO timestamp from the backend into a `YYYY-MM-DD` input value. */
export function isoToDateInput(iso: string): string {
  const date = new Date(iso);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Turn an amount in cents into a value for a money input. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Return the initials shown in a member avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The colours offered, and drawn from when nobody picked one.
 *
 * Muted on purpose: these sit behind white initials on both a light and a dark
 * theme, so they cannot be as bright as the palette a chart would use.
 */
export const PALETTE = [
  "#3f7cac",
  "#c05746",
  "#4a7c59",
  "#8b5fbf",
  "#c98b3e",
  "#3d7e7e",
  "#b0567a",
  "#5c6b8a",
  "#7a5c3d",
  "#4a5f8a",
  "#8a4a6b",
  "#5f7a3d",
];

/** Pick a stable colour for whoever has not chosen one. */
export function colorFor(id: string): string {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}
