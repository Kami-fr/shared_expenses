/**
 * Resolving a member's Home Assistant photo, on the client.
 *
 * The backend knows only whether a member wants their photo; the photo itself
 * lives in Home Assistant's own `person` entities, which the panel already
 * holds in `hass`. So it is joined here, where the members are loaded and `hass`
 * is at hand, and every avatar downstream reads a plain `member.picture` and
 * needs nothing of Home Assistant.
 */

import type { HomeAssistant, Member } from "../types";

/**
 * The picture a Home Assistant account shows, if it has set one.
 *
 * A person entity carries the account it stands for and the picture it wears,
 * so this is the one place that walks the states to pair them. Returns null for
 * an account with no person, or a person with no picture — either way, the
 * initials are what shows.
 */
export function personPicture(
  userId: string | null,
  hass: HomeAssistant | undefined,
): string | null {
  if (!userId || !hass?.states) {
    return null;
  }

  for (const state of Object.values(hass.states)) {
    if (
      state.entity_id.startsWith("person.") &&
      state.attributes.user_id === userId
    ) {
      return state.attributes.entity_picture ?? null;
    }
  }

  return null;
}

/**
 * The members, each with the photo it should wear resolved.
 *
 * Called wherever a list of members is loaded next to a `hass`. A member who
 * keeps the initials, has no account, or set no picture comes back with a null
 * `picture`, which the avatar reads as "show the coloured initials".
 */
export function withAvatars(
  members: Member[],
  hass: HomeAssistant | undefined,
): Member[] {
  return members.map((member) => ({
    ...member,
    picture: member.use_ha_avatar ? personPicture(member.user_id, hass) : null,
  }));
}
