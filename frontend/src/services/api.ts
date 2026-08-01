/**
 * Typed client for the Shared Expenses WebSocket API.
 *
 * The frontend never talks to Home Assistant entities: every read and write
 * goes through these commands.
 */

import type {
  Category,
  ExchangeRate,
  Expense,
  ExpenseShare,
  Group,
  GroupBalances,
  GroupStatistics,
  GroupMember,
  HaUser,
  HomeAssistant,
  Member,
  Payment,
  PaymentKind,
  Permission,
  Revision,
  SplitRule,
} from "../types";

export interface CreateGroupInput {
  name: string;
  currency?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  admin_name?: string | null;
  split_rule?: SplitRule | null;
  default_category_id?: string | null;
}

/**
 * What may be changed about a project, which is not what it was made with.
 *
 * A new project allows everything, so there is nothing to say at creation; the
 * switches are the admin's afterwards. Hence its own type rather than a bare
 * `Partial<CreateGroupInput>` — sending `permissions` to create_group would be
 * refused outright, its schema not knowing the word.
 */
export interface UpdateGroupInput extends Partial<CreateGroupInput> {
  /**
   * The whole set, never a delta.
   *
   * A message that only lists what is granted cannot tell "not mentioned" from
   * "taken away", so a switch turned off has to arrive as an absence.
   */
  permissions?: Permission[];
  /** Whether the project puts its figures on the dashboard. The admin's alone. */
  exposed?: boolean;
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
  /**
   * The purchase a refund gives money back on.
   *
   * Null unlinks on an update, where leaving a field out changes nothing: taking
   * a refund off the purchase it named has to be said out loud.
   */
  refund_of?: string | null;
  /**
   * The rate to convert at, in millionths.
   *
   * Sent when the panel has shown one and had it accepted, so that what was
   * agreed to on screen is what gets stored. Left out, the manager finds one.
   */
  exchange_rate?: number;
}

export interface CreatePaymentInput {
  group_id: string;
  /** Whoever is out of pocket: they paid, or they lent. */
  from_member_id: string;
  to_member_id: string;
  /** In cents. */
  amount: number;
  payment_date: string;
  description?: string | null;
  kind?: PaymentKind;
  /** What it was handed over in. Left out, the group's own. */
  currency?: string | null;
  /**
   * The rate to convert at, in millionths.
   *
   * Sent when the panel has shown a rate and had it accepted, so that what was
   * agreed to on screen is what lands in the balances. Left out, the backend
   * finds one itself.
   */
  exchange_rate?: number;
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

  public updateGroup(groupId: string, changes: UpdateGroupInput): Promise<Group> {
    return this.call("update_group", { group_id: groupId, ...changes });
  }

