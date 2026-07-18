import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import type { Key, Localizer } from "../services/localize";
import { sharedStyles } from "../styles/shared";

/**
 * Pick a colour by name, from a list you can search, or leave it to the app.
 *
 * A combobox rather than a spread of swatches: named, so it reads the way Home
 * Assistant's own colour field does, and searchable, so a long list is one word
 * away rather than a hunt. The one behind every colour in the app — members,
 * categories, the dashboard tiles — so all of them wear the same control.
 *
 * The colours are the muted set the rest of the app draws from: they sit behind
 * white text on both a light and a dark theme, which a bright palette could not.
 * The stored value stays a plain hex (or null for automatic), so nothing
 * downstream has to learn a colour name.
 *
 * It expands in place rather than floating over the page: dropped inside a
 * scrolling dialog, an overlay would be clipped at its edge, while a panel in
 * the flow simply pushes the rest down and the dialog scrolls to it.
 *
 * Fires `value-changed` with a hex colour, or null for automatic.
 */

/**
 * The value that means "no fill at all", distinct from null's "automatic".
 * Null leaves the app to pick the accent; this leaves the surface bare — the
 * neutral card grey — for the callers that offer it (`allow-none`).
 */
export const NO_COLOR = "none";

/** The named colours offered, each a hex the app already uses elsewhere. */
const COLORS: { key: Key; value: string }[] = [
  { key: "color_blue", value: "#3f7cac" },
  { key: "color_teal", value: "#3d7e7e" },
  { key: "color_green", value: "#4a7c59" },
  { key: "color_olive", value: "#5f7a3d" },
  { key: "color_amber", value: "#c98b3e" },
  { key: "color_brown", value: "#7a5c3d" },
  { key: "color_red", value: "#c05746" },
  { key: "color_pink", value: "#b0567a" },
  { key: "color_plum", value: "#8a4a6b" },
  { key: "color_purple", value: "#8b5fbf" },
  { key: "color_indigo", value: "#4a5f8a" },
  { key: "color_slate", value: "#5c6b8a" },
];

@customElement("se-color-picker")
export class SeColorPicker extends LitElement {
  @property({ attribute: false }) public localize!: Localizer;

  @property({ type: String }) public label = "";

  /** A hex colour, or null to let the app pick a stable one. */
  @property({ type: String }) public value: string | null = null;

  /** The colour used when none is chosen, so "Automatic" shows the real thing. */
  @property({ type: String }) public fallback = "#5c6b8a";

  /** Offer "None" — a bare, neutral surface — as a choice above the colours. */
  @property({ type: Boolean, attribute: "allow-none" }) public allowNone = false;

  @state() private open = false;

  @state() private query = "";

