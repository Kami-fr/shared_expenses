# On the dashboard

Everything the integration puts on a Home Assistant dashboard: a card that
speaks to whoever is looking, per-group entities a group can choose to expose,
and the tiles and automations built on top of them.

## The card

Add a card, pick **Shared Expenses**, and the balances are on your dashboard —
the same ones as in the panel, drawn by the same code:

```yaml
type: custom:shared-expenses-card
group_id: 01KXHEB4VFFWMAN5CG4BDNNBF9
```

It says what the panel says, in the same words. **You are owed 42,71 €** when
two of you are square with everyone but each other; your line first and the
others under it when more people are involved. Each line taps through to record
the reimbursement, filled in.

**And it speaks to whoever is looking.** A card runs in your browser, on your own
connection, so it asks the integration who you are — exactly as the panel does.
The same card, on the same wall-mounted dashboard, tells you what you owe and
tells your flatmate what they owe. On a tablet logged in as nobody in
particular, there is no "you" and it says who owes whom.

Nothing here is an entity, so nothing here needs the switch below, and nobody
outside the group can read it: the card asks through the same door as the panel,
and that door knows the answer.

Add or edit the card from the dashboard's own UI and a group picker fills the
`group_id` in for you — it lists only the groups you belong to. To write it by
hand, see **Where the ids come from** below.

## The entities

A group keeps its *figures* to its panel until you say otherwise. Open **Edit
group → Dashboard sensors**, and it grows a device carrying:

| Entity | What it says |
|--------|--------------|
| Total spent | What the group has spent since it started. Expenses only — paying somebody back moves money, it does not spend any |
| One per member | Their balance. Positive is owed to them, negative is owed by them |
| Last activity | When something was last entered |

**It is off by default, and that is the whole design.** Home Assistant does not
wall entities off — every account in the house reads every entity's state,
whatever this integration thinks about who is in which group. So a sensor
carrying a balance is a balance the flatmate can read, and the switch is the
only thing standing between the two. Throwing it takes a wall down; that has to
be a decision, so it is written into the group's history like any other.

There is no "you" out there, either. An entity's state is the same for everybody
reading it, so nothing here says "you are owed" — a balance is named for whose it
is. That is what the card above is for, and why it is not built out of these.

A group that closes the switch, or is deleted, has its device removed and its
entities with it: no stale figures left unavailable to rot. Turn it back on and
they come straight back.

**Where the ids come from.** A group and a member are this integration's own, not
Home Assistant entities, so no selector lists them. They are under **Developer
tools → States**: every entity of a group carries its `group_id`, and somebody's
`member_id` is on their own balance sensor. The group's id is also in the panel's
address, which is the only way to find it with the switch shut — and all the card
needs.

## A tile that adds the shopping

A tile is one tap, so it carries the answers already. That is exactly right for
something you buy every week:

```yaml
type: tile
entity: sensor.the_apartment_total_spent
name: Bread
icon: mdi:baguette
tap_action:
  action: perform-action
  perform_action: shared_expenses.add_expense
  data:
    group_id: 01KXHEB4VFFWMAN5CG4BDNNBF9
    title: Bread
    amount: 1.30
    paid_by_member_id: 01KXHEB4VG7Q2M8XQZ0P3R5T7V
```

One tap and it is in, dated today, at today's rate, with your name on it in the
history — and the tile it sits on goes up by 1,30 €, which is how you know.

## A tile that records a reimbursement

The same tap, for money going back rather than out — a share of the rent, a
standing debt, settled every month without opening anything:

```yaml
type: tile
entity: sensor.the_apartment_marcus
name: Rent — Marcus's half
icon: mdi:cash-refund
tap_action:
  action: perform-action
  perform_action: shared_expenses.settle_up
  data:
    group_id: 01KXHEB4VFFWMAN5CG4BDNNBF9
    from_member_id: 01KXHEB4VG7Q2M8XQZ0P3R5T7V
    to_member_id: 01KXHEB4VH9S4N0YR1Q5T7W9X2
    amount: 400.00
```

`from` is whoever is out of pocket, `to` whoever is paid back — the ids are the
`member_id`s carried on the balance sensors. A reimbursement moves money between
members, not out of the group, so the total stays put; the balance on the tile is
what shifts, which is how you know it landed.

## A tile for everything else

An expense you do not know in advance has an amount to type, and a tile has no
keyboard. The panel already asks all of it — the payer, the split, the currency —
so the shortest honest path is to open it:

```yaml
type: tile
entity: sensor.the_apartment_total_spent
name: The Apartment
tap_action:
  action: navigate
  navigation_path: /shared_expenses/group/01KXHEB4VFFWMAN5CG4BDNNBF9
```

One tap to the group, one to the plus.

## A month on a gauge

`Total spent` only ever climbs, so on its own it answers "since when", not "this
month". But it is a monetary total, so Home Assistant keeps long-term statistics
on it — and a `utility_meter` helper reading it on a monthly cycle turns it into
exactly that:

```yaml
# configuration.yaml
utility_meter:
  the_apartment_this_month:
    source: sensor.the_apartment_total_spent
    cycle: monthly
```

The helper starts fresh on the first of the month, and a gauge draws the running
spend against whatever you call a full one:

```yaml
type: gauge
entity: sensor.the_apartment_this_month
name: This month
max: 800
severity:
  green: 0
  yellow: 600
  red: 750
```

Nothing new is stored for this — the figure was always inside `Total spent`, and
the helper only reads it.

## From an automation

`add_expense` and `settle_up` work from anything: an automation, a script, an NFC
tag by the door.

Called from the interface they carry the account that pressed, and every rule the
group has applies exactly as it does in the panel. An automation carries no
account — Home Assistant builds its trigger context without one, even when a
person set the trigger off — so there is nobody to ask and nothing is asked. The
history records it as "Someone", which is the truth.
