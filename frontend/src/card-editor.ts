/**
 * The visual editor for the balance card.
 *
 * Home Assistant opens this in its own card dialog when someone adds or edits
 * the card without touching YAML. It has one thing worth choosing — which group
 * the card is about — and offers it as a list rather than an id to paste: the
 * same list the panel would show, and only the groups this account is a member
 * of, so a stranger's group never surfaces here either.
 *
 * A title is offered too, empty by default: two of these cards on one dashboard
 * both read "Current balance" otherwise, with nothing to tell the kitchen's from
 * the trip's.
 *
 * Reports changes the way a Lovelace editor must: a `config-changed` event
 * carrying the whole config, which Home Assistant writes back and hands round.
 */

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./components/se-field";
import "./components/se-select";
import type { CardConfig } from "./card";
import { SharedExpensesApi } from "./services/api";
import { localizer } from "./services/localize";
import { sharedStyles } from "./styles/shared";
import type { Group, HomeAssistant } from "./types";

@customElement("shared-expenses-card-editor")
export class SharedExpensesCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private config?: CardConfig;

  @state() private groups: Group[] = [];

  /** The groups have been asked for, so the ask does not repeat every render. */
  private requested = false;

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  protected willUpdate(): void {
    // Home Assistant sets `hass` after the element is made, so the fetch waits
    // for it rather than firing from connectedCallback on nothing. Once only.
    if (this.hass && !this.requested) {
      this.requested = true;
      void this.loadGroups();
    }
  }

  private async loadGroups(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // The whole list, archived ones included: the card reads an archived group
    // as happily as a live one — only writing to it is refused — and a card
    // whose group was archived after the fact must still find its own name in
    // the picker, or the dropdown would show somebody else's group as chosen.
    this.groups = await new SharedExpensesApi(this.hass).listGroups().catch(() => []);
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
            // A dropdown has no room for the tag the group list carries, so
            // the word goes in the name itself: an archived group is a fine
            // thing to show balances for, but not one to pick unknowingly.
            label: group.archived ? `${group.name} (${translate("archived")})` : group.name,
          }))}
          @value-changed=${this.pickGroup}
        ></se-select>

        <se-field
          .label=${translate("card_title")}
          .value=${this.config.title ?? ""}
          placeholder=${translate("current_balance")}
          @value-changed=${this.setTitle}
        ></se-field>

        <label class="switch">
          <input
            type="checkbox"
            .checked=${this.config.add_button !== false}
            @change=${this.toggleAddButton}
          />
          <span>${translate("card_add_button")}</span>
        </label>
      </div>
    `;
  }

  private pickGroup = (event: CustomEvent) => {
    this.emit({ ...this.config!, group_id: event.detail.value });
  };

  private setTitle = (event: CustomEvent) => {
    const title = (event.detail.value as string).trim();
    const next: CardConfig = { ...this.config!, title };

    // An empty title is no title: drop the key rather than write "" to the
    // YAML, so the card falls back to "Current balance" and the config stays
    // as short as what was actually chosen.
    if (!title) {
      delete next.title;
    }

    this.emit(next);
  };

  private toggleAddButton = (event: Event) => {
    const show = (event.target as HTMLInputElement).checked;
    const next: CardConfig = { ...this.config! };

    // On is the default: drop the key rather than write `true`, so the config
    // only ever carries the choice that departs from it.
    if (show) {
      delete next.add_button;
    } else {
      next.add_button = false;
    }

    this.emit(next);
  };

  private emit(config: CardConfig): void {
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

      .switch {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        cursor: pointer;
      }

      .switch input {
        width: 18px;
        height: 18px;
        accent-color: var(--primary-color, #03a9f4);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "shared-expenses-card-editor": SharedExpensesCardEditor;
  }
}
