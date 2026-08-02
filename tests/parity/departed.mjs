// What a rule written before somebody left says once they are gone.
//
// The editor fills itself in from a stored rule with `stateOf` and writes what
// it holds back out with `ruleFor`. A member the rule names and who has since
// left has no tick in that panel: whatever the round trip makes of them, the
// reader cannot see it and cannot correct it. This hands back the rewritten
// rule, so the test can say what it must be. Called by tests/test_split_modes.py.

import { readFileSync } from "node:fs";

const [, , modesPath, casesPath] = process.argv;

const { modeOf, ruleFor, stateOf } = await import(new URL(`file://${modesPath}`).href);

const cases = JSON.parse(readFileSync(casesPath, "utf-8"));

const rewritten = cases.map(({ rule, member_ids: memberIds, payer_id: payerId }) => {
  const mode = modeOf(rule);
  const state = stateOf(rule, memberIds, payerId);

  return { mode, rule: ruleFor(mode, { ...state, memberIds }) };
});

console.log(JSON.stringify(rewritten));
