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
import type { Expense, Revision } from "../../src/types";
import {
  LANGUAGES,
  button,
  click,
  cuts,
  find,
  mount,
  settle,
  unanswered,
  type Cut,
  type GroupKey,
} from "./harness";

type Translate = (key: Key) => string;

const page = (...selectors: string[]) => find("se-group-page", ...selectors);

/**
 * Click it when this group has it. The recurring expenses are the Apartment's:
 * London has none, and its scene is the screen without them.
 */
const ifThere = async (...selectors: string[]) => {
  let target: HTMLElement;

  try {
    target = page(...selectors);
  } catch {
    return;
  }

  await click(target);
};

const plus = () => click(page(".fab"));
const more = () => click(page(".actions button:nth-child(3)"));
const statistics = () => click(page(".actions button:nth-child(2)"));
const period = async (nth: number) => {
  await statistics();
  await click(page("se-statistics-dialog", "se-statistics", "se-segmented", `button:nth-child(${nth})`));
};

/** Type into a new expense's title as a finger would: the caret in it first. */
const typeTitle = async (text: string) => {
  const input = page("se-expense-dialog", "se-field", "input") as HTMLInputElement;

  input.focus();
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  await settle();
};

/**
 * Slips of every kind the check asks about, added to the demo's expenses: a
 * shop written three ways, its figure typed ten times over once, filed
 * nowhere once, and a subscription entered twice. Copies of one of the
 * demo's own purchases, so the payer, the rule and the currency are real.
 */
const slips = async () => {
  const shown = page() as unknown as { expenses: Expense[] };
  const base = shown.expenses.find((expense) => expense.amount > 0)!;
  const make = (id: string, title: string, amount: number, day: string, extra = {}) => ({
    ...base,
    id,
    title,
    amount,
    converted_amount: amount,
    description: null,
    recurring_id: null,
    refund_of: null,
    expense_date: `${day}T10:00:00+00:00`,
    created_at: `${day}T18:00:00+00:00`,
    ...extra,
  });

  shown.expenses = [
    ...shown.expenses,
    ...["02", "09", "16", "23"].map((day, index) =>
      make(`slip-${index}`, "Leclerc", 1090, `2026-09-${day}`),
    ),
    make("slip-case", "leclerc ", 1250, "2026-09-30"),
    make("slip-letter", "Leclrc", 990, "2026-10-07"),
    make("slip-point", "Leclerc", 10_900, "2026-10-14"),
    make("slip-nowhere", "Leclerc", 1100, "2026-10-20", { category_id: null }),
    make("slip-once", "Netflix", 1349, "2026-10-06"),
    make("slip-twice", "Netflix", 1349, "2026-10-06", {
      created_at: "2026-10-06T19:00:00+00:00",
    }),
  ];
  await settle();
};

/**
 * The journal with something in it besides the demo's additions: Alex fixing
 * an expense's figure, its category and who shares it, then deleting another.
 */
