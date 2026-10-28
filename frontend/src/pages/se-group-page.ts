import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import { renderAvatar } from "../components/avatar";
import { expenseTileStyles, renderExpenseTile } from "../components/expense-tile";
import { withAvatars } from "../services/avatar";
import "../components/se-balance-card";
import "../components/se-button";
import type { CalendarMark } from "../components/se-calendar";
import "../components/se-calendar";
import "../components/se-field";
import "../components/se-icon";
import "../components/se-segmented";
import "../dialogs/se-categories-dialog";
import "../dialogs/se-check-dialog";
import "../dialogs/se-expense-dialog";
import "../dialogs/se-group-dialog";
import "../dialogs/se-history-dialog";
import "../dialogs/se-member-dialog";
import "../dialogs/se-payment-dialog";
import "../dialogs/se-recurring-dialog";
import "../dialogs/se-statistics-dialog";
import type { SharedExpensesApi } from "../services/api";
import {
  firstWeekday,
  localToday,
  readView,
  rememberView,
  type ListView,
} from "../services/calendar";
import {
  colorFor,
  dateToIso,
  formatDayDate,
  formatLongDay,
  formatMoney,
  formatMonthLong,
  isoToDateInput,
  moneyNeedles,
  sortByName,
} from "../services/format";
import { errorMessage, type Localizer } from "../services/localize";
import { countChecks, findChecks, type Checks } from "../services/checks";
import { shortDay, varies, whoPays } from "../services/recurrence";
import { monthOf } from "../services/statistics-period";
import { sharedStyles } from "../styles/shared";
import type {
  Category,
  Expense,
  Group,
  GroupBalances,
  GroupMember,
  GroupRole,
  HomeAssistant,
  Member,
  Payment,
  PaymentKind,
  Permission,
  Recurring,
  Settlement,
} from "../types";

type Dialog =
  | "expense"
  | "payment"
  | "member"
  | "group"
  | "categories"
  | "history"
  | "statistics"
  | "recurring"
  | "check";

/**
 * One thing that happened in the group, expense or payment alike.
 *
 * `at` is the date you typed, `addedAt` when it was actually entered. Both are
 * needed: a date input carries no time, so everything on the same day shares
 * one timestamp and would otherwise come out in no particular order.
 */
type Activity =
  | { kind: "expense"; at: string; addedAt: string; expense: Expense }
  | { kind: "payment"; at: string; addedAt: string; payment: Payment };

/** How far the plus is dragged before it means a reimbursement, in pixels. */
const FAB_DRAG = 40;

/** Detail of a group: balances, expenses and members. */
@customElement("se-group-page")
export class SeGroupPage extends LitElement {
  @property({ attribute: false }) public api!: SharedExpensesApi;

  /** Passed straight to ha-menu-button, which is the only thing here using it. */
  @property({ attribute: false }) public hass!: HomeAssistant;

  /** Home Assistant's own: the sidebar is not on screen. Same use as hass. */
  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public groupId!: string;

  @property({ type: String }) public language = "en";

  /** The Home Assistant account looking at the panel, to know who "you" is. */
  @property({ type: String }) public userId: string | null = null;

  /**
   * Open a fresh expense the moment the group is loaded, then say it is done.
   *
   * Set by the app when the address carried `new=expense` — the dashboard card's
   * "+ expense" walking straight here. Consumed once, on the load that follows,
   * so switching groups afterwards does not keep reopening it.
   */
  @property({ type: Boolean }) public openNewExpense = false;

  @state() private group?: Group;

  /** Every group the user belongs to, for the switcher. */
  @state() private groups: Group[] = [];

  @state() private menu?: "groups" | "more";

  /** Members still in the group: who can be picked for anything new. */
  @state() private members: Member[] = [];

  /**
   * Members including those who left.
   *
   * Only for putting a name on the past: someone who left keeps their old
   * expenses, and may still owe money. They must never be offered as a payer.
   */
  @state() private pastMembers: Member[] = [];

  /** Who holds which role here. Only ever read to know what to offer. */
  @state() private memberships: GroupMember[] = [];

  @state() private categories: Category[] = [];

  @state() private expenses: Expense[] = [];

  @state() private payments: Payment[] = [];

  /** What comes back: the rent, the subscriptions. */
  @state() private recurring: Recurring[] = [];

  /** The checks a member answered "this is right", as `kind|key`. */
  @state() private answered: string[] = [];

  /** A recurring expense opened to be changed, in the expense dialog. */
  @state() private editedRecurring?: Recurring;

  /** A recurring expense whose waiting occurrence is being checked. */
  @state() private checking?: Recurring;

  /** The occurrence being answered from the list, so it is not answered twice. */
  @state() private answering?: string;

  @state() private result?: GroupBalances;

  /** What is typed in the search box. Filters the list, never the balance. */
  @state() private query = "";

  /** The search box is open: the magnifier in the header was pressed. */
  @state() private searching = false;

  /** The list by month, or the month as a calendar. Remembered per browser. */
  @state() private view: ListView = readView();

  /** The calendar's month, `YYYY-MM`; unset means the one today falls in. */
  @state() private calendarMonth?: string;

  /** The day picked on the calendar; unset means the month's latest that has something. */
  @state() private calendarDay?: string;

  @state() private loading = true;

  @state() private error?: string;

  @state() private dialog?: Dialog;

  @state() private prefill?: Settlement;

  @state() private editedExpense?: Expense;

  @state() private editedPayment?: Payment;

  /** Where the plus was pressed. The render does follow this one, via below. */
  private fabFrom?: { x: number; y: number };

  /** The plus is being dragged: it would record a reimbursement, not spend. */
  @state() private addingPayment = false;

  /** The drag already acted; swallow the click the browser sends after it. */
  private draggedAway = false;

  /** The plus was pressed: the four things it adds are on screen to pick from. */
  @state() private choosing = false;

  /** What a new entry from the plus opens as: a purchase, or a shop's refund. */
  @state() private newRefund = false;

  /** What a new payment from the plus opens as. */
  @state() private paymentKind: PaymentKind = "reimbursement";

  @state() private busy = false;

  @state() private confirmingDelete = false;

