/**
 * Typed client for the Shared Expenses WebSocket API.
 *
 * The frontend never talks to Home Assistant entities: every read and write
 * goes through these commands.
 */

import type {
  Category,
  Expense,
  ExpenseShare,
  Group,
  GroupBalances,
  GroupMember,
  GroupRole,
  HaUser,
  HomeAssistant,
  Member,
  Payment,
  SplitRule,
} from "../types";

export interface CreateGroupInput {
  name: string;
  currency?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  owner_name?: string | null;
  split_rule?: SplitRule | null;
}

export interface CreateExpenseInput {
  group_id: string;
  title: string;
  /** In cents. */
  amount: number;
  paid_by_member_id: string;
  expense_date: string;
  currency?: string | null;
  category_id?: string | null;
  description?: string | null;
  /** Explicit shares. Leave out to apply the category or group rule. */
  shares?: Array<{ member_id: string; amount: number }>;
  /** Rule applied to this expense only. */
  split_rule?: SplitRule | null;
}

export interface CreatePaymentInput {
  group_id: string;
  from_member_id: string;
  to_member_id: string;
  /** In cents. */
  amount: number;
  payment_date: string;
  description?: string | null;
}

export class SharedExpensesApi {
  public constructor(private readonly hass: HomeAssistant) {}

  // Groups

  public listGroups(includeArchived = true): Promise<Group[]> {
    return this.call("list_groups", { include_archived: includeArchived });
  }

  public getGroup(groupId: string): Promise<Group> {
    return this.call("get_group", { group_id: groupId });
  }

  public createGroup(input: CreateGroupInput): Promise<Group> {
    return this.call("create_group", input);
  }

  public updateGroup(groupId: string, changes: Partial<CreateGroupInput>): Promise<Group> {
    return this.call("update_group", { group_id: groupId, ...changes });
  }

  public archiveGroup(groupId: string, archived: boolean): Promise<Group> {
    return this.call("archive_group", { group_id: groupId, archived });
  }

  public deleteGroup(groupId: string): Promise<null> {
    return this.call("delete_group", { group_id: groupId });
  }

  public getBalances(groupId: string): Promise<GroupBalances> {
    return this.call("get_balances", { group_id: groupId });
  }

  // Members

  /** The Home Assistant accounts a group can be built from. */
  public listHaUsers(): Promise<HaUser[]> {
    return this.call("list_ha_users");
  }

  // `groupId` is required: the backend refuses to list every member of the
  // house, as that would leak the people of groups you have nothing to do with.
  public listMembers(groupId: string, includeLeft = false): Promise<Member[]> {
    return this.call("list_members", {
      group_id: groupId,
      include_left: includeLeft,
    });
  }

  public listMemberships(groupId: string): Promise<GroupMember[]> {
    return this.call("list_memberships", { group_id: groupId });
  }

  public createMember(input: {
    name: string;
    group_id: string;
    /** A Home Assistant account id, or nothing for someone without one. */
    user_id?: string | null;
    color?: string | null;
    role?: GroupRole;
  }): Promise<Member> {
    return this.call("create_member", input);
  }

  public updateMember(
    memberId: string,
    changes: { name?: string; color?: string | null },
  ): Promise<Member> {
    return this.call("update_member", { member_id: memberId, ...changes });
  }

  public removeMemberFromGroup(groupId: string, memberId: string): Promise<null> {
    return this.call("remove_member_from_group", {
      group_id: groupId,
      member_id: memberId,
    });
  }

  // Categories

  public listCategories(groupId: string): Promise<Category[]> {
    return this.call("list_categories", { group_id: groupId });
  }

  public createCategory(input: {
    group_id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    split_rule?: SplitRule | null;
  }): Promise<Category> {
    return this.call("create_category", input);
  }

  public updateCategory(
    categoryId: string,
    changes: {
      name?: string;
      icon?: string | null;
      color?: string | null;
      split_rule?: SplitRule | null;
    },
  ): Promise<Category> {
    return this.call("update_category", { category_id: categoryId, ...changes });
  }

  public deleteCategory(categoryId: string): Promise<null> {
    return this.call("delete_category", { category_id: categoryId });
  }

  // Expenses

  public listExpenses(groupId: string, withShares = true): Promise<Expense[]> {
    return this.call("list_expenses", { group_id: groupId, with_shares: withShares });
  }

  public getExpense(expenseId: string): Promise<Expense> {
    return this.call("get_expense", { expense_id: expenseId });
  }

  public createExpense(input: CreateExpenseInput): Promise<Expense> {
    return this.call("create_expense", input);
  }

  public updateExpense(
    expenseId: string,
    changes: Partial<Omit<CreateExpenseInput, "group_id">>,
  ): Promise<Expense> {
    return this.call("update_expense", { expense_id: expenseId, ...changes });
  }

  public deleteExpense(expenseId: string): Promise<null> {
    return this.call("delete_expense", { expense_id: expenseId });
  }

  public listExpenseShares(groupId: string): Promise<ExpenseShare[]> {
    return this.call("list_expense_shares", { group_id: groupId });
  }

  // Payments

  public listPayments(groupId: string): Promise<Payment[]> {
    return this.call("list_payments", { group_id: groupId });
  }

  public createPayment(input: CreatePaymentInput): Promise<Payment> {
    return this.call("create_payment", input);
  }

  public deletePayment(paymentId: string): Promise<null> {
    return this.call("delete_payment", { payment_id: paymentId });
  }

  private call<T>(command: string, payload: object = {}): Promise<T> {
    return this.hass.callWS<T>({
      type: `shared_expenses/${command}`,
      ...payload,
    });
  }
}
