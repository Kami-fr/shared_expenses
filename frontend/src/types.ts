/**
 * Types mirroring the WebSocket API of the integration.
 *
 * Every amount is in cents, like in the backend.
 */

export type GroupRole = "owner" | "admin" | "member";

/** Who takes what is left once the envelope is shared. */
export interface Remainder {
  /** Members taking part. `null` or absent means the payer alone. */
  members?: string[] | null;
  /** Amounts owed by specific members out of the remainder. */
  fixed?: Record<string, number>;
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
  amount: number;
  currency: string;
  paid_by_member_id: string;
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

export interface Payment {
  id: string;
  group_id: string;
  description: string | null;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
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
