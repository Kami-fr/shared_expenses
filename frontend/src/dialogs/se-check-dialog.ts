import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "../components/se-button";
import "../components/se-dialog";
import type { SharedExpensesApi } from "../services/api";
import {
  type AmountCheck,
  type CategoryCheck,
  type CheckKind,
  type Checks,
  type DuplicateCheck,
  type NamesCheck,
} from "../services/checks";
import { formatDayDate, formatMoney, formatMoneyRange } from "../services/format";
import { errorMessage, type Key, type Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";
import type { Category, Expense, Group, Member } from "../types";

/**
 * The group's expenses looked over for typing slips, one card per question.
 *
 * Grouped by kind of slip, each question on a card of its own with its two
 * answers, the way "To confirm" asks on the group page: "this is right" on
 * the left, the correction on the right, filled. The correction is the one
 * the check found likeliest; anything it cannot guess opens the expense.
 *
 * Nothing here decides what is wrong — the page hands the checks in, worked
 * out from what it already holds — and nothing changes without a press. Fires
 * `checks-changed` after every answer, for the page to read the group again,
 * and `expense-picked` when an expense is to be opened instead.
 */
@customElement("se-check-dialog")
export class SeCheckDialog extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ attribute: false }) public group!: Group;

  @property({ attribute: false }) public checks!: Checks;

  @property({ attribute: false }) public categories: Category[] = [];

  /** Members including those who left: one may still be down as paying. */
  @property({ attribute: false }) public members: Member[] = [];

  /** The expenses this reader may change: the group page's rule. */
  @property({ attribute: false }) public editable: string[] = [];

  @property({ type: String }) public language = "en";

  /** The name picked to keep, per question, when not the commonest. */
  @state() private keep = new Map<string, string>();

  /** The question being answered, so it is not answered twice. */
  @state() private busy?: string;

  @state() private error?: string;

  public static styles = [
    sharedStyles,
    css`
      /* The list's own month heading: what kind of slip, and how many. */
      .kind {
        margin: 16px 0 8px;
        padding: 0 4px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }

      .kind:first-of-type {
        margin-top: 4px;
      }

      /* A question on a surface of its own, as the statistics' sections. */
      .question {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        background: color-mix(
          in srgb,
          var(--primary-text-color) 5%,
          var(--card-background-color, #fff)
        );
      }

      .question + .question {
        margin-top: 8px;
      }

      .line {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }

      .name {
        min-width: 0;
        font-size: 15px;
        font-weight: 500;
        overflow-wrap: anywhere;
      }

      .figure {
        flex: none;
        font-size: 15px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }

      .fact {
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }

      .fact b {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .answers {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
      }

      .spellings {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
      }

      /* A name to keep: a chip with a body, tinted on the one kept. */
      .spelling {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 32px;
        padding: 0 12px;
        border: none;
        border-radius: 16px;
        background: var(--divider-color, rgba(0, 0, 0, 0.08));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
      }

      .spelling small {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .spelling[aria-pressed="true"] {
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
        color: var(--primary-color, #03a9f4);
        font-weight: 500;
      }

      .spelling[aria-pressed="true"] small {
        color: inherit;
      }

      .hint {
        padding-top: 14px;
        font-size: 13px;
        line-height: 1.4;
      }
    `,
  ];

  protected render() {
    const translate = this.localize;
    const { amounts, names, duplicates, categories } = this.checks;
    const none = amounts.length + names.length + duplicates.length + categories.length === 0;

    return html`
      <se-dialog
        open
        heading=${translate("check_expenses")}
        .localize=${this.localize}
        @dialog-closed=${this.close}
      >
        ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
        ${none
          ? html`<div class="empty">${translate("check_nothing")}</div>`
          : html`
              ${this.renderKind("check_names", names, (check) => this.renderNames(check))}
              ${this.renderKind("check_duplicates", duplicates, (check) =>
                this.renderDuplicate(check),
              )}
              ${this.renderKind("check_amounts", amounts, (check) => this.renderAmount(check))}
              ${this.renderKind("check_categories", categories, (check) =>
                this.renderCategory(check),
              )}
              <div class="muted hint">${translate("check_hint")}</div>
            `}

        <se-button slot="actions" variant="text" @click=${this.close}>
          ${translate("close")}
        </se-button>
      </se-dialog>
    `;
  }

  private renderKind<T>(heading: Key, checks: T[], render: (check: T) => unknown) {
    if (checks.length === 0) {
      return nothing;
    }

    return html`
      <div class="kind">${this.localize(heading)} · ${checks.length}</div>
      ${checks.map(render)}
    `;
  }

  private renderAmount(check: AmountCheck) {
    const { expense } = check;
    const translate = this.localize;
    const usual = this.fill(check.fix === null ? "check_usual" : "check_usual_slip", {
      range: `<b>${formatMoneyRange(check.low, check.high, expense.currency, this.language)}</b>`,
      n: String(check.times),
    });

    return html`
      <div class="question">
        <div class="line">
          <span class="name">${expense.title}</span>
          <span class="figure">${this.money(expense.amount, expense.currency)}</span>
        </div>
        <div class="fact">${this.paid(expense)}</div>
        <div class="fact">${this.rich(usual)}</div>
        <div class="answers">
          ${this.right(check)}
          ${this.mine(expense)
            ? check.fix !== null && expense.split_rule
              ? html`<se-button
                  ?disabled=${this.busy !== undefined}
                  @click=${() =>
                    this.answer(check, () =>
                      this.api.correctExpenses(this.group.id, [expense.id], {
                        amount: check.fix!,
                      }),
                    )}
                >
                  ${translate("check_set_amount").replace(
                    "{amount}",
                    this.money(check.fix, expense.currency),
                  )}
                </se-button>`
              : html`<se-button @click=${() => this.open(expense)}>
                  ${translate("check_fix")}
                </se-button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renderNames(check: NamesCheck) {
    const translate = this.localize;
    const kept = this.keep.get(check.key) ?? check.spellings[0].title;
    const renamed = check.spellings
      .filter((spelling) => spelling.title !== kept)
      .flatMap((spelling) => spelling.ids);
    const all = check.spellings.reduce((sum, spelling) => sum + spelling.ids.length, 0);
    // Renamed together or not at all: a shop left with two names is what this
    // is meant to end, so the button is only there when every one is yours.
    const yours = renamed.every((id) => this.editable.includes(id));

    return html`
      <div class="question">
        <div class="line">
          <span class="name">${kept}</span>
          <span class="fact">${translate("check_names_count").replace("{n}", String(all))}</span>
        </div>
        <div class="fact">
          ${translate("check_names_hint").replace("{n}", String(check.spellings.length))}
        </div>
        <div class="spellings">
          ${check.spellings.map(
            (spelling) => html`
              <button
                type="button"
                class="spelling"
                aria-pressed=${spelling.title === kept ? "true" : "false"}
                @click=${() => (this.keep = new Map(this.keep).set(check.key, spelling.title))}
              >
                ${spelling.title} <small>${spelling.ids.length}</small>
              </button>
            `,
          )}
        </div>
        <div class="answers">
          ${this.right(check, "check_leave")}
          ${yours
            ? html`<se-button
                ?disabled=${this.busy !== undefined}
                @click=${() =>
                  this.answer(check, () =>
                    this.api.correctExpenses(this.group.id, renamed, { title: kept }),
                  )}
              >
                ${renamed.length === 1
                  ? translate("check_rename_one")
                  : translate("check_rename").replace("{n}", String(renamed.length))}
              </se-button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renderDuplicate(check: DuplicateCheck) {
    const { second } = check;
    const translate = this.localize;

    return html`
      <div class="question">
        <div class="line">
          <span class="name">${second.title}</span>
          <span class="figure">${this.money(second.amount, second.currency)}</span>
        </div>
        <div class="fact">
          ${this.rich(
            this.fill("check_twice", {
              date: `<b>${this.day(second)}</b>`,
              name: this.escape(this.payerName(second)),
            }),
          )}
        </div>
        <div class="answers">
          ${this.right(check, "check_two_purchases")}
          ${this.mine(second)
            ? html`<se-button
                ?disabled=${this.busy !== undefined}
                @click=${() => this.answer(check, () => this.api.deleteExpense(second.id))}
              >
                ${translate("check_delete_one")}
              </se-button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renderCategory(check: CategoryCheck) {
    const { expense } = check;
    const translate = this.localize;
    const usual = this.categoryName(check.usual);
    const filed = expense.category_id ? this.categoryName(expense.category_id) : null;

    return html`
      <div class="question">
        <div class="line">
          <span class="name">${expense.title}</span>
          <span class="figure">${this.money(expense.amount, expense.currency)}</span>
        </div>
        <div class="fact">
          ${this.rich(
            this.fill(filed === null ? "check_category_none" : "check_category_usual", {
              date: this.escape(this.day(expense)),
              category: `<b>${this.escape(filed ?? "")}</b>`,
              usual: `<b>${this.escape(usual)}</b>`,
              n: String(check.times),
            }),
          )}
        </div>
        <div class="answers">
          ${this.right(check)}
          ${this.mine(expense)
            ? html`<se-button
                ?disabled=${this.busy !== undefined}
                @click=${() =>
                  this.answer(check, () =>
                    this.api.correctExpenses(this.group.id, [expense.id], {
                      category_id: check.usual,
                    }),
                  )}
              >
                ${translate("check_set_category").replace("{category}", usual)}
              </se-button>`
            : nothing}
        </div>
      </div>
    `;
  }

  /** "This is right": kept by the backend, so the question is not asked again. */
  private right(check: { kind: CheckKind; key: string }, label: Key = "check_right") {
    return html`<se-button
      variant="text"
      ?disabled=${this.busy !== undefined}
      @click=${() =>
        this.answer(check, () => this.api.dismissCheck(this.group.id, check.kind, check.key))}
    >
      ${this.localize(label)}
    </se-button>`;
  }

  /**
   * Answer one question, then have the page read the group again: an answer
   * moves expenses, and every other question is worked out from them.
   */
  private async answer(check: { key: string }, call: () => Promise<unknown>) {
    this.busy = check.key;
    this.error = undefined;

    try {
      await call();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = undefined;
    }

    this.dispatchEvent(new CustomEvent("checks-changed", { bubbles: true, composed: true }));
  }

  private open(expense: Expense) {
    this.dispatchEvent(
      new CustomEvent("expense-picked", {
        detail: { expenseId: expense.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private mine(expense: Expense): boolean {
    return this.editable.includes(expense.id);
  }

  private paid(expense: Expense): string {
    return this.fill("check_paid", { date: this.day(expense), name: this.payerName(expense) });
  }

  private day(expense: Expense): string {
    return formatDayDate(expense.expense_date, this.language, "UTC");
  }

  private payerName(expense: Expense): string {
    return this.members.find((member) => member.id === expense.paid_by_member_id)?.name ?? "?";
  }

  private categoryName(id: string): string {
    return this.categories.find((category) => category.id === id)?.name ?? "?";
  }

  private money(cents: number, currency: string): string {
    return formatMoney(cents, currency, this.language);
  }

  private fill(key: Key, values: Record<string, string>): string {
    return Object.entries(values).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, value),
      this.localize(key),
    );
  }

  /** A sentence with its figures in bold: the only markup it carries is ours. */
  private rich(text: string) {
    const parts = text.split(/<b>|<\/b>/);

    return parts.map((part, index) => (index % 2 ? html`<b>${part}</b>` : part));
  }

  /** Names are the household's own: kept from reading as our markup. */
  private escape(text: string): string {
    return text.replace(/</g, "‹").replace(/>/g, "›");
  }

  private close = () => {
    this.dispatchEvent(new CustomEvent("dialog-cancelled", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-check-dialog": SeCheckDialog;
  }
}
