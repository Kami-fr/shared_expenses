import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./se-icon";
import type { Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";

interface IconEntry {
  name: string;
  keywords: string[];
}

/** The list Home Assistant's own icon picker reads, ~520 KB for 7447 icons. */
const ICON_LIST_URL = "/static/mdi/iconList.json";

const MAX_SUGGESTIONS = 48;

let pending: Promise<IconEntry[]> | null = null;

/** Fetch the icon list once per session, on first use. */
function loadIcons(): Promise<IconEntry[]> {
  if (pending === null) {
    pending = fetch(ICON_LIST_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} on ${ICON_LIST_URL}`);
        }

        return response.json() as Promise<IconEntry[]>;
      })
      .catch((error) => {
        // Let the next attempt retry rather than caching the failure.
        pending = null;
        throw error;
      });
  }

  return pending;
}

/**
 * Icon picker backed by Home Assistant's own icon list.
 *
 * Fires `value-changed` with an `mdi:*` name, or an empty string.
 */
@customElement("se-icon-picker")
export class SeIconPicker extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public label = "";

  /** An `mdi:*` name, for example `mdi:cart`. */
  @property({ type: String }) public value = "";

  @property({ type: String }) public color = "#5c6b8a";

  @state() private icons: IconEntry[] = [];

  @state() private suggestions: IconEntry[] = [];

  @state() private open = false;

  @state() private failed = false;

  public static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
      }

      label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }

      .field {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--input-fill-color, var(--secondary-background-color, #f1f1f1));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        padding: 6px 10px;
      }

      .field:focus-within {
        border-color: var(--primary-color, #03a9f4);
      }

      input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: none;
        color: var(--primary-text-color);
        font-size: 16px;
        font-family: inherit;
        padding: 6px 0;
      }

      .clear {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 18px;
        padding: 0 4px;
      }

      .grid {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        max-height: 232px;
        overflow-y: auto;
        margin-top: 4px;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
        gap: 4px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      }

      .choice {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 2px;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-family: inherit;
      }

      .choice:hover {
        background: var(--secondary-background-color, #f1f1f1);
      }

      .choice .name {
        font-size: 9px;
        line-height: 1.1;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        white-space: nowrap;
      }

      .hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
    `,
  ];

  protected render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : nothing}

      <div class="field">
        <se-icon
          .icon=${this.value || null}
          .color=${this.color}
          .size=${32}
          fallback="?"
        ></se-icon>
        <input
          .value=${this.value}
          placeholder=${this.localize("icon_search")}
          @focus=${this.handleFocus}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
        />
        ${this.value
          ? html`<button class="clear" @click=${this.clear} aria-label="×">×</button>`
          : nothing}
      </div>

      ${this.renderHint()} ${this.open ? this.renderGrid() : nothing}
    `;
  }

  private renderHint() {
    if (this.failed) {
      return html`<div class="hint">${this.localize("icon_list_failed")}</div>`;
    }

    return html`<div class="hint">${this.localize("icon_hint")}</div>`;
  }

  private renderGrid() {
    if (this.suggestions.length === 0) {
      return nothing;
    }

    return html`
      <div class="grid">
        ${this.suggestions.map(
          (entry) => html`
            <button
              class="choice"
              title=${entry.name}
              @mousedown=${(event: Event) => this.choose(event, entry.name)}
            >
              <se-icon
                .icon=${`mdi:${entry.name}`}
                .color=${this.color}
                .size=${34}
                fallback="•"
              ></se-icon>
              <span class="name">${entry.name}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private handleFocus = async () => {
    await this.ensureLoaded();

    this.search(this.stripPrefix(this.value));
    this.open = true;
  };

  private handleInput = async (event: Event) => {
    const raw = (event.target as HTMLInputElement).value;

    this.emit(raw);

    await this.ensureLoaded();

    this.search(this.stripPrefix(raw));
    this.open = true;
  };

  // `mousedown` on a choice fires before `blur`, so the pick still lands.
  private handleBlur = () => {
    this.open = false;
  };

  private choose(event: Event, name: string) {
    event.preventDefault();

    this.emit(`mdi:${name}`);
    this.open = false;
  }

  private clear = () => {
    this.emit("");
    this.suggestions = [];
  };

  private async ensureLoaded(): Promise<void> {
    if (this.icons.length > 0 || this.failed) {
      return;
    }

    try {
      this.icons = await loadIcons();
    } catch {
      // Typing an mdi name by hand still works: only the suggestions are lost.
      this.failed = true;
    }
  }

  /** Rank exact prefixes first, then any substring, then keyword matches. */
  private search(query: string) {
    const needle = query.trim().toLowerCase();

    if (needle === "") {
      this.suggestions = this.icons.slice(0, MAX_SUGGESTIONS);
      return;
    }

    const starts: IconEntry[] = [];
    const contains: IconEntry[] = [];
    const keyworded: IconEntry[] = [];

    for (const entry of this.icons) {
      if (entry.name.startsWith(needle)) {
        starts.push(entry);
      } else if (entry.name.includes(needle)) {
        contains.push(entry);
      } else if (entry.keywords?.some((word) => word.includes(needle))) {
        keyworded.push(entry);
      }

      if (starts.length >= MAX_SUGGESTIONS) {
        break;
      }
    }

    this.suggestions = [...starts, ...contains, ...keyworded].slice(0, MAX_SUGGESTIONS);
  }

  private stripPrefix(value: string): string {
    return value.startsWith("mdi:") ? value.slice(4) : value;
  }

  private emit(value: string) {
    this.value = value;

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "se-icon-picker": SeIconPicker;
  }
}
