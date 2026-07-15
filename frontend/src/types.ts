/**
 * Types mirroring the WebSocket API of the integration.
 *
 * Every amount is in cents, like in the backend.
 */

export type GroupRole = "owner" | "admin" | "member";

/**
 * One thing a project either lets its members do, or does not.
 *
 * A setting of the project, the same for everybody in it. The owner and the
 * admins are above them — that is what the role is for, and it is why one
 * switch per project is enough instead of a matrix per person.
 *
 * Mirrors `Permission` in the backend. The panel only ever hides what the
 * backend would refuse: it is a courtesy, never the guard.
 */
export type Permission =
  | "manage_members"
  | "manage_categories"
  | "manage_group"
  | "edit_others";

export const PERMISSIONS: Permission[] = [
  "manage_members",
  "manage_categories",
  "manage_group",
  "edit_others",
];

/** Who takes what is left once the envelope is shared. */
export interface Remainder {
  /** Members taking part. `null` or absent means the payer alone. */
  members?: string[] | null;
  /** Amounts owed by specific members out of the remainder. */
  fixed?: Record<string, number>;
  /**
   * Shares of the remainder owed by specific members.
   *
   * In hundredths of a percent, so 60% is 6000: an integer, like every other
   * figure here. A percentage of money is money.
   */
  percent?: Record<string, number>;
}

export interface SplitRule {
  /** Amount shared equally. `null` or absent means the whole expense. */
  envelope?: number | null;
  /** Members sharing the envelope. `null` means every active group member. */
  participants?: string[] | null;
  /** Who takes what the envelope left behind. */
  remainder?: Remainder;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  icon: string | null;
  color: string | null;
  archived: boolean;
  created_at: string;
  split_rule: SplitRule | null;
  /** The category a new expense starts on, if the group named one. */
  default_category_id: string | null;
  /** What an ordinary member of this project may do. Everything, by default. */
  permissions: Permission[];
}

export interface Member {
  id: string;
  /** The Home Assistant account behind this member, or null if they have none. */
  user_id: string | null;
  name: string;
  color: string | null;
  created_at: string;
}

/** A Home Assistant account, as offered by the member picker. */
export interface HaUser {
  id: string;
  name: string;
  is_owner: boolean;
  /** The member already backing this account, if it has one. */
  member_id: string | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  member_id: string;
  role: GroupRole;
  joined_at: string;
  left_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  group_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  split_rule: SplitRule | null;
}

export interface ExpenseShare {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  group_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  /** What was handed over at the till, in the cents of `currency`. */
  amount: number;
  /** What it was paid in. Not always the group's. */
  currency: string;
  /** The same money in the group's currency: what every figure is in. */
  converted_amount: number;
  /** The rate applied, in millionths. 0.87681 is 876810. Frozen. */
  exchange_rate: number;
  /** The day the rate is from, or null when nothing was converted. */
  rate_as_of: string | null;
  paid_by_member_id: string;
  /**
   * Who entered it, which is not always who paid it.
   *
   * Null where nobody knows: entered before this was recorded. Read only to
   * work out whether this is yours to edit.
   */
  created_by_member_id: string | null;
  expense_date: string;
  created_at: string;
  shares?: ExpenseShare[];
  /**
   * The rule that produced the shares, with its members spelled out.
   *
   * Only to reopen the dialog as it was filled in. The shares stay the truth.
   */
  split_rule: SplitRule | null;
}

/**
 * Why money moved between two members.
 *
 * Both move the balances the same way, `from` being whoever is out of pocket.
 * Read, never reckoned with.
 */
export type PaymentKind = "reimbursement" | "debt";

export interface Payment {
  id: string;
  group_id: string;
  description: string | null;
  /** Whoever is out of pocket: they paid, or they lent. */
  from_member_id: string;
  /** Whoever received it, or owes it. */
  to_member_id: string;
  kind: PaymentKind;
  /** Who wrote it down, which is not always either party. Null when unknown. */
  created_by_member_id: string | null;
  /** What was handed over, in the cents of `currency`. */
  amount: number;
  /** What it was handed over in. Not always the group's. */
  currency: string;
  payment_date: string;
  created_at: string;
  /** The same money in the group's currency: what the balances count. */
  converted_amount: number;
  /** The rate applied, in millionths. */
  exchange_rate: number;
  /** The day the rate is from, or null when nothing was converted. */
  rate_as_of: string | null;
}

export interface Balance {
  member_id: string;
  amount: number;
}

export interface Settlement {
  from_member_id: string;
  to_member_id: string;
  amount: number;
}

export interface GroupBalances {
  balances: Balance[];
  settlements: Settlement[];
}

/** What a category cost. `category_id` is null for the uncategorised. */
export interface CategoryTotal {
  category_id: string | null;
  total: number;
}

/** What a month cost. `month` is `YYYY-MM`, on the date you typed. */
export interface MonthTotal {
  month: string;
  total: number;
}

/**
 * What a member put in, and what they consumed.
 *
 * `paid` is what left their pocket, `share` what was theirs to bear. The two
 * differ by exactly the balance they are owed or owe.
 */
export interface MemberTotal {
  member_id: string;
  paid: number;
  share: number;
}

/** What a group spent, cut three ways. Reimbursements are not spending. */
export interface GroupStatistics {
  total: number;
  by_category: CategoryTotal[];
  by_month: MonthTotal[];
  by_member: MemberTotal[];
  /** Every year holding an expense, for the period picker. Never filtered. */
  years: number[];
}

/** What one currency was worth in another, on a given day. */
export interface ExchangeRate {
  base: string;
  quote: string;
  /** In millionths: 0.87681 is 876810. */
  rate: number;
  /** The day it is really from. A Sunday carries Friday's. */
  as_of: string;
  source: "ecb" | "manual";
  /**
   * Whether this is not the day that was asked for.
   *
   * The whole reason this is not just a number: a rate from another day is
   * worth having, but only if whoever is offered it can see that and say no.
   */
  stale: boolean;
}

/** One field of one thing, before and after, in stored values. */
export interface FieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

/**
 * Something that happened to an expense or a payment.
 *
 * Stands on its own: it holds no reference to what it describes, so it is still
 * there once that has been deleted — which is the change most worth reading.
 */
export interface Revision {
  id: string;
  group_id: string;
  entity_type: "expense" | "payment";
  entity_id: string;
  /** What it was called at the time, so a deleted one can still be named. */
  entity_label: string | null;
  action: "created" | "updated" | "deleted";
  actor_user_id: string | null;
  changes: FieldChange[];
  at: string;
}

/** Error codes sent back by the integration. */
export type ErrorCode =
  | "group_not_found"
  | "group_archived"
  | "member_not_found"
  | "member_already_in_group"
  | "category_not_found"
  | "expense_not_found"
  | "invalid_expense"
  | "invalid_expense_shares"
  | "invalid_split_rule"
  | "payment_not_found"
  | "invalid_payment"
  | "invalid_exchange_rate"
  | "exchange_rate_unavailable"
  | "not_loaded"
  | "unknown_error";

/** Minimal shape of the `hass` object handed to the panel. */
export interface HomeAssistant {
  language: string;
  locale?: { language: string };
  themes?: unknown;
  user?: { id: string; name: string; is_admin: boolean };
  callWS<T>(message: object): Promise<T>;
  connection: {
    subscribeEvents<T>(
      callback: (event: T) => void,
      eventType: string,
    ): Promise<() => Promise<void>>;
  };
}

export interface Route {
  prefix: string;
  path: string;
}
