/**
 * A member's avatar: their Home Assistant photo, or their coloured initials.
 *
 * One helper for every place a face is shown — expense rows, balances,
 * statistics, the members list — so a member looks the same throughout. It is a
 * plain function rather than an element on purpose: rendered inline, it inherits
 * each host's own `.avatar` sizing, and a photo and a set of initials keep the
 * exact same footprint. The photo is preferred only when one was resolved;
 * otherwise the initials show, which is also the whole of the fallback.
 */

import { html, type TemplateResult } from "lit";

import { colorFor, initials } from "../services/format";
import type { Member } from "../types";

export function renderAvatar(
  member: Member | undefined,
  name: string,
  seed: string,
  extraClass = "",
  title = name,
): TemplateResult {
  const className = extraClass ? `avatar ${extraClass}` : "avatar";

  if (member?.picture) {
    return html`<img
      class=${className}
      src=${member.picture}
      alt=${name}
      title=${title}
    />`;
  }

  const color = member?.color ?? colorFor(seed);

  return html`<div class=${className} style=${`background:${color}`} title=${title}>
    ${initials(name)}
  </div>`;
}
