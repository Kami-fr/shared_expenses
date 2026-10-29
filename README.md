<p align="center"><img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/hero.png" width="720" alt="Shared Expenses on three phones"></p>

<h1 align="center">💸 Shared Expenses</h1>
<p align="center"><b>Who paid, who owes what, and who pays whom back. Inside Home Assistant.</b><br>
No account to create, no cloud, nothing to sync.</p>

<p align="center">
<a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Default-41BDF5.svg" alt="HACS default"></a>
<a href="https://github.com/Kami-fr/shared_expenses/releases"><img src="https://img.shields.io/github/v/release/Kami-fr/shared_expenses" alt="Release"></a>
<a href="https://github.com/Kami-fr/shared_expenses/actions"><img src="https://github.com/Kami-fr/shared_expenses/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>
<p align="center"><a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=Kami-fr&repository=shared_expenses&category=integration"><img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open in HACS"></a></p>

## ✨ Why this one

| | |
|---|---|
| 👤 **It knows who is asking** | The panel and the dashboard card run as the person looking at them: *you are owed 42.71*, green when money comes your way, red when it leaves. Same card on the kitchen tablet, a different answer for each of you. |
| 🔒 **Yours, all of it** | The figures live in your own instance, next to the rest of it. Each person in the house signs in as themselves and sees only the groups they belong to. |
| 🧮 **Exact to the cent, forever** | Amounts are integers in cents, rates are integers in millionths. No rounding drift, and an old expense always resolves to the same shares it did the day it was entered. |
| 🌍 **Another currency, frozen the day it was owed** | Pay in pounds on a trip counted in euros: the day's rate is fetched once, kept with the expense, and yours to overwrite. |
| ✂️ **Split the way life splits** | Equally, by amounts, by percentages, or "share 40 of it, the rest is mine". A category can carry its own rule. |
| ↩️ **Refunds and reimbursements, told apart** | A shop giving money back comes off the purchase it answers, split exactly as the purchase was. Paying a flatmate back is a different thing, and the list says so. |
| 📊 **See where it went** | Month by month: what the group spent, against the month before, by category as bars or a ring, and what of it was yours. |
| 🏠 **Part of the house** | A card for the dashboard, optional sensors per group, `add_expense` and `settle_up` actions for a tile or an NFC tag, and an event on the bus for every change. |
| 🕓 **Nothing is lost** | Every edit is in the history with who made it, and the expense as it was before and after. A deleted expense comes back from there as the one it was. |
| 🌐 **Eight languages** | EN · FR · DE · NL · ES · IT · PL · PT. Light or dark, in your own theme, built for a thumb. |

## 🚀 Install

1. Open HACS, search for **Shared Expenses**, download it, restart. Or use
   the button above.
2. **Settings → Devices & services → Add integration → Shared Expenses.**

Nothing to configure, no YAML. **Shared Expenses** is in the sidebar.

<details>
<summary>No HACS? Install by hand</summary>

Copy `custom_components/shared_expenses` into your `config/custom_components`
directory, restart Home Assistant, then add the integration as in step 2.
</details>

## 📸 A look around

<p align="center">
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/tour.gif" width="270" alt="A quick tour: the apartment's balances, a 36 dollar wine and cheese of which 20 is shared, the month as a calendar, the weekend in London in pounds, then where the money went, as bars and as a ring" title="Balances, a bill shared in part, the month as a calendar, a trip in pounds, and where it all went">
</p>

<p align="center"><sub>Balances, a bill shared in part, the month as a calendar, a trip in pounds, and where it all went.</sub></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/01-groups.jpg" width="176" alt="Your groups, one tap in" title="Your groups, one tap in">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/02-balances.jpg" width="176" alt="What is due to confirm, and who owes what from where you stand" title="What is due to confirm, and who owes what from where you stand">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/03-trip-currency.jpg" width="176" alt="Two of you, in a currency the group doesn't count in" title="Two of you, in a currency the group doesn't count in">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/04-split-part.jpg" width="176" alt="Share part of it, the rest to whoever paid" title="Share part of it, the rest to whoever paid">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/05-edit-currency.jpg" width="176" alt="The rate, frozen the day it was owed" title="The rate, frozen the day it was owed">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/06-statistics.jpg" width="176" alt="Where the money went" title="Where the money went">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/07-reimbursement.jpg" width="176" alt="Record money paid back" title="Record money paid back">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/08-calendar.jpg" width="176" alt="The month as a calendar, a dot per expense in the colour of who paid" title="The month as a calendar, a dot per expense in the colour of who paid">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/09-check.jpg" width="176" alt="A check for typing slips: one shop written two ways, a purchase entered twice" title="A check for typing slips: one shop written two ways, a purchase entered twice">&nbsp;
  <img src="https://raw.githubusercontent.com/Kami-fr/shared_expenses/main/docs/screenshots/10-history.jpg" width="176" alt="The history: who changed what, and the expense before and after" title="The history: who changed what, and the expense before and after">
