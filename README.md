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
- **History** — every change to an expense or a reimbursement, with who made it
  and what moved. Deletions included, which is where an expense's own history
  cannot help.
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

The panel is Lit 3 and TypeScript, built by Vite. The integration talks to it
over the Home Assistant WebSocket API — never through entities.

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
