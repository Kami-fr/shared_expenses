// Reopening an expense and saving it again must not move a cent.
//
// The editor reads a stored rule back as a mode, and writes that mode back out
// as a rule. If the round trip is not faithful, simply opening an expense and
// pressing save would change what people owe — silently, and in the one place
// nobody would think to check. Called by tests/test_split_modes.py.

import { readFileSync } from "node:fs";

const [, , modesPath, splitsPath, casesPath] = process.argv;

const { modeOf, ruleFor, stateOf } = await import(new URL(`file://${modesPath}`).href);
const { resolveShares } = await import(new URL(`file://${splitsPath}`).href);

const cases = JSON.parse(readFileSync(casesPath, "utf-8"));

const failures = [];

for (const item of cases) {
  const { amount, payer_id: payerId, member_ids: memberIds, rule } = item;

  // What the expense is worth today.
  const before = resolveShares({ amount, payerId, memberIds, rule });

  // Open it: the editor works out the mode and fills itself in.
  const mode = modeOf(rule);
  const state = stateOf(rule, memberIds, payerId);

  // Save it, touching nothing.
  const rewritten = ruleFor(mode, { ...state, memberIds });
  const after = resolveShares({ amount, payerId, memberIds, rule: rewritten });

  const a = JSON.stringify(before);
  const b = JSON.stringify(after);

  if (a !== b) {
    failures.push({
      rule: JSON.stringify(rule),
      mode,
      rewritten: JSON.stringify(rewritten),
      amount,
      before: a,
      after: b,
    });
  }
}

console.log(JSON.stringify({ compared: cases.length, failures }));

process.exitCode = failures.length === 0 ? 0 : 1;
