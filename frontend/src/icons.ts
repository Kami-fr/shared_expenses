/**
 * The integration's own icon set, `shared_expenses:*`.
 *
 * The sidebar draws a panel's icon in one colour, the theme's, so the brand
 * icon cannot go there as it is. `coin` is the same mark — a coin cut in two —
 * redrawn on the 24-unit grid every MDI icon uses, and named `shared_expenses:coin`
 * by the integration for the panel. Dashboards can use it as well: the icon
 * picker lists it.
 *
 * One path, filled nonzero as `ha-svg-icon` does: each half is its outer disc,
 * the ring drawn the other way round to cut it out, and the inner disc.
 */

export const ICONS: Record<string, string> = {
  coin:
    "M10.7,3.034A9.5,9.5 0 0 0 10.7,21.966Z" +
    "M10.7,19.454A7,7 0 0 1 10.7,5.546Z" +
    "M10.7,7.16A5.4,5.4 0 0 0 10.7,17.84Z" +
    "M13.3,2.034A9.5,9.5 0 0 1 13.3,20.966Z" +
    "M13.3,18.454A7,7 0 0 0 13.3,4.546Z" +
    "M13.3,6.16A5.4,5.4 0 0 1 13.3,16.84Z",
};

interface CustomIconSet {
  getIcon: (name: string) => Promise<{ path: string }>;
  getIconList?: () => Promise<{ name: string; keywords?: string[] }[]>;
}

const iconSets = ((window as unknown as { customIcons?: Record<string, CustomIconSet> })
  .customIcons ??= {});

iconSets.shared_expenses = {
  getIcon: async (name) => ({ path: ICONS[name] ?? "" }),
  getIconList: async () =>
    Object.keys(ICONS).map((name) => ({ name, keywords: ["shared expenses", "money"] })),
};

/**
 * Redraw the `shared_expenses:*` icons drawn before the set above existed.
 *
 * This bundle loads alongside the frontend, not before it, and the sidebar can
 * win the race: once in a while, on the first load after a restart, it draws
 * the panel's icon first. `ha-icon` then gives up on the unknown prefix for
 * good (an `<iron-icon>` nobody defines, so nothing at all), until the page is
 * reloaded. Only going through an `mdi:` name clears that, so each stuck icon
 * takes one on the way back to its own.
 */
async function redrawStuckIcons(root: Document | ShadowRoot): Promise<void> {
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) void redrawStuckIcons(el.shadowRoot);
    if (el.localName !== "ha-icon") continue;
    const icon = el as HTMLElement & { icon?: string; updateComplete?: Promise<unknown> };
    const name = icon.icon;
    if (!name?.startsWith("shared_expenses:") || !el.shadowRoot?.querySelector("iron-icon")) continue;
    icon.icon = "mdi:circle-outline";
    await icon.updateComplete;
    icon.icon = name;
  }
}

void redrawStuckIcons(document);
