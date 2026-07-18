/**
 * The same "add an expense", shrunk to a badge.
 *
 * A badge rides the top of a dashboard next to the weather and the alarm, so it
 * is the smallest possible way to say "log what you just spent". It carries the
 * one thing it needs — which group — and a tap walks to the panel exactly as the
 * card's button does; the panel opens the form.
 */

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./add-editor";
import "./components/se-icon";
import { NO_COLOR } from "./components/se-color-picker";
import type { AddConfig } from "./add-card";
import { localizer } from "./services/localize";
import { NEW_EXPENSE, goToGroup } from "./services/navigate";
import { SharedExpensesApi } from "./services/api";
import { sharedStyles } from "./styles/shared";
import type { HomeAssistant } from "./types";

@customElement("shared-expenses-add-badge")
export class SharedExpensesAddBadge extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: AddConfig;

  public setConfig(config: AddConfig): void {
    if (!config?.group_id) {
      throw new Error(
        "shared-expenses-add-badge needs a group_id — the group to add the " +
          "expense to.",
      );
    }

    this.config = config;
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<AddConfig> {
    const groups = await new SharedExpensesApi(hass).listGroups(false).catch(() => []);

    return { type: "custom:shared-expenses-add-badge", group_id: groups[0]?.id };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("shared-expenses-add-editor");
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
    const background = plain || !this.config.color ? "" : `background:${this.config.color}`;

    return html`
      <button class="badge ${plain ? "plain" : ""}" style=${background} @click=${this.add}>
        ${this.config.icon
          ? html`<se-icon plain .icon=${this.config.icon} .size=${16}></se-icon>`
          : html`<span class="plus">+</span>`}
        <span class="label">${label}</span>
      </button>
    `;
  }

  public static styles = [
    sharedStyles,
    css`
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        /* Fixed height, so a chosen icon does not make the badge taller than
           the plain "+" version. */
        min-height: 36px;
        box-sizing: border-box;
        /* The hairline a native Home Assistant badge wears, themed. */
        border: var(--ha-card-border-width, 1px) solid
          var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        border-radius: 18px;
        padding: 4px 14px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        /* The soft lift Home Assistant's own badges wear. */
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .badge:hover {
        filter: brightness(0.94);
      }

      /* No fill: the bare card grey, text in the normal colour. */
      .badge.plain {
        background: var(--card-background-color, var(--secondary-background-color, #fff));
        color: var(--primary-text-color);
      }

      .plus {
        font-size: 16px;
        line-height: 1;
      }
    `,
  ];
}

interface CustomBadge {
  type: string;
  name: string;
  description: string;
}

const badges = ((window as unknown as { customBadges?: CustomBadge[] })
  .customBadges ??= []);

badges.push({
  type: "shared-expenses-add-badge",
  name: "Shared Expenses — Add expense",
  description: "A badge that opens a new expense in a project.",
});

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-add-badge": SharedExpensesAddBadge;
  }
}
