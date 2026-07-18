/**
 * A dashboard card that is nothing but "add an expense" to a group.
 *
 * No balances, no connection, no state to keep in step — it holds a group id and
 * a label, and a tap walks to the panel with the address that opens a fresh
 * expense there. The card cannot render a dialog itself; the panel owns those,
 * so this only says where to go, the same way the balance card's "+" does.
 *
 * The group it adds to is chosen once, in the editor; a tap is then a tap, with
 * nothing to fill in before you are looking at the form.
 */

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./add-editor";
import "./components/se-icon";
import { NO_COLOR } from "./components/se-color-picker";
import { localizer } from "./services/localize";
import { NEW_EXPENSE, goToGroup } from "./services/navigate";
import { SharedExpensesApi } from "./services/api";
import { sharedStyles } from "./styles/shared";
import type { HomeAssistant } from "./types";

/** The tile's colour when none is chosen: Home Assistant's own accent blue. */
export const ADD_TILE_COLOR = "#03a9f4";

export interface AddConfig {
  type: string;
  group_id?: string;
  /** The word on the button. Empty falls back to "Add expense". */
  label?: string;
  /** Its background. Absent keeps the theme's primary colour. */
  color?: string;
  /** An `mdi:*` glyph in place of the plain "+". Absent keeps the "+". */
  icon?: string;
}

@customElement("shared-expenses-add-card")
export class SharedExpensesAddCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: AddConfig;

  /**
   * Home Assistant hands a card its config here, and a card refuses one it
   * cannot use by throwing: without a group there is nowhere to add to.
   */
  public setConfig(config: AddConfig): void {
    if (!config?.group_id) {
      throw new Error(
        "shared-expenses-add-card needs a group_id — the group to add the " +
          "expense to.",
      );
    }

    this.config = config;
  }

  /** A working first guess, so the card does not drop straight to raw YAML. */
  public static async getStubConfig(hass: HomeAssistant): Promise<AddConfig> {
    const groups = await new SharedExpensesApi(hass).listGroups(false).catch(() => []);

    return { type: "custom:shared-expenses-add-card", group_id: groups[0]?.id };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("shared-expenses-add-editor");
  }

  public getCardSize(): number {
    return 1;
  }

  private get language(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private add = () => {
    goToGroup(this.config!.group_id!, NEW_EXPENSE);
  };

  protected render() {
    if (!this.config) {
      return html``;
    }

    const label = this.config.label || localizer(this.language)("action_add_expense");
    const plain = this.config.color === NO_COLOR;

    // A picked colour fills the tile; "none" leaves it the neutral card grey;
    // absent keeps the theme's accent from the stylesheet.
    const background = plain || !this.config.color ? "" : `background:${this.config.color}`;

    return html`
      <button class="tile ${plain ? "plain" : ""}" style=${background} @click=${this.add}>
        ${this.config.icon
          ? html`<se-icon plain .icon=${this.config.icon} .size=${22}></se-icon>`
          : html`<span class="plus">+</span>`}
        <span class="label">${label}</span>
      </button>
    `;
  }

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        /* Fill the cell Home Assistant lays out, so in a grid the tile stands
           exactly as tall as the tiles beside it. */
        height: 100%;
      }

      .tile {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        /* 100% of the cell in a grid; the min-height is the floor everywhere
           else, and it is what keeps a chosen icon — taller than the text line
           — from stretching the tile past the plain "+". */
        height: 100%;
        min-height: 56px;
        box-sizing: border-box;
        border: none;
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 8px 16px;
        cursor: pointer;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }

      .tile:hover {
        /* A touch darker on hover, the way Home Assistant's own buttons do. */
        filter: brightness(0.94);
      }

      /* No fill: the bare card grey, with text and icon in the normal colour
         since white would vanish on it, and a hairline so it still reads as a
         surface you can press. */
      .tile.plain {
        background: var(--card-background-color, var(--secondary-background-color, #fff));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .plus {
        font-size: 20px;
        line-height: 1;
      }
    `,
  ];
}

interface CustomCard {
  type: string;
  name: string;
  description: string;
}

const cards = ((window as unknown as { customCards?: CustomCard[] }).customCards ??=
  []);

cards.push({
  type: "shared-expenses-add-card",
  name: "Shared Expenses — Add expense",
  description: "A button that opens a new expense in a project.",
});

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-add-card": SharedExpensesAddCard;
  }
}
