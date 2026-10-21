# ADR-016 - Where the bundle is served from

## Status

Accepted

## Context

ADR-015 put the card on the dashboard by handing the panel's bundle to every
page through `add_extra_js_url`, and served the bundle from the integration's
own `www/` folder at `/shared_expenses_frontend/index.js`. Both happen when the
integration sets up.

Home Assistant does not wait for that. Its web server starts as soon as the
`frontend` component is up, in the first stage of boot; custom integrations load
in the last, after the recorder and everything else, and this one opens a
database and refreshes a coordinator before it registers anything. In between,
Home Assistant is already serving pages.

A page served in that window is rendered from the list of extra modules as it
stands — without ours — and the frontend never reads the list again. The card
on that dashboard becomes **"Custom element doesn't exist: shared-expenses-card"**
two seconds later, and stays that way. The frontend keeps a `whenDefined` on the
tag and rebuilds the card the moment somebody defines it, which is why opening
the panel, whose module loads the same bundle, "fixes" it: that is the only
thing on the page that still knows the URL.

This is not a rare race. Every browser left on a dashboard reloads itself when
Home Assistant comes back from an upgrade with a new version — the frontend
compares versions on reconnect and reloads to pick up its own update — and it
does so as soon as the WebSocket is answering, which is the first stage of boot.
Every upgrade, then, turned every open card red until somebody opened the panel.

HACS cards live with a narrower version of the same window: their files are
served from `/hacsfiles/`, which HACS registers when it loads, also in the last
stage.

## Decision

**The bundle is also copied into the configuration's `www/` folder, served by
Home Assistant at `/local/` from the first stage of boot, and declared as a
Lovelace resource, which is stored in `.storage` and read by the dashboard
before anything of ours has run.** Both halves of what a page needs — a file to
fetch and a line that says to fetch it — exist at the earliest moment a page can
be asked for.

- The copy is `www/shared_expenses/index.js`, made with `copy2` so it carries
  the bundle's modification time and therefore its version stamp. It is remade
  when the bundle moves and left alone when it has not.
- The resource is `/local/shared_expenses/index.js?v=<mtime>`, type `module`.
  Exactly one, found by its path and updated in place when the version changes;
  a duplicate, which only a hand could add, is cleared, because two would load
  the bundle twice.
- **The panel takes the same URL.** ADR-015's rule stands and gets sharper: one
  bundle per document means one *URL* per document, since a browser evaluates
  an ES module once per URL and not once per file. `add_extra_js_url` is still
  called, with that URL, so the card picker works on a run where the resource
  has not been read yet; the same URL twice costs nothing.
- The integration's own static path stays, as the fallback for the one run it
  is needed on.

### The run that creates `www/`

The frontend registers `/local/` only if `www/` exists when it sets up. On a
configuration that never had one, this integration creates it, and nothing
serves it until the next start. On that run the panel and the card take the
integration's own URL, as before, and the copy and the resource wait for the
restart that will make them reachable. The two URLs are never both loaded: the
resource points at `/local/`, which 404s on that run, and a module that fails
to load defines nothing. The log says what will happen next.

### YAML mode

Resources of a YAML-mode dashboard are the user's to write, and the integration
says so in the log, with the URL to add. Without it such a dashboard is where it
was before this decision: the card is on the extra-module list and missing from
a page served during boot.

### Uninstall, not unload

The copy and the resource go when the config entry is removed, through
`async_remove_entry`. A reload leaves them: a reload is not a goodbye, and
rewriting `.storage/lovelace_resources` on every one would be churn.

## Consequences

**A folder appears in the user's configuration**, and a line in Settings →
Dashboards → Resources. Both are the integration's and say so in their names.
This is the HACS model, and the one thing that survives the absence of our code.

**The card loads on a page served during boot**, and the card itself then says
"The integration is not loaded" until it is — it retries every thirty seconds,
and starts over when the socket comes back. That is the honest state of
affairs and it clears by itself, which the red frame never did.

**Two restarts on a configuration without `www/`.** Documented, logged, and
harmless in between.

**`/local/` is cached by Home Assistant's service worker and sends cache
headers.** The version stamp carries the invalidation, as it did on our own
path.

## Alternatives considered

**Registering earlier.** `async_setup` runs moments before `async_setup_entry`,
in the same stage; the window is between stages. Nothing a custom integration
does runs before the frontend serves its first page.

**A Lovelace resource pointing at our own static path.** The declaration would
survive, the file would not: the route is registered when we load, and a module
that 404s is never retried. Half a cure.

**`frontend: extra_module_url:` in `configuration.yaml`.** Read in the first
stage, so the declaration would be early enough — and it is a static list in a
file the user owns, with no version stamp, pointing at a route that does not
exist yet. Same half.

**Reloading the page from the frontend once the integration is up.** There is
no such hook: nothing we can run before we have loaded, and once we have, the
page has decided. Making the card itself recover is what ADR-015's card does
for its data; it cannot do it for its own existence.
