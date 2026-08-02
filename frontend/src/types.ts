/**
 * Types mirroring the WebSocket API of the integration.
 *
 * Every amount is in cents, like in the backend.
 */

/**
 * What somebody is in a project. There is exactly one admin.
 *
 * Two, where there used to be three — an owner above an admin above a member.
 * The middle step named somebody who was almost in charge, which is not a
 * station worth having in a household's shopping list.
 *
 * A role is never handed out, only handed on: `transferAdmin` moves it, and
 * whoever gives it up becomes an ordinary member.
 */
export type GroupRole = "admin" | "member";

/**
 * One thing a project either lets its members do, or does not.
 *
 * A setting of the project, the same for everybody in it. The admin is above
 * them — that is what the role is for, and it is why one switch per project is
 * enough instead of a matrix per person.
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
  /**
   * Whether this project puts its figures on the Home Assistant dashboard.
   *
   * False, and deliberately. Entities are not walled: every account in the
   * house reads every entity's state, whatever this integration says about who
   * is in which project.
   */
  exposed: boolean;
}

export interface Member {
  id: string;
  /** The Home Assistant account behind this member, or null if they have none. */
  user_id: string | null;
  name: string;
  color: string | null;
  /** Whether they wear their Home Assistant photo rather than the initials. */
  use_ha_avatar: boolean;
  created_at: string;
  /**
   * Their Home Assistant photo, resolved on the client from `hass.states`.
   *
   * Never sent by the backend: it is filled in where the members are loaded and
   * `hass` is at hand. Null when they keep the initials, have no account, or set
   * no picture — the panel reads its absence as "show the coloured initials".
   */
  picture?: string | null;
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
  /**
   * The purchase this refund gives money back on, or null.
   *
   * Only ever set on a refund — an expense with a negative `amount`. Read, never
   * counted: the shares are the money. It may name an expense that is not here,
   * a deleted one keeping its id while the link waits for it.
   */
  refund_of: string | null;
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
  /** How many expenses the total is made of. The average expense is total / count. */
  count: number;
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
 * What a revision can be about.
 *
 * A member's is global — one per Home Assistant account, across every project —
 * so a rename is felt everywhere while the revision belongs to the project that
 * asked for it.
 */
export type RevisionEntity = "expense" | "payment" | "group" | "category" | "member";

/**
 * Something that happened in a project: to an expense, a payment, a category,
 * somebody in it, or the project itself.
 *
 * Stands on its own: it holds no reference to what it describes, so it is still
 * there once that has been deleted — which is the change most worth reading.
 */
export interface Revision {
  id: string;
  group_id: string;
  entity_type: RevisionEntity;
  entity_id: string;
  /** What it was called at the time, so a deleted one can still be named. */
  entity_label: string | null;
  action: "created" | "updated" | "deleted" | "restored";
  actor_user_id: string | null;
  changes: FieldChange[];
  at: string;
}

/* The error codes the integration sends back were listed here too, and nothing
 * ever read the list. It went stale the first time a `code=` was added to a
 * raise, which is what a second copy does. `EN` in services/localize.ts is the
 * one to keep: `errorMessage` looks a code up in it, so a code with no sentence
 * there falls back to English rather than being quietly accepted. */

/** Minimal shape of the `hass` object handed to the panel. */
/** A Home Assistant entity, of which we read only a person's photo and account. */
export interface HassEntity {
  entity_id: string;
  attributes: {
    user_id?: string;
    entity_picture?: string;
    [key: string]: unknown;
  };
}

export interface HomeAssistant {
  language: string;
  locale?: { language: string };
  /** The house's own settings, of which we read only the currency. */
  config?: { currency?: string };
  /** Every entity's current state, where the person photos are found. */
  states?: Record<string, HassEntity>;
  themes?: unknown;
  user?: { id: string; name: string; is_admin: boolean };
  callWS<T>(message: object): Promise<T>;
  connection: {
    subscribeEvents<T>(
      callback: (event: T) => void,
      eventType: string,
    ): Promise<() => Promise<void>>;
    /**
     * Subscribe to one of our own commands, rather than to the event bus.
     *
     * The bus is not an option: Home Assistant refuses `subscribe_events` on
     * anything but `state_changed` unless the account is an admin, so an
     * ordinary member could never listen. A command of ours goes through the
     * same door as the rest — it checks that they are in the group.
     */
    subscribeMessage<T>(
      callback: (message: T) => void,
      subscribeMessage: object,
    ): Promise<() => Promise<void>>;
  };
}

export interface Route {
  prefix: string;
  path: string;
}