const edits = async () => {
  const dialog = page("se-history-dialog") as unknown as { revisions: Revision[] };
  const alex = "01M5N3R3MWTH1D4GNMNDJA1TN7";
  const marcus = "01M5N3R3N8H2M2NRMC0FPWJG36";
  const line = (extra: Partial<Revision>): Revision => ({
    id: `edit-${extra.action}`,
    group_id: "01M5N3R3MVC6W3NEM495DR4Y94",
    entity_type: "expense",
    entity_id: "",
    entity_label: null,
    action: "updated",
    actor_user_id: "417341e0a3e746fc8f07a5c053176a11",
    changes: [],
    at: "2026-10-23T20:00:00+00:00",
    ...extra,
  });

  dialog.revisions = [
    line({
      entity_id: "01M5N3R3RHYRN2NJWS1NPH0S14",
      entity_label: "Groceries + BBQ",
      at: "2026-10-23T20:30:00+00:00",
      changes: [
        { field: "amount", before: 14360, after: 13460 },
        { field: "category_id", before: "01M5N3R3NSVFNE0QJZZP1VJ2ZK", after: "01M5N3R3NM7D5FP3M4VWPPHFHP" },
        {
          field: "shares",
          before: { [alex]: 11360, "01M5N3R3N5R8FE0EPSK19R63GM": 1000, [marcus]: 1000, "01M5N3R3NCR99091EQC99FDF8T": 1000 },
          after: { [alex]: 11460, "01M5N3R3N5R8FE0EPSK19R63GM": 1000, "01M5N3R3NCR99091EQC99FDF8T": 1000 },
        },
      ],
    }),
    line({
      entity_id: "gone-bakery",
      entity_label: "Boulangerie",
      action: "deleted",
      changes: [
        { field: "title", before: "Boulangerie", after: null },
        { field: "amount", before: 1090, after: null },
        { field: "currency", before: "USD", after: null },
        { field: "paid_by_member_id", before: alex, after: null },
        { field: "created_by_member_id", before: alex, after: null },
        { field: "expense_date", before: "2026-10-23T12:00:00+00:00", after: null },
        { field: "shares", before: { [alex]: 1090 }, after: null },
      ],
    }),
    ...dialog.revisions,
  ];
  await settle();
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
  "the history, after changes": async (translate) => {
    await more();
    await click(button(translate("group_history")));
    await edits();
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
  "the recurring expenses": async (translate) => {
    await more();
    await click(button(translate("recurring_expenses")));
  },
  "a recurring expense's settings": async (translate) => {
    await more();
    await click(button(translate("recurring_expenses")));
    await ifThere("se-recurring-dialog", "button.entry");
  },
  "checking an occurrence": () => ifThere(".due-item se-button.check"),
  "a new expense that repeats": async () => {
    await plus();
    await click(page(".choice.main"));
    await click(page("se-expense-dialog", "button.fold-row"));
    // Unfolded on "Never": the month is what sets it repeating.
    await click(page("se-expense-dialog", "se-segmented.units", "button:nth-child(4)"));
  },
  "an occurrence opened": () => ifThere(".item-button .repeat"),
  "a new expense, its title half typed": async () => {
    await plus();
    await click(page(".choice.main"));
    await typeTitle("gr");
  },
  "the check": async (translate) => {
    await more();
    await click(button(translate("check_expenses")));
  },
  "the check, with typing slips": async (translate) => {
    await slips();
    await more();
    await click(button(translate("check_expenses")));
  },
  "the calendar": () => click(page("se-segmented", "button:nth-child(2)")),
  "the calendar, a month back": async () => {
    await click(page("se-segmented", "button:nth-child(2)"));
    await click(page("se-calendar", ".step"));
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

/**
 * Where things sit, which a cut does not see: a mark that drops to a line of
 * its own holds everything it shows.
 */
describe("placement", () => {
  it("the ↻ of an occurrence sits on its title's line", async () => {
    await mount("apartment", "en");

    const marks = [...page().shadowRoot!.querySelectorAll<HTMLElement>(".title .repeat")];

    expect(marks.length).toBeGreaterThan(0);

    for (const mark of marks) {
      const words = document.createRange();
      // Lit's markers come first: the title is the first text with words in it.
      words.selectNodeContents(
        [...mark.parentElement!.childNodes].find(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim() !== "",
        )!,
      );
      const line = [...words.getClientRects()].at(-1)!;
      const middle = (mark.getBoundingClientRect().top + mark.getBoundingClientRect().bottom) / 2;

      expect(middle).toBeGreaterThan(line.top);
      expect(middle).toBeLessThan(line.bottom);
    }
  });

  it("the calendar opens on the latest day with something, its rows undated", async () => {
    await mount("apartment", "fr");
    await click(page("se-segmented", "button:nth-child(2)"));

    const picked = page("se-calendar").shadowRoot!.querySelector('.day[aria-pressed="true"]');

    expect(picked?.querySelector(".number")?.textContent).toBe("18");
    // The last heading: "To confirm" comes first on this group.
    const heads = [...page().shadowRoot!.querySelectorAll(".month-head span")];

    expect(heads.at(-1)?.textContent).toBe("Dimanche 18 octobre");

    const rows = [...page().shadowRoot!.querySelectorAll("section.month .item:not(.due-item)")];

    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      expect(row.textContent).not.toContain("18 oct. 2026");
    }
  });

  it("the calendar's foot explains both marks and presses nothing", async () => {
    await mount("apartment", "fr");
    await click(page("se-segmented", "button:nth-child(2)"));

    const foot = page("se-calendar").shadowRoot!.querySelector(".foot")!;

    expect(foot.querySelector("button")).toBeNull();
    expect([...foot.querySelectorAll(".legend")].map((item) => item.textContent?.trim())).toEqual([
      "Dépense",
      "Remboursements",
    ]);
    expect(foot.querySelector(".legend .ring")).not.toBeNull();
  });

  it("a name taken fills the title and its category, never the amount", async () => {
    await mount("apartment", "en");
    await plus();
    await click(page(".choice.main"));
    await typeTitle("gr");

    const names = [...page("se-expense-dialog").shadowRoot!.querySelectorAll("button.name")];

    // "Groceries + BBQ" starts with it, "Weekly groceries" holds it.
    expect(names).toHaveLength(2);

    const dialog = page("se-expense-dialog") as unknown as {
      expenseTitle: string;
      categoryId: string;
      amountInput: string;
      categories: { id: string; name: string }[];
    };

    expect(dialog.categoryId).toBe("");

    await click(names[0] as HTMLElement);

    expect(dialog.expenseTitle).toBe("Groceries + BBQ");
    expect(dialog.categoryId).toBe(
      dialog.categories.find((category) => category.name === "Groceries")!.id,
    );
    expect(dialog.amountInput).toBe("");
    expect(page("se-expense-dialog").shadowRoot!.querySelector(".names")).toBeNull();
  });

  it("the menu says how many questions the check has", async () => {
    await mount("apartment", "en");
    await more();

    // The demo has no slips: nothing to say, not a zero.
    expect(page().shadowRoot!.querySelector(".menu .count")).toBeNull();

    await click(page(".actions button:nth-child(3)"));
    await slips();
    await more();

    // A figure, a name written three ways, a twin, a category.
    expect(page().shadowRoot!.querySelector(".menu .count")?.textContent).toBe("4");
  });

  it("the check sets names right before it reads figures, and gives the usual as a range", async () => {
    const translate = localizer("fr");

    await mount("apartment", "fr");
    await slips();
    await more();
    await click(button(translate("check_expenses")));

    const dialog = page("se-check-dialog").shadowRoot!;
    const kinds = [...dialog.querySelectorAll(".kind")].map((kind) => kind.textContent!.split(" · ")[0]);

    // A figure is read against its name's others: merged names first.
    expect(kinds).toEqual(
      (["check_names", "check_duplicates", "check_amounts", "check_categories"] as Key[]).map(
        translate,
      ),
    );

    // 109,00 against the four 10,90, the 12,50 and the 11,00: the demo is in dollars.
    const usual = [...dialog.querySelectorAll(".fact")].find((fact) =>
      fact.textContent!.startsWith("Ses "),
    )!;

    expect(usual.textContent!.replace(/\s/gu, " ")).toBe(
      "Ses 6 autres achats : 10,90–11,00 $US. Une virgule oubliée ?",
    );
  });

  it("a check card carries its expense as the list draws it, and opens it", async () => {
    await mount("apartment", "en");
    await slips();
    await more();
    await click(button(localizer("en")("check_expenses")));

    const dialog = page("se-check-dialog").shadowRoot!;
    const tiles = (card: Element) =>
      [...card.querySelectorAll(".tiles .item")].map(
        (tile) => tile.querySelector(".title")!.textContent!.trim(),
      );
    const cards = [...dialog.querySelectorAll(".question.tiled")];

    // The twin with both of its halves; the figure and the category with theirs.
    expect(cards.map(tiles)).toEqual([["Netflix", "Netflix"], ["Leclerc"], ["Leclerc"]]);

    // Who shares it, as on the list: the part the card used to leave out.
    expect(cards[1].querySelectorAll(".tiles .stack-avatars .avatar").length).toBeGreaterThan(0);

    await click(cards[1].querySelector(".tiles .item") as HTMLElement);

    expect(page("se-expense-dialog")).toBeTruthy();
  });

  it("the journal says who changed an expense, and shows it with what it was", async () => {
    await mount("apartment", "fr");
    await more();
    await click(button(localizer("fr")("group_history")));
    await edits();

    const journal = page("se-history-dialog", "se-history").shadowRoot!;
    const text = (node: Element | null) => node!.textContent!.replace(/\s+/gu, " ").trim();
    const [edit, deletion] = [...journal.querySelectorAll(".event")];

    // Who did it, on a line of its own; the thing under it, as the list draws it.
    expect(text(edit.querySelector(".author .done"))).toBe("Alex a modifié la dépense");
    expect(text(edit.querySelector(".thing .title"))).toBe("Groceries + BBQ");
    expect(text(edit.querySelector(".thing .amount .was"))).toBe("143,60 $US");
    expect(text(edit.querySelector(".thing .muted s"))).toBe("Dining Out");
    // Marcus stays in the stack, faded, and is named under it.
    expect(edit.querySelectorAll(".thing .stack-avatars .avatar.out")).toHaveLength(1);
    expect(text(edit.querySelector(".moves"))).toContain("Marcus ne partage plus");

    // A deletion draws what it took, and offers it back as a button.
    expect(deletion.querySelector(".thing.gone .title")?.textContent).toContain("Boulangerie");
    expect(deletion.querySelector("button.chip.restore")).toBeTruthy();

    // The demo's twenty-odd additions by Alex, said once: the newest five drawn
    // straight away under it, the rest behind a press.
    const run = [...journal.querySelectorAll(".event")].find((event) =>
      /^Alex a ajouté \d+ dépenses/u.test(text(event.querySelector(".author .done"))),
    )!;

    expect(run).toBeTruthy();
    expect(run.querySelectorAll(".thing, .frame")).toHaveLength(5);
    expect(run.querySelector(".chip.plain")).toBeTruthy();
  });

  it("a recurring expense set up with its first month is told by that month alone", async () => {
    await mount("apartment", "fr");
    await more();
    await click(button(localizer("fr")("group_history")));

    const dialog = page("se-history-dialog") as unknown as { revisions: Revision[] };
    const added = (extra: Partial<Revision>): Revision => ({
      id: `plan-${extra.entity_type}`,
      group_id: "01M5N3R3MVC6W3NEM495DR4Y94",
      entity_type: "expense",
      entity_id: "",
      entity_label: "Internet",
      action: "created",
      actor_user_id: "417341e0a3e746fc8f07a5c053176a11",
      changes: [],
      // A day of its own, out of the run the demo was set up in.
      at: "2026-10-24T12:00:00+00:00",
      ...extra,
    });

    // Newest first, as the backend sends them: the month was written a moment
    // after the plan that produced it.
    dialog.revisions = [
      added({ entity_id: "01M5N3R3QDE1ES8JQS5GKG9HMM", at: "2026-10-24T12:01:00+00:00" }),
      added({
        entity_type: "recurring",
        entity_id: "01M5RECUR0NETW00000000000A",
        changes: [
          { field: "amount", before: null, after: 5999 },
          { field: "currency", before: null, after: "USD" },
          { field: "every", before: null, after: 1 },
          { field: "unit", before: null, after: "month" },
        ],
      }),
      ...dialog.revisions,
    ];
    await settle();

    const line = page("se-history-dialog", "se-history").shadowRoot!.querySelector(".event")!;

    // One addition, the month, wearing the repeat mark; no frame repeating its name.
    expect(line.querySelector(".author .done")!.textContent!.trim()).toBe("Alex a ajouté la dépense");
    expect(line.querySelectorAll(".thing")).toHaveLength(1);
    expect(line.querySelector(".thing .repeat")).toBeTruthy();
    expect(line.querySelector(".frame")).toBeNull();
  });

  it("a day is written as the panel's language writes it", async () => {
    await mount("apartment", "fr");
    await plus();
    await click(page(".choice.main"));

    const day = page("se-expense-dialog", "se-field[type=date]", ".day span");

    expect(day.textContent).toBe("23/10/2026");
  });
});
