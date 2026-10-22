/**
 * Reading a typed percentage, which only the split editor does.
 *
 * The round trip from rule to mode and back is checked from the Python side, in
 * `tests/test_split_modes.py`, against the real resolver. What is left is the
 * field itself: a share is held in hundredths of a percent, never as a float.
 */

import { describe, expect, it } from "vitest";

import { FULL_PERCENT, parsePercent, percentToText } from "../src/services/split-modes";

describe("parsePercent", () => {
  it("reads either decimal separator into hundredths", () => {
    expect(parsePercent("33,33")).toBe(3333);
    expect(parsePercent("33.33")).toBe(3333);
    expect(parsePercent("100")).toBe(FULL_PERCENT);
  });

  it("refuses an empty field or a word", () => {
    expect(parsePercent("")).toBeNull();
    expect(parsePercent("  ")).toBeNull();
    expect(parsePercent("abc")).toBeNull();
  });
});

describe("percentToText", () => {
  it("writes whole percents without the noise", () => {
    expect(percentToText(5000)).toBe("50");
    expect(percentToText(FULL_PERCENT)).toBe("100");
    expect(percentToText(3333)).toBe("33.33");
  });

  it("gives back every share a field can hold", () => {
    for (let share = 0; share <= FULL_PERCENT; share += 1) {
      expect(parsePercent(percentToText(share))).toBe(share);
    }
  });
});
