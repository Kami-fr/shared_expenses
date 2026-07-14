# Shared Expenses

Shared expenses for Home Assistant: who paid, who owes what, and who reimburses
whom. No cloud, no account to create — the data lives in your own instance,
next to the rest of it.

Everyone in the house logs in as themselves. Each person sees the groups they
belong to, and nothing else.

## Features

- **Groups** — a flat, a holiday, a couple. Every Home Assistant account you add
  can open the group; people without an account can be added too, and still
  carry expenses.
- **Expenses** — a title, an amount, who paid, a date, a category, and a split.
- **Split rules** — beyond splitting equally: fixed amounts per person, an
  envelope shared between some and the rest to whoever paid. A category carries
  its own rule, so the usual case is filled in for you.
- **Balances** — who owes what, answered from your side first, and the shortest
  set of transfers that clears everything.
- **Reimbursements** — record one, correct it, or delete it. Someone who left
  the group can still be reimbursed: leaving does not clear a debt.
- **History** — every change to an expense or a reimbursement, with who made it
  and what moved. Deletions included, which is where an expense's own history
  cannot help.
- **Mobile first** — a single panel, thumb-reachable, in your own theme, light
  or dark.

Amounts are held in cents, as integers: no rounding drift, ever.

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
  between the people you tick — equally, or by exact amounts you type.

An 85,42 € shop where only 5 € of it is shared, for instance: an envelope of
5 € between the two of you, the rest to whoever paid.

Rules are stored with their members spelled out, never as "everyone". Someone
joining next month never falls into an expense they had nothing to do with, and
an old expense always resolves back to the same shares.

## Requirements

- Home Assistant **2026.7.0** or later
- No external service, no API key

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

The split resolver exists twice, in Python for the backend and in TypeScript so
the panel can show what a rule comes to before you save it. The two are checked
against each other on generated cases: the panel must never promise a split the
backend would not store.

`docs/adrs` records the decisions and why they were taken; `docs/database.md`
covers the schema and its migrations.

## Bugs and ideas

Both go to [the issue tracker](https://github.com/Kami-fr/shared_expenses/issues).
A bug about money is worth the figures it happened on: what the expense was, the
rule, and what you expected instead.

## Licence

MIT
