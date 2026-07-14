"""Home Assistant panel registration.

The bundle served here is built by the Vite project in `frontend/`, at the root
of the repository: only its output ships with the integration.
"""

from __future__ import annotations

from logging import getLogger
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL

LOGGER = getLogger(__package__)

WEBCOMPONENT_NAME = "shared-expenses-panel"

STATIC_URL = f"/{DOMAIN}_frontend"
BUNDLE_NAME = "index.js"

WWW_PATH = Path(__file__).parent / "www"

# Kept outside `hass.data[DOMAIN]`, which is dropped when the entry unloads.
DATA_STATIC_REGISTERED = f"{DOMAIN}_static_registered"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve the frontend bundle and add the panel to the sidebar."""

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

    module_url = await hass.async_add_executor_job(_module_url)

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


def _module_url() -> str:
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

        return f"{STATIC_URL}/{BUNDLE_NAME}"

    return f"{STATIC_URL}/{BUNDLE_NAME}?v={version}"


@callback
def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the panel from the sidebar, if it is registered."""

    frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)
