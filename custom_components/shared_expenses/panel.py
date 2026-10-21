"""Home Assistant panel registration.

The bundle served here is built by the Vite project in `frontend/`, at the root
of the repository: only its output ships with the integration.

It carries the dashboard card as well as the panel, and is handed to Home
Assistant twice: once as the panel's module, once as a module every dashboard
loads. One file rather than two, which is not thrift — Home Assistant is a
single page, so the panel and the card live in the same document, and two
bundles would each run `customElements.define("se-balance-card")`. The second
would throw, and take the panel down with it.

Where it is served from is the other half of the story, and ADR-016 tells it.
Home Assistant serves its pages from the moment the frontend is up, which is
long before a custom integration has loaded, and a dashboard opened in between
is handed a page that knows nothing of this bundle: the card on it turns into
"Custom element doesn't exist" and stays that way, because nothing ever rereads
the list. So the bundle is also copied into the configuration's `www/` folder,
which Home Assistant serves at `/local/` from the start, and declared as a
Lovelace resource, which is stored and read back before anything of ours runs.
Both halves exist at the earliest moment a page can be asked for.
"""

from __future__ import annotations

from logging import getLogger
from pathlib import Path
import shutil
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL

LOGGER = getLogger(__package__)

WEBCOMPONENT_NAME = "shared-expenses-panel"

#: Where the integration serves its own `www/`: the fallback, for a run on
#: which `/local/` has nothing of ours to give yet.
STATIC_URL = f"/{DOMAIN}_frontend"
BUNDLE_NAME = "index.js"

WWW_PATH = Path(__file__).parent / "www"

#: The folder inside the configuration's `www/` that the copy lives in, and the
#: URL Home Assistant serves that folder at.
LOCAL_DIR = DOMAIN
LOCAL_URL = f"/local/{LOCAL_DIR}"

#: What a Lovelace resource of ours looks like, before the version is stamped on.
LOCAL_BUNDLE_URL = f"{LOCAL_URL}/{BUNDLE_NAME}"

# Kept outside `hass.data[DOMAIN]`, which is dropped when the entry unloads.
DATA_STATIC_REGISTERED = f"{DOMAIN}_static_registered"

