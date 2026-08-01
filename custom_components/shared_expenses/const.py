"""Constants for the Shared Expenses integration."""

from datetime import timedelta
from typing import Final

from homeassistant.const import Platform

DOMAIN: Final = "shared_expenses"
NAME: Final = "Shared Expenses"

CONFIG_VERSION: Final = 1

DATABASE_NAME: Final = "shared_expenses.db"
DATABASE_SCHEMA: Final = "schema_v1.sql"
DATABASE_VERSION: Final = 13
STORAGE_KEY: Final = DOMAIN

DEFAULT_CURRENCY: Final = "EUR"

#: The platforms a project puts on the dashboard, when it says to.
PLATFORMS: Final = [Platform.SENSOR]

#: Fired when anything in a group moved, so the entities can catch up.
#:
#: The panel reloads itself and never needed this; entities have nobody to tell
#: them. Sent with the group id, so a coordinator only redoes the arithmetic of
#: the group that actually changed.
SIGNAL_GROUP_CHANGED: Final = f"{DOMAIN}_group_changed"

#: How long a figure may stay wrong when the signal did not arrive.
#:
#: The signal is what makes the dashboard feel instant; this is only the net
#: under it. Home Assistant's own pushed-at integrations keep one for the same
#: reason — `flux_led` reads every ten seconds, `esphome` every five minutes —
#: because a coordinator with no interval never reschedules itself after a
#: failure, and one hiccup then lasts until somebody happens to write.
FALLBACK_INTERVAL: Final = timedelta(minutes=10)

#: How long a burst of changes is allowed to fold into one re-read.
#:
#: One thing somebody does can announce itself several times — a group saved
#: with two fields changed, a member added and then given their share. Each one
#: used to re-read every exposed group in full.
REFRESH_COOLDOWN: Final = 1.0

#: Fired on Home Assistant's own bus whenever something is written, so an
#: automation can react — notify, remind, log, light a lamp. The other side of
#: the actions: those let an automation write, this lets one hear. Carries what
#: the journal carries — group, kind of thing, what happened, who did it — and
#: nothing an automation could not already read for itself once told to look.
EVENT_CHANGED: Final = f"{DOMAIN}_changed"

PANEL_URL: Final = DOMAIN
PANEL_TITLE: Final = NAME
PANEL_ICON: Final = "mdi:account-cash"
