# ADR-015 - The dashboard card

## Status

Accepted

## Context

ADR-014 put a project's figures on the dashboard as entities, and paid for it
with the one thing the panel is built on: **there is no "you" in an entity.** Its
state is one string for the whole house, so a balance sensor can only ever say
"Antonin: -42.71". Every screen in the panel says "you are owed", green when the
money comes your way — and none of that survives the crossing.

The question a household actually puts to a dashboard is "who owes what to
whom". Answering it as entities means a sensor per member and a reader who does
the matching in their head.

A `tile` cannot help. It renders an entity's state: a value and an icon, not a
sentence. The state would have to *be* the sentence — capped at 255 characters,
and built in Python, which would be a third implementation of formatting money
next to `format.ts` and the parity harness that guards it.

And the answer already exists. `se-balance-card` has been the first thing in the
panel since the beginning, and already knows the three shapes the question takes:
the face-off when two people owe each other, the transfers when more do, and the
group's own view when nobody is looking from the inside.

## Decision

**Ship `se-balance-card` to the dashboard as a custom Lovelace card**,
`shared-expenses-card`, a thin adapter that fetches and hands over. No layout is
written twice.

### A card is not an entity, and that changes everything

A Lovelace card runs in the browser of whoever is looking, with **their** `hass`
connection. So it calls `shared_expenses/get_balances` exactly as the panel does,
and the WebSocket API knows who is asking.

- **The "you" comes back.** The same card, in the same dashboard, tells you what
  you owe and tells Antonin what he owes. Proven by rendering it: one set of
  balances reads "On te doit 42,71 €" for one account and "Tu dois 42,71 €" for
  the other.
- **The wall holds by itself.** `Scope.GROUP` refuses a stranger at the same door
  the panel uses, so `groups.exposed` has nothing to do with this. **The card
  works with the dashboard switch shut**, and takes no wall down — there is
  nothing to opt into, and nothing to warn anybody about.
- **No account is an ordinary answer.** The kitchen tablet drops to the group's
  own view and never says "you", which is what the panel already does on it.

The entities stay and are not in competition. They are for automations, for
history, for a thing that reads a number. The card is for the person.

### One bundle, and it has to be one

The card ships inside the panel's own bundle, handed to Home Assistant twice: as
`panel_custom`'s module, and to every dashboard through `add_extra_js_url`.

Not thrift. **Home Assistant is a single page**, so the panel and the card live
in the same document. Two bundles would each run
`customElements.define("se-balance-card")`; the second throws, and takes the
panel down with it. The card costs 6 KB on top of a 271 KB bundle, which is not
a trade worth thinking about.

The URL is the panel's, mtime and all, and it is *held* rather than recomputed
when it is taken back: `remove_extra_js_url` matches on the string, so a rebuild
between a register and an unregister would remove nothing and leave every
dashboard loading a bundle that is gone.

### Told when the group moved, never asked

The panel is opened, read, and closed, and whoever is looking at it is usually
the one typing into it. A card sits on a kitchen wall for days: nothing would
ever tell it somebody else did the shopping, and it would look perfectly current
not doing so.

`shared_expenses/subscribe_group` is a command of ours rather than an event on
the bus, because the bus is not open to it: Home Assistant refuses
`subscribe_events` on anything but `state_changed` unless the account is an
admin, so an ordinary member could never listen. Ours goes through
`api_command(Scope.GROUP)`, like everything else.

**The ping carries nothing** — not the balances, not what moved, only that
something did. That is the design and not an economy. A subscription outlives the
check that allowed it: somebody dropped from the group would go on hearing it. So
what the ping provokes is another `get_balances`, authorized afresh, which
refuses them. Put a figure in the ping and that second door stops being asked.

It hangs off `SIGNAL_GROUP_CHANGED`, which already exists and already fires from
`_record` on every write worth accounting for — the same door the coordinator
listens at.

## Consequences

**Settling up walks to the panel.** In the panel a line opens the payment dialog
filled in, which is the whole trick: the figure you are looking at is the one you
are about to pay. A dashboard has nothing to open a dialog in, so the card
navigates to the project and the line there does the rest. One tap more, and
nothing pretended.

**No visual editor.** The card is configured in YAML, and `setConfig` throws with
the one thing the writer needs to know: the id is on every entity of the project,
under Developer tools. `getStubConfig` fills in their first project so the card
picker produces something that works rather than something that throws.

**Every dashboard loads the bundle, for everybody**, including accounts in no
project at all. That is what it takes to be offered in the card picker; there is
no per-user module list. It costs a parse, and the card asks the integration
nothing until one is placed.

**The card is a public surface now.** Its config — `type` and `group_id` — is
written by hand into dashboards, and breaking it breaks them silently. That is a
heavier promise than an entity, which Home Assistant at least renames loudly.

## Alternatives considered

**A sensor whose state is the sentence, shown by a real `tile`.** What was
literally asked for. Rejected: 255 characters, and the sentence would be built in
Python — a third implementation of money formatting, with no harness to hold it
to the other two. It would also still have no "you".

**A Markdown card templating over a `settlements` attribute.** Cheap: the
coordinator already has the settlements and throws them away. Rejected as the
main road — it is the entity surface, so no "you", `exposed` must be open, and
the money is formatted in Jinja. Still available to anyone who wants it, and
worth adding the attribute for if an automation ever needs one.

**A second bundle for the card.** Would have saved a parse on dashboards and cost
a crash: two `customElements.define` calls for the same name in one document.
Shared chunks would have fixed it, at the price of hashed files accumulating in a
versioned `www/`.

**Firing an event on the bus and subscribing to it.** Simpler, and admin-only:
`handle_subscribe_events` refuses everything but `state_changed` to an ordinary
account. Antonin could never have listened.
