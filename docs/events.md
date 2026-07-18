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
| `entity` | What kind of thing: `expense`, `payment`, `group`, `category`, or `member`. |
| `entity_id` | Which one. |
| `action` | `created`, `updated`, or `deleted`. |
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
