import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import "../components/se-field";
import "../components/se-select";
import type { SharedExpensesApi, CreateExpenseInput } from "../services/api";
import { colorFor, dateToIso, formatMoney, initials, parseMoney, today } from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Group, Member } from "../types";

type SplitMode = "rule" | "equal" | "custom";

/** Dialog creating an expense. Fires `expense-created` on success. */
@customElement("se-expense-dialog")
export class SeExpenseDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public members: Member[] = [];

  @property({ attribute: false }) public categories: Category[] = [];

  @property({ type: String }) public language = "en";

  /** Named `expenseTitle` because `title` is taken by HTMLElement. */
  @state() private expenseTitle = "";

  @state() private amountInput = "";

  @state() private paidBy = "";

  @state() private date = today();

  @state() private categoryId = "";

  @state() private mode: SplitMode = "rule";

  @state() private participants: Set<string> = new Set();

  @state() private customAmounts: Record<string, string> = {};

  @state() private busy = false;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      .modes {
        display: flex;
        gap: 4px;
        background: var(--secondary-background-color, #f1f1f1);
        border-radius: 10px;
        padding: 4px;
      }

      .modes button {
        flex: 1;
        border: none;
        background: none;
        border-radius: 8px;
        padding: 8px 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .modes button[aria-pressed="true"] {
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .member-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 0;
      }

      .member-row .name {
        flex: 1;
        font-size: 14px;
      }

      .member-row se-field {
        width: 120px;
      }

      .total {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color, #03a9f4);
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();

    if (!this.paidBy && this.members.length > 0) {
      this.paidBy = this.members[0].id;
    }

    this.participants = new Set(this.members.map((member) => member.id));
  }

  protected render() {
    const translate = this.localize;
    const amount = parseMoney(this.amountInput);

    return html`
      <se-dialog open heading=${translate("new_expense")} @dialog-closed=${this.cancel}>
        <div class="stack">
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          <se-field
            .label=${translate("expense_title")}
            .value=${this.expenseTitle}
            required
            placeholder="Courses Carrefour"
            @value-changed=${(e: CustomEvent) => (this.expenseTitle = e.detail.value)}
          ></se-field>

          <se-field
            .label=${translate("amount")}
            .value=${this.amountInput}
            .suffix=${this.group.currency}
            required
            decimal
            placeholder="85,42"
            @value-changed=${(e: CustomEvent) => (this.amountInput = e.detail.value)}
          ></se-field>

          <se-select
            .label=${translate("paid_by")}
            .value=${this.paidBy}
            .options=${this.members.map((m) => ({ value: m.id, label: m.name }))}
            @value-changed=${(e: CustomEvent) => (this.paidBy = e.detail.value)}
          ></se-select>

          <se-field
            .label=${translate("date")}
            type="date"
            .value=${this.date}
            @value-changed=${(e: CustomEvent) => (this.date = e.detail.value)}
          ></se-field>

          <se-select
            .label=${translate("category")}
            .value=${this.categoryId}
            .placeholder=${translate("no_category")}
            .options=${this.categories.map((c) => ({ value: c.id, label: c.name }))}
            @value-changed=${(e: CustomEvent) => (this.categoryId = e.detail.value)}
          ></se-select>

          <div>
            <label class="muted">${translate("split")}</label>
            <div class="modes" role="group">
              ${this.renderModeButton("rule", translate("split_rule"))}
              ${this.renderModeButton("equal", translate("split_equally"))}
              ${this.renderModeButton("custom", translate("split_custom"))}
            </div>
          </div>

          ${this.renderSplit(amount)}
        </div>

        <se-button slot="actions" variant="text" @click=${this.cancel}>
          ${translate("cancel")}
        </se-button>
        <se-button slot="actions" ?disabled=${this.busy || !this.isValid(amount)} @click=${this.submit}>
          ${translate("create")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderModeButton(mode: SplitMode, label: string) {
    return html`
      <button
        type="button"
        aria-pressed=${this.mode === mode}
        @click=${() => (this.mode = mode)}
      >
        ${label}
      </button>
    `;
  }

  private renderSplit(amount: number | null) {
    const translate = this.localize;

    if (this.mode === "rule") {
      return html`<div class="muted">${translate("split_rule_hint")}</div>`;
    }

    if (this.mode === "equal") {
      return html`
        <div>
          <label class="muted">${translate("participants")}</label>
          ${this.members.map(
            (member) => html`
              <div class="member-row">
                <input
                  type="checkbox"
                  .checked=${this.participants.has(member.id)}
                  @change=${() => this.toggleParticipant(member.id)}
                />
                ${this.renderAvatar(member)}
                <span class="name">${member.name}</span>
                <span class="amount muted">${this.equalShare(amount, member.id)}</span>
              </div>
            `,
          )}
        </div>
      `;
    }

    const total = this.customTotal();

    return html`
      <div>
        ${this.members.map(
          (member) => html`
            <div class="member-row">
              ${this.renderAvatar(member)}
              <span class="name">${member.name}</span>
              <se-field
                .value=${this.customAmounts[member.id] ?? ""}
                .suffix=${this.group.currency}
                decimal
                placeholder="0"
                @value-changed=${(e: CustomEvent) => this.setCustom(member.id, e.detail.value)}
              ></se-field>
            </div>
          `,
        )}
        <div class="total">
          <span class="muted">Total</span>
          <span class=${`amount ${amount !== null && total !== amount ? "negative" : ""}`}>
            ${formatMoney(total, this.group.currency, this.language)}
            ${amount !== null ? ` / ${formatMoney(amount, this.group.currency, this.language)}` : ""}
          </span>
        </div>
      </div>
    `;
  }

  private renderAvatar(member: Member) {
    return html`
      <div class="avatar" style=${`background:${member.color ?? colorFor(member.id)}`}>
        ${initials(member.name)}
      </div>
    `;
  }

  private equalShare(amount: number | null, memberId: string): string {
    if (amount === null || !this.participants.has(memberId)) {
      return "";
    }

    const ids = this.members.map((m) => m.id).filter((id) => this.participants.has(id));
    const index = ids.indexOf(memberId);

    if (index < 0 || ids.length === 0) {
      return "";
    }

    // Mirrors the backend: the leftover cents go to the first participants.
    const base = Math.floor(amount / ids.length);
    const extra = amount % ids.length;
    const share = base + (index < extra ? 1 : 0);

    return formatMoney(share, this.group.currency, this.language);
  }

  private customTotal(): number {
    return Object.values(this.customAmounts).reduce(
      (sum, value) => sum + (parseMoney(value) ?? 0),
      0,
    );
  }

  private toggleParticipant(memberId: string) {
    const next = new Set(this.participants);

    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      next.add(memberId);
    }

    this.participants = next;
  }

  private setCustom(memberId: string, value: string) {
    this.customAmounts = { ...this.customAmounts, [memberId]: value };
  }

  private isValid(amount: number | null): boolean {
    if (this.expenseTitle.trim() === "" || amount === null || amount <= 0 || !this.paidBy) {
      return false;
    }

    if (this.mode === "equal") {
      return this.participants.size > 0;
    }

    if (this.mode === "custom") {
      return this.customTotal() === amount;
    }

    return true;
  }

  private cancel = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };

  private submit = async () => {
    const amount = parseMoney(this.amountInput);

    if (amount === null) {
      return;
    }

    this.busy = true;
    this.error = undefined;

    const input: CreateExpenseInput = {
      group_id: this.group.id,
      title: this.expenseTitle.trim(),
      amount,
      paid_by_member_id: this.paidBy,
      expense_date: dateToIso(this.date),
      category_id: this.categoryId || null,
    };

    if (this.mode === "equal") {
      input.split_rule = {
        participants: [...this.participants],
        fixed: {},
        cap: null,
        remainder: "payer",
      };
    } else if (this.mode === "custom") {
      input.shares = this.members
        .map((member) => ({
          member_id: member.id,
          amount: parseMoney(this.customAmounts[member.id] ?? "") ?? 0,
        }))
        .filter((share) => share.amount !== 0);
    }

    try {
      const expense = await this.api.createExpense(input);

      this.dispatchEvent(
        new CustomEvent("expense-created", {
          detail: { expense },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-expense-dialog": SeExpenseDialog;
  }
}
