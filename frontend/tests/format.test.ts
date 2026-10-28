/**
 * What the panel shows a figure as, and reads a typed one back as.
 *
 * Every bug that reached a user lived in the panel, where neither `tsc` nor the
 * Python suite looks: "85,42" was French in every language for months. These
 * are the helpers that turn money, dates and names into what is on screen, and
 * they are pure, so they are checked here rather than by eye.
 *
 * Intl output differs by a space here and there between ICU versions, so
 * formatted strings are compared with every kind of space made plain.
 */

import { describe, expect, it } from "vitest";

import {
  PALETTE,
  autoColors,
  centsToInput,
  colorFor,
  colorOf,
  dateToIso,
  firstName,
  formatClock,
  formatClockRange,
  formatDayDate,
  formatJournalDay,
  formatMoney,
  formatMoneyRange,
  formatMonth,
  formatMonthLong,
  formatNumericDay,
  formatSignedMoney,
  initials,
  isoToDateInput,
  moneyNeedles,
  parseMoney,
  sortByName,
  typedExample,
} from "../src/services/format";

const plain = (text: string) => text.replace(/\s/gu, " ");

describe("parseMoney", () => {
  it("reads either decimal separator", () => {
    expect(parseMoney("12")).toBe(1200);
    expect(parseMoney("12.5")).toBe(1250);
    expect(parseMoney("12,50")).toBe(1250);
  });

  it("reads a thousands space, the one a keyboard and Intl both write", () => {
    expect(parseMoney(" 1 234,56 ")).toBe(123456);
    expect(parseMoney("1 234,56")).toBe(123456);
  });

  it("does not land a cent short through a float", () => {
    // Each of these times 100 is a hair under the whole number in binary.
    expect(parseMoney("0.29")).toBe(29);
    expect(parseMoney("1,15")).toBe(115);
    expect(parseMoney("4.35")).toBe(435);
  });

  it("refuses what it cannot read rather than guessing", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    // Two separators: 1,234.56 or 1.234,56 — neither is taken for a figure.
    expect(parseMoney("1,234.56")).toBeNull();
  });

  it("gives back every cent a money input can hold", () => {
    for (let cents = 0; cents <= 100_000; cents += 7) {
      expect(parseMoney(centsToInput(cents, "en"))).toBe(cents);
      expect(parseMoney(centsToInput(cents, "fr"))).toBe(cents);
    }
  });
});

describe("centsToInput", () => {
  it("writes two decimals, in the reader's separator and no grouping", () => {
    expect(centsToInput(8542, "en")).toBe("85.42");
    expect(centsToInput(5, "en")).toBe("0.05");
    expect(centsToInput(0, "en")).toBe("0.00");
    expect(centsToInput(13460, "fr")).toBe("134,60");
    expect(centsToInput(120000, "fr")).toBe("1200,00");
    expect(centsToInput(120000, "de")).toBe("1200,00");
  });
});

describe("typedExample", () => {
  it("writes the reader's own decimal separator", () => {
    expect(typedExample(85.42, 2, "en")).toBe("85.42");
    expect(typedExample(85.42, 2, "fr")).toBe("85,42");
    expect(typedExample(0.87681, 5, "de")).toBe("0,87681");
    expect(typedExample(5, 2, "pt-BR")).toBe("5,00");
  });

  it("never groups thousands, which nobody types", () => {
    expect(typedExample(1234.5, 2, "en")).toBe("1234.50");
    expect(typedExample(1234.5, 2, "fr")).toBe("1234,50");
  });
});

describe("formatMoney and formatSignedMoney", () => {
  it("writes cents as the language writes money", () => {
    expect(plain(formatMoney(8542, "EUR", "en"))).toBe("€85.42");
    expect(plain(formatMoney(8542, "EUR", "fr"))).toBe("85,42 €");
  });

  it("signs a balance both ways, and zero neither", () => {
    expect(plain(formatSignedMoney(8542, "EUR", "en"))).toBe("+€85.42");
    expect(plain(formatSignedMoney(-8542, "EUR", "en"))).toBe("-€85.42");
    expect(plain(formatSignedMoney(0, "EUR", "en"))).toBe("€0.00");
  });

  it("writes a range once, and two equal ends as one figure", () => {
    expect(plain(formatMoneyRange(850, 1320, "EUR", "fr"))).toBe("8,50–13,20 €");
    expect(plain(formatMoneyRange(1349, 1349, "EUR", "fr"))).toBe("13,49 €");
  });
});

describe("moneyNeedles", () => {
  it("offers every way somebody might type the amount they are looking for", () => {
    const needles = moneyNeedles(315034, "EUR", "fr");

    expect(needles).toContain("3150.34");
    expect(needles).toContain("3150,34");
    expect(needles).toContain("3 150,34 €");
    expect(needles).toContain(formatMoney(315034, "EUR", "fr"));
  });
});

