/**
 * Converting money in the panel, before the backend ever sees it.
 *
 * `tests/test_currency_parity.py` checks `convert` and `apportion` against the
 * Python side on generated cases. What is checked here is what parity cannot
 * see: the properties both sides could share and both get wrong, and the
 * reading of a typed rate, which only the panel does.
 */

import { describe, expect, it } from "vitest";

import {
  RATE_MAX,
  RATE_ONE,
  apportion,
  convert,
  formatRate,
  isValidRate,
  parseRate,
} from "../src/services/currency";

describe("convert", () => {
  it("rounds half up, in integers", () => {
    expect(convert(100, 876_810)).toBe(88);
    expect(convert(1, 500_000)).toBe(1);
    expect(convert(1, 499_999)).toBe(0);
  });

  it("refuses where the backend would", () => {
    expect(convert(-1, RATE_ONE)).toBeNull();
    expect(convert(1.5, RATE_ONE)).toBeNull();
    expect(convert(100, 0)).toBeNull();
    expect(convert(100, RATE_MAX + 1)).toBeNull();
  });
});

describe("apportion", () => {
  const sum = (shares: Record<string, number>) =>
    Object.values(shares).reduce((total, value) => total + value, 0);

  it("always adds up to the total it shares out", () => {
    const sets: Record<string, number>[] = [
      { a: 1 },
      { a: 1, b: 1 },
      { a: 1, b: 1, c: 1 },
      { a: 5, b: 3, c: 2 },
    ];

    for (const total of [0, 1, 2, 3, 100, 101, 9_999, 123_457]) {
      for (const amounts of sets) {
        const shares = apportion(amounts, total);

        expect(shares).not.toBeNull();
        expect(sum(shares!)).toBe(total);
      }
    }
  });

  it("keeps every share within a cent of its exact part", () => {
    const amounts = { a: 3333, b: 3333, c: 3334 };
    const shares = apportion(amounts, 1000)!;

    for (const [id, value] of Object.entries(amounts)) {
      expect(Math.abs(shares[id] - (value * 1000) / 10_000)).toBeLessThan(1);
    }
  });

  it("makes a refund the same trip the other way", () => {
    for (const total of [1, 3, 100, 101]) {
      const purchase = apportion({ a: 1, b: 2, c: 3 }, total)!;
      const refund = apportion({ a: -1, b: -2, c: -3 }, -total)!;

      for (const id of ["a", "b", "c"]) {
        expect(refund[id]).toBe(-purchase[id]);
      }
    }
  });

  it("refuses shares pulling against each other, or nothing to share by", () => {
    expect(apportion({ a: 1, b: -1 }, 10)).toBeNull();
    expect(apportion({ a: 1 }, -10)).toBeNull();
    expect(apportion({}, 10)).toBeNull();
    expect(apportion({ a: 0, b: 0 }, 10)).toBeNull();
  });
});

describe("rates", () => {
  it("reads a rate typed either way into millionths", () => {
    expect(parseRate("0,87681")).toBe(876_810);
    expect(parseRate("0.87681")).toBe(876_810);
    expect(parseRate("1")).toBe(RATE_ONE);
    expect(parseRate(".5")).toBe(500_000);
  });

  it("refuses a seventh digit rather than dropping it", () => {
    expect(parseRate("0.1234567")).toBeNull();
  });

  it("refuses what cannot be a rate", () => {
    expect(parseRate("")).toBeNull();
    expect(parseRate("0")).toBeNull();
    expect(parseRate("abc")).toBeNull();
    expect(parseRate("876810")).toBeNull();
    expect(isValidRate(RATE_MAX)).toBe(true);
    expect(isValidRate(RATE_MAX + 1)).toBe(false);
  });

  it("writes a rate back as it would be typed, and reads it again unchanged", () => {
    expect(formatRate(876_810)).toBe("0.87681");
    expect(formatRate(RATE_ONE)).toBe("1");

    for (const rate of [1, 876_810, RATE_ONE, 1_234_567, 20_000_000_000]) {
      expect(parseRate(formatRate(rate))).toBe(rate);
    }
  });
});
