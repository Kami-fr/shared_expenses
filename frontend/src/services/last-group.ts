/**
 * The last group opened, remembered for next time.
 *
 * Two copies of the same fact. localStorage answers synchronously, so the
 * panel lands where you were without waiting on anything — but it belongs to
 * the browser, and the companion app's WebView throws its storage away when
 * the phone wants the room back. Home Assistant's per-user frontend storage
 * is the durable copy: it lives on the server, follows the account rather
 * than the device, and is only asked when the local one is gone.
 *
 * Every localStorage access is guarded, as it throws outright when a browser
 * disables storage.
 */

import type { HomeAssistant } from "../types";

const LOCAL_KEY = "shared_expenses.last_group";

/** Where Home Assistant files the server copy, one per user. */
const SERVER_KEY = "shared_expenses.last_group";

export function readCachedGroup(): string | null {
  try {
    return window.localStorage.getItem(LOCAL_KEY);
  } catch {
    return null;
  }
}

/** Write only the device copy — reseeding it from the server's, say. */
export function cacheGroup(groupId: string): void {
  try {
    window.localStorage.setItem(LOCAL_KEY, groupId);
  } catch {
    // Not being able to remember is not worth breaking the panel over.
  }
}

/** The server's word on it, for when this device has none of its own. */
export async function readRememberedGroup(
  hass: HomeAssistant,
): Promise<string | null> {
  try {
    const response = await hass.callWS<{ value?: unknown }>({
      type: "frontend/get_user_data",
      key: SERVER_KEY,
    });

    return typeof response?.value === "string" ? response.value : null;
  } catch {
    return null;
  }
}

export function rememberGroup(hass: HomeAssistant, groupId: string): void {
  cacheGroup(groupId);

  // Fire and forget: landing here is already decided, the server copy is for
  // the next visit, and a write that fails leaves the local one serving.
  hass
    .callWS({ type: "frontend/set_user_data", key: SERVER_KEY, value: groupId })
    .catch(() => {});
}

export function forgetGroup(hass: HomeAssistant): void {
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    // Losing the shortcut is harmless.
  }

  hass
    .callWS({ type: "frontend/set_user_data", key: SERVER_KEY, value: null })
    .catch(() => {});
}
