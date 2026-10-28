/**
 * The month laid out as a wall calendar, for the group page's other view.
 *
 * Days are `YYYY-MM-DD` strings throughout, the day somebody typed: read in
 * UTC off a stored timestamp, as `isoToDateInput` does, so a dinner typed on
 * the 18th sits on the 18th wherever the reader is.
 */

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

interface WeekInfo {
  firstDay: number;
}

/**
 * Which day a week opens on, 0 for Sunday as `Date.getDay` counts.
 *
 * Home Assistant's own setting first: a household that told it weeks start
 * on Monday means it here too. Otherwise the language's habit, which is
 * Sunday in American English and Monday nearly everywhere else.
 */
export function firstWeekday(language: string, setting?: string): number {
  const named = WEEKDAYS.indexOf(setting ?? "");

  if (named >= 0) {
    return named;
  }

  try {
    const locale = new Intl.Locale(language) as Intl.Locale & {
      getWeekInfo?: () => WeekInfo;
      weekInfo?: WeekInfo;
    };
    const info = locale.getWeekInfo?.() ?? locale.weekInfo;

    if (info) {
      return info.firstDay % 7;
    }
  } catch {
    // An unknown tag: fall through to the commonest answer.
  }

  return 1;
}

/**
 * The month's days in rows of seven, `null` before the first and after the
 * last so every row is whole and each day stands under its own weekday.
 */
export function monthGrid(month: string, firstDay: number): (string | null)[] {
  const [year, index] = month.split("-").map(Number);
  const opens = new Date(Date.UTC(year, index - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, index, 0)).getUTCDate();
  const cells: (string | null)[] = Array((opens - firstDay + 7) % 7).fill(null);

  for (let day = 1; day <= length; day++) {
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  }

  while (cells.length % 7) {
    cells.push(null);
  }

  return cells;
}

/** The weekdays' initials in the reader's language, in the order the grid uses. */
export function weekdayInitials(language: string, firstDay: number): string[] {
  const format = new Intl.DateTimeFormat(language, { weekday: "narrow", timeZone: "UTC" });

  // 2023-01-01 was a Sunday: day n after it is weekday n.
  return Array.from({ length: 7 }, (_, offset) =>
    format.format(new Date(Date.UTC(2023, 0, 1 + ((firstDay + offset) % 7)))),
  );
}

/** Today on the reader's own calendar, as a `YYYY-MM-DD`. */
export function localToday(now = new Date()): string {
  return [
    String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Which view the group page opens on, and whether the calendar shows the
 * reimbursements, remembered per browser.
 *
 * Display preferences, not group data, kept as the statistics keep their
 * chart: every access guarded, since a browser with storage disabled throws
 * outright, and forgetting costs one tap.
 */
const VIEW_KEY = "shared_expenses.view";
const PAYMENTS_KEY = "shared_expenses.calendar_payments";

export type ListView = "list" | "calendar";

export function readView(): ListView {
  try {
    return window.localStorage.getItem(VIEW_KEY) === "calendar" ? "calendar" : "list";
  } catch {
    return "list";
  }
}

export function rememberView(view: ListView): void {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Not being able to remember is not worth breaking the page over.
  }
}

export function readPaymentsShown(): boolean {
  try {
    return window.localStorage.getItem(PAYMENTS_KEY) !== "0";
  } catch {
    return true;
  }
}

export function rememberPaymentsShown(shown: boolean): void {
  try {
    window.localStorage.setItem(PAYMENTS_KEY, shown ? "1" : "0");
  } catch {
    // As above.
  }
}