</p>

## 🧰 What is in the box

| | |
|---|---|
| 👥 **Groups** | A flat, a holiday, a couple. Home Assistant accounts or people without one; one currency chosen once, a name you can change anytime. Everyone with an account wears their Home Assistant photo from the start, the others their coloured initials, and each can switch. |
| 🛡️ **Who may do what** | Four switches (members, categories, the group, others' expenses), the same for everyone, with one admin above them who can hand it on. |
| 🧾 **Expenses** | A title, an amount, who paid, a date, a category, and a split. The names already in use are offered while a title is typed, with the category they had last time, so one shop keeps one spelling. |
| 🔁 **Recurring expenses** | The rent, a subscription, the electricity: every N days, weeks or months. Each one is proposed on its day, to add in one tap or check first when the figure moves, and an event on the bus can buzz a phone. |
| ↩️ **Refunds** | A shop giving money back is the same expense the other way: it comes off the total and off each share, split exactly as the purchase was. |
| 🧮 **Split rules** | Equally, by fixed amounts or percentages, or an envelope shared between some with the rest to whoever paid; categories carry their own. |
| 🌍 **Other currencies** | Pay in another currency; the day's rate is fetched and frozen onto what it converted, so a debt stays what it was the day it was owed. |
| ⚖️ **Balances** | Who owes what, and the shortest set of transfers that clears it. |
| 🤝 **Reimbursements and debts** | Record money moved, or merely owed; someone who left the group can still be paid back. |
| 🔍 **One list** | Expenses and reimbursements together, newest first, searchable by anything on the row: a shop, a person, a category, an amount. |
| 🩺 **A check for typing slips** | A figure ten times its usual, one shop written four ways, the same purchase twice, an odd category: each asked once, set right in one tap or answered "that's right". |
| 📅 **Or a calendar** | The month as a wall calendar, a dot per expense in the colour of who paid: tap a day to see what it holds. Reimbursements wear a ring of their own. |
| 🟢🔴 **Written from where you stand** | "You are owed", green when the money comes your way, red when it leaves. |
| 📈 **Statistics** | A month, a year or everything: the total and how it compares, where it went, the year around it, and who paid against whose share it was. |
| 🕓 **History** | Every change, a day at a time: who made it and when, and the expense as the list shows it, what it was struck through beside what it became. Several in a row read as one line; a deleted expense can be brought back from there as the one it was. |
| 🏠 **On the dashboard** | A card that tells each viewer what *they* owe, plus optional per-group sensors and `add_expense` / `settle_up` actions. |
| 📱 **Mobile first** | A single panel, thumb-reachable, in your own theme, light or dark. |

> 💡 Amounts are held in cents, as integers: no rounding drift, ever. Rates are
> held in millionths, and are integers too.

## ✂️ How the split works

Every expense resolves to a set of shares, and it is the shares that are stored
— the balances only ever read those. A rule is kept alongside them so reopening
an expense shows what was meant, not just the figures it happened to produce.

A rule has two parts:

- 📦 **An envelope**, shared equally between the people you tick. Leave it empty
  and the whole expense is shared.
- 🧩 **The rest**, which goes to whoever paid unless you say otherwise, or is
  split between the people you tick — equally, by exact amounts, or by
  percentages.

An 85,42 € shop where only 5 € of it is shared, for instance: an envelope of 5 €
between the two of you, the rest to whoever paid.

Rules are stored with their members spelled out, never as "everyone". Someone
joining next month never falls into an expense they had nothing to do with, and
an old expense always resolves back to the same shares.

🌍 A split is settled in what the expense was paid in — the editor sits under the
amount, so "Antonin owes 20" on a New York dinner is twenty dollars. The shares
are then converted and stored in the group's currency, which is what balances can
be counted in. The converted total is divided rather than each share converted on
its own: three shares of a cent at a rate of a third would each round to nothing,
and the shares would stop adding up to what they are shares of.

## 🏠 On the dashboard

Add a card, pick **Shared Expenses**, and the balances are on your dashboard —
the same ones as in the panel, drawn by the same code:

```yaml
type: custom:shared-expenses-card
group_id: 01KXHEB4VFFWMAN5CG4BDNNBF9
```

🎯 **It speaks to whoever is looking.** A card runs in your browser, on your own
connection, so you read what *you* owe and your flatmate reads what *they* owe.
Nothing here is an entity, so nobody outside the group can read it. Add or edit
the card from the dashboard's own UI and a group picker fills the id in for you.

A group can also put its **figures** on the dashboard as entities — off by
default, since Home Assistant lets every account in the house read any entity.
Turn it on under **Edit group → Dashboard sensors**:

| Entity | What it says |
|--------|--------------|
| 💶 Total spent | What the group has spent since it started — expenses only |
| 👤 One per member | Their balance: positive is owed to them, negative is owed by them |
| 🕓 Last activity | When something was last entered |

With those entities come two actions, `add_expense` and `settle_up`, so a tile,
an NFC tag, or an automation can add the shopping or settle the rent:

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

📚 **More recipes** — a reimbursement tile, a monthly gauge, calling from an
automation, and where the ids come from — are in
**[docs/dashboard.md](https://github.com/Kami-fr/shared_expenses/blob/main/docs/dashboard.md)**.

🔔 And the other direction: every write fires a `shared_expenses_changed` event
on the bus, so an automation can notify, remind, or react when an expense lands
or a debt is settled — **[docs/events.md](https://github.com/Kami-fr/shared_expenses/blob/main/docs/events.md)**.

## 🔐 Requirements, and what leaves your instance

| | |
|---|---|
| **Home Assistant** | 2026.7.0 or later |
| **Accounts and keys** | None |
| **Telemetry** | None |
| **Network** | One request, only if you ask for it: the day's rate for an expense in a currency the group does not count in |

That one request goes to [Frankfurter](https://frankfurter.dev), a free
open-source service sourcing from central banks and needing no key. Nothing
about the expense is sent — only the pair of currencies and the date.

The rate is always yours to overwrite, and typing one always wins. The service
being down, or the instance being offline, never stands between you and writing
down what you just spent.

## 🛠️ Development

```bash
python -m venv .venv
.venv/Scripts/activate        # source .venv/bin/activate on Linux and macOS
pip install homeassistant aiosqlite python-ulid pytest pytest-asyncio pytest-cov ruff

pytest                        # the manager, against a real SQLite database
ruff check .

cd frontend
npm ci
npx playwright install chromium
npm test                      # the panel's helpers, and its layout on a phone
npm run build                 # writes custom_components/shared_expenses/www
```

The panel is Lit 3 and TypeScript, built by Vite. It talks to the integration
over the Home Assistant WebSocket API and never through entities: the panel knows
who is asking, and every rule in here depends on that.

The dashboard card is the same bundle and the same conversation — it runs in a
browser too, so it asks over the WebSocket API and is answered as whoever is
looking. It has to be one bundle: Home Assistant is a single page, and two would
each define `se-balance-card`, the second throwing and taking the panel with it.
See ADR-015. It is served from the configuration's `www/`, copied there by the
integration, because that is the one place Home Assistant serves before a custom
integration has loaded — ADR-016 says why a dashboard opened during boot needs it.

The entities go the other way and are a separate surface. They belong to the
instance rather than to an account, which is why a group has to ask for them —
see ADR-014.

Some logic exists twice, in Python for the backend and in TypeScript so the panel
can show what an expense comes to before you save it — the split resolver, and
the conversion of money at a rate. Each pair is checked against the other on
generated cases, and each harness has a test that sabotages one side to prove it
can still fail. The panel must never promise a figure the backend would not store.

The built bundle is committed on purpose: HACS ships the repository as it is and
never runs a build, and CI fails if `www/index.js` differs from a fresh one.

`docs/adrs` records the decisions and why they were taken; `docs/dashboard.md`
covers everything on the dashboard, and `docs/database.md` the schema and its
migrations.

## 🐛 Bugs and ideas

Both go to [the issue tracker](https://github.com/Kami-fr/shared_expenses/issues).
A bug about money is worth the figures it happened on: what the expense was, the
rule, and what you expected instead.

## 📄 Licence

MIT
