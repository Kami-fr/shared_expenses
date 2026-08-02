// Compare the TypeScript conversion against the Python one, case by case.
//
// The panel shows what an expense comes to; the backend stores it. A cent
// between them is a figure someone accepted that is not the figure in the
// balances. Called by tests/test_currency_parity.py.

import { readFileSync } from "node:fs";

const [, , modulePath, casesPath] = process.argv;

const { convert, parseRate, formatRate, apportion } = await import(
  new URL(`file://${modulePath}`).href
);

const cases = JSON.parse(readFileSync(casesPath, "utf-8"));

const failures = [];

for (const item of cases) {
  let got;

  try {
    if (item.kind === "convert") {
      got = convert(item.amount, item.rate);
    } else if (item.kind === "parse") {
      got = parseRate(item.text);
    } else if (item.kind === "apportion") {
      got = apportion(item.amounts, item.total);
    } else {
      got = formatRate(item.rate);
    }
  } catch (error) {
    got = `threw: ${error.message}`;
  }

  const mine = JSON.stringify(got ?? null);
  const theirs = JSON.stringify(item.expected ?? null);

  if (mine !== theirs) {
    failures.push({ ...item, python: theirs, typescript: mine });
  }
}

console.log(JSON.stringify({ compared: cases.length, failures }));

process.exitCode = failures.length === 0 ? 0 : 1;
