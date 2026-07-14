/**
 * Types mirroring the WebSocket API of the integration.
 *
 * Every amount is in cents, like in the backend.
 */

export type GroupRole = "owner" | "admin" | "member";

export interface SplitRule {
  /** Members sharing the envelope. `null` means every active group member. */
  participants: string[] | null;
  /** Amounts assigned to specific members before distribution. */
  fixed: Record<string, number>;
  /** Upper bound of the shared envelope. `null` means no cap. */
  cap: number | null;
  /** Where the surplus above the cap goes. */
  remainder: "payer";
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
  user_id: string | null;
  name: string;
  color: string | null;
  created_at: string;
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
