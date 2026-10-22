/**
 * Which months the statistics are read over, and what they are compared with.
 *
 * The page opens on a month and steps through them, compares each with the one
 * before, and draws a year around it. Every one of those is a question about
 * calendar arithmetic on strings, which is where an off-by-one lives quietly.
 */

import { describe, expect, it } from "vitest";

import {
  addMonths,
  averageOf,
  change,
  inPeriod,
  monthOf,
  monthsBetween,
  openingPeriod,
  periodSpan,
  stepPeriod,
  totalOf,
  trendWindow,
} from "../src/services/statistics-period";
import type { MonthTotal } from "../src/types";

/** July to October 2026, with August spent in and nothing in September. */
const MONTHS: MonthTotal[] = [
  { month: "2025-11", total: 1000 },
  { month: "2026-07", total: 4000 },
  { month: "2026-08", total: 2000 },
  { month: "2026-10", total: 3000 },
];

describe("addMonths and monthsBetween", () => {
  it("crosses a year either way", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2025-12", 1)).toBe("2026-01");
    expect(addMonths("2026-10", -22)).toBe("2024-12");
    expect(addMonths("2026-10", 0)).toBe("2026-10");
  });

  it("counts both ends", () => {
    expect(monthsBetween("2026-10", "2026-10")).toBe(1);
    expect(monthsBetween("2025-11", "2026-10")).toBe(12);
  });
});

describe("monthOf", () => {
  it("files a typed day in its own month, as the backend does", () => {
    expect(monthOf("2026-10-31T12:00:00+00:00")).toBe("2026-10");
    expect(monthOf("2026-11-01T12:00:00Z")).toBe("2026-11");
  });

  it("reads an offset the way the stored instant falls in UTC", () => {
    expect(monthOf("2026-11-01T00:30:00+02:00")).toBe("2026-10");
  });
});

describe("openingPeriod", () => {
  it("opens on the last month anything was spent in", () => {
    expect(openingPeriod(MONTHS)).toEqual({ kind: "month", month: "2026-10" });
  });

  it("opens on everything when nothing was ever spent", () => {
    expect(openingPeriod([])).toEqual({ kind: "all" });
  });
});

describe("stepPeriod", () => {
  it("steps through an empty month rather than over it", () => {
    expect(stepPeriod({ kind: "month", month: "2026-10" }, -1, MONTHS, [])).toEqual({
      kind: "month",
      month: "2026-09",
    });
  });

  it("stops at the first and the last month spent in", () => {
    expect(stepPeriod({ kind: "month", month: "2026-10" }, 1, MONTHS, [])).toBeNull();
    expect(stepPeriod({ kind: "month", month: "2025-11" }, -1, MONTHS, [])).toBeNull();
  });

  it("steps through the years that hold an expense, whatever order they come in", () => {
    const years = [2026, 2025];

    expect(stepPeriod({ kind: "year", year: 2026 }, -1, MONTHS, years)).toEqual({
      kind: "year",
      year: 2025,
    });
    expect(stepPeriod({ kind: "year", year: 2026 }, 1, MONTHS, years)).toBeNull();
  });

  it("does not step from everything", () => {
    expect(stepPeriod({ kind: "all" }, -1, MONTHS, [2026])).toBeNull();
  });
});

describe("what a period covers", () => {
  it("knows its own months", () => {
    expect(inPeriod("2026-07", { kind: "month", month: "2026-07" })).toBe(true);
    expect(inPeriod("2026-08", { kind: "month", month: "2026-07" })).toBe(false);
    expect(inPeriod("2026-08", { kind: "year", year: 2026 })).toBe(true);
    expect(inPeriod("2025-11", { kind: "year", year: 2026 })).toBe(false);
    expect(inPeriod("2025-11", { kind: "all" })).toBe(true);
  });

  it("averages a year over the months the group existed in it", () => {
    expect(periodSpan({ kind: "year", year: 2025 }, MONTHS)).toBe(2);
    expect(periodSpan({ kind: "year", year: 2026 }, MONTHS)).toBe(10);
    expect(periodSpan({ kind: "all" }, MONTHS)).toBe(12);
    expect(periodSpan({ kind: "month", month: "2026-10" }, MONTHS)).toBe(1);
  });
});

describe("change", () => {
  it("is a fraction of what came before", () => {
    expect(change(1500, 1000)).toBe(0.5);
    expect(change(500, 1000)).toBe(-0.5);
  });

  it("has nothing to say against nothing, or against a refunded month", () => {
    expect(change(1000, 0)).toBeNull();
    expect(change(1000, -200)).toBeNull();
  });

  it("compares with the month before even when nobody spent in it", () => {
    expect(totalOf(MONTHS, addMonths("2026-10", -1))).toBe(0);
    expect(change(totalOf(MONTHS, "2026-10"), totalOf(MONTHS, "2026-09"))).toBeNull();
  });
});

describe("trendWindow", () => {
  it("draws the year up to the last month spent in, empty months at zero", () => {
    const window = trendWindow(MONTHS, { kind: "month", month: "2026-10" });

    expect(window).toHaveLength(12);
    expect(window[0]).toEqual({ month: "2025-11", total: 1000 });
    expect(window.find((item) => item.month === "2026-09")).toEqual({ month: "2026-09", total: 0 });
    expect(window.at(-1)).toEqual({ month: "2026-10", total: 3000 });
  });

  it("never starts before the first expense", () => {
    const young: MonthTotal[] = [
      { month: "2026-07", total: 100 },
      { month: "2026-10", total: 300 },
    ];

    expect(trendWindow(young, { kind: "all" }).map((item) => item.month)).toEqual([
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ]);
  });

  it("moves back to hold a month older than the last year", () => {
    const long: MonthTotal[] = [
      { month: "2024-01", total: 100 },
      { month: "2026-10", total: 300 },
    ];
    const window = trendWindow(long, { kind: "month", month: "2024-03" });

    // The year starting on it: the month asked for is on screen, at its edge.
    expect(window[0].month).toBe("2024-03");
    expect(window.at(-1)?.month).toBe("2025-02");
    expect(window).toHaveLength(12);
  });

  it("draws a past year as itself", () => {
    const window = trendWindow(MONTHS, { kind: "year", year: 2025 });

    expect(window.map((item) => item.month)).toEqual(["2025-11", "2025-12"]);
  });

  it("is empty when nothing was ever spent", () => {
    expect(trendWindow([], { kind: "all" })).toEqual([]);
  });
});

describe("averageOf", () => {
  it("counts an empty month as the zero it is", () => {
    expect(averageOf([{ month: "a", total: 3000 }, { month: "b", total: 0 }])).toBe(1500);
    expect(averageOf([])).toBe(0);
  });
});
