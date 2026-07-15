# Shared Expenses

Shared expenses for Home Assistant: who paid, who owes what, and who reimburses
whom. No account to create and nothing to sync — the data lives in your own
instance, next to the rest of it.

Everyone in the house logs in as themselves. Each person sees the projects they
belong to, and nothing else.

## Features

- **Projects** — a flat, a holiday, a couple. Every Home Assistant account you
  add can open the project; people without an account can be added too, and
  still carry expenses. A project counts in one currency, chosen once: it is the
  unit every balance in it is written in, so it does not move afterwards. The
  name does — rename it whenever you like.
- **Who may do what** — a project starts by letting everybody do everything,
  which is what a household usually wants. Four switches take that back one at a
  time: managing members, managing categories, editing the project, and touching
  what somebody else entered and paid. They are the same for everybody. One
  person is the project's **admin** and is always above them; they alone delete
  it, and they can hand it on — becoming an ordinary member, free to leave.
- **Expenses** — a title, an amount, who paid, a date, a category, and a split.
- **Split rules** — beyond splitting equally: fixed amounts or percentages per
  person, an envelope shared between some and the rest to whoever paid. A
  category carries its own rule, so the usual case is filled in for you.
- **Other currencies** — pay in dollars in a project that counts in euros, and
  pay each other back in dollars too. The day's rate is fetched and frozen onto
  what it converted: what someone owes was settled the day they were owed it,
  and a rate that moved since is a fact about the market, not about the debt.
- **Balances** — who owes what, and the shortest set of transfers that clears
  everything.
- **Reimbursements and debts** — record that money moved, or merely that it is
  owed, with a note saying what it was about. Someone who left the project can
  still be reimbursed: leaving does not clear a debt.
- **One list** — expenses and reimbursements together, newest first, and
  searchable by anything on the row: a shop, a person, a category, an amount. A
  debt and the payment that clears it belong on the same page; apart, you never
  know whether it was settled.
- **Written from where you stand** — "you are owed", not "Marc is owed", and
  green when the money is coming your way, red when it is leaving. The same
  figure means the same thing on the balance card and in the list under it.
- **Statistics** — what the project spent, by category and by month, and what of
  it was yours.
- **History** — every change in the project, with who made it and what moved:
  the expenses and the reimbursements, and the decisions around them too — who
  joined, who left, who runs it, what it allows, what its categories are.
  Deletions included, which is where an expense's own history cannot help — and
  a deleted expense can be brought back from there, as the one it was: same
  date, same shares, same frozen rate.
- **On the dashboard** — a card putting who owes what to whom on any view, and
  saying it to whoever is looking: you read what you owe, your flatmate reads
  what they owe. Alongside it, if a project asks: what it has spent, a balance
  per member, when it was last used, and `add_expense` and `settle_up` as
  actions, so a tag on the fridge or a button card can add the shopping.
- **Mobile first** — a single panel, thumb-reachable, in your own theme, light
  or dark.

Amounts are held in cents, as integers: no rounding drift, ever. Rates are held
in millionths, and are integers too.

## Installation

### HACS

1. In HACS, add `https://github.com/Kami-fr/shared_expenses` as a custom
   repository of type *Integration*.
2. Install **Shared Expenses**.
3. Restart Home Assistant.
4. Go to **Settings → Devices & services → Add integration**, and pick
   **Shared Expenses**.

### Manually

Copy `custom_components/shared_expenses` into your `config/custom_components`
directory and restart Home Assistant, then add the integration as above.

There is nothing to configure and no YAML to write. **Shared Expenses** appears
in the sidebar once the integration is added.

## How the split works

Every expense resolves to a set of shares, and it is the shares that are stored
— the balances only ever read those. A rule is kept alongside them so reopening
an expense shows what was meant, not just the figures it happened to produce.

A rule has two parts:

- **An envelope**, shared equally between the people you tick. Leave it empty
  and the whole expense is shared.
- **The rest**, which goes to whoever paid unless you say otherwise, or is split
  between the people you tick — equally, by exact amounts, or by percentages.

An 85,42 € shop where only 5 € of it is shared, for instance: an envelope of
5 € between the two of you, the rest to whoever paid.

Rules are stored with their members spelled out, never as "everyone". Someone
joining next month never falls into an expense they had nothing to do with, and
an old expense always resolves back to the same shares.

A split is settled in what the expense was paid in — the editor sits under the
amount, so "Antonin owes 20" on a New York dinner is twenty dollars. The shares
are then converted and stored in the project's currency, which is what balances
can be counted in. The converted total is divided rather than each share
converted on its own: three shares of a cent at a rate of a third would each
round to nothing, and the shares would stop adding up to what they are shares
of.

## On the dashboard