  public static styles = [
    sharedStyles,
    expenseTileStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      /*
       * The banner every other Home Assistant panel wears. Its colours come
       * from the theme: hard-coding a grey would look wrong the moment someone
       * picks a theme that is not the default.
       */
      /*
       * Above the scrim, so the buttons it carries stay live while a menu is
       * open: pressing the same button again is how you close it.
       */
      .toolbar {
        background: var(--app-header-background-color, var(--primary-color, #03a9f4));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        position: sticky;
        top: 0;
        z-index: 4;
      }

      .page {
        /*
         * Room at the foot for the last row to clear the add button. The FAB is
         * fixed 20px up and 56px tall, so anything in the last 76px sits under
         * it — the final expense, most of all, which is the newest and the one
         * you just came to see. The extra bottom padding is scrolled into, so it
         * lifts only that last row above the button, without spacing the list.
         */
        padding: 16px 16px calc(56px + 20px + 16px);
        max-width: 720px;
        margin: 0 auto;
      }

      /*
       * The full width of the window, like every other Home Assistant header.
       * The page below keeps its 720px column — a line of text that long is
       * unreadable, which is not true of a title and two buttons. Capping the
       * header as well left it floating in the middle of a desktop screen,
       * detached from the banner it is painted on.
       *
       * As tall as every other header in Home Assistant, and from the same
       * variable rather than a number of our own: a theme that sets its bars
       * taller means it, and ours would have stayed the odd one out.
       *
       * Positioned: the menus hang from it, see .menu.
       */
      .header {
        display: flex;
        align-items: center;
        /* 8 and not 12: with three buttons on the bar, the title needs it to
           stay on one line in French at 360 pixels (165 for 160 at 12). */
        gap: 8px;
        padding: 4px 16px;
        min-height: var(--header-height, 56px);
        box-sizing: border-box;
        position: relative;
      }

      .chevron {
        color: var(--secondary-text-color);
      }

      .titles {
        flex: 1;
        min-width: 0;
      }

      /*
       * One line, always. The bar gained the magnifier and the statistics, and
       * "Dépenses partagées" went onto two lines on a phone, pushing the whole
       * page down by one. Cut with an ellipsis as a last resort — the longest
       * of the eight, the Portuguese, on the narrowest glass — rather than
       * wrapped.
       */
      .titles h1 {
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* The bar's buttons side by side, without the header's gap between them:
         each keeps its own padding to be pressed, and the title gets the room. */
      .actions {
        display: flex;
        flex: none;
        margin-right: -6px;
      }

      .switcher {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 2px 0 0;
        cursor: pointer;
        color: inherit;
        opacity: 0.85;
        font-family: inherit;
        font-size: 15px;
        max-width: 100%;
      }

      .switcher .current {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .switcher .caret {
        font-size: 12px;
      }

      .icon {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .icon:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      /* Within thumb reach, where Home Assistant puts its own add buttons. */
      .fab {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2;
        width: 56px;
        height: 56px;
        border: none;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.12s ease, background 0.12s ease;
        /*
         * The drag is the button's own: without this the browser would scroll
         * the page under the finger and cancel the pointer, and the plus would
         * only ever add an expense.
         */
        touch-action: none;
      }

      /* Dragged: it says what it would do now, before the finger lifts. */
      .fab.reimbursing {
        background: var(--se-positive);
        transform: scale(1.08);
      }

      .fab-hint {
        position: fixed;
        right: 20px;
        bottom: 88px;
        z-index: 2;
        padding: 8px 14px;
        border-radius: 16px;
        background: var(--se-positive);
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        /* Never under the finger that is dragging past it. */
        pointer-events: none;
      }

      .fab:hover {
        transform: scale(1.06);
      }

      /* Its display is set above, which would win over the attribute alone. */
      .fab[hidden] {
        display: none;
      }

      /*
       * What the plus adds, once pressed. An expense is what it adds nine times
       * in ten, so it takes the plus's own place, the same blue disc under the
       * same thumb: a second press where the first one landed adds an
       * expense, and the other three are above it for whoever is looking.
       * Nothing moves or fades in: a choice that slid into place would be
       * missed by the thumb pressing twice.
       */
      .choice-scrim {
        position: fixed;
        inset: 0;
        z-index: 5;
        background: rgba(0, 0, 0, 0.5);
      }

      .choices {
        position: fixed;
        right: 24px;
        bottom: calc(20px + 56px + 18px);
        z-index: 6;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 14px;
      }

      .choice {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        font-family: inherit;
        text-align: right;
        cursor: pointer;
      }

      .choice .label {
        max-width: min(260px, calc(100vw - 120px));
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-size: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      }

      .choice .hint {
        display: block;
        margin-top: 1px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .choice .disc {
        width: 48px;
        height: 48px;
        flex: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      }

      /* The expense, exactly where the plus was. */
      .choice.main {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 6;
      }

      .choice.main .disc {
        width: 56px;
        height: 56px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      }

      .scrim {
        position: fixed;
        inset: 0;
        z-index: 3;
      }

      /*
       * Under the button that opened it, wherever the page has been scrolled.
       *
       * Absolute against the header, not fixed against the viewport. Both were
       * tried and both were wrong on their own: absolute against the *host*
       * pinned the menu 64px from the top of an element as tall as the whole
       * page, so once scrolled down it opened above the screen and never
       * showed; fixed cured that but hung the menu off the viewport, and the
       * viewport is not the panel — Home Assistant's sidebar owns the left of
       * it. A left of 16px therefore parked the menu at the far edge of the
       * screen, half under the sidebar, pointing at nothing. On a phone it went
       * unseen: the viewport *is* the panel there, and a menu spanning the
       * width looks deliberate.
       *
       * The header is both: the 720px column the buttons actually live in, and
       * inside a sticky toolbar that is always on screen.
       */
      .menu {
        position: absolute;
        z-index: 1;
        top: 100%;
        width: min(320px, calc(100% - 32px));
        /* What is left below the header it drops from, less a little air. */
        max-height: calc(100dvh - var(--header-height, 56px) - 32px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
      }

      /* Each menu drops from its own button: the groups left, the rest right. */
      .menu.at-groups {
        left: 16px;
      }

      .menu.at-more {
        right: 16px;
      }

      .menu button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        text-align: left;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
      }

      .menu button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .menu button:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .menu .current-item {
        font-weight: 600;
        color: var(--primary-color, #03a9f4);
      }

      .menu .separated {
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        margin-top: 4px;
        padding-top: 12px;
      }

      /* How many questions the check has: a quiet pill, as the menu is. */
      .menu .count {
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        box-sizing: border-box;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
        color: var(--primary-color, #03a9f4);
      }

      .menu .danger {
        color: var(--error-color, #db4437);
      }

      .section-title {
        padding: 12px 16px 4px;
      }

      .archived-tag {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 4px;
        padding: 1px 5px;
      }

      .banner {
        background: var(--secondary-background-color, #f1f1f1);
        color: var(--secondary-text-color);
        border-radius: var(--se-radius);
        padding: 12px 16px;
        font-size: 13px;
      }

      /* Not about you: it says what happened, not what it does to you. */
      .amount.neutral {
        color: var(--secondary-text-color);
      }

      /*
       * A month of the list: its name and what it cost, over its rows. A run
       * of dates in full on every line said when, but never where one month
       * stopped and the next began, nor what a month came to — which is the
       * question the statistics now answer, a month at a time.
       */
      .month {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .month-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding: 0 4px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: var(--secondary-text-color);
      }

      /*
        An occurrence waiting: what it is and its figure, then the two answers
        under them, right-aligned where a thumb finds them.
      */
      .due-item {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }

      .due-top {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .due-actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
      }

      .month-head b {
        font-size: 13px;
        letter-spacing: 0;
        text-transform: none;
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
    `,
  ];

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("popstate", this.handlePop);
    void this.load();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.handlePop);
  }

  /**
   * Reload when the switcher swaps the group under us.
   *
   * The app keeps one page element and only changes `groupId` when you pick
   * another group from the header — no remount, so `connectedCallback` never
   * runs again. Without this, choosing a group did nothing: the page went on
   * showing the one it first loaded, which read as the switcher being broken.
   * The initial group is already loaded in `connectedCallback`, so this fires
   * only on a real change, where `changed.get` holds the group left behind.
   *
   * What is on screen goes first. `load` fills these in only when it succeeds,
   * so a switch that fails — the integration reloading, a dropped connection —
   * would leave the group left behind on the page while `groupId` already names
   * another: one group in the header and its expenses in the list, another one
   * in the address and in the member dialog. Cleared here, the page holds on
   * the error until a load goes through and everything on it is one group's.
   */
  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("groupId") && changed.get("groupId")) {
      this.loading = true;
      this.forget();
      void this.load();
    }
  }

  /** Drop what is on screen: none of it belongs to the group being opened. */
  private forget() {
    this.group = undefined;
    this.members = [];
    this.pastMembers = [];
    this.memberships = [];
    this.categories = [];
    this.expenses = [];
    this.payments = [];
    this.recurring = [];
    this.answered = [];
    this.result = undefined;
    this.calendarMonth = undefined;
    this.calendarDay = undefined;
  }

  protected render() {
    const translate = this.localize;

    if (this.loading || !this.group) {
      return html`
        <div class="empty">${this.error ?? translate("loading")}</div>
      `;
    }

    return html`
      ${this.renderHeader()}

      <div class="page">
        <div class="stack">
          ${this.group.archived
            ? html`<div class="banner">${translate("archived_hint")}</div>`
            : nothing}

          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}

          ${this.renderHome()}
        </div>
      </div>

      ${this.addingPayment
        ? html`<div class="fab-hint">${translate("new_payment")}</div>`
        : nothing}
      ${this.choosing ? this.renderChoices() : nothing}
      <button
        class=${`fab ${this.addingPayment ? "reimbursing" : ""}`}
        ?hidden=${this.choosing}
        aria-label=${translate("fab_add")}
        aria-haspopup="menu"
        title=${translate("fab_hint")}
        @click=${this.fabClick}
        @pointerdown=${this.fabDown}
        @pointermove=${this.fabMove}
        @pointerup=${this.fabUp}
        @pointercancel=${this.fabCancel}
      >
        <se-icon
          plain
          .icon=${this.addingPayment ? "mdi:swap-horizontal" : "mdi:plus"}
          fallback=${this.addingPayment ? "⇄" : "+"}
          .size=${26}
        ></se-icon>
      </button>

      ${this.renderDialog()}
    `;
  }

  /**
   * The four things the plus adds, each named and said in a few words.
   *
   * It used to add an expense on a press and a reimbursement on a drag, and a
   * drag is a gesture nobody guesses: the panel's second most common entry
   * was behind it, and a shop's refund and a debt behind a switch inside a
   * dialog. Here all four are on screen at once, two of them named apart
   * from each other at last: a shop giving money back, and a member paying
   * another. No close button: the dim around them closes, as back does.
   */
  private renderChoices() {
    const translate = this.localize;
    // A colour each, so the four read apart at a glance and the same one is
    // found in the same place next time: drawn from the palette the members'
    // initials sit on, which is chosen to carry white. The shop's refund wears
    // the green the list gives money coming back.
    const choice = (
      label: string,
      hint: string,
      icon: string,
      fallback: string,
      colour: string,
      pick: () => void,
    ) => html`
      <button class="choice" role="menuitem" @click=${pick}>
        <span class="label">${label}<span class="hint">${hint}</span></span>
        <span class="disc" style=${`background:${colour}`}>
          <se-icon plain .icon=${icon} fallback=${fallback} .size=${22}></se-icon>
        </span>
      </button>
    `;

    return html`
      <div class="choice-scrim" @click=${this.closeChoices}></div>
      <div
        class="choices"
        role="menu"
        aria-label=${translate("fab_add")}
        @keydown=${this.choicesKey}
      >
        ${choice(
          translate("new_debt"),
          translate("fab_debt_hint"),
          "mdi:note-edit-outline",
          "✎",
          "#c98b3e",
          () => this.pickPayment("debt"),
        )}
        ${choice(
          translate("fab_reimburse"),
          translate("fab_reimburse_hint"),
          "mdi:swap-horizontal",
          "⇄",
          "#8b5fbf",
          () => this.pickPayment("reimbursement"),
        )}
        ${choice(
          translate("kind_shop_refund"),
          translate("fab_refund_hint"),
          "mdi:storefront-outline",
          "↩",
          "var(--se-positive)",
          () => this.pickExpense(true),
        )}
      </div>
      <button
        class="choice main"
        role="menuitem"
        @click=${() => this.pickExpense(false)}
        @keydown=${this.choicesKey}
      >
        <span class="label">${translate("kind_expense")}</span>
        <span class="disc">
          <se-icon plain .icon=${"mdi:receipt-text-outline"} fallback="+" .size=${26}></se-icon>
        </span>
      </button>
    `;
  }

  /**
   * Open the choices, and leave a step behind for the phone's back button.
   *
   * The dialog's own rule: back is how a sheet is dismissed on a phone, and
   * without a step of its own it would leave the panel instead. The step is
   * handed on to the dialog picked, so one press of back closes that.
   */
  private async openChoices() {
    history.pushState({ seDialog: true }, "");
    this.choosing = true;

    // On the expense, where the plus was: Enter adds one, Escape closes.
    await this.updateComplete;
    (this.renderRoot.querySelector(".choice.main") as HTMLElement | null)?.focus();
  }

  private closeChoices = () => {
    const ours = history.state?.seDialog === true;

    this.choosing = false;

    if (ours) {
      history.back();
    }
  };

  private choicesKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.closeChoices();
    }
  };

  private pickExpense(refund: boolean) {
    this.choosing = false;
    this.newRefund = refund;
    this.editedExpense = undefined;
    this.editedRecurring = undefined;
    this.checking = undefined;
    this.show("expense", true);
  }

  private pickPayment(kind: PaymentKind) {
    this.choosing = false;
    this.paymentKind = kind;
    this.prefill = undefined;
    this.editedPayment = undefined;
    this.show("payment", true);
  }

  private renderHeader() {
    const translate = this.localize;
    const group = this.group!;

    return html`
      <div class="toolbar">
        <div class="header">
          <!--
            Home Assistant's own, not one of ours. It knows something we would
            have to guess at and would guess wrong: whether the sidebar is
            already on screen. On a desktop it is, with a burger of its own, so
            this renders nothing and there is one burger instead of two; on a
            phone the sidebar is gone and this is the way back out of the panel.
            It carries the notification dot too, which ours never did.
          -->
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>

        <div class="titles">
          <h1>${translate("app_title")}</h1>
          <button class="switcher" @click=${() => this.openMenu("groups")}>
            <span class="current">${group.name}</span>
            <span class="caret">⌄</span>
            ${group.archived
              ? html`<span class="archived-tag">${translate("archived")}</span>`
              : nothing}
          </button>
        </div>

        <!--
          The two things read most after the list itself, on the bar rather than
          in the menu: the statistics were the richest screen here and the
          hardest to find, behind a menu shared with renaming and deleting.
        -->
        <div class="actions">
        <button
          class="icon"
          aria-label=${translate(this.searching ? "search_close" : "search_open")}
          title=${translate(this.searching ? "search_close" : "search_open")}
          aria-pressed=${this.searching}
          @click=${this.toggleSearch}
        >
          <se-icon plain .icon=${"mdi:magnify"} fallback="⌕" .size=${22}></se-icon>
        </button>
        <button
          class="icon"
          aria-label=${translate("statistics")}
          title=${translate("statistics")}
          @click=${() => this.openDialog("statistics")}
        >
          <se-icon plain .icon=${"mdi:chart-bar"} fallback="▥" .size=${22}></se-icon>
        </button>
        <button
          class="icon"
          aria-label=${translate("more")}
          @click=${() => this.openMenu("more")}
        >
          <se-icon plain .icon=${"mdi:dots-vertical"} fallback="⋮" .size=${22}></se-icon>
        </button>
        </div>

        ${this.menu ? this.renderMenu() : nothing}
        </div>
      </div>
      ${this.menu
        ? html`<div class="scrim" @click=${() => (this.menu = undefined)}></div>`
        : nothing}
    `;
  }

  /**
   * The open menu, inside the header so it can hang from the right button.
   *
   * The scrim that closes it stays outside: it covers the page, never the
   * toolbar, so the button you opened it with is still there to close it.
   */
  private renderMenu() {
    return html`
      <div
        class=${`menu ${this.menu === "groups" ? "at-groups" : "at-more"}`}
        role="menu"
      >
        ${this.menu === "groups" ? this.renderGroupMenu() : this.renderMoreMenu()}
      </div>
    `;
  }

  private renderGroupMenu() {
    return html`
      ${this.groups.map(
        (group) => html`
          <button
            role="menuitem"
            class=${group.id === this.groupId ? "current-item" : ""}
            @click=${() => this.switchTo(group)}
          >
            ${group.name}
            ${group.archived
              ? html`<span class="archived-tag">${this.localize("archived")}</span>`
              : nothing}
          </button>
        `,
      )}
      <button role="menuitem" class="separated" @click=${this.goBack}>
        ${this.localize("all_groups")}
      </button>
    `;
  }

  /**
   * What you may actually do here.
   *
   * An entry that is offered and then refused is worse than one that is not
   * there: it reads as the panel being broken rather than as the project being
   * shut. So each of these appears only where the backend would let it through
   * — the same rule, asked twice, and the backend's is the one that counts.
   *
   * The members and the project stay reachable either way: the first is where
   * you rename yourself or leave, the second where you read what the project
   * counts in. Both dialogs shut their own doors rather than close.
   *
   * Three groups, each under a rule: what is read, what is managed, and what
   * puts the group away — the one that cannot be undone last and on its own,
   * never a slip of the thumb away from the history somebody came for.
   */
  private renderMoreMenu() {
    const translate = this.localize;
    const archiving = this.may("manage_group");
    // How many questions the check has, said where it is opened: a count in
    // the menu rather than a banner on the page, which nobody asked for.
    const waiting = countChecks(this.checks());

    return html`
      <button role="menuitem" @click=${() => this.openDialog("history")}>
        ${translate("group_history")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("recurring")}>
        ${translate("recurring_expenses")}
      </button>
      <button role="menuitem" @click=${() => this.openDialog("check")}>
        ${translate("check_expenses")}
        ${waiting > 0 ? html`<span class="count">${waiting}</span>` : nothing}
      </button>
      <button role="menuitem" class="separated" @click=${() => this.openDialog("member")}>
        ${translate("members")}
      </button>
      ${this.may("manage_categories")
        ? html`<button role="menuitem" @click=${() => this.openDialog("categories")}>
            ${translate("categories")}
          </button>`
        : nothing}
      <button role="menuitem" @click=${() => this.openDialog("group")}>
        ${this.may("manage_group") ? translate("edit_group") : translate("group_details")}
      </button>
      ${archiving
        ? html`<button
            role="menuitem"
            class="separated"
            ?disabled=${this.busy}
            @click=${this.toggleArchive}
          >
            ${this.group!.archived ? translate("restore") : translate("archive")}
          </button>`
        : nothing}
      ${this.myRole() === "admin"
        ? html`<button
            role="menuitem"
            class=${archiving ? "danger" : "danger separated"}
            ?disabled=${this.busy}
            @click=${this.deleteGroup}
          >
            ${this.confirmingDelete
              ? translate("confirm_delete")
              : translate("delete_group")}
          </button>`
        : nothing}
    `;
  }

  private openDialog(dialog: Dialog) {
    this.menu = undefined;
    this.show(dialog);
  }

  private openMenu(menu: "groups" | "more") {
    this.menu = this.menu === menu ? undefined : menu;
    this.confirmingDelete = false;
  }

  private switchTo(group: Group) {
    this.menu = undefined;

    if (group.id === this.groupId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("group-selected", {
        detail: { groupId: group.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private deleteGroup = async () => {
    if (!this.group) {
      return;
    }

    // Deleting takes every expense with it: ask once, in place.
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      return;
    }

    this.busy = true;

    try {
      // The group on screen, never `groupId`: they are the same one only once a
      // load has gone through, and this is the one action nothing undoes.
      await this.api.deleteGroup(this.group.id);

      this.menu = undefined;
      this.goBack();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
      this.confirmingDelete = false;
    } finally {
      this.busy = false;
    }
  };

  /**
   * The group, on one page: what is owed, then everything that happened.
   *
   * Expenses and reimbursements were on separate tabs, so a debt and the
   * payment clearing it never met, and the overview was a third view showing a
   * truncated copy of both. One list, scrolling with the page.
   */
  private renderHome() {
    return html`
      ${this.renderDue()}

      <se-balance-card
        .localize=${this.localize}
        .balances=${this.result?.balances ?? []}
        .settlements=${this.result?.settlements ?? []}
        .members=${this.pastMembers}
        .meId=${this.meId()}
        .currency=${this.group!.currency}
        .language=${this.language}
        @settle-up=${this.settleUp}
      ></se-balance-card>

      <se-segmented
        .value=${this.view}
        .options=${[
          { value: "list", label: this.localize("view_list") },
          { value: "calendar", label: this.localize("view_calendar") },
        ]}
        @value-changed=${this.pickView}
      ></se-segmented>

      ${this.searching ? this.renderSearch() : nothing}
      ${this.view === "calendar" ? this.renderCalendar() : this.renderActivityCard()}
    `;
  }

  private pickView = (event: CustomEvent) => {
    this.view = event.detail.value as ListView;
    rememberView(this.view);
  };

  /**
   * The month as a calendar, and under it what happened on the day picked.
   *
   * The same entries as the list, the search included, so switching views
   * never makes anything appear or vanish, the reimbursements with their ring.
   * The rows under it are the list's own, without the date each would repeat
   * from the heading.
   */
  private renderCalendar() {
    const today = localToday();
    const entries = this.matching();
    const months = this.activity().map((entry) => monthOf(entry.at));
    const current = today.slice(0, 7);
    const month = this.calendarMonth ?? current;
    const earliest = months.reduce((first, at) => (at < first ? at : first), current);
    const latest = months.reduce((last, at) => (at > last ? at : last), current);

    const byDay = new Map<string, Activity[]>();

    for (const entry of entries) {
      const day = isoToDateInput(entry.at);

      byDay.set(day, [...(byDay.get(day) ?? []), entry]);
    }

    const marks = new Map<string, CalendarMark[]>();

    for (const [day, onDay] of byDay) {
      // Oldest first, so a day's dots read in the order they were spent.
      marks.set(
        day,
        [...onDay].reverse().map((entry) => ({
          colour: this.colourOf(entry),
          payment: entry.kind === "payment",
        })),
      );
    }

    const day = this.calendarDay ?? this.latestDay(byDay, month, today);
    const searching = this.query.trim() !== "";

    return html`
      <div class="card">
        <se-calendar
          .localize=${this.localize}
          .language=${this.language}
          .month=${month}
          .earliest=${earliest}
          .latest=${latest}
          .today=${today}
          .selected=${day ?? null}
          .firstDay=${firstWeekday(this.language, this.hass?.locale?.first_weekday)}
          .marks=${marks}
          .spent=${searching ? "" : this.money(this.spentIn(month))}
          @month-changed=${(event: CustomEvent) => {
            this.calendarMonth = event.detail.value;
            this.calendarDay = undefined;
          }}
          @day-picked=${(event: CustomEvent) => (this.calendarDay = event.detail.value)}
        ></se-calendar>
      </div>

      ${day ? this.renderDay(day, byDay.get(day) ?? [], today, searching) : nothing}
    `;
  }

  /** What happened on one day, under a heading that says which. */
  private renderDay(day: string, entries: Activity[], today: string, searching: boolean) {
    const spent = this.expenses
      .filter((expense) => isoToDateInput(expense.expense_date) === day)
      .reduce((sum, expense) => sum + expense.converted_amount, 0);

    return html`
      <section class="month">
        <div class="month-head">
          <span>${formatLongDay(day, this.language, today)}</span>
          ${searching || spent === 0 ? nothing : html`<b>${this.money(spent)}</b>`}
        </div>
        <div class="card">
          ${entries.length === 0
            ? html`<div class="empty">
                ${searching ? this.localize("no_match") : this.localize("calendar_nothing")}
              </div>`
            : entries.map((entry) =>
                entry.kind === "expense"
                  ? this.renderExpense(entry.expense, false)
                  : this.renderPayment(entry.payment, false),
              )}
        </div>
      </section>
    `;
  }

  /**
   * The day the calendar opens on in a month: today when something happened
   * today, else the latest day that has something, else none.
   */
  private latestDay(byDay: Map<string, Activity[]>, month: string, today: string) {
    if (byDay.has(today) && today.startsWith(month)) {
      return today;
    }

    return [...byDay.keys()]
      .filter((day) => day.startsWith(month))
      .sort()
      .at(-1);
  }

  /**
   * The typing slips the check would ask about, less those already answered.
   * Worked out from the expenses on the page, each time it is asked: the menu
   * and the dialog are open seldom, and a cached answer would go stale with
   * every expense added.
   */
  private checks(): Checks {
    return findChecks(this.expenses, new Set(this.answered));
  }

  /** The colour a row of the list draws down its side, for its dot. */
  private colourOf(entry: Activity): string {
    const payerId =
      entry.kind === "expense"
        ? entry.expense.paid_by_member_id
        : entry.payment.kind === "debt"
          ? entry.payment.to_member_id
          : entry.payment.from_member_id;

    return this.memberById(payerId)?.color ?? colorFor(payerId);
  }

  /**
   * What has come back and waits for somebody to say so: the rent, the
   * electricity.
   *
   * At the top, above the balance, because it is the one thing on this page
   * asking for an answer — and an answer changes the balance underneath. Not
   * there at all when nothing waits, nor on an archived group, which nothing
   * can be added to.
   *
   * One tap for what never changes, a check for what does: a rent is added as
   * it is, the electricity opens on last time's figure to be corrected. Any
   * member answers, as any member may add an expense.
   */
  private renderDue() {
    // The longest waiting first: it is the one somebody has been meaning to do.
    const due = this.recurring
      .filter((item) => item.waiting > 0)
      .sort((a, b) => a.next_due!.localeCompare(b.next_due!));

    if (due.length === 0 || this.group!.archived) {
      return nothing;
    }

    const translate = this.localize;

    return html`
      <section class="month">
        <div class="month-head">
          <span>${translate("to_confirm")} · ${due.length}</span>
        </div>
        <div class="card">${due.map((item) => this.renderDueItem(item))}</div>
      </section>
    `;
  }

  private renderDueItem(item: Recurring) {
    const translate = this.localize;
    const payer = this.memberById(item.paid_by_member_id);
    const checked = varies(item);
    const busy = this.answering === item.id;

    const facts = [
      translate("recurring_due").replace("{date}", shortDay(item.next_due!, this.language)),
      whoPays(item, payer?.name ?? "?", this.meId(), translate),
      ...(item.waiting > 1
        ? [translate("recurring_waiting").replace("{n}", String(item.waiting))]
        : []),
    ];

    return html`
      <div
        class="item due-item"
        style=${`border-left-color:${payer?.color ?? colorFor(item.paid_by_member_id)}`}
      >
        <div class="due-top">
          <div class="info">
            <div class="title">${item.title}</div>
            <div class="muted">${facts.join(" · ")}</div>
          </div>
          <div class="tail">
            <span class="amount">
              ${formatMoney(
                checked ? item.latest_amount! : item.amount,
                item.currency,
                this.language,
              )}
            </span>
            ${checked
              ? html`<span class="converted">${translate("recurring_last")}</span>`
              : nothing}
          </div>
        </div>
        <div class="due-actions">
          <se-button
            variant="text"
            ?disabled=${busy}
            @click=${() => this.skipOccurrence(item)}
          >
            ${translate("skip")}
          </se-button>
          <se-button
            class=${checked ? "check" : "add"}
            ?disabled=${busy}
            @click=${() => (checked ? this.checkOccurrence(item) : this.addOccurrence(item))}
          >
            ${translate(checked ? "check_amount" : "add")}
          </se-button>
        </div>
      </div>
    `;
  }

  /**
   * Add the occurrence waiting, as it is proposed.
   *
   * The split is left to the backend when the recurring expense has none of its
   * own, which is the point of having none: the category's rule then the
   * group's, as they stand today. The rate too, for one in another currency.
   */
  private async addOccurrence(item: Recurring) {
    await this.answer(item, () =>
      this.api.createExpense({
        group_id: item.group_id,
        title: item.title,
        amount: item.amount,
        paid_by_member_id: item.paid_by_member_id,
        expense_date: dateToIso(item.next_due!),
        currency: item.currency,
        category_id: item.category_id,
        description: item.description,
        ...(item.split_rule ? { split_rule: item.split_rule } : {}),
        recurring_id: item.id,
        occurrence: item.next_due!,
      }),
    );
  }

  private async skipOccurrence(item: Recurring) {
    await this.answer(item, () => this.api.skipOccurrence(item.id, item.next_due!));
  }

  /**
   * Answer an occurrence from the list, then read the group again.
   *
   * Read again on a refusal as well: the usual one is somebody having answered
   * it on another phone a moment ago, and the list should stop asking.
   */
  private async answer(item: Recurring, call: () => Promise<unknown>) {
    this.answering = item.id;
    this.error = undefined;

    try {
      await call();
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.answering = undefined;
    }

    await this.load({ keepError: true });
  }

  private checkOccurrence(item: Recurring) {
    this.checking = item;
    this.editedExpense = undefined;
    this.editedRecurring = undefined;
    this.show("expense");
  }

  /** Open a recurring expense from the list, to change it. */
  private openRecurring = (event: CustomEvent) => {
    const item = this.recurring.find((entry) => entry.id === event.detail.recurringId);

    if (item && this.mayEditRecurring(item)) {
      this.editedRecurring = item;
      this.checking = undefined;
      this.editedExpense = undefined;
      this.show("expense");
    }
  };

  /**
   * Whether a recurring expense is yours to change: you set it up, you pay it,
   * or the group lets you change what is not yours — an expense's own rule.
   */
  private mayEditRecurring(item: Recurring): boolean {
    const me = this.meId();
    const mine =
      me !== null && (item.created_by_member_id === me || item.paid_by_member_id === me);

    return mine || this.may("edit_others");
  }

  /**
   * The search box, while the magnifier in the header has it open.
   *
   * It used to stand above the list at all times, a full line of the phone
   * spent on something looked for now and then. It still never comes and goes
   * on its own — a control that does is read as a bug — only on the button
   * that says it will, which is always there, in the same place.
   */
  private renderSearch() {
    return html`
      <se-field
        class="search"
        .value=${this.query}
        .label=${""}
        placeholder=${this.localize("search")}
        @value-changed=${(e: CustomEvent) => (this.query = e.detail.value)}
      ></se-field>
    `;
  }

  /**
   * Open the search box with the caret in it, or close it and forget it.
   *
   * Closed means not filtering: a list still cut down by a query nobody can
   * see any more would read as expenses gone missing.
   */
  private toggleSearch = async () => {
    if (this.searching) {
      this.searching = false;
      this.query = "";

      return;
    }

    this.searching = true;
    await this.updateComplete;

    const field = this.renderRoot.querySelector("se-field.search");

    await (field as LitElement | null)?.updateComplete;
    field?.shadowRoot?.querySelector("input")?.focus();
  };

  private renderActivityCard() {
    const entries = this.matching();

    if (entries.length === 0) {
      return html`
        <div class="card">
          <div class="empty">
            ${this.query.trim()
              ? this.localize("no_match")
              : this.localize("no_activity")}
          </div>
        </div>
      `;
    }

    // While searching, a month says no total: what it cost is the month's,
    // and a figure over a filtered list would be read as the sum of the rows
    // left — the balance's rule, for the same reason.
    const searching = this.query.trim() !== "";

    return html`${this.byMonth(entries).map(
      ({ month, entries: rows }) => html`
        <section class="month">
          <div class="month-head">
            <span>${this.monthName(month)}</span>
            ${searching ? nothing : html`<b>${this.money(this.spentIn(month))}</b>`}
          </div>
          <div class="card">
            ${rows.map((entry) =>
              entry.kind === "expense"
                ? this.renderExpense(entry.expense)
                : this.renderPayment(entry.payment),
            )}
          </div>
        </section>
      `,
    )}`;
  }

  /**
   * The list cut into months, in the order it already runs in.
   *
   * By the day typed, read in UTC as the panel reads it everywhere, so a month
   * here is the month the statistics count the same expense in.
   */
  private byMonth(entries: Activity[]): { month: string; entries: Activity[] }[] {
    const months: { month: string; entries: Activity[] }[] = [];

    for (const entry of entries) {
      const month = monthOf(entry.at);
      const last = months.at(-1);

      if (last?.month === month) {
        last.entries.push(entry);
      } else {
        months.push({ month, entries: [entry] });
      }
    }

    return months;
  }

  /**
   * What the group spent in a month: its expenses, refunds netted in, never
   * a reimbursement — the figure the statistics give for the same month.
   */
  private spentIn(month: string): number {
    return this.expenses
      .filter((expense) => monthOf(expense.expense_date) === month)
      .reduce((sum, expense) => sum + expense.converted_amount, 0);
  }

  private monthName(month: string): string {
    const name = formatMonthLong(month, this.language);

    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private money(cents: number): string {
    return formatMoney(cents, this.group!.currency, this.language);
  }

  /**
   * Everything that moved money, newest first.
   *
   * Expenses and payments are two halves of the same story: seeing them apart
   * means never knowing whether a debt was already settled.
   */
  private activity(): Activity[] {
    const entries: Activity[] = [
      ...this.expenses.map(
        (expense): Activity => ({
          kind: "expense",
          at: expense.expense_date,
          addedAt: expense.created_at,
          expense,
        }),
      ),
      ...this.payments.map(
        (payment): Activity => ({
          kind: "payment",
          at: payment.payment_date,
          addedAt: payment.created_at,
          payment,
        }),
      ),
    ];

    // Newest first, and within a single day the most recently entered first.
    return entries.sort(
      (a, b) => b.at.localeCompare(a.at) || b.addedAt.localeCompare(a.addedAt),
    );
  }

  /**
   * A payment, said the way its kind reads, and from where you stand.
   *
   * The two kinds are one movement of money and differ only in words, so the
   * words are the whole job here: a debt shown as "Dupont → Michel" reads as
   * Dupont having paid, which is true of a loan and nonsense for a debt
   * somebody is only writing down.
   *
   * Which is why the names swap round by kind. The arrow always points at
   * whoever ends up with the money — a reimbursement has sent it, a debt owes
   * it — and on a debt the one who will pay is the one who owes, which is the
   * member on the receiving end of the stored payment.
   */
  private renderPayment(payment: Payment, dated = true) {
    const debt = payment.kind === "debt";

    // Whose money leaves, and whose it becomes. The line reads payer → taker
    // whatever the kind; only which stored member is which changes.
    const payerId = debt ? payment.to_member_id : payment.from_member_id;
    const takerId = debt ? payment.from_member_id : payment.to_member_id;

    // The line is the payer's: on a reimbursement the one whose money left, on
    // a debt the one who owes it — a debt is somebody's, and it is theirs, not
    // the lender's.
    const payer = this.memberById(payerId);
    const colour = payer?.color ?? colorFor(payerId);

    // The other end. A payment has exactly one, which is what makes it a
    // payment and not an expense.
    const taker = this.memberById(takerId);

    const editable = this.mayEdit(payment);

    return html`
      <button
        class=${`item ${editable ? "item-button" : "item-fixed"}`}
        style=${`border-left-color:${colour}`}
        ?disabled=${!editable}
        @click=${() => this.openPayment(undefined, payment)}
      >
        <span class="face">
          <!--
            Whose line it is, wearing the same face the expenses above and below
            it show. This was the kind's own icon at 36px and nothing else, so
            the one list where money moves between two people was the one list
            neither of them had a face in.
          -->
          ${this.renderMemberAvatar(payer?.name ?? "?", payerId)}
          <!--
            Reimbursement or debt on the corner, exactly as an expense wears its
            category. It keeps the payer's colour, which the avatar behind it
            carries as well: the ring is what holds the two apart, and holding a
            mark apart from an avatar of its own colour is the whole reason that
            ring exists. Which of the two it is, the glyph says — a hand holding
            a coin for money still owed, two arrows for money that moved.

            Hidden from screen readers: the line underneath already says
            "Reimbursement" or "Debt" in the reader's own language.
          -->
          <se-icon
            class="pip"
            aria-hidden="true"
            .icon=${debt ? "mdi:hand-coin-outline" : "mdi:swap-horizontal"}
            .fallback=${debt ? "→" : "⇄"}
            .color=${colour}
            .size=${18}
            .glyph=${0.82}
          ></se-icon>
        </span>
        <div class="info">
          <div class="title">
            ${this.nameFrom(payerId)} → ${this.nameFrom(takerId)}
          </div>
          <!--
            Where an expense shows its category: same grid, same reading. What
            somebody wrote about it wins the line — "Dette" is already said by
            the icon and the colour, and a note is only ever there because it
            said something they were not.
          -->
          <div class="muted">
            ${payment.description || this.localize(debt ? "a_debt" : "a_settlement")}
          </div>
          ${dated
            ? html`<div class="muted">
                ${formatDayDate(payment.payment_date, this.language, "UTC")}
              </div>`
            : nothing}
        </div>
        <div class="tail">
          <span class="amount ${this.toneFor(payerId, takerId)}">
            ${formatMoney(payment.amount, payment.currency, this.language)}
          </span>
          <!-- What it weighs in the group, exactly as on an expense. -->
          ${payment.currency === this.group!.currency
            ? nothing
            : html`<span class="converted">
                ${formatMoney(
                  payment.converted_amount,
                  this.group!.currency,
                  this.language,
                )}
              </span>`}
          <!--
            Who it reaches, where an expense keeps the people who share it. The
            same stack and the same 26px, holding one face rather than several:
            a payment has one other end, and putting it anywhere else on the row
            would have been a fourth column for a list that reads in three.
          -->
          <div class="stack-avatars">
            ${renderAvatar(taker, taker?.name ?? "?", takerId, "small")}
          </div>
        </div>
      </button>
    `;
  }




  /**
   * A member's name, or "you" when it is yours.
   *
   * The balance card has always been written from where you stand — "on te
   * doit", not "Stéphane doit recevoir". The list underneath it was not, so the
   * same fact was told twice in two voices, and finding yourself in a row meant
   * spotting your own name among the others first.
   */
  private nameFrom(id: string): string {
    if (id === this.meId()) {
      return this.localize("you");
    }

    return this.memberById(id)?.name ?? "?";
  }

  /**
   * What a movement of money does to you, in one colour.
   *
   * Green when it comes your way, red when it leaves you — the reading the
   * balance card already trained. Kind has nothing to do with it: a debt owed
   * to you is money coming, and every debt used to be red on the grounds that a
   * debt is a bad thing, which is only true of the ones you owe.
   *
   * Neither, when the line is not about you: two other people settling up is a
   * fact, not good news or bad. Same when no member is you at all — an admin
   * looking in, a tablet in the kitchen. There is no point of view to take.
   */
  private toneFor(payerId: string, takerId: string): string {
    const me = this.meId();

    if (me === takerId) {
      return "positive";
    }

    return me === payerId ? "negative" : "neutral";
  }

  /** A row of the list; `dated` false under a heading that already says the day. */
  private renderExpense(expense: Expense, dated = true) {
    return renderExpenseTile(
      expense,
      {
        members: this.pastMembers,
        categories: this.categories,
        language: this.language,
        localize: this.localize,
        currency: this.group!.currency,
      },
      this.mayEdit(expense),
      () => this.openExpense(expense),
      dated,
    );
  }


  /**
   * A member as a coloured initial.
   *
   * `hint` names what the avatar stands for: on an expense row the one on the
   * left is the payer and the ones on the right are who shares it, which the
   * circles alone do not say.
   */
  private renderMemberAvatar(name: string, id: string, hint?: string) {
    return renderAvatar(this.memberById(id), name, id, "", hint ?? name);
  }

  private renderDialog() {
    if (!this.dialog || !this.group) {
      return nothing;
    }

    if (this.dialog === "expense") {
      // Keyed on the expense, because a refund opens the purchase it answers
      // without the dialog ever closing: one element left standing would keep
      // the expense it first loaded, having read it in connectedCallback and
      // never again. The same reuse that made the group switcher do nothing.
      const recurring = this.editedRecurring ?? this.checking;
      const origin = this.recurring.find(
        (item) => item.id === this.editedExpense?.recurring_id,
      );

      return keyed(
        this.editedExpense?.id ?? recurring?.id ?? "new",
        html`
          <se-expense-dialog
            .api=${this.api}
            .localize=${this.localize}
            .group=${this.group}
            .members=${recurring
              ? this.plusGone([recurring.paid_by_member_id])
              : this.membersFor(this.editedExpense)}
            .template=${this.editedRecurring}
            .occurrence=${this.checking}
            .recurring=${origin}
            .recurringEditable=${origin !== undefined && this.mayEditRecurring(origin)}
            .categories=${this.categories}
            .expense=${this.editedExpense}
            .expenses=${this.expenses}
            .refunds=${this.refundsOf(this.editedExpense)}
            .openable=${this.openableExpenses()}
            .meId=${this.meId()}
            .startRefund=${this.newRefund}
            .language=${this.language}
            @dialog-cancelled=${this.closeDialog}
            @expense-saved=${this.handleChanged}
            @expense-deleted=${this.handleChanged}
            @open-expense=${this.openRelated}
            @open-recurring=${this.openRecurring}
          ></se-expense-dialog>
        `,
      );
    }

    if (this.dialog === "payment") {
      return html`
        <se-payment-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.membersForPayment(this.editedPayment)}
          .payment=${this.editedPayment}
          .settlement=${this.prefill}
          .expenses=${this.expenses}
          .categories=${this.categories}
          .openable=${this.openableExpenses()}
          .initialKind=${this.paymentKind}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @payment-saved=${this.handleChanged}
          @payment-deleted=${this.handleChanged}
          @open-expense=${this.openRelated}
        ></se-payment-dialog>
      `;
    }

    if (this.dialog === "check") {
      return html`
        <se-check-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .checks=${this.checks()}
          .categories=${this.categories}
          .members=${this.pastMembers}
          .editable=${this.expenses
            .filter((expense) => this.mayEdit(expense))
            .map((expense) => expense.id)}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @checks-changed=${() => this.load({ keepError: true })}
          @expense-picked=${(event: CustomEvent) => {
            const expense = this.expenses.find((one) => one.id === event.detail.expenseId);

            if (expense) {
              this.openExpense(expense);
            }
          }}
        ></se-check-dialog>
      `;
    }

    if (this.dialog === "recurring") {
      return html`
        <se-recurring-dialog
          .localize=${this.localize}
          .group=${this.group}
          .recurring=${this.recurring}
          .members=${this.pastMembers}
          .editable=${this.recurring
            .filter((item) => this.mayEditRecurring(item))
            .map((item) => item.id)}
          .meId=${this.meId()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @recurring-picked=${this.openRecurring}
        ></se-recurring-dialog>
      `;
    }

    if (this.dialog === "statistics") {
      return html`
        <se-statistics-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .meId=${this.meId()}
          .expenses=${this.expenses}
          .openable=${this.openableExpenses()}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @open-expense=${this.openRelated}
        ></se-statistics-dialog>
      `;
    }

    if (this.dialog === "history") {
      return html`
        <se-history-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .members=${this.pastMembers}
          .categories=${this.categories}
          .expenses=${this.expenses}
          .payments=${this.payments}
          .openable=${this.openableEntries()}
          .meId=${this.meId()}
          .mayEditOthers=${this.may("edit_others")}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @revision-picked=${this.openFromHistory}
          @history-restored=${this.handleChanged}
        ></se-history-dialog>
      `;
    }

    if (this.dialog === "group") {
      return html`
        <se-group-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .role=${this.myRole()}
          .mayManage=${this.may("manage_group")}
          @dialog-cancelled=${this.closeDialog}
          @group-saved=${this.handleChanged}
        ></se-group-dialog>
      `;
    }

    if (this.dialog === "categories") {
      return html`
        <se-categories-dialog
          .api=${this.api}
          .localize=${this.localize}
          .group=${this.group}
          .mayManageGroup=${this.may("manage_group")}
          .members=${this.members}
          .language=${this.language}
          @dialog-cancelled=${this.closeDialog}
          @categories-changed=${this.handleChanged}
        ></se-categories-dialog>
      `;
    }

    return html`
      <se-member-dialog
        .api=${this.api}
        .hass=${this.hass}
        .localize=${this.localize}
        .groupId=${this.group.id}
        .meId=${this.meId()}
        .permissions=${this.group.permissions}
        @dialog-cancelled=${this.closeDialog}
        @members-changed=${this.handleChanged}
      ></se-member-dialog>
    `;
  }

  /** Looks among past members too: an old expense still needs a name on it. */
  private memberById(id: string): Member | undefined {
    return this.pastMembers.find((member) => member.id === id);
  }

  /**
   * Which member of this group you are, if any.
   *
   * Nobody, when the panel is open on an account no member is tied to — a
   * shared tablet in the kitchen, an admin looking at someone else's group.
   */
  private meId(): string | null {
    if (!this.userId) {
      return null;
    }

    return this.members.find((member) => member.user_id === this.userId)?.id ?? null;
  }

  /** What standing you have here, or null on an account no member is tied to. */
  private myRole(): GroupRole | null {
    const me = this.meId();

    if (me === null) {
      return null;
    }

    return (
      this.memberships.find(
        (membership) => membership.member_id === me && membership.left_at === null,
      )?.role ?? null
    );
  }

  /**
   * Whether the project lets you do this.
   *
   * The same rule the backend applies, and only ever used to decide what to
   * offer. A courtesy, never a guard: the panel is a program on somebody's
   * machine, and the door is `ensure_permission`. Offering what would be
   * refused is the thing to avoid — a button that always errors is worse than
   * no button.
   */
  private may(permission: Permission): boolean {
    const role = this.myRole();

    if (role === "admin") {
      return true;
    }

    return this.group?.permissions.includes(permission) ?? false;
  }

  /** Whether an entry is yours: you entered it, or it is about you. */
  private mine(entry: Expense | Payment): boolean {
    const me = this.meId();

    if (me === null) {
      return false;
    }

    if (entry.created_by_member_id === me) {
      return true;
    }

    return "paid_by_member_id" in entry
      ? entry.paid_by_member_id === me
      : entry.from_member_id === me || entry.to_member_id === me;
  }

  /** Whether you may open an entry to change it, rather than only read it. */
  private mayEdit(entry: Expense | Payment): boolean {
    return this.mine(entry) || this.may("edit_others");
  }

  /**
   * The refunds that name this expense.
   *
   * Filtered here rather than fetched: the page already holds every expense of
   * the group, so "how much of this came back" is a question it can answer
   * without another round trip — which is why no command lists them.
   */
  private refundsOf(expense?: Expense): Expense[] {
    if (!expense) {
      return [];
    }

    return this.expenses.filter((item) => item.refund_of === expense.id);
  }

  /**
   * Which expenses may be opened rather than only read, by id.
   *
   * For every expense of the group and not for the one on screen: the expense
   * dialog offers a way through to the purchase a refund answers, and which
   * purchase that is gets chosen in the dialog, where this page cannot see it.
   * The rule stays here — it takes the group's permissions and your role, and a
   * second copy of it would be a second thing to keep in step.
   */
  private openableExpenses(): string[] {
    return this.expenses
      .filter((expense) => this.mayEdit(expense))
      .map((expense) => expense.id);
  }

  /**
   * The same, for everything the journal points at.
   *
   * The journal lists expenses and payments side by side, so it needs both:
   * an entry whose thing this reader may not open gets no chevron, and pressing
   * it opens nothing. Ids are unique across the two, so one list serves.
   */
  private openableEntries(): string[] {
    return [
      ...this.openableExpenses(),
      ...this.payments
        .filter((payment) => this.mayEdit(payment))
        .map((payment) => payment.id),
    ];
  }

  /**
   * Who the expense dialog may offer.
   *
   * The active members, plus anyone this very expense already involves. Someone
   * removed from the group must not be pickable for something new, but an
   * expense they paid still has to show them as its payer: dropping them would
   * silently reassign it on the next save.
   */
  private membersFor(expense?: Expense): Member[] {
    if (!expense) {
      return this.members;
    }

    return this.plusGone([
      expense.paid_by_member_id,
      ...(expense.shares ?? []).map((share) => share.member_id),
    ]);
  }

  /**
   * Who the payment dialog may offer.
   *
   * Anyone still owing or owed comes along, active or not. Leaving a group does
   * not clear a debt: the balances count those who left, and a settlement they
   * owe would be impossible to record if they could not be picked. Someone gone
   * and square is left out — that is over, and the list is not a graveyard.
   *
   * Editing an existing payment offers whoever it already names, whatever their
   * balance: dropping them would silently reassign the payment on the next save.
   */
  private membersForPayment(payment?: Payment): Member[] {
    if (payment) {
      return this.plusGone([payment.from_member_id, payment.to_member_id]);
    }

    const owing = (this.result?.balances ?? [])
      .filter((balance) => balance.amount !== 0)
      .map((balance) => balance.member_id);

    return this.plusGone(owing);
  }

  private plusGone(involved: string[]): Member[] {
    const ids = new Set(involved);

    const gone = this.pastMembers.filter(
      (member) =>
        ids.has(member.id) && !this.members.some((active) => active.id === member.id),
    );

    return [...this.members, ...gone];
  }

  /**
   * Read the whole group again.
   *
   * `keepError` keeps a message just shown, for a reload that follows a refusal:
   * clearing it would take the reason away the moment it appeared.
   */
  private async load(options: { keepError?: boolean } = {}) {
    if (!options.keepError) {
      this.error = undefined;
    }

    try {
      const [
        group,
        groups,
        members,
        pastMembers,
        memberships,
        categories,
        expenses,
        payments,
        result,
        recurring,
        answered,
      ] = await Promise.all([
        this.api.getGroup(this.groupId),
        this.api.listGroups(),
        this.api.listMembers(this.groupId),
        this.api.listMembers(this.groupId, true),
        this.api.listMemberships(this.groupId),
        this.api.listCategories(this.groupId),
        this.api.listExpenses(this.groupId),
        this.api.listPayments(this.groupId),
        this.api.getBalances(this.groupId),
        this.api.listRecurring(this.groupId),
        this.api.listCheckDismissals(this.groupId),
      ]);

      this.group = group;
      this.groups = groups;
      this.members = withAvatars(members, this.hass);
      this.pastMembers = withAvatars(pastMembers, this.hass);
      this.memberships = memberships;
      this.categories = sortByName(categories, this.language);
      this.expenses = expenses;
      this.payments = payments;
      this.result = result;
      this.recurring = recurring;
      this.answered = answered;
    } catch (error) {
      this.error = errorMessage(error, this.localize);

      // Deleted, or no longer ours: say so, rather than sitting on a dead end
      // the panel would reopen at every visit.
      if ((error as { code?: string })?.code === "group_not_found") {
        this.dispatchEvent(
          new CustomEvent("group-unavailable", { bubbles: true, composed: true }),
        );
      }
    } finally {
      this.loading = false;

      // Arrived from a dashboard's "+ expense": open it now the members are
      // loaded, and tell the app so a later group switch does not reopen it.
      if (this.openNewExpense && this.group) {
        this.openExpense();
        this.dispatchEvent(
          new CustomEvent("new-expense-opened", { bubbles: true, composed: true }),
        );
      }
    }
  }

  /**
   * The plus adds an expense, and is dragged to reimburse instead.
   *
   * An expense is what you come back to enter; a reimbursement happens a few
   * times a month. Making the common one cost a tap and the rare one a gesture
   * beats a menu that charges both of them two taps.
   *
   * Any direction away from the corner counts, and generously: at the bottom
   * right of a phone the room to move is up and left, and a thumb is not a
   * pointing device.
   */
  private fabDown = (event: PointerEvent) => {
    // Capture, or a drag leaving the button would never report its end and the
    // plus would sit there thinking it is still being dragged.
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.fabFrom = { x: event.clientX, y: event.clientY };
    this.addingPayment = false;
  };

  private fabMove = (event: PointerEvent) => {
    if (!this.fabFrom) {
      return;
    }

    const dx = event.clientX - this.fabFrom.x;
    const dy = event.clientY - this.fabFrom.y;

    // Up or left only: a tap drifts a little, and it must never buy the wrong
    // dialog. Away from the corner is a move nobody makes by accident.
    this.addingPayment = dy < -FAB_DRAG || dx < -FAB_DRAG;
  };

  private fabUp = () => {
    if (!this.fabFrom) {
      return;
    }

    const payment = this.addingPayment;

    this.fabFrom = undefined;
    this.addingPayment = false;

    if (payment) {
      // A click follows a pointerup, and it would open the expense on top.
      this.draggedAway = true;
      this.openPayment();
    }
  };

  private fabCancel = () => {
    this.fabFrom = undefined;
    this.addingPayment = false;
  };

  /**
   * A plain press: the expense.
   *
   * Left to the click rather than done on pointerup, so that pressing Enter on
   * the focused button works too — a keyboard raises no pointer at all.
   */
  private fabClick = () => {
    if (this.draggedAway) {
      this.draggedAway = false;
      return;
    }

    void this.openChoices();
  };

  /**
   * The activity, filtered by what is typed.
   *
   * Matched on everything a row shows — title, description, category, the
   * people, the amount — because that is what someone types: they look for
   * "carrefour", "antonin", "essence" or "300" without thinking about which
   * field it is.
   *
   * The balance above never moves with it: it is the group's, not the list's,
   * and a total that shrank as you typed would be a lie.
   */
  private matching(): Activity[] {
    const needle = this.query.trim().toLowerCase();
    const entries = this.activity();

    if (!needle) {
      return entries;
    }

    return entries.filter((entry) => this.haystack(entry).includes(needle));
  }

  private haystack(entry: Activity): string {
    const nameOf = (id: string) => this.memberById(id)?.name ?? "";

    if (entry.kind === "payment") {
      const payment = entry.payment;

      return [
        // The word the row itself shows, which is not the same one for a debt.
        this.localize(payment.kind === "debt" ? "a_debt" : "a_settlement"),
        payment.description ?? "",
        nameOf(payment.from_member_id),
        nameOf(payment.to_member_id),
        ...this.amountNeedles(
          payment.amount,
          payment.currency,
          payment.converted_amount,
        ),
      ]
        .join(" ")
        .toLowerCase();
    }

    const expense = entry.expense;
    const category = this.categories.find((c) => c.id === expense.category_id);

    return [
      expense.title,
      expense.description ?? "",
      category?.name ?? "",
      nameOf(expense.paid_by_member_id),
      ...this.amountNeedles(
        expense.amount,
        expense.currency,
        expense.converted_amount,
      ),
    ]
      .join(" ")
      .toLowerCase();
  }

  /**
   * What was paid, and what it came to — both are findable.
   *
   * A row in a foreign currency shows two figures, and either is the one that
   * stuck in somebody's memory: the 100 they handed over, or the 87,68 it cost
   * the group.
   */
  private amountNeedles(
    amount: number,
    currency: string,
    converted: number,
  ): string[] {
    const needles = moneyNeedles(amount, currency, this.language);

    if (currency === this.group!.currency) {
      return needles;
    }

    return [
      ...needles,
      ...moneyNeedles(converted, this.group!.currency, this.language),
    ];
  }

  /** Record the reimbursement a balance line stands for, filled in with it. */
  private settleUp = (event: CustomEvent) => {
    this.openPayment(event.detail.settlement);
  };

  /**
   * Jump from an entry of the journal to the thing it is about.
   *
   * The journal closes on the way: two stacked dialogs would leave no way back
   * that is not a guess, and the history you wanted is inside the one opening.
   *
   * Checked again here rather than trusted, exactly as `openRelated` does: the
   * journal was handed what may be opened, and this is where that is decided.
   * Somebody else's expense is a row you may not press in the list, and the
   * journal is not a way round it — the dialog has no reading-only shape, so it
   * would offer a Save the backend then refuses.
   */
  private openFromHistory = (event: CustomEvent) => {
    const { entityType, entityId } = event.detail;

    if (entityType === "expense") {
      const expense = this.expenses.find((item) => item.id === entityId);

      if (expense && this.mayEdit(expense)) {
        this.openExpense(expense);
      }

      return;
    }

    const payment = this.payments.find((item) => item.id === entityId);

    if (payment && this.mayEdit(payment)) {
      this.openPayment(undefined, payment);
    }
  };

  /**
   * Jump from an expense to another it points at: a refund to its purchase.
   *
   * The same move the journal makes, and the same reasons — one dialog at a
   * time, and one step on the history stack for the whole chain, since `show`
   * pushes nothing while a dialog is already open. Checked again here rather
   * than trusted: the dialog was handed what may be opened, and this is where
   * that is decided.
   */
  private openRelated = (event: CustomEvent) => {
    const expense = this.expenses.find((item) => item.id === event.detail.expenseId);

    if (expense && this.mayEdit(expense)) {
      this.openExpense(expense);
    }
  };

  /** A suggested settlement to record, or a recorded payment to correct. */
  private openPayment(settlement?: Settlement, payment?: Payment) {
    this.prefill = settlement;
    this.editedPayment = payment;
    this.show("payment");
  }

  private openExpense(expense?: Expense) {
    this.editedExpense = expense;
    this.editedRecurring = undefined;
    this.checking = undefined;
    this.show("expense");
  }

  /**
   * Show a dialog, and leave a step behind for the phone's back button.
   *
   * Back is how you dismiss a sheet on a phone, and without a step to go back
   * to it left the panel altogether — half a typed expense gone, and Home
   * Assistant's front page instead. The step is the dialog's, and it is dropped
   * again the moment it closes, so nothing accumulates and back still leaves
   * the panel once no dialog is open.
   *
   * One step for the whole chain: the journal opens the expense it points at
   * and closes on the way, and two steps for one sheet on screen would mean
   * pressing back twice for the same thing.
   */
  private show(dialog: Dialog, stepTaken = false) {
    if (!this.dialog && !stepTaken) {
      history.pushState({ seDialog: true }, "");
    }

    this.dialog = dialog;
  }

  /**
   * Close the dialog and take its step back off the stack.
   *
   * Both, in that order and unconditionally: the dialog goes even if the step
   * is not ours to drop — a dialog you cannot dismiss is worse than a stray
   * entry in the history.
   */
  private closeDialog = () => {
    const ours = history.state?.seDialog === true;

    this.clearDialog();

    if (ours) {
      history.back();
    }
  };

  /** Back was pressed with a dialog open: the browser dropped the step for us. */
  private handlePop = () => {
    this.choosing = false;

    if (this.dialog) {
      this.clearDialog();
    }
  };

  private clearDialog() {
    this.dialog = undefined;
    this.prefill = undefined;
    this.editedExpense = undefined;
    this.editedPayment = undefined;
    this.editedRecurring = undefined;
    this.checking = undefined;
    this.newRefund = false;
    this.paymentKind = "reimbursement";
  }

  private handleChanged = () => {
    this.closeDialog();
    void this.load();
  };

  /** Archiving is reversible and freezes the group: no confirmation needed. */
  private toggleArchive = async () => {
    if (!this.group) {
      return;
    }

    this.busy = true;
    this.error = undefined;

    try {
      const group = await this.api.archiveGroup(this.group.id, !this.group.archived);

      this.group = group;

      // The switcher reads its own list, filled in by `load` and by nothing
      // else: left alone it would go on showing the tag this group has just
      // dropped, next to groups that do wear theirs. A new array, or Lit sees
      // the same one and draws the same thing.
      this.groups = this.groups.map((item) => (item.id === group.id ? group : item));

      this.menu = undefined;
    } catch (error) {
      this.error = errorMessage(error, this.localize);
    } finally {
      this.busy = false;
    }
  };

  private goBack = () => {
    this.dispatchEvent(new CustomEvent("navigate-back", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "se-group-page": SeGroupPage;
  }
}
