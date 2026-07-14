/**
 * Say a split rule in one line.
 *
 * Read through `modeOf`, so what a rule is called here is what the editor will
 * open on. A summary drawn from the raw model instead would drift the day a
 * mode changes shape, and a rule described as one thing but edited as another
 * is worse than no description.
 */

import { formatMoney } from "./format";
import type { Localizer } from "./localize";
import { modeOf } from "./split-modes";
import type { SplitRule } from "../types";

/** Return what a rule does, in words. */
export function describeRule(
  rule: SplitRule | null,
  localize: Localizer,
  currency: string,
  language: string,
): string {
  if (rule === null) {
    return localize("split_equal");
  }

  const mode = modeOf(rule);

  if (mode === "equal") {
    const named = rule.participants?.length;

    // Everyone is what no rule says; a shorter list is worth spelling out.
    return named
      ? `${localize("split_equal")} · ${named}`
      : localize("split_equal");
  }

  if (mode === "exact") {
    return localize("split_exact");
  }

  if (mode === "percent") {
    return describePercent(rule, localize);
  }

  if (mode === "partial") {
    return rule.envelope == null
      ? localize("split_partial")
      : `${formatMoney(rule.envelope, currency, language)} ${localize("split_shared_lower")}`;
  }

  return localize("split_custom");
}

/** "60 / 40", which says more than the word "percentages" ever could. */
function describePercent(rule: SplitRule, localize: Localizer): string {
  const shares = Object.values(rule.remainder?.percent ?? {});

  if (shares.length === 0) {
    return localize("split_percent");
  }

  return shares
    .map((share) => (share % 100 === 0 ? String(share / 100) : (share / 100).toFixed(2)))
    .join(" / ")
    .concat(" %");
}