#: The bundle URL currently handed to the dashboards, so it can be taken back.
#:
#: Held rather than recomputed: the URL carries the bundle's modification time,
#: so rebuilding between a register and an unregister would have us try to
#: remove a URL that was never added, and leave the old one loaded for good.
DATA_CARD_URL = f"{DOMAIN}_card_url"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve the frontend bundle, add the panel, and offer the dashboard card."""

    # A static path lives for the whole run: registering it again on a reload
    # would add a duplicate route to the aiohttp router.
    if not hass.data.get(DATA_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    STATIC_URL,
                    str(WWW_PATH),
                    # Freshness comes from the versioned URL, not from here.
                    cache_headers=True,
                )
            ]
        )

        hass.data[DATA_STATIC_REGISTERED] = True

    www = Path(hass.config.path("www"))

    published = await hass.async_add_executor_job(_publish_bundle, www)

    # `/local/` is registered by the frontend component when it sets up, and
    # only if `www/` exists at that moment. On the run that creates the folder
    # nothing serves it, so the bundle is handed out from our own path once
    # more and the copy waits for the next start. The two URLs must never both
    # load: one bundle per document, or the second `define` throws.
    if published and _local_is_served(hass):
        module_url = _module_url(LOCAL_URL)
    else:
        module_url = _module_url()

        if published:
            LOGGER.info(
                "The dashboard card is served from %s on this run; from the next "
                "start it will be served from %s, which is available from the "
                "moment Home Assistant starts",
                STATIC_URL,
                LOCAL_URL,
            )

    # `panel_custom.async_register_panel` cannot update an existing panel, and
    # raises when one is already registered under the same path. Dropping it
    # first keeps a reload working even if the entry failed to unload cleanly.
    async_unregister_panel(hass)

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=WEBCOMPONENT_NAME,
        module_url=module_url,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={},
    )

    # Loaded by every dashboard, for everybody, which is what it takes for a
    # card to be offered in the picker at all. It costs a parse on pages nobody
    # will put a card on; the card itself asks the integration nothing until one
    # is placed, and what it then asks is walled by the WebSocket API.
    frontend.add_extra_js_url(hass, module_url)
    hass.data[DATA_CARD_URL] = module_url

    # The declaration that outlives this code: a page served before the
    # integration has loaded still finds it, and the file it names, in `www/`.
    if published:
        await _async_declare_resource(hass, _module_url(LOCAL_URL))


def _publish_bundle(www: Path) -> bool:
    """Copy the bundle into the configuration's `www/`, if it has moved.

    `copy2` carries the modification time across, so the copy answers to the
    same version stamp as the original and a stale one is told apart by it.
    Returns whether there is a copy to serve at all.
    """

    source = WWW_PATH / BUNDLE_NAME

    if not source.is_file():
        return False

    target = www / LOCAL_DIR / BUNDLE_NAME

    try:
        source_stat = source.stat()

        if target.is_file():
            target_stat = target.stat()

            if (
                int(target_stat.st_mtime) == int(source_stat.st_mtime)
                and target_stat.st_size == source_stat.st_size
            ):
                return True

        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    except OSError:
        LOGGER.exception(
            "Could not copy the frontend bundle to %s. The dashboard card will "
            "be served from %s instead, and may be missing from a dashboard "
            "opened while Home Assistant is starting",
            target,
            STATIC_URL,
        )

        return False

    return True


def _local_is_served(hass: HomeAssistant) -> bool:
    """Say whether this run of Home Assistant serves `/local/` at all."""

    return any(
        getattr(resource, "canonical", None) == "/local"
        for resource in hass.http.app.router.resources()
    )


def _module_url(base: str = STATIC_URL) -> str:
    """Return the bundle URL, versioned so an update is never served stale.

    Cache headers alone do not help: the browser caches the ES module and Home
    Assistant's service worker caches the response, so a stable URL keeps
    serving the previous panel after an update. Stamping the URL with the
    modification time of the bundle changes it whenever the bundle changes,
    which drops the cache on its own.
    """

    bundle = WWW_PATH / BUNDLE_NAME

    try:
        version = int(bundle.stat().st_mtime)
    except OSError:
        # A missing bundle is the packaging mistake worth shouting about, but
        # the panel must still register so the error is visible in the UI.
        LOGGER.error(
            "The frontend bundle is missing at %s. The panel will not load. "
            "Build it from the frontend/ project, or reinstall the integration.",
            bundle,
        )

        return f"{base}/{BUNDLE_NAME}"

    return f"{base}/{BUNDLE_NAME}?v={version}"


def _storage_resources(hass: HomeAssistant) -> Any | None:
    """Return the Lovelace resource collection, if it is one we can write to.

    Dashboards in YAML mode keep their resources in YAML, where only the user
    writes; they are told what to add in the documentation. Recognised by the
    store rather than by class, as HACS does: it is the store we need.
    """

    lovelace = hass.data.get(LOVELACE_DATA)
    resources = getattr(lovelace, "resources", None)

    if resources is None or getattr(resources, "store", None) is None:
        return None

    return resources


async def _ours(resources: Any) -> list[dict[str, Any]]:
    """Return the resources that point at our copy, whatever their version."""

    # The public way to have the collection read its store: it loads on first
    # use, and `async_items` on an unloaded one is an empty list, not an error.
    await resources.async_get_info()

    return [
        item
        for item in resources.async_items()
        if item["url"].split("?", 1)[0] == LOCAL_BUNDLE_URL
    ]


async def _async_declare_resource(hass: HomeAssistant, url: str) -> None:
    """Make sure exactly one Lovelace resource names the copy, at this version."""

    resources = _storage_resources(hass)

    if resources is None:
        LOGGER.info(
            "Dashboards are in YAML mode: add %s to their resources as a module, "
            "or the card is missing from a dashboard opened while Home Assistant "
            "is starting",
            url,
        )

        return

    ours = await _ours(resources)

    if not ours:
        await resources.async_create_item({"res_type": "module", "url": url})

        return

    first, *extra = ours

    if first["url"] != url:
        await resources.async_update_item(first["id"], {"url": url})

    # Not a case this code produces; a hand-added duplicate would load the
    # bundle twice and crash the panel, so it is cleared rather than kept.
    for item in extra:
        await resources.async_delete_item(item["id"])


async def async_withdraw_bundle(hass: HomeAssistant) -> None:
    """Take the copy and its resource back, when the integration is removed.

    Not on unload: a reload is not a goodbye, and churning the resource store
    on every one would be noise in `.storage` for nothing.
    """

    if (resources := _storage_resources(hass)) is not None:
        for item in await _ours(resources):
            await resources.async_delete_item(item["id"])

    folder = Path(hass.config.path("www")) / LOCAL_DIR

    await hass.async_add_executor_job(shutil.rmtree, folder, True)


@callback
def async_unregister_panel(hass: HomeAssistant) -> None:
    """Take back the panel and the card, if they were handed out."""

    # The exact URL that was added: `remove_extra_js_url` matches on the string,
    # so a recomputed one would silently remove nothing.
    if url := hass.data.pop(DATA_CARD_URL, None):
        frontend.remove_extra_js_url(hass, url)

    frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)
