/**
 * The balances of one project, as a card on a dashboard.
 *
 * A thin thing on purpose: `se-balance-card` already answers "who owes what to
 * whom", and already knows the three shapes that question takes — the face-off
 * when two people owe each other, the transfers when more do, and the group's
 * own view when nobody is looking from the inside. None of that is repeated
 * here. This finds out what to hand it, and hands it that.
 *
 * The one thing this buys that an entity never could: **it speaks to you.** A
 * card runs in the browser of whoever is looking, with their own connection, so
 * it asks the WebSocket API exactly as the panel does and the API knows who is
 * asking. The same card, in the same dashboard, tells you what you owe and
 * tells Antonin what he owes. An entity's state is one string for the whole
 * house, which is why the entities say "Antonin: -42,71" and never "you".
 *
 * It follows that the project's dashboard switch has nothing to do with this.
 * Nothing here is an entity, so nothing here is behind that wall — `Scope.GROUP`
 * refuses a stranger at the door, the same door the panel uses. The card works
 * with the switch shut.
 */

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./components/se-balance-card";
import { SharedExpensesApi } from "./services/api";
import { errorMessage, localizer } from "./services/localize";
import type { Localizer } from "./services/localize";
import { sharedStyles } from "./styles/shared";
import type { Balance, HomeAssistant, Member, Settlement } from "./types";

interface CardConfig {
  type: string;
  group_id?: string;
}

