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

- [ ] Frontend tests

## Sprint 6 — Release

- [x] `hacs.json`
- [x] CI (ruff, pytest, hassfest, HACS, frontend build)
- [x] README
- [x] Screenshots
- [ ] Publish to HACS. Everything the store asks for is in place and every HACS
      check is green (Sprint 17); what is left is the submission itself.

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

## Later

- [ ] Weighted splits (by shares, rather than by amount or percentage)
- [ ] The actions take ids, because no selector knows what a project is. A
      picker would mean teaching a form about them — worth doing, not worth
      holding the actions back for.
- [ ] Frontend tests. Every bug above that reached a user lived in the panel,
      where neither `tsc` nor the build nor the Python suite can see. Layout,
      at least, is measurable: Chrome headless against the built bundle catches
      what the eye does not — that is how the balance card was found spilling
      its figures on a phone.
- [ ] A native read of the translations. The error sentences of Sprint 23 were
      written across eight languages by one non-native hand. FR is the one this
      household reads and will catch for itself; DE, NL, ES, IT, PL and PT
      deserve a second pair of eyes.
- [ ] An amount that recurs unchanged still hands its odd cent to the same member.
      Folding the date in would give the daily bread its turn, and would make
      editing a date move a cent — not a trade worth making silently.
- [ ] `formatSignedMoney` would put a "+" back on a refund, and keep a second
      signal for whoever reads colour poorly, if that turns out to matter more
      than the quiet figure does.
