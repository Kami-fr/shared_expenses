/**
 * Nothing the group page shows on a phone is cut, in any language.
 *
 * 360 px is the repository's reference width (5ee0e33). Every screen a member
 * reaches from the group page is opened the way a finger would, in each of
 * the eight languages, on both demo groups: one in the house's currency and
 * one abroad. A cut is a label that does not fit, a figure pushed off the
 * edge, a word under an ellipsis — anything `cuts()` finds.
 */

import { afterEach, describe, expect, it } from "vitest";

import { localizer, type Key } from "../../src/services/localize";
import {
  LANGUAGES,
  button,
  click,
  cuts,
  find,
  mount,
  unanswered,
  type Cut,
  type GroupKey,
} from "./harness";

type Translate = (key: Key) => string;

const page = (...selectors: string[]) => find("se-group-page", ...selectors);

const plus = () => click(page(".fab"));
const more = () => click(page(".actions button:nth-child(3)"));
const statistics = () => click(page(".actions button:nth-child(2)"));
const period = async (nth: number) => {
  await statistics();
  await click(page("se-statistics-dialog", "se-statistics", "se-segmented", `button:nth-child(${nth})`));
};

/** Each screen, reached from a freshly opened group page. */
const SCENES: Record<string, (translate: Translate) => Promise<void>> = {
  "the page": async () => {},
  "the search": () => click(page(".actions button:nth-child(1)")),
  "the groups menu": () => click(page(".switcher")),
  "the more menu": more,
  "the plus's choices": plus,
  "a new expense": async () => {
    await plus();
    await click(page(".choice.main"));
  },
  "a new shop refund": async () => {
    await plus();
    await click(page(".choices .choice:nth-child(3)"));
  },
  "paying someone back": async () => {
    await plus();
    await click(page(".choices .choice:nth-child(2)"));
  },
  "a new debt": async () => {
    await plus();
    await click(page(".choices .choice:nth-child(1)"));
  },
  "the statistics, by month": statistics,
  "the statistics, by year": () => period(2),
  "the statistics, all of it": () => period(3),
  "the history": async (translate) => {
    await more();
    await click(button(translate("group_history")));
  },
  "the members": async (translate) => {
    await more();
    await click(button(translate("members")));
  },
  "the categories": async (translate) => {
    await more();
    await click(button(translate("categories")));
  },
  "the group's settings": async (translate) => {
    await more();
    await click(button(translate("edit_group")));
  },
};

/**
 * Cuts that are meant, each with its reason. Matched on where and what, so a
 * new cut in the same place still fails.
 */
const MEANT: { where: RegExp; text: string; why: string }[] = [
  {
    where: /> div\.titles > h1$/,
    text: "Despesas compartilhadas",
    why:
      "c19fc21: the title takes an ellipsis rather than a second line, and " +
      "Portuguese is the one language that needs it at 360 (209 px for 168).",
  },
  {
    where: /> div\.cb > div\.t > span\.nm$/,
    text: "Rent & Utilities",
    why:
      "A category's name is the household's own: its row gives the amount and " +
      "the share their room and lets the name take the ellipsis.",
  },
];

/** The cuts nobody meant, a line each: where, what, and by how much. */
function unmeant(found: Cut[]): string[] {
  return found
    .filter((cut) => !MEANT.some((meant) => meant.where.test(cut.where) && meant.text === cut.text))
    .map((cut) => `${cut.where} "${cut.text}" needs ${cut.needs} px, has ${cut.has}`);
}

afterEach(() => {
  expect(unanswered, "requests demo.json has no answer for").toEqual([]);
});

const GROUPS: GroupKey[] = ["apartment", "london"];

describe.each(GROUPS)("%s", (group) => {
  describe.each(LANGUAGES)("%s", (language) => {
    it.each(Object.keys(SCENES))("%s", async (scene) => {
      await mount(group, language);
      await SCENES[scene](localizer(language));

      expect(unmeant(cuts())).toEqual([]);
    });
  });
});
