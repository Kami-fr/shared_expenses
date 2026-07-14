// Compare the TypeScript resolver against the Python one, case by case.
//
// Reads the cases and their Python answers on stdin, runs each through the real
// frontend resolver, and reports on stdout. Called by tests/test_parity.py.

import { readFileSync } from "node:fs";

const [, , splitsPath, casesPath] = process.argv;

const { resolveShares } = await import(new URL(`file://${splitsPath}`).href);

const cases = JSON.parse(readFileSync(casesPath, "utf-8"));

const normalise = (shares) =>
  shares === null || shares === undefined
    ? null
    : Object.fromEntries(
        Object.entries(shares).sort(([a], [b]) => a.localeCompare(b)),
      );

const failures = [];

for (const item of cases) {
  let got;

  try {
    got = resolveShares({
      amount: item.amount,
      payerId: item.payer_id,
      memberIds: item.member_ids,
      rule: item.rule,
    });
  } catch (error) {
    // The Python side answers null where a rule cannot be resolved; a throw
    // here is a divergence, not a crash of the harness.
    got = `threw: ${error.message}`;
  }

  const mine = JSON.stringify(normalise(got));
  const theirs = JSON.stringify(normalise(item.expected));

  if (mine !== theirs) {
    failures.push({
      rule: item.rule,
      amount: item.amount,
      members: item.member_ids,
      python: theirs,
      typescript: mine,
    });
  }
}

console.log(JSON.stringify({ compared: cases.length, failures }));

process.exitCode = failures.length === 0 ? 0 : 1;
