/**
 * The panel on a phone, in a real browser, without a Home Assistant.
 *
 * Layout was checked by throwaway scripts: that is how the balance card was
 * found spilling its figures and four languages an ellipsed segment. This is
 * those scripts kept. What stands in for Home Assistant is only what changes
 * where a line breaks or whether a word fits:
 *
 * - the data, as a real backend answered it: `demo.json` is every read the
 *   panel makes, recorded from a Home Assistant running the README's demo
 *   groups, and to be recorded again when an answer changes shape;
 * - Roboto in the weights Home Assistant declares — 100, 300, 400, 500, 700,
 *   900, and no 600, so a 600 in our styles is drawn in 700 as it is there;
 * - `ha-icon` and `ha-menu-button`, which are its own elements, at their size;
 * - the clock, frozen on the day the demo was recorded.
 *
 * What is measured is read out of the DOM, never off a picture: an element
 * that hides an overflow and holds more than it shows is cutting something.
 */

import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

import { vi } from "vitest";

import { SharedExpensesApi } from "../../src/services/api";
import { localizer } from "../../src/services/localize";
import type { HomeAssistant } from "../../src/types";
import "../../src/pages/se-group-page";
import demo from "./demo.json";

export const LANGUAGES = ["en", "fr", "de", "nl", "es", "it", "pl", "pt"];

/** The day `demo.json` was recorded, noon: the panel reads "today" off it. */
export const RECORDED = new Date(2026, 9, 23, 12);

export type GroupKey = keyof typeof demo.groups;

interface Answer {
  request: Record<string, unknown>;
  result: unknown;
}

/** Requests the recording has no answer for: a test that makes one is wrong. */
export const unanswered: string[] = [];

/** A message as text, its keys in order, so two of them compare as strings. */
function canonical(message: object): string {
  return JSON.stringify(
    Object.fromEntries(Object.entries(message).sort(([a], [b]) => a.localeCompare(b))),
  );
}

const answers = new Map(
  (demo.answers as Answer[]).map((answer) => [canonical(answer.request), answer.result]),
);

function fakeHass(language: string): HomeAssistant {
  const nothingToUndo = async () => async () => {};

  return {
    language,
    locale: { language },
    config: { currency: "EUR" },
    states: {},
    themes: {},
    user: demo.user,
    callWS<T>(message: object): Promise<T> {
      const key = canonical(message);

      if (!answers.has(key)) {
        unanswered.push(key);
        return Promise.reject(new Error(`No recorded answer for ${key}`));
      }

      // A copy: the panel may sort or change what it is handed.
      return Promise.resolve(structuredClone(answers.get(key)) as T);
    },
    connection: {
      subscribeEvents: nothingToUndo,
      subscribeMessage: nothingToUndo,
      addEventListener() {},
      removeEventListener() {},
    },
  } as HomeAssistant;
}

/**
 * Home Assistant's icon: a box of `--mdc-icon-size`, 24 px unless told.
 *
 * Without it `se-icon` would draw its fallback glyph instead, which is not
 * what anyone sees in Home Assistant and not the same width.
 */
class HaIcon extends HTMLElement {
  public icon = "";

  public connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).innerHTML = `<style>
        :host { display: inline-block; }
        span {
          display: inline-flex;
          vertical-align: middle;
          width: var(--mdc-icon-size, 24px);
          height: var(--mdc-icon-size, 24px);
        }
      </style><span></span>`;
    }
  }
}

/** Its burger: a 48 px button on a phone, nothing beside a docked sidebar. */
class HaMenuButton extends HTMLElement {
  private wide = false;

  public set narrow(narrow: boolean) {
    this.wide = !narrow;
    this.style.display = this.wide ? "none" : "inline-block";
  }

  public connectedCallback() {
    this.style.width = "48px";
    this.style.height = "48px";
    this.style.flex = "none";
    this.style.display = this.wide ? "none" : "inline-block";
  }
}

if (!customElements.get("ha-icon")) {
  customElements.define("ha-icon", HaIcon);
  customElements.define("ha-menu-button", HaMenuButton);
}

/** What Home Assistant sets on the page: the font and its weight, no size. */
const page = document.createElement("style");
page.textContent = `
  html, body { margin: 0; }
  body { font-family: Roboto, Noto, sans-serif; font-weight: 400; }
`;
document.head.append(page);

/** Every element on the page, shadow roots included, in document order. */
function* everything(root: ParentNode = document.body): Generator<Element> {
  for (const element of Array.from(root.children)) {
    yield element;

    if (element.shadowRoot) {
      yield* everything(element.shadowRoot);
    }

    yield* everything(element);
  }
}

interface Updating extends Element {
  updateComplete: Promise<unknown>;
  isUpdatePending: boolean;
}

function updating(element: Element): element is Updating {
  return "updateComplete" in element && "isUpdatePending" in element;
}

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

