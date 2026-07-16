/**
 * Turn a stored change into something readable.
 *
 * The backend stores values as the tables hold them — cents, ids, ISO dates —
 * so this is where they become money, names and dates. Ids are resolved here
 * rather than frozen in the history: the day someone is renamed, their past
 * changes should say the name they go by now, not the one they had.
 */

import { formatDayDate, formatMoney } from "./format";
import type { Key, Localizer } from "./localize";
import { describeRule } from "./split-summary";
import type { Category, FieldChange, Member, SplitRule } from "../types";

/** What a change is read against, to put names on ids. */
export interface HistoryContext {
  localize: Localizer;
  members: Member[];
  categories: Category[];
  currency: string;
  language: string;
}

/** A change, said in words: what it is about, and what it went from and to. */
export interface ReadableChange {
  label: string;
  before: string | null;
  after: string | null;
}

/**
 * The fields worth showing, and what to call them.
 *
 * Typed on the translation keys, so a field pointing at a label that does not
 * exist is caught here rather than showing up blank in someone's history.
 */
const LABELS: Record<string, Key> = {
  title: "expense_title",
  description: "description",
  amount: "amount",
  currency: "currency",
  paid_by_member_id: "paid_by",
  expense_date: "date",
  payment_date: "date",
  category_id: "category",
  from_member_id: "from_member",
  to_member_id: "to_member",
  shares: "split",
  kind: "kind_label",

  // The project, its categories and its people.
  name: "field_name",
  icon: "icon",
  color: "color",
  archived: "archived",
  exposed: "dashboard",
  default_category_id: "default_category",
  split_rule: "default_split",
  permissions: "permissions",
  role: "field_role",
};

/**
 * Read a change, or null when it is not worth showing.
 *
 * A field this version does not know how to say is dropped rather than printed
 * raw: a history is read by people, and "paid_by_member_id: 01JQ…" tells them
 * nothing they can act on.
 */
export function readChange(
  change: FieldChange,
  context: HistoryContext,
): ReadableChange | null {
  const key = LABELS[change.field];

  if (!key) {
    return null;
  }

  return {
    label: context.localize(key),
    before: readValue(change.field, change.before, context),
    after: readValue(change.field, change.after, context),
  };
}

function readValue(
  field: string,
  value: unknown,
  context: HistoryContext,
): string | null {
  // Nothing: a creation has no before, a deletion no after, and a field can be
  // cleared. The caller decides how to show an absence — em dash, or nothing.
  if (value === null || value === undefined) {
    return null;
  }

  if (field === "amount" && typeof value === "number") {
    return formatMoney(value, context.currency, context.language);
  }

  if (field === "expense_date" || field === "payment_date") {
    return formatDayDate(String(value), context.language);
  }

  if (field === "category_id") {
    return (
      context.categories.find((category) => category.id === value)?.name ??
      context.localize("no_category")
    );
  }

  if (field === "paid_by_member_id" || field === "from_member_id" || field === "to_member_id") {
    return nameOf(String(value), context);
  }

  if (field === "shares" && isShares(value)) {
    return readShares(value, context);
  }

  // Stored as the enum spells it. "reimbursement" is a word for the database,
  // not for whoever is reading their own history.
  if (field === "kind") {
    return context.localize(
      value === "debt" ? "kind_debt" : "kind_reimbursement",
    );
  }

  if (field === "role") {
    return context.localize(value === "admin" ? "role_admin" : "role_member");
  }

  // Both booleans, read as yes/no. `exposed` is why this change is worth
  // showing at all: it takes the wall down, and a wall coming down is the one
  // project change nobody should have to take on trust.
  if (field === "archived" || field === "exposed") {
    return context.localize(value ? "yes" : "no");
  }

  // Said the way the editor says it, through the same helper: a rule described
  // as one thing here and edited as another would be worse than no description.
  if (field === "split_rule") {
    return describeRule(
      value as SplitRule | null,
      context.localize,
      context.currency,
      context.language,
    );
  }

  // What is granted, in the words of the switches. A list of enum values would
  // be the database talking.
  if (field === "permissions" && Array.isArray(value)) {
    return value.length === 0
      ? context.localize("permissions_none")
      : value
          .map((name) => context.localize(`perm_${name}` as Key))
          .join(" · ");
  }

  return String(value);
}

/** "Stéphane 45,00 € · Antonin 45,00 €", in the group's own member order. */
function readShares(shares: Record<string, number>, context: HistoryContext): string {
  const listed = Object.entries(shares).filter(([, amount]) => amount !== 0);

  if (listed.length === 0) {
    return "—";
  }

  return listed
    .map(
      ([memberId, amount]) =>
        `${nameOf(memberId, context)} ${formatMoney(amount, context.currency, context.language)}`,
    )
    .join(" · ");
}

/**
 * The name behind an id.
 *
 * Someone removed from the group is still on their old expenses, so this looks
 * at whoever it is handed; an id it cannot place shows as "?" rather than
 * leaking a ULID into a sentence.
 */
function nameOf(memberId: string, context: HistoryContext): string {
  return context.members.find((member) => member.id === memberId)?.name ?? "?";
}

function isShares(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((amount) => typeof amount === "number")
  );
}
