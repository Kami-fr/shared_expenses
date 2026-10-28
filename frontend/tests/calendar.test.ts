/**
 * The month as a wall calendar: which weekday each day stands under.
 *
 * A grid shifted by one puts every expense under the wrong weekday and still
 * looks like a calendar, so the shapes are pinned on months whose first day
 * is known.
 */

import { describe, expect, it } from "vitest";

import {
  firstWeekday,
  localToday,
  monthGrid,
  weekdayInitials,
} from "../src/services/calendar";

describe("monthGrid", () => {
  it("puts 1 October 2026, a Thursday, fourth in a week opening on Monday", () => {
    const grid = monthGrid("2026-10", 1);

    expect(grid.slice(0, 4)).toEqual([null, null, null, "2026-10-01"]);
    expect(grid).toHaveLength(35);
    expect(grid.at(-1)).toBeNull();
    expect(grid.filter(Boolean)).toHaveLength(31);
  });

  it("moves it one along when the week opens on Sunday", () => {
    expect(monthGrid("2026-10", 0).indexOf("2026-10-01")).toBe(4);
  });

  it("opens a month on its first cell when the week does", () => {
    // 1 February 2026 is a Sunday.
    expect(monthGrid("2026-02", 0)[0]).toBe("2026-02-01");
    expect(monthGrid("2026-02", 0)).toHaveLength(28);
    expect(monthGrid("2026-02", 1).indexOf("2026-02-01")).toBe(6);
  });

  it("knows a leap February", () => {
    expect(monthGrid("2028-02", 1).filter(Boolean).at(-1)).toBe("2028-02-29");
  });
});

describe("firstWeekday", () => {
  it("takes Home Assistant's setting over the language", () => {
    expect(firstWeekday("en", "monday")).toBe(1);
    expect(firstWeekday("fr", "sunday")).toBe(0);
    expect(firstWeekday("de", "saturday")).toBe(6);
  });

  it("follows the language when the setting says to", () => {
    expect(firstWeekday("fr", "language")).toBe(1);
    expect(firstWeekday("en")).toBe(0);
  });

  it("opens on Monday for a tag it cannot read", () => {
    expect(firstWeekday("not a language")).toBe(1);
  });
});

describe("weekdayInitials", () => {
  it("names the columns in the grid's order", () => {
    expect(weekdayInitials("fr", 1)).toEqual(["L", "M", "M", "J", "V", "S", "D"]);
    expect(weekdayInitials("en", 0)).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
  });
});

describe("localToday", () => {
  it("reads the reader's own calendar, not UTC's", () => {
    expect(localToday(new Date(2026, 9, 23, 23, 30))).toBe("2026-10-23");
    expect(localToday(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });
});
