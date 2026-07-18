/**
 * The visual editor shared by the "add expense" button and badge.
 *
 * Both have the same one thing worth choosing — which group the expense lands
 * in — offered as a list of the account's own groups rather than an id to
 * paste, exactly as the balance card's editor does. A label is offered too,
 * empty by default, so the button reads "Add expense" unless a dashboard wants
 * its own word for it.
 */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./components/se-color-picker";
import "./components/se-field";
import "./components/se-icon-picker";
import "./components/se-select";
import { ADD_TILE_COLOR, type AddConfig } from "./add-card";
import { SharedExpensesApi } from "./services/api";
import { localizer } from "./services/localize";
import { sharedStyles } from "./styles/shared";
import type { Group, HomeAssistant } from "./types";

@customElement("shared-expenses-add-editor")
export class SharedExpensesAddEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: AddConfig;

  @state() private groups: Group[] = [];

  /** The groups have been asked for, so the ask does not repeat every render. */
  private requested = false;

  public setConfig(config: AddConfig): void {
    this.config = config;
  }

  protected willUpdate(): void {
    if (this.hass && !this.requested) {
      this.requested = true;
      void this.loadGroups();
    }
  }

  private async loadGroups(): Promise<void> {
    if (!this.hass) {
      return;
    }

    this.groups = await new SharedExpensesApi(this.hass)
      .listGroups(false)
      .catch(() => []);
  }

  private get language(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  protected render() {
    if (!this.config) {
      return nothing;
    }

    const translate = localizer(this.language);

    return html`
      <div class="form">
        <se-select
          .label=${translate("card_group")}
          .value=${this.config.group_id ?? ""}
          .options=${this.groups.map((group) => ({
            value: group.id,
            label: group.name,
          }))}
          @value-changed=${this.pickGroup}
        ></se-select>

        <se-field
          .label=${translate("card_title")}
          .value=${this.config.label ?? ""}
          placeholder=${translate("action_add_expense")}
          @value-changed=${this.setLabel}
        ></se-field>

        <se-icon-picker
          .localize=${translate}
          .label=${translate("icon")}
          .value=${this.config.icon ?? ""}
          @value-changed=${this.setIcon}
        ></se-icon-picker>

        <se-color-picker
          allow-none
          .localize=${translate}
          .label=${translate("color")}
          .value=${this.config.color ?? null}
          .fallback=${ADD_TILE_COLOR}
          @value-changed=${this.setColor}
        ></se-color-picker>
      </div>
    `;
  }

  private pickGroup = (event: CustomEvent) => {
    this.emit({ ...this.config!, group_id: event.detail.value });
  };

  private setLabel = (event: CustomEvent) => {
    const label = (event.detail.value as string).trim();
    const next: AddConfig = { ...this.config!, label };

    // An empty label is no label: drop the key so the element falls back to
    // "Add expense" and the config stays as short as what was actually chosen.
    if (!label) {
      delete next.label;
    }

    this.emit(next);
  };

  private setIcon = (event: CustomEvent) => {
    const icon = (event.detail.value as string).trim();
    const next: AddConfig = { ...this.config! };

    // No icon is the plain "+": drop the key rather than write an empty string.
    if (icon) {
      next.icon = icon;
    } else {
      delete next.icon;
    }

    this.emit(next);
  };

  private setColor = (event: CustomEvent) => {
    const color = event.detail.value as string | null;
    const next: AddConfig = { ...this.config! };

    // Null is "automatic": the tile keeps the theme's primary colour, so the
    // key is dropped rather than pinned to whatever the primary happens to be.
    if (color) {
      next.color = color;
    } else {
      delete next.color;
    }

    this.emit(next);
  };

  private emit(config: AddConfig): void {
    this.config = config;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public static styles = [
    sharedStyles,
    css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-add-editor": SharedExpensesAddEditor;
  }
}
