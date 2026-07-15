# ADR-014 - Entities and actions

## Status

Accepted

## Context

Everything this integration does happens in its own panel, over its own
WebSocket API. That was deliberate — ADR-006 — and it left the rest of Home
Assistant unable to touch any of it: no card on a dashboard, no automation, no
tag on the fridge.

The obvious answer is entities. It is also the one that walks through a wall.

**Home Assistant does not wall entities off.** The machinery exists — there is
an entity policy per account, in `auth/permissions/entities.py` — and nothing
sets it:

```python
ADMIN_POLICY = {CAT_ENTITIES: True}
USER_POLICY  = {CAT_ENTITIES: True}   # every ordinary account: every entity
```

There is no interface for anything else. So an ordinary account reads every
entity's state in the house.

That is exactly what `Scope`, `ensure_group_member` and `list_user_groups` exist
to prevent. A member of the flat's project is not a member of the one somebody
shares with their partner, and the panel is careful never to let them learn it
is there. A sensor called `sensor.montigny_antonin_balance` tells them, and
tells them the figure.

## Decision

**A project says whether it goes on the dashboard, and says no by default.**
One column, `groups.exposed`, set by the admin alone and written into the
project's journal.

Not because a closed default is a reflex. Because turning this on takes a wall
down, and nothing that takes a wall down may happen to somebody who did not ask
for it. Every project that existed before this stays as private as it was, and
the switch says what it does before it is touched — the panel spells it out
under the switch, not in a doc nobody reads.

### What an exposed project offers

Under a device of its own:

| Entity | What it says |
|--------|--------------|
| `sensor` | What the project has spent, `device_class: monetary`, in its currency |
| `sensor` per member | Their balance, `device_class: monetary`, in the project's currency |
| `sensor` | When something was last entered |

A `binary_sensor` saying whether anything was still owed was here and is gone.
It answered a question the balances already answer, and answered it worse: an
automation wanting "does anybody owe anything" reads the balances it would have
to read anyway to say who and how much.

**There is no "you", and there cannot be.** An entity's state is the same for
everybody who reads it, so the whole way the panel speaks — "you are owed",
green when the money comes your way — has nowhere to land. A balance is named
for whose it is, and its sign is the model's own: positive is owed to them,
negative is owed by them.

**The monetary sensors are the only floats this integration hands out.**
Everything inside is integer cents, on purpose. But a monetary sensor is read as
money, and 8542 would be read as eight thousand euros; the division by a hundred
happens at the very edge, where it is exact for anything a household will spend.

**What a project spent is expenses only**, like every total here: a
reimbursement moves money between members, it does not spend any. It is summed
off the expenses the snapshot already holds rather than asked of
`get_statistics`, which would re-read them and their shares to hand back one
number — so the two definitions have to move together, and a test holds the rule
against a real database.

### Actions, not buttons

A `button` entity has no fields, so it cannot say how much or who.
`shared_expenses.add_expense` and `shared_expenses.settle_up` take fields, which
is what makes a button card, an NFC tag and an automation all possible from one
thing.

**Who is asking, and what happens when nobody is.** An action called from the
interface carries the account — `websocket_api` builds `Context(user_id=...)` —
so every rule applies as it does in the panel. An automation carries none: Home
Assistant builds its trigger context with a `parent_id` and no user, even when a
person set the trigger off.

So a call with no account goes through, unchecked. That was decided, not
overlooked. Only an admin can write an automation, and an admin can already read
`.storage/shared_expenses.db` with a text editor — ADR-013 already says these
rules were never a wall against them. Refusing here would buy nothing and cost
the tag on the fridge. It is not silent either: the journal records the actor it
was given, which is nobody, and reads as "Someone added the expense".

### Refreshed on a signal, never on a clock

A shared expense changes when somebody types it in. So `update_interval` is None
and the only thing that refreshes the coordinator is a group actually having
changed.

The signal is sent from `_record`, which every write worth accounting for
already went through — one door rather than a `_notify` sprinkled down thirty
methods, one of which would be forgotten. A change nobody journals is a change
nobody needed to be told about: the two questions have the same answer, which is
why they share a door. `delete_group` is the one exception and says so itself,
being the one write that journals nothing.

The coordinator redoes every exposed group rather than the one that changed. A
household has a handful of projects holding a few hundred expenses, so the whole
lot costs milliseconds, and refreshing selectively would hold data of two
different ages. It is one snapshot or it is a race.

## Consequences

**The switch is the whole of the privacy story, so it has to be exact.** A
project that closes it goes unavailable rather than sitting on its last known
balance — a sensor holding the figure would be the leak the switch was closed to
stop, and it would look current, which is worse than looking gone. That is what
`tests/test_entities.py` exists for, and the exposure filter is sabotaged there
to prove the suite catches its absence.

**Entities are not removed when a project closes its switch**, only made
unavailable. That is Home Assistant's own habit: a card pointing at one keeps
pointing at it and says so, rather than vanishing and taking the card's meaning
with it. Somebody who wants them gone deletes them from the registry.

**The wiring is not tested.** Forwarding the platforms, the entity registry,
entities appearing as a project starts exposing itself — that needs a running
Home Assistant, and `pytest-homeassistant-custom-component` cannot be installed
here (it pulls in the Unix-only `fcntl`). What is tested is what this
integration wrote: the snapshot, the arithmetic, the availability. The same line
the WebSocket tests draw, and for the same reason.

**The actions take ids.** A project and a member are this integration's own, not
Home Assistant entities, so no selector knows how to list them. A picker would
mean teaching a form what a project is; worth doing, not worth holding the
actions back for.

## Alternatives considered

**Expose everything, document the hole.** Rejected: the reader of a README is
not the flatmate whose balance is on the wall. A hole nobody chose is a bug with
paperwork.

**Expose nothing sensitive — counters only.** A count of expenses and a last
date, no balances, no names. The wall holds and the feature is pointless: the
question a household asks a dashboard is "does anybody owe me anything", and
that is the one thing this could not answer.

**Set the entity policy per account.** It is right there in `auth/permissions`.
Rejected: nothing in Home Assistant sets it, there is no interface for it, and
an integration writing other people's auth policies would be doing something no
integration does. It would also break the moment Home Assistant changed its
mind about a subsystem it has left alone for years.

**A `button` entity per action.** No fields. It could say "settle up" and not
with whom, nor how much.