### The card

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
outside the project can read it: the card asks through the same door as the
panel, and that door knows the answer.

The `group_id` is the one thing to fill in, and there is no picker for it — see
**Where the ids come from** below.

### The entities

A project keeps its *figures* to its panel until you say otherwise. Open **Edit
project → On the dashboard**, and it grows a device carrying:

| Entity | What it says |
|--------|--------------|
| Total spent | What the project has spent since it started. Expenses only — paying somebody back moves money, it does not spend any |
| One per member | Their balance. Positive is owed to them, negative is owed by them |
| Last activity | When something was last entered |

**It is off by default, and that is the whole design.** Home Assistant does not
wall entities off — every account in the house reads every entity's state,
whatever this integration thinks about who is in which project. So a sensor
carrying a balance is a balance the flatmate can read, and the switch is the
only thing standing between the two. Throwing it takes a wall down; that has to
be a decision, so it is written into the project's history like any other.

There is no "you" out there, either. An entity's state is the same for everybody
reading it, so nothing here says "you are owed" — a balance is named for whose
it is. That is what the card above is for, and why it is not built out of these.

### A tile that adds the shopping

A tile is one tap, so it carries the answers already. That is exactly right for
something you buy every week:

```yaml
type: tile
entity: sensor.montigny_total_spent
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

**Where the ids come from.** A project and a member are this integration's own,
not Home Assistant entities, so no selector lists them. They are under
**Developer tools → States**: every entity of a project carries its `group_id`,
and somebody's `member_id` is on their own balance sensor. The project's id is
also in the panel's address, which is the only way to find it with the switch
shut — and all the card needs.

### A tile for everything else

An expense you do not know in advance has an amount to type, and a tile has no
keyboard. The panel already asks all of it — the payer, the split, the currency
— so the shortest honest path is to open it:

```yaml
type: tile
entity: sensor.montigny_total_spent
name: Montigny
tap_action:
  action: navigate
  navigation_path: /shared_expenses/group/01KXHEB4VFFWMAN5CG4BDNNBF9
```

One tap to the project, one to the plus.

### From an automation

`add_expense` and `settle_up` work from anything: an automation, a script, an
NFC tag by the door.

Called from the interface they carry the account that pressed, and every rule
the project has applies exactly as it does in the panel. An automation carries
no account — Home Assistant builds its trigger context without one, even when a
person set the trigger off — so there is nobody to ask and nothing is asked. The
history records it as "Someone", which is the truth.

## Requirements

- Home Assistant **2026.7.0** or later
- No account, no API key

One request ever leaves your instance, and only if you ask for it: an expense or
a reimbursement in a currency the project does not count in fetches that day's rate
from [Frankfurter](https://frankfurter.dev), a free open-source service sourcing
from central banks and needing no key. Nothing about the expense is sent — only
the pair of currencies and the date.

The rate is always yours to overwrite, and typing one always wins. The service
being down, or the instance being offline, never stands between you and writing
down what you just spent.

## Development

```bash
python -m venv .venv
.venv/Scripts/activate        # source .venv/bin/activate on Linux and macOS
pip install -e ".[dev]"

pytest                        # the manager, against a real SQLite database
ruff check .

cd frontend
npm install
npm run build                 # writes custom_components/shared_expenses/www
```

The panel is Lit 3 and TypeScript, built by Vite. It talks to the integration
over the Home Assistant WebSocket API and never through entities: the panel
knows who is asking, and every rule in here depends on that.

The dashboard card is the same bundle and the same conversation — it runs in a
browser too, so it asks over the WebSocket API and is answered as whoever is
looking. It has to be one bundle: Home Assistant is a single page, and two would
each define `se-balance-card`, the second throwing and taking the panel with it.
See ADR-015.

The entities go the other way and are a separate surface. They belong to the
instance rather than to an account, which is why a project has to ask for them —
see ADR-014.

A project is a `group` everywhere but on screen: the tables, the commands, the
URL and the translation keys all keep the word. Home Assistant has groups of its
own, so the one the reader sees had to give way; the ones in the code answer to
the schema, and renaming those would buy nothing.

Some logic exists twice, in Python for the backend and in TypeScript so the
panel can show what an expense comes to before you save it — the split resolver,
and the conversion of money at a rate. Each pair is checked against the other on
generated cases, and each harness has a test that sabotages one side to prove it
can still fail. The panel must never promise a figure the backend would not
store.

`docs/adrs` records the decisions and why they were taken; `docs/database.md`
covers the schema and its migrations.

## Bugs and ideas

Both go to [the issue tracker](https://github.com/Kami-fr/shared_expenses/issues).
A bug about money is worth the figures it happened on: what the expense was, the
rule, and what you expected instead.

## Licence

MIT