/**
 * Wait until nothing is left to change: data loaded, every element rendered,
 * transitions run to their end, the fonts in. A loop, because a rendered
 * element can start loading and a loaded one can render again.
 */
export async function settle(): Promise<void> {
  for (let round = 0; round < 20; round++) {
    await new Promise((resolve) => setTimeout(resolve, 0));

    const elements = [...everything()].filter(updating);
    await Promise.all(elements.map((element) => element.updateComplete));
    await frame();
    await frame();

    for (const animation of document.getAnimations()) {
      if (animation.effect?.getComputedTiming().endTime !== Infinity) {
        animation.finish();
      }
    }

    await document.fonts.ready;

    if (!elements.some((element) => element.isUpdatePending)) {
      return;
    }
  }

  throw new Error("The panel never stopped updating");
}

/** Mount the group page of a phone, as the panel does, and wait for it. */
export async function mount(group: GroupKey, language: string): Promise<HTMLElement> {
  document.body.replaceChildren();
  // A browser that never opened the panel: a view picked in one scene is
  // remembered, and would open the next one.
  window.localStorage.clear();
  // Only the date: Lit and the browser keep their own timers.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(RECORDED);

  const hass = fakeHass(language);
  const element = document.createElement("se-group-page");

  Object.assign(element, {
    api: new SharedExpensesApi(hass),
    hass,
    narrow: true,
    localize: localizer(language),
    groupId: demo.groups[group],
    language,
    userId: demo.user.id,
  });

  document.body.append(element);
  await settle();

  return element;
}

/**
 * The element a chain of selectors leads to, through shadow roots: each
 * selector is looked for in the shadow root of what the last one found, or
 * in the element itself when it has none.
 */
export function find(...selectors: string[]): HTMLElement {
  let scope: ParentNode = document;

  for (const selector of selectors) {
    const found: HTMLElement | null = scope.querySelector(selector);

    if (!found) {
      throw new Error(`Nothing matches ${selectors.join(" » ")} at "${selector}"`);
    }

    scope = found.shadowRoot ?? found;
  }

  return scope instanceof ShadowRoot ? (scope.host as HTMLElement) : (scope as HTMLElement);
}

/** The button whose text is `text`, anywhere on the page. */
export function button(text: string): HTMLElement {
  const found = [...everything()].find(
    (element) =>
      (element.tagName === "BUTTON" || element.getAttribute("role") === "menuitem") &&
      element.textContent?.replace(/\s+/g, " ").trim().startsWith(text) &&
      element.getClientRects().length > 0,
  );

  if (!found) {
    throw new Error(`No button says "${text}"`);
  }

  return found as HTMLElement;
}

export async function click(target: HTMLElement): Promise<void> {
  target.click();
  await settle();
}

export interface Cut {
  /** Where it is: tags and classes, shadow roots crossed. */
  where: string;
  text: string;
  /** Pixels the content needs, and pixels it is given. */
  needs: number;
  has: number;
}

function label(element: Element): string {
  const classes = [...element.classList].map((name) => `.${name}`).join("");

  return `${element.tagName.toLowerCase()}${classes}`;
}

function path(element: Element): string {
  const parts: string[] = [];
  let at: Element | null = element;

  while (at) {
    parts.unshift(label(at));
    at = at.parentElement ?? ((at.getRootNode() as ShadowRoot).host || null);
  }

  return parts.slice(parts.indexOf("body") + 1).join(" > ");
}

/**
 * Everything on screen that holds more than it shows.
 *
 * Sideways, for any element that does not let its content spill: an
 * ellipsis, a hidden overflow, a scroller. Down, only for what hides the
 * rest, since a list is meant to scroll. And anything that leaves the screen
 * on either side, since nothing here is meant to.
 */
export function cuts(): Cut[] {
  const found: Cut[] = [];
  const width = document.documentElement.clientWidth;

  for (const element of everything()) {
    if (element.getClientRects().length === 0) {
      continue;
    }

    const style = getComputedStyle(element);

    if (style.visibility === "hidden") {
      continue;
    }

    const text = element.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ?? "";
    const cut = (needs: number, has: number) =>
      found.push({ where: path(element), text, needs: Math.round(needs), has: Math.round(has) });

    if (style.overflowX !== "visible" && element.scrollWidth > element.clientWidth + 1) {
      cut(element.scrollWidth, element.clientWidth);
    }

    if (
      (style.overflowY === "hidden" || style.overflowY === "clip") &&
      element.scrollHeight > element.clientHeight + 1
    ) {
      cut(element.scrollHeight, element.clientHeight);
    }

    const box = element.getBoundingClientRect();

    if (box.width > 0 && (box.left < -0.5 || box.right > width + 0.5)) {
      cut(box.right - Math.min(box.left, 0), width);
    }
  }

  return found;
}
