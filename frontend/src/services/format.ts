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

/**
 * Every way an amount might be typed when looking for it.
 *
 * Someone hunting a 3150,34 € line types "300", "3150,34" or "3 150,34" — and
 * none of those is a substring of the cents the row is actually stored as. The
 * formatted string is not enough on its own either: it separates thousands with
 * a non-breaking space, which no keyboard produces.
 */
export function moneyNeedles(
  cents: number,
  currency: string,
  language: string,
): string[] {
  const formatted = formatMoney(cents, currency, language);
  const plain = (cents / 100).toFixed(2);

  return [
    formatted,
    // The same, spelled with the space bar rather than with Intl's own.
    formatted.replace(/\s/gu, " "),
    plain,
    plain.replace(".", ","),
  ];
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
 *
 * `timeZone` is left out for a moment something happened — a revision is read
 * in the reader's own zone, as ADR-009 asks. A day somebody picked is passed
 * `"UTC"` instead, because that is the zone `dateToIso` wrote it in and the one
 * the backend counts it in.
 */
export function formatDayDate(iso: string, language: string, timeZone?: string): string {
  const formatted = new Intl.DateTimeFormat(language, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));

  // French yields a lowercase "lun." mid-sentence; this one opens a line.
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Format a `YYYY-MM` as a month, e.g. "Juil. 2026".
 *
 * Parsed by hand rather than through `new Date("2026-07")`: that reads as UTC
 * midnight, which lands in June for anyone west of Greenwich and would label
 * the month wrong.
 */
export function formatMonth(month: string, language: string): string {
  const [year, index] = month.split("-").map(Number);

  const formatted = new Intl.DateTimeFormat(language, {
    month: "short",
    year: "numeric",
  }).format(new Date(year, index - 1, 1));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Return today as `YYYY-MM-DD`, for date inputs. */
export function today(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Turn a `YYYY-MM-DD` input value into an ISO timestamp for the backend.
 *
 * Noon, and noon in UTC. The backend reads the calendar day straight off the
 * timestamp it stores — which month a statistic counts the expense in, which
 * day the exchange rate is asked for — so that day has to be the day that was
 * typed, wherever the household lives. Noon in local time carries an offset of
 * up to ±11:59 without changing day and then falls off the end: at UTC+13 an
 * Auckland household typing the 1st of January files it in December.
 */
export function dateToIso(value: string): string {
  return new Date(`${value}T12:00:00Z`).toISOString();
}

/**
 * Turn an ISO timestamp from the backend into a `YYYY-MM-DD` input value.
 *
 * Read in UTC, the zone `dateToIso` wrote the day in, so that reopening a
 * dialog offers back the day that was typed rather than the one after it.
 */
export function isoToDateInput(iso: string): string {
  const date = new Date(iso);
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/** Turn an amount in cents into a value for a money input. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Return what somebody goes by, in one word.
 *
 * For the places a name is a label rather than a sentence — a column beside a
 * figure, where a full name pushes the money about and says nothing the
 * household did not already know. The first word, because that is the one a
 * household uses.
 */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
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
 * Order things by name, the way the reader's own alphabet does.
 *
 * The backend hands its lists back `ORDER BY name`, which SQLite reads as raw
 * UTF-8 bytes: every lowercase name lands after every uppercase one, and every
 * accented name after both. A French household typing "Alimentation", "Zoo",
 * "restaurant" and "Épicerie" gets the last two filed below "Zoo", which is not
 * the alphabetical list the order claims to be — and six of the eight languages
 * the panel speaks produce accented names as a matter of course.
 *
 * `Intl.Collator` in the panel's language puts them back where they are looked
 * for. Sorted here rather than in SQL because SQLite has no locale-aware
 * collation to offer: `COLLATE NOCASE` folds ASCII and nothing else.
 */
export function sortByName<T extends { name: string }>(
  items: readonly T[],
  language: string,
): T[] {
  const collator = new Intl.Collator(language);

  return [...items].sort((left, right) => collator.compare(left.name, right.name));
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

/** Anything that can be given a colour, or has been given one already. */
export interface Colourable {
  id: string;
  color: string | null;
}

/**
 * The automatic colours of a set of things, each one different from the others.
 *
 * `colorFor` hashes an id into twelve colours, which is right for a member —
 * you meet them a few at a time, and the same face is always the same colour.
 * A group's categories are read as a set, side by side down a list and as the
 * wedges of one disc, and two of them landing on the same green happens by the
 * fourth or fifth by the birthday problem alone. There the colour is not
 * decoration, it is what tells the bread from the weekly shopping on a row too
 * narrow to write it, and two categories wearing one colour is the one thing it
 * must not do.
 *
 * A colour somebody chose is left exactly as it is and taken off the table, so
 * the automatic ones do not walk into it either.
 *
 * The automatic ones are dealt out in the order they were created — ids are
 * ULIDs, so sorting them is sorting by age — and each takes the colour its own
 * hash asks for, or the next one free. That keeps two promises at once: nearly
 * every category keeps the colour it already had, since only the ones that
 * collided move; and a category added today can never change the colour of one
 * that has been on screen for a year, because it is dealt last.
 *
 * Past the twelfth there is nothing left to be unique with, and the ones that
 * find nothing free fall back to their hash. Twelve categories in one household
 * is already more than the screen can tell apart.
 */
export function autoColors(items: readonly Colourable[]): Map<string, string> {
  const chosen = new Set(
    items.map((item) => item.color).filter((color) => color !== null),
  );

  const free = PALETTE.filter((color) => !chosen.has(color));
  const colours = new Map<string, string>();

  const automatic = items
    .filter((item) => item.color === null)
    .sort((left, right) => left.id.localeCompare(right.id));

  for (const item of automatic) {
    const wanted = colorFor(item.id);

    // From the colour its own hash asks for, then round the ring. Round `free`
    // and not the palette, so the search cannot land on something somebody
    // picked by hand — and starting from the wanted colour's place among what
    // is left keeps whatever spread the hash had.
    const start = free.findIndex((color) => PALETTE.indexOf(color) >= PALETTE.indexOf(wanted));
    const from = start === -1 ? 0 : start;

    const taken = new Set(colours.values());
    const found = free
      .slice(from)
      .concat(free.slice(0, from))
      .find((color) => !taken.has(color));

    colours.set(item.id, found ?? wanted);
  }

  return colours;
}

/**
 * The colour one of a set is drawn in: what was chosen, or what is left over.
 *
 * Memoised on the set it was asked about, because it is asked once a row and a
 * group's list runs to hundreds of them while its categories run to a dozen.
 * One entry is the whole cache: every caller in a single render passes the same
 * list, and the render after it passes the same list again.
 */
let lastItems = "";
let lastColours = new Map<string, string>();

export function colorOf(item: Colourable, within: readonly Colourable[]): string {
  if (item.color !== null) {
    return item.color;
  }

  const key = within.map((one) => `${one.id}:${one.color ?? ""}`).join("|");

  if (key !== lastItems) {
    lastItems = key;
    lastColours = autoColors(within);
  }

  // Not in the set it was asked about — a category deleted a moment ago, or one
  // still being typed into existence. Its own hash is the best there is.
  return lastColours.get(item.id) ?? colorFor(item.id);
}