  /**
   * Hand a project to another member, who becomes its admin. The admin's alone.
   *
   * Whoever gives it up becomes an ordinary member — a project has one admin,
   * so this is giving it away, not sharing it — and may then leave, which
   * without this they never could.
   */
  public transferAdmin(groupId: string, memberId: string): Promise<null> {
    return this.call("transfer_admin", {
      group_id: groupId,
      member_id: memberId,
    });
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

  /**
   * Call `onChange` whenever the group moves. Returns how to stop listening.
   *
   * The ping carries nothing, on purpose: read the group again on it rather
   * than believing it. The subscription was authorized once and the read is
   * authorized every time, so a card left open by somebody since removed from
   * the group is refused at the read, not trusted at the ping.
   */
  public subscribeGroup(
    groupId: string,
    onChange: () => void,
  ): Promise<() => Promise<void>> {
    return this.hass.connection.subscribeMessage(onChange, {
      type: "shared_expenses/subscribe_group",
      group_id: groupId,
    });
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

  /**
   * Add somebody to a project, as a member.
   *
   * There is no role to pass, and the backend's schema does not know the word:
   * a project has one admin, handed on rather than handed out.
   */
  public createMember(input: {
    name: string;
    group_id: string;
    /** A Home Assistant account id, or nothing for someone without one. */
    user_id?: string | null;
    color?: string | null;
  }): Promise<Member> {
    return this.call("create_member", input);
  }

  /**
   * Rename a member, or recolour them.
   *
   * `groupId` is which project is asking. A member is global — one per Home
   * Assistant account, across every project — so there is no per-project answer
   * to who may rename them; the project asking is the one whose leave is needed.
   */
  public updateMember(
    groupId: string,
    memberId: string,
    changes: { name?: string; color?: string | null; use_ha_avatar?: boolean },
  ): Promise<Member> {
    return this.call("update_member", {
      group_id: groupId,
      member_id: memberId,
      ...changes,
    });
  }

  /** Put an existing member back into a group they had left. */
  public addMemberToGroup(groupId: string, memberId: string): Promise<GroupMember> {
    return this.call("add_member_to_group", {
      group_id: groupId,
      member_id: memberId,
    });
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

  /**
   * Bring a deleted expense back, as the one it was.
   *
   * Takes the project as well as the expense, because there is no expense left
   * to find the project from: it is built from the deletion, which is the only
   * place it still exists.
   */
  public restoreExpense(groupId: string, expenseId: string): Promise<Expense> {
    return this.call("restore_expense", {
      group_id: groupId,
      expense_id: expenseId,
    });
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

  public updatePayment(
    paymentId: string,
    changes: Partial<Omit<CreatePaymentInput, "group_id">>,
  ): Promise<Payment> {
    return this.call("update_payment", { payment_id: paymentId, ...changes });
  }

  public deletePayment(paymentId: string): Promise<null> {
    return this.call("delete_payment", { payment_id: paymentId });
  }

  /** Bring a deleted payment back. See `restoreExpense`. */
  public restorePayment(groupId: string, paymentId: string): Promise<Payment> {
    return this.call("restore_payment", {
      group_id: groupId,
      payment_id: paymentId,
    });
  }

  // Exchange rates

  /**
   * The rate for a pair on a day.
   *
   * Answers from the source, or from what is cached, or with the last known
   * one — `stale` and `as_of` say which. Throws `exchange_rate_unavailable`
   * only when nothing is known and nothing can be reached, and then a rate has
   * to be typed.
   *
   * `groupId` is required so the wall applies: rates are public knowledge, but
   * who asks for them is not.
   */
  public getExchangeRate(
    groupId: string,
    base: string,
    quote: string,
    on: string,
  ): Promise<ExchangeRate> {
    return this.call("get_exchange_rate", {
      group_id: groupId,
      base,
      quote,
      on,
    });
  }

  /** Record a rate by hand. It becomes the last known one for the pair. */
  public setExchangeRate(
    groupId: string,
    base: string,
    quote: string,
    on: string,
    rate: number,
  ): Promise<ExchangeRate> {
    return this.call("set_exchange_rate", {
      group_id: groupId,
      base,
      quote,
      on,
      rate,
    });
  }

  // Statistics

  /** What the group spent. Leave `year` out for everything, ever. */
  public getStatistics(groupId: string, year?: number | null): Promise<GroupStatistics> {
    return this.call("get_statistics", {
      group_id: groupId,
      ...(year ? { year } : {}),
    });
  }

  // History

  /** What happened in the group, newest first. */
  public listRevisions(groupId: string, limit?: number): Promise<Revision[]> {
    return this.call("list_revisions", {
      group_id: groupId,
      ...(limit ? { limit } : {}),
    });
  }

  // `groupId` is required: a deleted expense can no longer say which group it
  // belonged to, and its history is exactly what is being asked for.
  public listEntityRevisions(groupId: string, entityId: string): Promise<Revision[]> {
    return this.call("list_entity_revisions", {
      group_id: groupId,
      entity_id: entityId,
    });
  }

  private call<T>(command: string, payload: object = {}): Promise<T> {
    return this.hass.callWS<T>({
      type: `shared_expenses/${command}`,
      ...payload,
    });
  }
}
