# Roadmap

## Sprint 1 — Foundations

- [x] Integration skeleton
- [x] Config flow

## Sprint 2 — Storage

- [x] SQLite
- [x] Domain models
- [x] Repositories
- [x] Versioned migrations (up to `schema_v8`: the kind of a payment)

## Sprint 3 — Business logic

- [x] Groups, members, categories
- [x] Expenses and shares
- [x] Payments
- [x] Split rules: an envelope shared equally, then the rest by exact amounts or percentages
- [x] Balances and simplified reimbursements

## Sprint 4 — API and panel

- [x] WebSocket API (30 commands)
- [x] Panel registration
- [x] Lit 3 frontend: dashboard, group detail, dialogs
- [x] Category management and split rule editor in the panel

## Sprint 5 — Quality

- [x] Unit tests for the helpers
- [x] Manager tests against SQLite
- [x] Panel tests binding the real Home Assistant signatures
- [x] WebSocket tests

  Done **without** `pytest-homeassistant-custom-component`, which cannot be
  installed on Windows: it pulls in `homeassistant.runner`, which imports the
  Unix-only `fcntl`, and its pytest11 entry point then breaks collection of
  every test. The tests drive the real handlers, decorators and voluptuous
  schemas directly instead. What they lose is the transport; what they keep is
  everything this integration actually wrote — which is where the bugs were.

- [x] Parity harnesses: the split resolver and the currency conversion, each
      existing twice and checked against the other on generated cases. Each
      harness has a test that sabotages one side, to prove it can still fail.

- [x] Frontend tests (see Later: the helpers, then the layout)

## Sprint 6 — Release

- [x] `hacs.json`
- [x] CI (ruff, pytest, hassfest, HACS, frontend build)
- [x] README
- [x] Screenshots
- [x] Publish to HACS. Everything the store asks for was in place and every
      HACS check green (Sprint 17); the submission, `hacs/default#9302`, was
      merged on 2026-10-18, and the integration is in HACS's default list.

## Sprint 7 — Accountability

- [x] History of every change to an expense or a reimbursement
- [x] Group journal, holding what deletions took away

## Sprint 8 — Statistics

- [x] Totals, by category and by month, and what of it was yours
- [x] Pie and bar charts, drawn as SVG by hand: the Home Assistant CSP blocks
      every external script, so a charting library was never on the table
- [x] Reimbursements left out throughout — moving money between members is not
      spending

## Sprint 9 — Currencies

- [x] An expense in another currency, converted once on the way in
- [x] A reimbursement or a debt in another currency too: 100 USD handed back
      does not clear 100 EUR owed
