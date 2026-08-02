"""What the dashboard reads, worked out once per group.

The panel asks for what it needs and reloads itself; entities have nobody to
tell them anything. So this sits between the two: the manager says a group
moved, this redoes that group's arithmetic, and every entity of that group reads
the answer off it rather than each going to the database on its own.

Nothing here is polled for its own sake. A shared expense changes when somebody
types it in, not on a schedule, so the signal is what makes the dashboard feel
instant.

The clock under it is a safety net and nothing else. `update_interval` was None,
and a coordinator with no interval never reschedules itself after a failure —
Home Assistant returns straight out of `_schedule_refresh` when there is none —
so a single hiccup left every entity in the house unavailable until somebody
happened to write in a group. Ten minutes is now the longest anything here can
be wrong without saying so.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from logging import getLogger

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, FALLBACK_INTERVAL, REFRESH_COOLDOWN, SIGNAL_GROUP_CHANGED
from .exceptions import GroupNotFoundError, SharedExpensesError
from .manager import SharedExpensesManager
from .models import Group, Member

LOGGER = getLogger(__package__)


@dataclass(frozen=True, slots=True)
class GroupSnapshot:
    """Everything the entities of one group need, read at one moment.

    Held together on purpose. A total and the balances under it must never
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

    total: int
    """What the group has spent since it started, in the cents of its currency.

    Expenses only. A reimbursement moves money between members, it does not
    spend any — counting one would say a household spent 100 EUR on a 90 EUR
    shop. The same rule the statistics page keeps, and the same figure.
    """

    last_activity: datetime | None
    """When the last expense or payment was entered. None in an empty group."""


class SharedExpensesCoordinator(DataUpdateCoordinator[dict[str, GroupSnapshot]]):
    """Holds a snapshot per exposed group, refreshed when one changes."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        manager: SharedExpensesManager,
    ) -> None:
        """Set up the coordinator: pushed at, with a clock underneath."""

        super().__init__(
            hass,
            LOGGER,
            # Handed over rather than picked up. Home Assistant reads the entry
            # off a context variable when it is not given one, and says it means
            # to stop.
            config_entry=entry,
            name=DOMAIN,
            update_interval=FALLBACK_INTERVAL,
            # `immediate=True`: the first change of a burst is read at once, so
            # a tile moves as the expense lands, and the rest of the burst folds
            # into one trailing read.
            request_refresh_debouncer=Debouncer(
                hass,
                LOGGER,
                cooldown=REFRESH_COOLDOWN,
                immediate=True,
            ),
            # A clock waking every entity every ten minutes would fill the
            # recorder with a figure that had not moved. A snapshot is frozen
            # and compares by value, so "has anything changed" is exact here —
            # for everything the data holds. The one change it cannot see is a
            # group disappearing that was not on the dashboard anyway, and
            # `_async_update_data` lifts the flag for that cycle alone.
            always_update=False,
        )

        self._manager = manager

        self.known_group_ids: frozenset[str] = frozenset()
        """Every group in the database, exposed or not.

        Not what is on the dashboard — what exists. It is the only way to tell a
        group that went quiet from one that was deleted, and the sensors need
        that difference before they take anything down.
        """

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

        # `async_request_refresh`, not `async_refresh`: one thing somebody does
        # can announce itself several times, and every announcement is a full
        # re-read of every exposed group. The debouncer runs the first at once
        # and folds the rest into one.
        self.hass.async_create_task(self.async_request_refresh())

    async def _async_update_data(self) -> dict[str, GroupSnapshot]:
        """Return a snapshot per exposed group.

        `list_groups`, not `list_user_groups`: there is no user here. An entity
        belongs to the instance, which is exactly why a group has to say it
        wants one — see `Group.exposed`.
        """

        try:
            groups = await self._manager.list_groups()
        except SharedExpensesError as err:
            # `UpdateFailed` is one line in the log where an unexpected error is
            # a stack trace. Either way it costs one cycle and no more: the
            # clock brings the next one along.
            raise UpdateFailed(err) from err

        snapshots: dict[str, GroupSnapshot] = {}

        for group in groups:
            if not group.exposed:
                continue

            try:
                snapshots[group.id] = await self._snapshot(group)
            except GroupNotFoundError:
                # Deleted between being listed and being read. That is a fact
                # about one group, not a reason to take the other nine off the
                # wall — which is what letting it out of here would do.
                LOGGER.debug("Group %s went while it was being read", group.id)
            except SharedExpensesError as err:
                raise UpdateFailed(err) from err

        # Every group, not only the ones on the dashboard: this is what tells a
        # group that closed its switch from one that no longer exists.
        known = frozenset(group.id for group in groups)

        # A group deleted while its switch was already closed changes nothing
        # here — it was filtered out of the snapshots before it went, so the
        # dict comes back equal to the last one and `always_update=False` means
        # Home Assistant tells nobody. Which is exactly the cycle the sensors
        # had to hear: `_forget` is a listener, and it is the only thing that
        # takes a deleted project's device down. So the one cycle that loses an
        # id asks to be announced anyway — the flag is read after this returns —
        # and every other cycle goes back to saying nothing when nothing moved.
        self.always_update = bool(self.known_group_ids - known)

        self.known_group_ids = known

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
            # `converted_amount`, never `amount`: a total adding 100 USD to
            # 100 EUR is not a total of anything. This is what
            # `compute_statistics` calls `total` over every year — summed off
            # the expenses already read here rather than asked of
            # `get_statistics`, which would re-read them and their shares to
            # hand back one number. If what a project "spent" ever stops
            # meaning this, the two have to move together.
            total=sum(expense.converted_amount for expense in expenses),
            # When it was entered, not the date typed on it. A shop from last
            # month added today is activity today — this answers "is anybody
            # still using this?", and a backdated expense means somebody is.
            last_activity=max(entered) if entered else None,
        )
