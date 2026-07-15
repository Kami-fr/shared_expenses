"""What the dashboard reads, worked out once per group.

The panel asks for what it needs and reloads itself; entities have nobody to
tell them anything. So this sits between the two: the manager says a group
moved, this redoes that group's arithmetic, and every entity of that group reads
the answer off it rather than each going to the database on its own.

Nothing here is polled. A shared expense changes when somebody types it in, not
on a schedule, so `update_interval` stays None and the only thing that ever
refreshes this is a group actually having changed.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from logging import getLogger

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN, SIGNAL_GROUP_CHANGED
from .manager import SharedExpensesManager
from .models import Group, Member

LOGGER = getLogger(__package__)


@dataclass(frozen=True, slots=True)
class GroupSnapshot:
    """Everything the entities of one group need, read at one moment.

    Held together on purpose. A balance and the "settled" it implies must never
    disagree because two entities happened to read a fraction apart.
    """

    group: Group

    members: tuple[Member, ...]
    """Active members only: the dashboard is about who is in the group now."""

    balances: dict[str, int]
    """Member id to what they are owed, in the cents of the group's currency.

    Positive is owed to them, negative is owed by them — the model's own sign,
    unchanged. A sensor is read by everybody, so there is no "you" to flip it
    for.
    """

    settled: bool

    last_activity: datetime | None
    """When the last expense or payment was entered. None in an empty group."""


class SharedExpensesCoordinator(DataUpdateCoordinator[dict[str, GroupSnapshot]]):
    """Holds a snapshot per exposed group, refreshed when one changes."""

    def __init__(self, hass: HomeAssistant, manager: SharedExpensesManager) -> None:
        """Set up the coordinator, polling nothing."""

        super().__init__(hass, LOGGER, name=DOMAIN, update_interval=None)

        self._manager = manager

    @callback
    def async_listen(self) -> None:
        """Refresh whenever the manager says a group moved."""

        self.config_entry.async_on_unload(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_GROUP_CHANGED,
                self._group_changed,
            )
        )

    @callback
    def _group_changed(self, group_id: str) -> None:
        """Redo the arithmetic. The group id is not used, and that is deliberate.

        Refreshing one group and not the others would be the obvious thing and
        the wrong one: a household has a handful of groups holding a few hundred
        expenses, so the whole lot costs milliseconds, and a coordinator that
        refreshed selectively would hold data of two different ages. It is one
        snapshot or it is a race.
        """

        self.hass.async_create_task(self.async_refresh())

    async def _async_update_data(self) -> dict[str, GroupSnapshot]:
        """Return a snapshot per exposed group.

        `list_groups`, not `list_user_groups`: there is no user here. An entity
        belongs to the instance, which is exactly why a group has to say it
        wants one — see `Group.exposed`.
        """

        snapshots: dict[str, GroupSnapshot] = {}

        for group in await self._manager.list_groups():
            if not group.exposed:
                continue

            snapshots[group.id] = await self._snapshot(group)

        return snapshots

    async def _snapshot(self, group: Group) -> GroupSnapshot:
        """Read one group at one moment."""

        result = await self._manager.get_balances(group.id)

        expenses = await self._manager.list_expenses(group.id)
        payments = await self._manager.list_payments(group.id)

        entered = [entry.created_at for entry in (*expenses, *payments)]

        return GroupSnapshot(
            group=group,
            members=tuple(await self._manager.list_group_members(group.id)),
            balances=dict(result.balances),
            # Asked of the balances rather than of the settlements: a group with
            # nothing in it has neither, and "settled" is the truth about it.
            settled=all(amount == 0 for amount in result.balances.values()),
            # When it was entered, not the date typed on it. A shop from last
            # month added today is activity today — this answers "is anybody
            # still using this?", and a backdated expense means somebody is.
            last_activity=max(entered) if entered else None,
        )
