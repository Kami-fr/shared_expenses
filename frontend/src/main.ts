/**
 * Entry point of the Shared Expenses frontend.
 *
 * Home Assistant loads the built bundle as a single ES module, twice over: as
 * the panel's, where it instantiates `shared-expenses-panel`, and as an extra
 * module on every dashboard, where the card, the add-expense card and the
 * add-expense badge register themselves in their pickers.
 *
 * One bundle for all of them, and it has to be one. Home Assistant is a single
 * page, so the panel and the dashboard pieces share a document — two bundles
 * would each run `customElements.define("se-balance-card")`, the second would
 * throw, and the panel would not load at all.
 */

export * from "./shared-expenses-app";
export * from "./card";
export * from "./add-card";
export * from "./add-badge";