  @query(".search") private searchBox?: HTMLInputElement;

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("mousedown", this.onOutside);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("mousedown", this.onOutside);
  }

  protected updated(changed: Map<string, unknown>): void {
    // Land in the search box the moment it opens, so typing narrows the list
    // without a click first.
    if (changed.has("open") && this.open) {
      this.searchBox?.focus();
    }
  }

  private name(color: string): string {
    const found = COLORS.find(
      (entry) => entry.value.toLowerCase() === color.toLowerCase(),
    );

    // A stored colour outside the list — an older pick, or a hand-typed one —
    // shows as itself rather than as nothing.
    return found ? this.localize(found.key) : color;
  }

  protected render() {
    const translate = this.localize;

    const current =
      this.value === null
        ? translate("color_auto")
        : this.value === NO_COLOR
          ? translate("color_none")
          : this.name(this.value);

    const needle = this.query.trim().toLowerCase();
    const matches = COLORS.filter(
      (entry) => !needle || translate(entry.key).toLowerCase().includes(needle),
    );
    const showAuto = !needle || translate("color_auto").toLowerCase().includes(needle);
    const showNone =
      this.allowNone &&
      (!needle || translate("color_none").toLowerCase().includes(needle));
    const empty = matches.length === 0 && !showAuto && !showNone;

    return html`
      ${this.label ? html`<label @click=${this.toggle}>${this.label}</label>` : nothing}

      <button
        type="button"
        class="trigger"
        aria-expanded=${this.open}
        @click=${this.toggle}
      >
        ${this.dot(this.value)}
        <span class="current">${current}</span>
        <span class="caret ${this.open ? "up" : ""}">▾</span>
      </button>

      ${this.open
        ? html`
            <div class="menu">
              <input
                class="search"
                .value=${this.query}
                placeholder=${translate("color_search")}
                @input=${(e: Event) => (this.query = (e.target as HTMLInputElement).value)}
                @keydown=${this.onKey}
              />
              <div class="list">
                ${showAuto ? this.renderItem(null, translate("color_auto")) : nothing}
                ${showNone ? this.renderItem(NO_COLOR, translate("color_none")) : nothing}
                ${matches.map((entry) =>
                  this.renderItem(entry.value, translate(entry.key)),
                )}
                ${empty ? html`<div class="none">${translate("no_match")}</div>` : nothing}
              </div>
            </div>
          `
        : nothing}
    `;
  }

  /** The swatch for a value: a colour, the fallback for auto, a bare ring for none. */
  private dot(value: string | null) {
    if (value === NO_COLOR) {
      return html`<span class="dot bare" title=${this.localize("color_none")}></span>`;
    }

    return html`<span class="dot" style=${`background:${value ?? this.fallback}`}></span>`;
  }

  private renderItem(value: string | null, name: string) {
    const selected = value === this.value;

    return html`
      <button
        type="button"
        class="item ${selected ? "on" : ""}"
        @click=${() => this.pick(value)}
      >
        ${this.dot(value)}
        <span class="name">${name}</span>
        ${selected ? html`<span class="check">✓</span>` : nothing}
      </button>
    `;
  }

  private toggle = () => {
    this.open = !this.open;
    this.query = "";
  };

  private pick(color: string | null) {
    this.value = color;
    this.open = false;
    this.query = "";

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.open = false;
      return;
    }

    // Enter takes the first thing the search left standing, so a full word need
    // not be aimed at with the mouse.
    if (event.key === "Enter") {
      event.preventDefault();

      const needle = this.query.trim().toLowerCase();

      if (!needle) {
        return;
      }

      const first = COLORS.find((entry) =>
        this.localize(entry.key).toLowerCase().includes(needle),
      );

      if (first) {
        this.pick(first.value);
      } else if (this.localize("color_auto").toLowerCase().includes(needle)) {
        this.pick(null);
      } else if (
        this.allowNone &&
        this.localize("color_none").toLowerCase().includes(needle)
      ) {
        this.pick(NO_COLOR);
      }
    }
  };

  private onOutside = (event: MouseEvent) => {
    if (this.open && !event.composedPath().includes(this)) {
      this.open = false;
    }
  };

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
        cursor: pointer;
      }

      .dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      /* "None": a bare ring in the neutral surface, so it reads as no fill. */
      .dot.bare {
        background: var(--card-background-color, var(--secondary-background-color, #fff));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.3));
      }

      .trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
        border-radius: 8px;
        background: var(--card-background-color, var(--secondary-background-color, #fff));
        color: var(--primary-text-color);
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        text-align: left;
      }

      .current {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .caret {
        color: var(--secondary-text-color);
        transition: transform 0.15s ease;
      }

      .caret.up {
        transform: rotate(180deg);
      }

      .menu {
        margin-top: 6px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
        border-radius: 8px;
        background: var(--card-background-color, var(--secondary-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.2));
        overflow: hidden;
      }

      .search {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        border: none;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: transparent;
        color: var(--primary-text-color);
        font: inherit;
        font-size: 14px;
        outline: none;
      }

      .list {
        max-height: 240px;
        overflow-y: auto;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 12px;
        border: none;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        text-align: left;
      }

      .item:hover {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
      }

      .item.on {
        font-weight: 600;
      }

      .item .name {
        flex: 1;
        min-width: 0;
      }

      .check {
        color: var(--primary-color, #03a9f4);
      }

      .none {
        padding: 10px 12px;
        color: var(--secondary-text-color);
        font-size: 13px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "se-color-picker": SeColorPicker;
  }
}
