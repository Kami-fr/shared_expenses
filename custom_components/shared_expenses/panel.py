"""Home Assistant panel registration.

Named `panel` rather than `frontend` on purpose: `frontend/` next to this file
is the Vite project, and a `frontend.py` module would shadow it.
"""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL

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
                    # The bundle name is stable, so caching it would serve a
                    # stale panel after an update.
                    cache_headers=False,
                )
            ]
        )

        hass.data[DATA_STATIC_REGISTERED] = True

    # `panel_custom.async_register_panel` cannot update an existing panel, and
    # raises when one is already registered under the same path. Dropping it
    # first keeps a reload working even if the entry failed to unload cleanly.
    async_unregister_panel(hass)

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=WEBCOMPONENT_NAME,
        module_url=f"{STATIC_URL}/{BUNDLE_NAME}",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={},
    )


@callback
def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the panel from the sidebar, if it is registered."""

    frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)