@customElement("shared-expenses-card")
export class SharedExpensesCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: CardConfig;

  @state() private balances: Balance[] = [];
  @state() private settlements: Settlement[] = [];
  @state() private members: Member[] = [];
  @state() private currency = "EUR";

  @state() private error?: string;
  @state() private loading = true;

  /** How to stop listening, once we are. */
  private unsubscribe?: () => Promise<void>;

  /** The project this card is already showing, so it is not reloaded forever. */
  private loadedFor?: string;

  /**
   * Which project to show.
   *
   * Throwing is how a Lovelace card reports a config it cannot use: Home
   * Assistant catches it and puts the message on the card, where the person
   * writing the YAML is looking. Saying where the id lives is the whole of the
   * help they need — no selector lists a project, so there is nowhere else to
   * find out.
   */
  public setConfig(config: CardConfig): void {
    if (!config?.group_id) {
      throw new Error(
        "shared-expenses-card needs a group_id. Every entity of the project " +
          "carries it: Developer tools → States.",
      );
    }

    this.config = config;
  }

  /**
   * What the card picker drops in when it is picked.
   *
   * Without this it would offer a card that throws on sight. The first project
   * of whoever is adding it is a guess, but it is a working one, and the id is
   * right there in the YAML to change.
   */
  public static async getStubConfig(hass: HomeAssistant): Promise<CardConfig> {
    const groups = await new SharedExpensesApi(hass).listGroups(false).catch(() => []);

    return { type: "custom:shared-expenses-card", group_id: groups[0]?.id };
  }

  /** Roughly the height of the answer, in Home Assistant's own unit of card. */
  public getCardSize(): number {
    return 3;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    this.refresh();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    // Dropped rather than kept: a card taken off the view is put back as a new
    // one, and its old subscription would outlive it on the connection.
    this.loadedFor = undefined;

    void this.stop();
  }

  protected willUpdate(): void {
    this.refresh();
  }

  /**
   * Load the project, once.
   *
   * The guard is the point. Home Assistant hands a card a new `hass` on every
   * state change anywhere in the house — a light, a sensor, a door — so this
   * runs constantly and must do nothing almost every time.
   */
  private refresh(): void {
    const groupId = this.config?.group_id;

    if (!this.hass || !groupId || !this.isConnected || this.loadedFor === groupId) {
      return;
    }

    this.loadedFor = groupId;

    void this.start(groupId);
  }

  private async start(groupId: string): Promise<void> {
    await this.stop();
    await this.load(groupId);

    // A dashboard is left running on a kitchen wall for days, where the panel
    // is opened and closed. Without this the card would sit on the balances as
    // they were when the page was loaded, and look perfectly current doing it.
    try {
      this.unsubscribe = await this.api!.subscribeGroup(groupId, () => {
        void this.load(groupId);
      });
    } catch {
      // The load above already said what is wrong, in words. A card that could
      // not listen still shows what it read.
    }
  }

  private async stop(): Promise<void> {
    const unsubscribe = this.unsubscribe;

    this.unsubscribe = undefined;

    // The socket is often already gone: it going is what tore the card down.
    await unsubscribe?.().catch(() => undefined);
  }

  private async load(groupId: string): Promise<void> {
    const api = this.api;

    if (!api) {
      return;
    }

    try {
      const [group, result, members] = await Promise.all([
        api.getGroup(groupId),
        api.getBalances(groupId),
        // Everybody, including whoever left: leaving does not clear a debt, so
        // a settlement can still name them, and a name has to resolve.
        api.listMembers(groupId, true),
      ]);

      this.currency = group.currency;
      this.balances = result.balances;
      this.settlements = result.settlements;
      this.members = members;
      this.error = undefined;
    } catch (err) {
      // Including "no such project", which is what being refused looks like
      // from here — the API hides what is not yours rather than denying it.
      this.error = errorMessage(err, this.localize);
    } finally {
      this.loading = false;
    }
  }

  private get api(): SharedExpensesApi | undefined {
    return this.hass ? new SharedExpensesApi(this.hass) : undefined;
  }

  private get language(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private get localize(): Localizer {
    return localizer(this.language);
  }

  /**
   * Which member you are, or null when the account is nobody in this project.
   *
   * Null is the kitchen tablet, and an ordinary answer rather than a failure:
   * the card drops to the project's own view, and says who owes whom without
   * ever saying "you". Same as the panel on the same tablet.
   */
  private meId(): string | null {
    const userId = this.hass?.user?.id;

    if (!userId) {
      return null;
    }

    return this.members.find((member) => member.user_id === userId)?.id ?? null;
  }

  /**
   * Go and record the reimbursement, where it can be recorded.
   *
   * The line is the same one the panel offers, and there it opens the payment
   * dialog filled in. A dashboard has nothing to open it in, so this walks to
   * the project instead and the line there does the rest. One tap more than
   * the panel, and nothing pretended.
   */
  private settleUp = () => {
    const path = `/shared_expenses/group/${this.config!.group_id}`;

    history.pushState(null, "", path);

    // How Home Assistant is told to route: it owns the page, this card does
    // not, and reloading the browser at the new address would throw the whole
    // frontend away to move one screen.
    window.dispatchEvent(
      new CustomEvent("location-changed", { bubbles: true, composed: true }),
    );
  };

  protected render() {
    if (this.error) {
      return html`<div class="card note">${this.error}</div>`;
    }

    if (this.loading) {
      return html`<div class="card note">${this.localize("loading")}</div>`;
    }

    return html`
      <se-balance-card
        .localize=${this.localize}
        .balances=${this.balances}
        .settlements=${this.settlements}
        .members=${this.members}
        .meId=${this.meId()}
        .currency=${this.currency}
        .language=${this.language}
        @settle-up=${this.settleUp}
      ></se-balance-card>
    `;
  }

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }

      .note {
        padding: 16px;
        color: var(--secondary-text-color);
      }
    `,
  ];
}

/**
 * Offer the card in the picker.
 *
 * Undocumented and universal: it is how every custom card in the wild is
 * listed, and there is no supported alternative.
 */
interface CustomCard {
  type: string;
  name: string;
  description: string;
}

const cards = ((window as unknown as { customCards?: CustomCard[] }).customCards ??=
  []);

cards.push({
  type: "shared-expenses-card",
  name: "Shared Expenses",
  description: "Who owes what to whom, in one project.",
});

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-card": SharedExpensesCard;
  }
}