describe("dates", () => {
  it("files a typed day at noon UTC, so no time zone moves it", () => {
    expect(dateToIso("2026-01-01")).toBe("2026-01-01T12:00:00.000Z");
  });

  it("offers back the day that was typed", () => {
    for (const day of ["2026-01-01", "2026-02-28", "2026-12-31"]) {
      expect(isoToDateInput(dateToIso(day))).toBe(day);
    }
  });

  it("reads a stored moment in UTC, the zone the day was written in", () => {
    expect(isoToDateInput("2026-07-15T23:30:00-05:00")).toBe("2026-07-16");
  });

  it("opens a line with a capital, even in French", () => {
    const day = formatDayDate("2026-07-15T12:00:00Z", "fr", "UTC");

    expect(day.startsWith("Mer")).toBe(true);
    expect(day).toContain("15");
    expect(day).toContain("2026");
    expect(formatMonth("2026-07", "fr").startsWith("J")).toBe(true);
  });

  it("names a month mid-sentence in the language's own case", () => {
    expect(formatMonthLong("2026-10", "en")).toBe("October 2026");
    expect(formatMonthLong("2026-10", "fr")).toBe("octobre 2026");
    expect(formatMonthLong("2026-09", "fr", false)).toBe("septembre");
    expect(formatMonthLong("2026-01", "de", false)).toBe("Januar");
  });

  it("writes a picked day in figures, in each language's order", () => {
    expect(formatNumericDay("2026-10-24", "fr")).toBe("24/10/2026");
    expect(formatNumericDay("2026-10-24", "en")).toBe("10/24/2026");
  });

  it("writes back a day no calendar holds rather than throw", () => {
    expect(formatNumericDay("20261-10-24", "fr")).toBe("20261-10-24");
  });

  it("labels a month as itself, wherever the reader is", () => {
    expect(formatMonth("2026-01", "en")).toContain("Jan");
    expect(formatMonth("2026-12", "en")).toContain("Dec");
  });

  it("heads the journal with today and yesterday in words, then the day itself", () => {
    expect(formatJournalDay("2026-10-29", "fr", "2026-10-29")).toBe("Aujourd’hui");
    expect(formatJournalDay("2026-10-28", "fr", "2026-10-29")).toBe("Hier");
    expect(formatJournalDay("2026-10-27", "fr", "2026-10-29")).toBe("Mardi 27 octobre");
    expect(formatJournalDay("2025-12-31", "en", "2026-01-01")).toBe("Yesterday");
  });

  it("writes the time of day on the reader's clock", () => {
    const at = new Date(2026, 9, 29, 9, 12).toISOString();

    expect(formatClock(at, "fr")).toBe("09:12");
  });

  it("writes a span of time once, and a single minute as itself", () => {
    const at = (minute: number) => new Date(2026, 9, 29, 19, minute).toISOString();

    expect(plain(formatClockRange(at(2), at(28), "fr"))).toMatch(/^19:02 ?– ?19:28$/u);
    expect(formatClockRange(at(28), at(28), "fr")).toBe("19:28");
  });
});

describe("names", () => {
  it("takes the initials of the first and last words", () => {
    expect(initials("Stéphane Fath")).toBe("SF");
    expect(initials("Jean Paul Sartre")).toBe("JS");
    expect(initials("antonin")).toBe("AN");
    expect(initials("   ")).toBe("?");
  });

  it("takes the first word as what somebody goes by", () => {
    expect(firstName("  Emma  Stone ")).toBe("Emma");
    expect(firstName("Priya")).toBe("Priya");
  });

  it("sorts by the reader's alphabet, not by bytes", () => {
    const names = ["Zoo", "restaurant", "Épicerie", "Alimentation"].map((name) => ({ name }));

    expect(sortByName(names, "fr").map(({ name }) => name)).toEqual([
      "Alimentation",
      "Épicerie",
      "restaurant",
      "Zoo",
    ]);
  });
});

describe("autoColors", () => {
  // ULIDs sort by age, so these are created in the order they are listed.
  const ids = Array.from({ length: 14 }, (_, index) => `01K${String(index).padStart(3, "0")}`);
  const automatic = (count: number) => ids.slice(0, count).map((id) => ({ id, color: null }));

  it("gives twelve categories twelve different colours", () => {
    const colours = autoColors(automatic(12));

    expect(new Set(colours.values()).size).toBe(12);
  });

  it("never hands out a colour somebody chose", () => {
    const chosen = { id: "01KZZZ", color: PALETTE[0] };
    const colours = autoColors([chosen, ...automatic(11)]);

    expect([...colours.values()]).not.toContain(PALETTE[0]);
    expect(colours.has(chosen.id)).toBe(false);
  });

  it("does not repaint an old category when a new one arrives", () => {
    const before = autoColors(automatic(6));
    const after = autoColors(automatic(7));

    for (const [id, colour] of before) {
      expect(after.get(id)).toBe(colour);
    }
  });

  it("falls back to the hash once the palette is spent", () => {
    const colours = autoColors(automatic(14));

    expect(colours.get(ids[13])).toBe(colorFor(ids[13]));
  });
});

describe("colorOf", () => {
  it("keeps a chosen colour, and hashes one it was not asked about", () => {
    const within = [{ id: "01KA", color: null }];

    expect(colorOf({ id: "01KB", color: "#123456" }, within)).toBe("#123456");
    expect(colorOf({ id: "01KC", color: null }, within)).toBe(colorFor("01KC"));
  });
});