- [x] Rates from [Frankfurter](https://frankfurter.dev), free and needing no key
- [x] The rate frozen on what it converted, and always overridable by hand
- [x] A debt written down as one, next to reimbursements

## Sprint 10 — Repairs

Everything here was found by using the thing, which is the point.

- [x] A second group could not be created at all: the owner was minted a fresh
      member each time, against an index saying one member per account. Every
      test missed it by leaving the owner accountless — a null user_id collides
      with nothing.
- [x] Editing an expense dropped its currency: the update hand-listed eight of
      the ten fields the create sends, and `Partial` makes a missing field mean
      "leave it alone". Both dialogs now derive the update from the create.
- [x] A debt could not become a reimbursement: `update_payment` asks
      `payment_state` what moved and skips the write when the answer is nothing.
      The kind was not in it — and being the one editable field that moves no
      money, it was the one field nothing else could betray.
- [x] A group's currency was free text: "EURO" went in happily and left every
      foreign expense unsaveable, with no way back. Picked from a list now.
- [x] Groups can be renamed
- [x] The search box stopped hiding itself on short lists: a control that comes
      and goes is read as a bug

## Sprint 11 — Who may do what

`role` had been stored, served and settable since v1, and read by nothing. Any
member could delete the whole group.

- [x] Four permissions per project, all granted by default: managing members,
      managing categories, editing the project, touching what is not theirs.
      Per project and not per person — the per-person dimension is `role`, and
      it already existed.
- [x] The role means something at last: the admin is above every switch, and
      deleting the project is theirs alone.
- [x] Two roles instead of three (v11): `owner` goes, `admin` stays and is
      handed on. The middle step named somebody almost in charge of a shopping
      list, which is not a station worth having.
- [x] The admin can hand the project on, becoming an ordinary member, and only
      then leave. Being locked into your own group for life was not a rule
      protecting anything, it was the absence of this.
- [x] No command anywhere takes a role: the schema does not know the word, so a
      member who might have brought in a second account of their own as an admin
      is refused at the door rather than by a check somebody could forget.
- [x] `created_by_member_id` (v10): an entry is yours if you entered it or it is
      about you. Recovered for the past from the creation revision.
- [x] `update_member` requires its group: a guard skippable by leaving a field
      out is not a guard.
- [x] 33 tests, each guard sabotaged to prove the suite fails when it should.
      The tests that came before walk through every line of this without ever
      waking it: everything is granted by default, so only a refusal reaches it.
      See ADR-013.

## Sprint 12 — Undo

- [x] A deleted expense or payment can be brought back from the group journal,
      as the one it was: same id, so its history runs on unbroken, and same
      frozen rate — converting afresh would restore a different debt from the
      one that was deleted.
- [x] A deletion carries a snapshot rather than a diff. It is the only place the
      thing still exists, and what a restore is built from.
- [x] The panel spells out the fields of an `updated` and of nothing else. A
      deletion takes every field there is, so naming them says only what
      "deleted" already said.
- [x] "It cannot be brought back" left the delete confirmation, being no longer
      true.
- [x] 14 tests, the frozen rate sabotaged to prove they catch a re-conversion.

## Sprint 13 — The journal holds more than the money

- [x] The project itself, its categories and its people are accounted for: what
      it allows, its name and default rule, who joined, who left, who was
      renamed, and who runs it. Those decide who may touch an expense at all,
      and they used to happen with no record.
- [x] A member's revision belongs to the project that asked for it. A member is
      global, so a rename is felt everywhere; the others were not party to it.
- [x] Handing the project on writes two lines. The one giving it up is not a
      footnote to the one taking it.
- [x] A save that moved no field records nothing.
- [x] Restore is offered on an expense and a payment only — a member who left is
      not in `openable` either, and would have looked restorable on that alone.
- [x] 10 tests, the group's recording sabotaged to prove they catch its absence.

## Sprint 14 — The dashboard

- [x] A project can put its figures on the dashboard: what it has spent, a
      balance per member, and when it was last used. Grouped under a device per
      project.
- [x] A `binary_sensor` for "does anybody still owe anything" was built and
      dropped. It answered what the balances already answer, and worse: whoever
      asks it goes on to read them anyway, to know who and how much.
- [x] Off by default, per project, admin only, and written into the journal.
      Entities are not walled — `USER_POLICY` grants every account every entity
      — so this takes a wall down and has to be thrown rather than inherited.
- [x] Actions rather than buttons: `add_expense` and `settle_up` take fields, so
      an NFC tag on the fridge works. From the interface they carry the account
      and obey every rule; from an automation there is nobody to ask, so they go
      through and the journal records "Someone".
- [x] The coordinator refreshes on a signal, never on a clock: a shared expense
      changes when somebody types it in. One signal, sent from `_record`, which
      every write worth accounting for already went through.
- [x] 25 tests. The exposure filter sabotaged to prove they catch a project
      reaching the dashboard without asking, and the total sabotaged to prove
      they catch a reimbursement counted as spending.

## Sprint 15 — The card

- [x] `se-balance-card` on any dashboard, as `shared-expenses-card`. Not one
      line of it was rewritten: it already knew the three shapes of "who owes
      what to whom" — the face-off at two, the transfers beyond, and the group's
      own view when nobody is looking from the inside.
- [x] **The "you" comes back.** A card runs in the browser of whoever is looking,
      on their connection, so it asks the WebSocket API and is answered as them.
      One set of balances reads "On te doit 42,71 €" for one account and "Tu dois
      42,71 €" for the other. An entity's state is one string for the whole
      house; this is why the card is not built out of them.
- [x] Nothing here is an entity, so the wall holds by itself and `exposed` has
      nothing to do with it. The card works with the switch shut.
- [x] One bundle, and it has to be one: Home Assistant is a single page, so two
      would each run `customElements.define("se-balance-card")` and the second
      would throw, taking the panel with it. The card costs 6 KB of 277.
- [x] `subscribe_group`: a card sits on a kitchen wall for days, where the panel
      is opened and closed. A command of ours rather than an event on the bus —
      Home Assistant refuses `subscribe_events` on anything but `state_changed`
      to an ordinary account, so a member could never have listened. The ping
      carries nothing, so the read it provokes is authorized afresh.
- [x] 9 tests, the group filter sabotaged to prove they catch a card hearing
      about a household it has nothing to do with, and the held URL sabotaged to
      prove they catch every dashboard left loading a bundle that is gone.
- [x] Rendered in headless Chrome against the real bundle, which is the only
      thing that could show the same balances speaking differently to two
      accounts. See ADR-015.

## Sprint 16 — Before it is public

- [x] A group's currency locks the moment it holds money. Nothing reconverts, so
      changing it later would reread every stored figure as another currency —
      40,00 € as 40,00 $, in silence. The panel already offered it on an empty
      group only; this says the same where no panel can be skipped, in the
      manager, so an automation or a direct command is refused too. The lock is
      the money and not the field: an empty group still changes freely, and a
      group full of expenses is still renamed freely.
- [x] `iot_class` was `cloud_polling`, which was never true: the data is local
      SQLite and the coordinator refreshes on a signal, not a clock. The one
      request that ever leaves is a rate, on demand. `local_push` now, which is
      what the privacy line in the README has always claimed.
- [x] 4 tests, the lock sabotaged both ways — disabled to prove they catch a
      currency changed under stored figures, and stripped of its condition to
      prove they catch a rename refused for no reason.
- [x] Registering `add_expense` and `settle_up` turned Hassfest red, and rightly:
      Home Assistant wants an action's names and descriptions in its
      translations, not loose in `services.yaml`. They moved — every action and
      every field is named under `services` in `strings.json` and in both
      translation files, and `services.yaml` keeps only the shape of the fields:
      what is required, what a selector offers, an example. The manifest keys
      went back into their canonical order while here.
- [x] HACS was red on `brands`: an integration cannot pass that check until its
      icon lives in `home-assistant/brands`, a pull request against another
      repository and part of publishing, not of building. The check is skipped in
      CI (`ignore: brands`) until that lands. The icon drawn for it is the
      integration's own mark — a coin split in two, a person on each half, in the
      money green — rather than a borrowed glyph.

      **Superseded**, and the pull request was never opened: see Sprint 17. Left
      standing as the record of what was true when it was written.
- [x] The sidebar dropped `cash-multiple` for `account-cash`. A person and their
      money says more of what the panel is than a stack of notes, and it echoes
      the new mark. The balance and activity sensors keep their own icons — a
      different surface, each already saying its own thing.

## Sprint 17 — Going public

- [x] The `LICENSE` file was empty, so GitHub read no licence from it —
      NOASSERTION — and HACS refused the repository over it, though
      `pyproject.toml` had said MIT since the first commit. The MIT text fills it
      now, the copyright on the repository's own handle rather than a name.
- [x] Version 1.0.0, the number a first GitHub release carries.
- [x] Seven shots of the panel on a phone, as a contained gallery near the top of
      the README, where HACS shows it too. The six dashboard recipes that had
      grown there moved to `docs/dashboard.md`, linked in a line: useful, but more
      than a first read wants. The feature list lost its second sentences — the
      what kept, the why let go.
- [x] **The brand icon ships in the integration, and there is no pull request to
      open.** Home Assistant stopped taking brands pull requests for custom
      integrations with the Brands Proxy API (2026.3): an integration carries its
      own icon now, in a `brand/` folder, and Home Assistant serves it from
      there. The coin lands in `custom_components/shared_expenses/brand` —
      `icon.png` at 256, `icon@2x.png` at 512 — and shows up without a single
      external step. This is what supersedes the last bullet of Sprint 16.
- [x] Every HACS check runs. `hacsjson` and `integration_manifest` were fetched
      over `raw.githubusercontent.com`, which hands out nothing for a private
      repository, so both came back empty and failed whatever the files held;
      they were set aside until the repo was public, where they are meant to run.
      `brands` was the last ignore and it is gone. The action validates the whole
      thing, exactly as the default store will when the submission lands.
- [x] The HACS check runs with the workflow's token. Unauthenticated, its calls
      shared the runner IP's 60-per-hour allowance, and once spent GitHub
      answered 503 — which HACS reports as "repository not loaded properly"
      though nothing here is wrong.

## Sprint 18 — What a full group turned up

Opening the panel on a group with real history in it, on a real phone.

- [x] The group switcher did nothing. The app keeps a single page element and
      only swaps its `groupId`, so Lit reused the element and `connectedCallback`
      never fired again: the page went on showing the group it first loaded. It
      read as the switcher being broken, and it was. The way in through "all
      groups", which unmounts and remounts, had been hiding it.
- [x] The last expense hid under the floating add button — the newest row, the
      one you came to read, sat beneath the plus. The page carries a foot of
      padding now, the button's own height and no more, so it lifts that one row
      clear and leaves the list's own rhythm alone.
- [x] The word on screen is "group" again. It had read "project" everywhere a
      reader met it, a deliberate turn once to keep clear of Home Assistant's own
      groups, and reversed for the plainer word. Only the noun a reader sees: every
      key, id, URL, table and command still says group, because those answer to
      the schema, not to the eye. Redone across all eight languages, the
      integration's own translations and the README — with the genders the swap
      turns over, das Projekt to die Gruppe, het to de, projekt to grupa and its
      declensions.
- [x] Editing a foreign-currency expense quietly refetched today's rate and let it
      stand in for the one it was saved with, so saving rewrote the debt at a rate
      that had nothing to do with the day it was owed. The dialog hands the stored
      rate to the field, which holds it as authoritative; changing the currency or
      the day still fetches a fresh one. A default to keep, not a wall.
- [x] A stored equal split reopened as "share part of it". Every rule pins its
      payer onto the remainder so that "everyone" cannot draw in whoever joins the
      group later; on an equal split that remainder is inert, and `modeOf` was
      reading it as an intention. No money moves — only the mode the editor opens
      on — and it mends what is already stored, with no migration.
- [x] The hairline that sets the split apart from the fields above it was drawn
      only where there was a history under it, so the one screen that most wants
      it — the expense filled in from nothing — ran the two together.
- [x] The uncategorised row drew an empty square where every other row carries a
      glyph, and so did any category saved without an icon of its own.

## Sprint 19 — The dashboard, further

- [x] The balance card gains a visual editor: the group as a list, only the ones
      this account belongs to, and an optional title for telling two cards apart
      on one dashboard. Adding it no longer means pasting a `group_id` out of
      Developer tools.
- [x] The exposure switch says what it governs. It read as though it ruled the
      whole dashboard, when the card speaks to the logged-in account over the
      authenticated socket, leaks nothing, and needs no exposure at all. It says
      "Dashboard sensors" now and spells that out.
- [x] A group that drops off the dashboard has its device removed outright,
      entities and all. They were never cleaned up, so a closed switch left a
      device sitting unavailable to rot with no way to delete it by hand either.
- [x] The card's title opens the group in the panel, and a button beside it lands
      straight on a new expense — on a tablet on the wall: see what is owed, tap,
      write down the shopping. The card only says where to go, the panel owns the
      dialogs, and the address carries that intent, which the panel reads once and
      drops so a reload or a step back does not reopen the form.
- [x] An add-expense card and badge that do only that: one for the body of a
      dashboard, one for the row along the top, each as tall as a native tile and
      wearing the same hairline. A tile with no group means "wherever the reader
      is", which the remembered group makes answerable — it used to be refused
      outright and wear Home Assistant's red error card for it.
- [x] Both cards draw a live preview in the picker, built from their own stub
      config, where they had sat in the gallery as a name and a line of prose
      among core cards showing the real thing.
- [x] The colour control everywhere — members, categories, tiles — became a
      searchable combobox of named colours in place of a spread of swatches, so a
      colour is a word away rather than a hunt, and it reads the way Home
      Assistant's own colour field does. It expands in place rather than floating
      over the page, so dropped in a dialog that scrolls it is never clipped. The
      same muted set, which is the point, and a plain hex still stored.
- [x] Where the money went can be read as a disc as well as a ranking of bars:
      one answers "how much of it" and the other "what fraction of everything",
      with the rows below kept as the legend. The choice is remembered by the
      browser that made it — it belongs to the screen looking, not to the
      household.
- [x] Amount and date shared a row only above 380 CSS pixels, so the same dialog
      wore two designs on two phones, decided by a display-zoom setting nobody
      remembers choosing. Two columns everywhere, measured to fit at 360px.
- [x] Every write fires `shared_expenses_changed` on the bus, so an automation can
      notify, remind, or light a lamp on it. The two actions let an automation
      write a group and nothing let one hear back. It rides the journal's own
      door: a save that moves no field stays silent, and a group's deletion — the
      one write that journals nothing — still announces itself, because an
      automation watching for it is a different listener.

## Sprint 20 — A face on every row

- [x] A member can wear their Home Assistant photo, everywhere a member shows:
      expense rows, balances, the dashboard card, statistics, the split editor.
      The choice sits on the member and is seen the same by everybody, exactly as
      the colour already is, and goes through the same door. Offered only when
      there is a photo to offer, so nobody's circle ever comes up blank. It is
      joined on the client from the person entities, so every avatar downstream
      reads a plain resolved picture and knows nothing of Home Assistant. Schema
      v13.
- [x] Both kinds of row in the group list read the same way now — a face, with
      what the row is about on its corner. An expense wears its category's icon
      and colour, which had never been seen outside the dialog where they were
      chosen; a reimbursement or a debt wears its kind, over the face whose money
      left or who owes it. On the corner rather than beside, because a third
      circle would have been paid for by the width of the title.
- [x] The journal carries a mark per line: green where something appeared, the
      theme's own colour where it changed, red where it went away — so finding
      the one deletion among forty lines no longer means reading forty lines. And
      the face beside it is a real one, in the list where knowing who did
      something matters most.
- [x] Every one of those marks is hidden from screen readers. The sentence
      underneath says all of it in the reader's language, and hearing it twice is
      not hearing it better.
- [x] The remembered group has a durable copy in Home Assistant's own per-user
      frontend storage. `localStorage` alone meant the companion app's WebView
      threw it away whenever the phone wanted the room back, so every few weeks
      the panel greeted its most regular reader like a stranger. The cache stays,
      to land without waiting on anything. The side effect is deliberate: the
      current group follows the account rather than the device, so a phone and a
      desktop open on the same one.
- [x] A member the project does not let manage it is no longer handed an editable
      project. The backend refused correctly and quietly, so nothing was ever
      changed — but from where the reader sat, the switch the admin had just
      closed looked like it had done nothing at all. The dialog reads as what it
      is, and stays reachable: a project you may not rename is not a project you
      may not read.

## Sprint 21 — Money a shop gave back

- [x] An expense may be negative. Money handed back is the same expense as the one
      it undoes with the money going the other way: `paid_by_member_id` reads as
      whoever received it, and every share is owed backwards, so it comes off what
      that member bore. Zero is the only amount refused, and it says why — that is
      not a small expense, it is no expense.
- [x] The sign is turned round at the door rather than threaded through the
      arithmetic. `resolve_shares` reads the rule on the size of what came back,
      `apportion` makes the whole trip reversed, and the TypeScript resolver does
      exactly the same — which is what keeps the figure the panel promises and the
      figure the backend stores the same one. Two signed code paths would be two
      chances for the two to disagree. The rule itself is untouched: every figure
      in it is a size and never a direction, so 60% of a refund is 60% of it.
- [x] A refund is in the total and not in the count. It comes off what the period
      cost, which is the whole point of entering it, but nobody went shopping —
      counting it would put the average of two trips over three. The charts are
      drawn on what they mean: bars measured against the largest size, the disc
      adding up to the wedges it actually draws, monthly bars floored at nothing.
- [x] A purchase is red and a refund green, for every reader alike, and the refund
      drops its minus on both figures. The rule is the group's own edge: money
      leaving the group or coming back to it is a direction, true of the row
      whoever reads it, while money moving between two members is a position and
      takes its colour from where the reader stands. The list answers two
      questions in one column on purpose, and the comment says so, so that neither
      gets "corrected" into the other later.
- [x] A refund may name the purchase it gives money back on (v15). The field
      appears the moment the amount turns negative and never before — a purchase
      answers no other purchase, so asking sooner would put a field nobody can use
      on every expense anybody ever enters. It is a picker rather than a dropdown
      of text, because a purchase is recognised by the face that paid it and the
      mark of what it was.
- [x] Naming one takes the purchase's split with it, handed over as a rule and not
      as the figures it happens to produce: an expense shared equally opens its
      refund on "equally", and its editor says so. The stored shares are the
      fallback for the one case a rule cannot answer — amounts typed by hand,
      where the proportions really were chosen, so they are scaled: 40 borne 30/10
      with 20 given back is 15/5. That scaling is `apportion`, which existed only
      in Python and now exists in TypeScript too, with a parity harness over 112
      generated cases whose sabotage test breaks not the arithmetic but *which*
      member takes the cent that will not divide.
- [x] And the purchase's own words fill what is empty: title, description and
      category, since a refund of the bakery is about the bakery. The category is
      taken outright rather than offered, because a new expense opens on the
      group's default and never on nothing, so "only when empty" would never fire
      and money back on the bakery would be counted against the shopping.
- [x] Four things are refused, each saying which: only a refund gives money back,
      a purchase from another project is out of reach, a refund of a refund says
      nothing anybody means, and a shop cannot hand back more than it was given —
      compared in the group's own money, since the two need not share a currency.
- [x] A purchase says what has come back on it, folded away as the history is and
      for the same reason: most of the time an expense is opened to fix a typo.
      The total sits on the head, since that is the whole of what most people
      want. Nothing at all when nothing has come back. No command lists them — the
      page holds every expense of the group, so this is a filter rather than
      another round trip.
- [x] The link is a plain id with no foreign key. A deleted expense really leaves
      the table, its revision being the only place it still exists, and it comes
      back under the same id — so `ON DELETE SET NULL` would cut every refund
      loose the moment somebody deleted a purchase, and restoring it would not tie
      them again. Held plainly, the link waits: it points at nothing while the
      purchase is away, and reads again the day it returns.
- [x] A category refunded past what it cost came out of the statistics with a
      negative total and took the percentage beside its bar with it. "-12 %" of
      what the group spent is not a fact about anything, so it is floored at zero;
      the bar is drawn on the size, so the category still shows one.

## Sprint 22 — Under the floor

A dashboard full of tiles went unavailable and stayed there. Four things had to
be wrong for that, and they were.

- [x] One writer at a time. The depth counter meant to nest transactions went up
      only after the BEGIN had been awaited, so two writers starting together both
      believed they were first: one of their BEGINs failed, and whichever left
      last committed the other's unfinished work or rolled it back from under
      them, both silently. A lock now holds the connection for the length of the
      outermost transaction and the task holding it is remembered, so a nested
      `transaction()` from that task joins as it always did and one from any other
      task waits its turn.
- [x] Nothing is said before the write lands. Home Assistant began running a
      coroutine up to its first await, so the coordinator's re-read was already
      queued on the very connection the transaction still held open: it read rows
      that had not committed and might never. `Database.after_commit` holds the
      announcement until the write is on disk and throws it away when it never
      lands, and a listener that throws takes neither the others nor the write
      with it.
- [x] The coordinator keeps an interval again. With none, Home Assistant returns
      straight out of `_schedule_refresh` and never reschedules after a failure,
      so a single failed read left every entity of every project unavailable for
      good. Ten minutes under the signal — not polling for freshness, which the
      signal gives, but the longest anything here can be wrong without saying so.
- [x] `available` is gone. The database is this integration's own and nobody can
      unplug it, so "I could not read it" is a bug to log rather than a state to
      broadcast to every tile in the house; Home Assistant's own integrations that
      own their storage do not implement the property at all. The coordinator
      keeps its last good data through a failure, so what stays on screen is the
      last thing that was true.
- [x] `DatabaseNotReadyError` replaces an assert on the connection. A read still
      in flight when the entry unloads finds the file closed under it, which is a
      moment rather than a mistake — and an assert says so only until somebody
      runs Python with `-O`.
- [x] The odd cents of an uneven split no longer all land on the same member. They
      went to the first of the pool, and the pool arrives in the group's own
      order, so it was never a member, it was always the same member: three of
      them over a thousand expenses bore 6,67 € of cents on one side and not a
      centime on the other. No test noticed, because every test asked whether the
      shares added up and none asked who they landed on. The rotation is the
      quotient of the division and not the amount — `amount % count` *is* the
      count of leftover cents, so at two members every odd amount would have
      handed its cent to the second and never to the first. It is derived from the
      amount and from nothing else, and it has to be: the expense has no id while
      the dialog is still adding it up, and the panel must resolve exactly what
      the backend will store.
- [x] CI tests against the Python Home Assistant actually needs. The job asked for
      3.13, which 2026.7.4 refuses, so pip could only resolve backwards and the
      suite ran green against an older Home Assistant than the one this is written
      for. `requires-python` and ruff's target followed.
- [x] `www/index.js` no longer buries the change it carries. It is versioned
      because HACS ships the repository as it is and never runs a build, and it is
      minified — and a minifier allocates its short names in order of appearance,
      so a three-line change to a row arrived as fifteen hundred lines of diff.
      `-diff` keeps git from printing it, `--text` still opens it, and the
      staleness check in CI reads an exit code and is unaffected.

## Sprint 23 — An error that says why

- [x] An error may carry a `code`, finer than its class, and `error_code()`
      prefers it over the table of classes. `InvalidExpenseError` is raised ten
      times over for ten different reasons, and all ten reached a reader as "this
      expense is invalid" while the sentence that would have told them something
      sat unused in the raise — refunding 15,00 against a 6,95 purchase said
      nothing about either figure.
- [x] Three lines of mechanism, and no existing raise touched: one without a code
      resolves exactly as it did, and the panel falls through to the English
      message for a code it does not know. That is what made it safe to spread a
      cause at a time rather than in one sweep.
- [x] 29 causes carry theirs, translated into all eight languages — the four a
      refund can hit, the five on an expense and its shares, the two on a payment,
      the ten ways a split rule can be refused, and the rate service's six causes
      folded into the two things there are to do about them. Two of them borrowed
      a sentence the panel already showed rather than writing a synonym under a
      new name, so one mistake reads the same whichever side catches it.
- [x] Translations go in one block per pass, where codes need not.
      `Key = keyof typeof EN` makes the other seven languages `Record<Key,
      string>`, so a key added to English alone takes `tsc` red.
- [x] Left generic by decision and now by test: every `*NotFoundError`, whose
      class is already the whole of the reason, and the internal guards — the
      deserialisation checks in `splits.py`, the migration `RuntimeError`s,
      `DatabaseNotReadyError`, the shares-add-up assertion, `apportion`'s
      refusals. Those report a bug rather than a mistake somebody made, and
      dressing them as sentences would give a defect the air of a choice.
- [x] 23 tests, because the failure mode is silent: a code with no key degrades to
      its English sentence, nothing goes red, and seven of the eight languages
      quietly stop being translated for that cause. The test reads both real
      sources — the package's syntax tree for every `code=` raised, `EN` for every
      sentence offered — and copies neither, so a code added tomorrow without its
      key fails here instead of in front of a reader. Through the tree rather than
      a regex, because `frankfurter.py` names its two in module constants.

## Sprint 24 — One entry names another

An expense, a refund and a handover are three ways of writing down one
afternoon, and each of them knew about the others without being a way to them.

- [x] A refund and its purchase open each other. The refund has named its
      purchase since Sprint 21 and the purchase has listed what came back on it,
      each showing the other and neither being a door. What somebody looking at
      15,00 given back wants next is what the 60,00 was, and it was a dialog
      away in every direction but the one they were facing.
- [x] The move the journal already makes: one dialog at a time, closing on the
      way, because two stacked leave no way back that is not a guess. One step
      on the history stack for the whole chain, since `show` pushes nothing
      while a dialog is already open.
- [x] The expense dialog is `keyed` on the expense. Jumping expense to expense
      leaves the page on the same dialog, so Lit reused the element and it went
      on showing what it had read in `connectedCallback` — the group-switcher
      bug of Sprint 18, in a second place.
- [x] Leaving is asked about when there is something to lose. Cancel and the
      phone's back button drop what was typed and always have, but those say
      "leave" and a link says "open that one". Armed once, in place, the way a
      deletion is. What counts as something to lose is what somebody did, not
      what the form holds: comparing the form against what is stored reads
      better and cries wolf, since the currency field hands back a rate from its
      first update and an expense saved before `9a35dc2` re-resolves a cent away
      from its own stored shares.
- [x] Whether an entry may be opened stays the page's rule, since it takes the
      group's permissions and the reader's role. It arrives as the ids of every
      expense that may be opened rather than an answer about one, because the
      purchase a refund names is chosen in the dialog. No link where there is
      nowhere to go: a link that does nothing is worse than plain text.
- [x] The row a picker offers, a purchase's refunds and the group page's list
      are one row, in `components/expense-row.ts` — a plain function and a block
      of CSS, the shape `renderAvatar` has, so each host frames it itself. It
      was already written twice and this was the third place asking.
- [x] **A payment can name the expense it is about** (v16). "Antonin gives me
      20,00 for the shopping on the 3rd" is a sentence with an expense in it,
      and money moving between two members is a payment, never an expense — so
      the link a refund gained did nothing for the commonest handover there is.
- [x] That column existed once before and saying why it left is the honest way
      to bring it back. v14 added it, v15 dropped it on the finding that what
      wanted a link was the shop's refund. That finding was right; it answered
      where the link belonged and mistook that for whether this one belonged
      too. The difference is that this one is read — and there is a test that
      reads it back.
- [x] The expense side says nothing in return, by decision, so there is no index
      where v14 had one: an index answers "which payments name this expense",
      and nothing asks. Every expense of the group is offered, refunds included,
      because a payment is not a share of what it names — one handover settles a
      month of them, and somebody pays half of what they owe.
- [x] `payment_state` gains the field, which is not bookkeeping: naming an
      expense moves no money, so every other field is identical either side of
      that save, and left out of the state `update_payment` diffs the write
      would be skipped and the caller told it went fine. That is exactly how the
      kind was once unsaveable.
- [x] 14 tests, twelve on the manager and two through the schema — where a field
      the door does not know dies with "extra keys not allowed". They cover the
      two silences: a field missing from the state, and a column nobody reads.

## Sprint 25 — What the screen was not saying

Three things this panel knew and did not show.

- [x] **Every category gets a colour of its own.** `colorFor` hashes an id into
      twelve, which is right for a member — you meet them a few at a time. A
      group's categories are read as a set, and by the birthday problem twelve
      of them came out in eight colours, eight in six, six in five. The mark on
      a row is what tells the bread from the weekly shopping where the row is
      too narrow to write either.
- [x] A chosen colour is left as it is and taken off the table first; the rest
      are dealt in the order they were created — ids are ULIDs, so sorting them
      is sorting by age — each taking the colour its own hash asks for or the
      next one free. Dealing by age keeps two promises at once: nearly every
      category keeps the colour it had, and one added today can never change the
      colour of one that has been on screen for a year. Past the twelfth there
      is nothing left to be unique with, and the rest fall back to their hash.
- [x] The legend under the disc keeps its bars. They were left off on the
      grounds that a wedge had already said it, and it has not: the disc draws
      only what came out positive, and writes a share on a wedge only where
      there is room — so the smallest categories, which are what a ranking is
      read for, were a colour and a name. Both charts draw the same row against
      the same longest category now.
- [x] **Which way an expense goes is asked outright.** A minus in the amount was
      the whole of how you said a shop had given money back. It worked, and
      there was no way to find out it worked: nothing on screen said a refund
      was a thing this panel does. The one figure a reader checks twice was
      carrying a second meaning on top of its own.
- [x] The field holds a size now and never a direction; `signedAmount()` is the
      one place the two are put back together, and the model still stores a
      refund as one signed figure, which is what lets one resolver serve both.
      Typing a minus still enters a refund — it moves the selector and leaves
      the field. Taking the gesture away outright was the one thing not to do:
      -20 would have become an expense of 20, silently, for exactly the people
      who knew the trick.
- [x] The picker for the purchase a refund answers stops waiting for a figure,
      which turns out to be the better order: name the purchase and its words,
      its category, its payer and its split come with it, and the amount fills
      in as the whole of the purchase until somebody types a smaller one.
- [x] `se-segmented`, and the payment dialog takes it too. A dropdown asks two
      gestures for a choice between two and shows one of them at a time, and
      what is asked here is a fork with two named sides. A switch is worse the
      other way round: off, one of the two natures is never written anywhere.
      Not an invention — the statistics have drawn their period this way since
      they were written; this is that control with a label and an API.
- [x] Measured rather than reasoned about. With no frontend tests, the built
      bundle was served to a headless browser and the segments measured at 360
      CSS pixels: "Remboursement d'enseigne" wanted 199 of the 160 it had, and
      so did Spanish, Italian and Portuguese. Four of the eight would have
      shipped ellipsed on a control whose whole job is to name both choices.
      The word alone fits everywhere and loses nothing.

## Sprint 26 — Every line, read (1.1.0)

Nothing since the 1.0.0 tag had reached anybody, and the manifest had walked
up to 1.0.12 a sprint at a time. Before tagging what was there, every source
file was read end to end rather than one symptom chased at a time.

- [x] Ninety-six suspicions, each put to a second reader whose only job was to
      refute it before a line changed. Eighty-two survived, fourteen did not —
      and the refutations are the reason to trust the rest. Almost none of the
      eighty-two is a mistake in the line it sits on; they are what a reader
      only sees with the caller and the callee open at the same time.
- [x] Three ways into a group you are not in. `ensure_may_edit_member` took the
      group id on trust, and explicit shares and both payment writes accepted a
      member of another group — after which the group's balances no longer
      summed to zero over its own members and settlement suggested repaying a
      stranger. Members who have left stay allowed, because they can still owe.
- [x] Money that was not there: a converted amount of exactly zero read back
      as the foreign one, so 3 JPY in a euro group became 3 EUR; percentage
      shares put the odd cent on a different person in the panel and the
      backend; IDR was offered though its rate is past `RATE_MAX`.
- [x] Controls drawing from their list rather than from their value — four
      components, one habit. `se-select` showed a value matching no option as
      the first option, the expense picker showed nothing chosen while still
      saving a link. That is where the rule "a control must draw from its
      value" was earned.
- [x] A migration that could brick the integration for good. Each statement
      landed on its own, so one that died between adding the columns and
      bumping the version left every later retry on `duplicate column name`.
      A script runs in one transaction now. The one fix here about a machine
      that has already gone wrong.
- [x] Four tests that could not fail, rewritten until they could. A test that
      cannot fail is a claim in the suite's own voice that the thing is checked.
- [x] Minor, not patch: no API and no stored shape moves, the schema is at v16
      either side, but a reader deciding whether to take the update should not
      be told "patch" about the version that stops a non-member editing their
      household's journal. Tagged `v1.1.0`; HACS took the integration into its
      default store on 2026-10-18.

## Sprint 27 — The card before the integration (1.1.1)

- [x] **The dashboard card no longer turns red after every update of Home
      Assistant.** Pages are served from the first stage of boot, a custom
      integration registers its module in the last, and a page rendered in
      between never learns of the card. Opening the panel defined it, which is
      the cure people had found without knowing why.
- [x] The bundle is copied into the configuration's `www/`, served at `/local/`
      from the first stage, and declared as a Lovelace resource, which the
      dashboard reads before anything of ours runs. The panel takes the same
      URL, because a browser evaluates a module once per URL, not per file.
      The run that creates `www/` cannot be served from it; that run keeps the
      integration's own URL and the log says so. ADR-016 keeps the reasoning
      and the three half-cures rejected.
- [x] The card starts over on the connection's `ready`. The WebSocket library
      re-sends every subscription while the integration is still loading, a
      refused one is dropped without a word, and a tablet sat on the balances
      of before the restart, looking current the whole time.
- [x] **A default split rule is refused where it is written**, not on the
      first expense. A real database held one that could not resolve — an
      envelope of 0 and nobody on the rest — and the panel had survived it by
      asking on every expense. A script calling the service has no dialog to
      ask in. The rule is run once, as an expense would run it, on an amount
      chosen to reach every part of it; a rule that merely wants a bigger bill
      is not refused. A rule is validated where it is written, not where it is
      read.
- [x] **A member born with a Home Assistant account wears its photo from the
      start**, whichever of the three ways it is born. Without an account there
      is no photo to borrow, and the initials stay. Existing members are left
      as they are; the member dialog still switches both ways.
- [x] One branch. Every change had gone through `develop`, a pull request and a
      squash into `main`, and nothing was ever held back on `develop` waiting
      for a release. What it guarded is guarded elsewhere: CI on every push and
      green before any tag, the bundle checked against a fresh build, HACS
      installing from Releases only. ADR-017 supersedes ADR-004.

## Sprint 28 — What a stranger meets (1.1.2)

With the integration in the default store, the README is the first thing
anybody reads, and it is read inside Home Assistant as often as on GitHub.

- [x] The seven screenshots dated from 1.0.0 and showed none of three months
      of work. Retaken on the current bundle, same scenes and demo data, at the
      July size (400×805 CSS pixels at 2.7) so the pictures do not change scale
      between commits. They stand in two plain rows: an HTML table gave them
      grey borders, a striped row and two empty cells.
- [x] The README is rewritten to be read first: three phones at the top, what
      sets it apart, the install in two steps, the manual one folded away. The
      Development section stops promising a `pip install -e ".[dev]"` that this
      layout cannot honour.
- [x] A quick tour opens the gallery, twenty-six seconds: balances, a bill
      shared in part, a trip in pounds, where it all went. The demo members
      have drawn faces (DiceBear, public domain), each with its own colour and
      one trait so they can be told apart at the size of an avatar; one stays a
      guest with initials, the other half of the rule.
- [x] **The pictures show in HACS too.** HACS renders the README inside Home
      Assistant, where a relative `src` is resolved against the Home Assistant
      server — and its sanitiser empties any address that does not start with
      a scheme, `/`, `./` or `#`. Every image and every link into `docs/` is
      absolute now. HACS reads the README of the installed version and fetches
      it once per run of Home Assistant, so an update shows the old one until
      the next restart.
- [x] **The expense dialog's examples speak the reader's language.** "Courses
      Carrefour" and "85,42" were French in all eight languages, and so were
      the shared amount's "5,00" and the rate's "0,87681". The titles are two
      keys in every language; the figures are written by `Intl` in the
      reader's own decimal separator, without grouping, since nobody types
      one. Found on the tour, which still shows them for two seconds.

## Sprint 29 — Statistics read by the month

A household counts in months — what did October cost, more than September? —
and the statistics could be cut by year at most. The page was also saying
something false about people.

- [x] **"Owes 623 EUR" is gone from the statistics.** It was paid minus share
      over the expenses of the period, and the statistics leave reimbursements
      out on purpose. So a member who had paid everything back still "owed" it
      there, and a debt cut to one year meant nothing at all. Each member now
      reads as what they paid, what their share was, and the gap between the
      two, said as a gap; a line sends whoever wants the debt to the group
      page, the only place that counts what settles one.
- [x] The page opens on the last month anything was spent in, not the
      calendar's, which is empty on the 1st. Month, year or everything, a step
      either way, and empty months stepped through rather than over: a month
      with nothing spent is a fact.
- [x] A month says how it compares with the one before, in the reader's own
      percent; a year or everything says what it comes to a month, over the
      months the group has existed in it, not twelve. Nothing is compared with
      a month that cost nothing, or came out refunded: against those every
      change is infinite or points the wrong way.
- [x] A year of months as bars, with no figure on them — twelve figures do not
      fit a phone — and the average dashed across. Each bar is the way to its
      month. The window holds the period: the year to the last month spent in,
      or the year starting on an older month stepped back to.
- [x] The insight box is gone: it said what the bar under it already showed.
      So is the average expense, which the rent dragged to a figure that
      described no expense. The share of each category sits against its
      amount instead of in a column a long name pushed out of line. The disc
      stays, as the switch it was.
- [x] **Your own month, reimbursements included.** The page counts spending,
      and a reimbursement is not spending, so "what did October cost me" had
      no answer on it. "Your summary" adds it up: the expenses you paid, plus
      the reimbursements you made, less those you received, is what left your
      pocket; set against your share, the difference is how far your balance
      moved over the period. Over everything, it is your balance, to the cent
      the group page shows — checked against the balances' own code on random
      groups, and month by month adding up to the whole. A debt written down
      is not in the pocket: often no money moved. It has lines of its own
      after the share, and moves the balance all the same.
- [x] What shops gave back is a line of its own too, under what was bought,
      rather than a refund silently netted into "expenses you paid". In most
      of the eight languages a shop refund and a reimbursement share a word,
      so the line says which, as the panel already does.
- [x] The backend sends, beside each member and for the period, what they
      handed over and got back, and the debts written down for and against
      them. Never in a total: the totals stay spending.
- [x] The backend answers a month (`YYYY-MM`, exclusive with a year in the
      schema) and always sends every month, unfiltered, the way it already
      sent every year: a month is read against its neighbours, and cut to the
      period it would have none. No stored shape moves.
- [x] What a period covers, where it steps to and what it is compared with live
      in `services/statistics-period.ts`, pure, under Vitest. Measured headless
      at 360 pixels in all eight languages: the German for "less than their
      share" squeezed a member's figures onto three lines until the words for
      the gap moved under the name and learnt to wrap on their own.

## Sprint 30 — A figure leads to what it is made of

- [x] A category on the statistics opens the list of its expenses over the
      period on screen. "236 on groceries in September" raises one question,
      which ones, and it is answered where it was asked: newest first, each the
      row the group page draws, from the expenses the group page already holds
      rather than a second answer from the backend to keep in step.
- [x] An expense opens from there as it does from the journal and from a
      refund's purchase: dialog to dialog, closing the statistics on the way,
      and only for an expense this reader may open — the group page's rule,
      handed down. A row with nowhere to go has no chevron and no target.
- [x] Which month an expense falls in is read in UTC, the zone a typed day is
      filed in, by a function under test beside the rest of the period logic.
- [x] The README shows the statistics as they are: `06-statistics`, the three
      phones at the top and the tour retaken on a re-seeded Home Assistant. The
      tour's expense dialog now reads in English, since 1.1.2 translated its
      examples.

## Sprint 31 — What is used most, where the thumb is

- [x] The statistics and the search are buttons on the bar. The statistics
      were the richest screen and one entry in a menu shared with deleting the
      group; the search box took a line of the phone at all times. It opens
      under its magnifier now, and closing it forgets the query.
- [x] The menu is three groups under a rule each: the history; members,
      categories and the group; archiving and deleting, apart and last.
- [x] The list is cut into months, each under its name and what the group
      spent in it, the statistics' figure for the same month. Rows keep their
      dates in full and their faces.
- [x] A shop refund is called one, in full and in every language: in five of
      the eight, "refund" alone was the word for a reimbursement between
      members too. se-segmented gives a long option a second line rather than
      an ellipsis. Equal shares, folded, read as one line.
- [x] **The plus offers what it adds.** A press opens four choices, each named
      and said in a few words: an expense, a shop refund, paying someone back,
      writing down a debt. The expense takes the plus's own place, so two
      presses where the thumb already is add one — the user's idea, better
      than the close button it replaced. Back and the dim around them close.
      The drag to reimburse stays for whoever learnt it.
- [x] The README's pictures and tour retaken on the new bar, list and plus;
      the tour now stops on the plus's four choices for a moment.

## Sprint 32 — What comes back

- [x] **Recurring expenses**: the rent, a subscription, the electricity. A new
      expense may be ticked "Repeat", every N days, weeks or months, until a
      date or for ever; it becomes the first occurrence. Chosen over a CSV
      export.
- [x] **Proposed, not added.** An occurrence that falls due waits at the top
      of the group page, above the balance, for a member to answer: add it,
      or pass over it this time. A figure that never moves is added in one
      tap; one that moves (the electricity) opens on last time's figure to be
      checked. Any member answers, as any member adds an expense; two phones
      answering the same one add it once.
- [x] Nothing has to run on the day: an occurrence waits however long Home
      Assistant was off, and each one caught up keeps its own date. Dates are
      counted from the first one, never step by step, so rent on the 31st
      falls on the 30th in November and on the 31st again in March.
- [x] The menu lists them, with what each waits on, comes next or is paused.
      Opening one changes what it proposes and its rhythm, pauses it or stops
      it; what it already added never moves. Its own entity in the journal,
      with "skipped" as its own action. Added occurrences wear ↻.
- [x] `shared_expenses_recurring_due` on the bus, once per occurrence, at 9:00
      local time and on start once that hour has passed — a restart in the
      night wakes no phone. See `docs/events.md`.

## Later

- [ ] Weighted splits (by shares, rather than by amount or percentage)
- [ ] The actions take ids, because no selector knows what a project is. A
      picker would mean teaching a form about them — worth doing, not worth
      holding the actions back for.
- [x] Frontend tests. Every bug above that reached a user lived in the panel,
      where neither `tsc` nor the build nor the Python suite can see. Layout,
      at least, is measurable: a headless browser catches what the eye does
      not — that is how the balance card was found spilling its figures on a
      phone, and how four of eight languages were caught shipping an ellipsed
      segment in Sprint 25. Both times it was a throwaway script. It is now
      `frontend/tests/layout/`: Vitest's browser mode lays the group page out
      in Chromium at 360 px, on answers recorded from a real backend, in
      Roboto as Home Assistant declares it (no 600: a 600 is drawn in 700
      there), and opens every screen a finger reaches from it — the menus,
      the plus and its four choices, the statistics over each period, the
      dialogs — in the eight languages, on both demo groups. Anything that
      holds more than it shows fails, unless it is listed as meant with its
      reason. Its figures were checked against the same screens in a running
      Home Assistant and agree to the pixel; putting back the header's old
      gap fails French and Spanish, as it should.
- [x] Tests for what is already pure. `autoColors` is a function of a list and
      nothing else, and it was checked with a script that should have been a
      test file. Vitest now runs the panel's own helpers in CI — money, dates,
      names, colours, rates, percentages — under `frontend/tests/`, each one
      seen failing on a sabotaged helper before it was trusted.
- [ ] Whether an expense should say which payments were about it. Sprint 24
      settled that it says nothing, deliberately, and left the index off for the
      same reason. If it turns out somebody wants "who has paid me back for
      this", the column is there and the index is one line.
- [ ] An amount that recurs unchanged still hands its odd cent to the same member.
      Folding the date in would give the daily bread its turn, and would make
      editing a date move a cent — not a trade worth making silently.
- [ ] `formatSignedMoney` would put a "+" back on a refund, and keep a second
      signal for whoever reads colour poorly, if that turns out to matter more
      than the quiet figure does.
- [ ] The icon in HACS's list. HACS 2.0.5 asks `brands.home-assistant.io`
      directly, which no longer takes custom integrations, so the list shows a
      blank tile while the rest of Home Assistant reads `brand/` through its
      proxy. Nothing to do here until HACS reads brands the same way.
