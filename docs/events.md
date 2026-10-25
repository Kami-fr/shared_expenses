# Events

The two actions — `add_expense` and `settle_up` — let an automation *write* to a
group. This is the other direction: every write fires an event on Home
Assistant's own bus, so an automation can *hear* one and react. A notification
when an expense lands, a reminder when a debt has lingered a week, a lamp that
blinks when the rent is settled — all of it is an automation triggering on:

```
shared_expenses_changed
```

## What it carries

The event data holds what the group's own journal holds, and nothing more:

| Field | Meaning |
|-------|---------|
| `group_id` | The group that changed. |
| `entity` | What kind of thing: `expense`, `payment`, `group`, `category`, `member`, or `recurring` (a recurring expense). |
| `entity_id` | Which one. |
| `action` | `created`, `updated`, `deleted`, or `skipped` (an occurrence of a recurring expense passed over). |
| `label` | Its name at the time — an expense's title, a member's name — or `null`. |
| `actor_user_id` | The Home Assistant account that did it, or `null` when an automation did (there is nobody to name), and when a whole group was deleted. |

It deliberately does **not** carry the amount, who paid, or who owes what. An
automation that needs the figures reads them the way anyone cleared for the
group does — the event is the nudge to go look, not a copy of the books.

A write that changes nothing fires nothing: the event rides the same door as the
journal, so a save that records no revision stays silent here too.

## Example: tell everyone when an expense is added

```yaml
alias: Notify on a new shared expense
triggers:
  - trigger: event
    event_type: shared_expenses_changed
    event_data:
      entity: expense
      action: created
actions:
  - action: notify.family
    data:
      title: New shared expense
      message: "{{ trigger.event.data.label }} was added."
```

Filter further in the action or a condition — on `group_id` for one group, on
`action` for edits and deletions too, on `actor_user_id` to leave out whoever
entered it. The ids are the ones the panel and the actions already use; the
dashboard recipes in [dashboard.md](dashboard.md) show where to find them.

## When a recurring expense falls due

A recurring expense — the rent, a subscription — does not add itself: each
occurrence waits in the panel for a member to confirm it, at whatever figure it
really came to. So that nobody has to remember to look, the day one falls due
the bus hears:

```
shared_expenses_recurring_due
```

| Field | Meaning |
|-------|---------|
| `group_id` | The group it belongs to. |
| `recurring_id` | The recurring expense. |
| `title` | What it is called. |
| `due` | The day of the occurrence waiting, ISO-8601 date. |
| `waiting` | How many have fallen due and are unanswered — more than one after Home Assistant was off for a while. |
| `amount` | The figure proposed, in the cents of `currency`. |
| `currency` | ISO 4217 code. |
| `paid_by_member_id` | Who pays it. |

It is checked every morning at 9:00, local time, and once Home Assistant has
started if that hour has passed — a restart in the night wakes nobody. It goes
out **once per occurrence**: not again the next morning while it waits, not
again after a restart. A new occurrence is news even while an older one still
waits: February's rent goes out on the 1st, `waiting` 2, `due` still January's.
Occurrences caught up after a long absence go out as one event carrying how
many there are. A paused recurring expense, or one in an
archived group, stays quiet.

Unlike `shared_expenses_changed`, this one carries the amount: it is a reminder
to act on a figure, and the figure is what the reminder is about. It is the
proposal, not money — nothing has moved anybody's balance yet.

```yaml
alias: Remind us of the rent
triggers:
  - trigger: event
    event_type: shared_expenses_recurring_due
actions:
  - action: notify.family
    data:
      title: To confirm
      message: >-
        {{ trigger.event.data.title }}:
        {{ '%.2f' | format(trigger.event.data.amount / 100) }}
        {{ trigger.event.data.currency }}
```
