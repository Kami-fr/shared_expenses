/**
 * Entry point of the Shared Expenses frontend.
 *
 * Home Assistant loads the built bundle as a single ES module, twice over: as
 * the panel's, where it instantiates `shared-expenses-panel`, and as an extra
 * module on every dashboard, where `shared-expenses-card` registers itself in
 * the card picker.
 *
 * One bundle for both, and it has to be one. Home Assistant is a single page,
 * so the panel and the card share a document — two bundles would each run
 * `customElements.define("se-balance-card")`, the second would throw, and the
 * panel would not load at all.
 */

export * from "./shared-expenses-app";
export * from "./card";
