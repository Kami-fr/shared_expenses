/**
 * The sidebar's coin is drawn even when the sidebar comes first.
 *
 * The bundle loads alongside Home Assistant's frontend, and on the first load
 * after a restart the sidebar can draw the panel's icon before the bundle has
 * registered `shared_expenses:*`. Measured on a throwaway Home Assistant: held
 * back six seconds, the bundle without a redraw left the icon blank for good.
 *
 * Runs in Chromium, without the harness: its `ha-icon` stand-in draws any name,
 * and what matters here is the real one's rule (frontend `ha-icon.ts`,
 * `_loadIcon`), copied below — an unknown prefix falls back to an
 * `<iron-icon>` nobody defines, and only an `mdi:` name takes that back.
 */

import { expect, it } from "vitest";

type IconSets = Record<string, { getIcon: (name: string) => Promise<{ path: string }>; getIconList?: () => Promise<{ name: string }[]> }>;

const iconSets = () => (window as unknown as { customIcons?: IconSets }).customIcons;

class HaIcon extends HTMLElement {
  #icon?: string;
  #legacy = false;
  #path = "";
  updateComplete: Promise<void> = Promise.resolve();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  get icon() {
    return this.#icon;
  }

  set icon(value: string | undefined) {
    this.#icon = value;
    this.updateComplete = this.#load(value);
  }

  async #load(value?: string) {
    await Promise.resolve();
    if (!value || this.#icon !== value) return;
    const [prefix, name] = value.split(":", 2);
    if (prefix !== "mdi") {
      const set = iconSets()?.[prefix];
      if (set) {
        const { path } = await set.getIcon(name);
        if (this.#icon === value) this.#path = path;
      } else {
        this.#legacy = true;
      }
      this.#render();
      return;
    }
    this.#legacy = false;
    this.#path = "";
    this.#render();
  }

  #render() {
    this.shadowRoot!.innerHTML = this.#legacy ? "<iron-icon></iron-icon>" : `<svg><path d="${this.#path}"></path></svg>`;
  }
}

customElements.define("ha-icon", HaIcon);

it("redraws a sidebar icon drawn before the icon set existed", async () => {
  // The sidebar keeps its icons in its shadow root.
  const sidebar = document.body.appendChild(document.createElement("div"));
  const icon = document.createElement("ha-icon") as HaIcon;
  sidebar.attachShadow({ mode: "open" }).append(icon);
  icon.icon = "shared_expenses:coin";
  await icon.updateComplete;
  expect(icon.shadowRoot!.querySelector("iron-icon")).not.toBeNull();

  await import("../../src/icons");

  const coin = (await iconSets()!.shared_expenses.getIcon("coin")).path;
  expect(coin).toMatch(/^M/);
  await expect.poll(() => icon.shadowRoot!.querySelector("path")?.getAttribute("d")).toBe(coin);
  expect(icon.icon).toBe("shared_expenses:coin");
});

it("offers the coin to the icon picker", async () => {
  await import("../../src/icons");
  const list = await iconSets()!.shared_expenses.getIconList!();
  expect(list.map((icon) => icon.name)).toContain("coin");
});
