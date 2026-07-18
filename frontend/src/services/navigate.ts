/**
 * Walking to a group in the panel, from anywhere on a dashboard.
 *
 * A card, a button, a badge — none of them own the page or can render a dialog;
 * the panel does. So each one moves by changing the address and letting Home
 * Assistant route, rather than reloading the browser, which would throw the
 * whole frontend away to cross one screen. This is that move, in one place.
 */

/** Appended to the group's address to have the panel open a fresh expense. */
export const NEW_EXPENSE = "?new=expense";

export function goToGroup(groupId: string, suffix = ""): void {
  history.pushState(null, "", `/shared_expenses/group/${groupId}${suffix}`);

  window.dispatchEvent(
    new CustomEvent("location-changed", { bubbles: true, composed: true }),
  );
}
