"""Tests for the panel registration.

These bind the real Home Assistant signatures on purpose: a fake `hass` alone
let `async_register_panel(update=True)` ship even though `panel_custom` has no
such parameter, which broke setup at load time.
"""

from __future__ import annotations

import inspect

from homeassistant.components import panel_custom
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, UrlManager

from custom_components.shared_expenses import panel


class FakeHttp:
    """Record the static paths registered."""

    def __init__(self) -> None:
        self.registered: list[str] = []

    async def async_register_static_paths(self, configs) -> None:
        self.registered.extend(config.url_path for config in configs)


class FakeBus:
    """Swallow the events fired by the frontend component."""

    def async_fire(self, *args, **kwargs) -> None:
        pass


class FakeHass:
    """Enough of `hass` for the frontend and http components."""

    def __init__(self) -> None:
        # The real `UrlManager`, seeded the way the frontend component seeds it
        # on setup. Home Assistant guarantees it is there — the manifest depends
        # on `frontend`, so it is set up before this integration — and a fake
        # holding a stand-in here would test a set that is not the one shipping.
        self.data: dict = {
            DATA_EXTRA_MODULE_URL: UrlManager(lambda *_args: None, []),
        }
        self.http = FakeHttp()
        self.bus = FakeBus()

    async def async_add_executor_job(self, func, *args):
        return func(*args)


def test_register_panel_matches_the_home_assistant_signature():
    signature = inspect.signature(panel_custom.async_register_panel)

    assert "update" not in signature.parameters

    for name in ("frontend_url_path", "webcomponent_name", "module_url"):
        assert name in signature.parameters


async def test_registering_the_panel_serves_the_bundle():
    hass = FakeHass()

    await panel.async_register_panel(hass)

    assert hass.http.registered == [panel.STATIC_URL]
    assert panel.PANEL_URL in hass.data["frontend_panels"]


async def test_the_bundle_is_where_the_panel_says_it_is():
    """A missing bundle would leave the panel loading forever."""

    assert (panel.WWW_PATH / panel.BUNDLE_NAME).is_file()


async def test_the_module_url_is_versioned():
    """A stable URL kept serving the previous panel from the browser cache."""

    url = panel._module_url()

    assert url.startswith(f"{panel.STATIC_URL}/{panel.BUNDLE_NAME}?v=")


async def test_the_module_url_changes_when_the_bundle_changes(tmp_path, monkeypatch):
    """This is the whole point: an update must invalidate the cache by itself."""

    bundle = tmp_path / panel.BUNDLE_NAME
    bundle.write_text("first", encoding="utf-8")

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    import os

    os.utime(bundle, (1_000_000, 1_000_000))
    before = panel._module_url()

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))
    after = panel._module_url()

    assert before != after


async def test_a_missing_bundle_still_registers_the_panel(tmp_path, monkeypatch):
    """Better a visibly broken panel than a silent setup failure."""

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    hass = FakeHass()

    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]


async def test_reloading_does_not_duplicate_the_static_route():
    hass = FakeHass()

    await panel.async_register_panel(hass)
    await panel.async_register_panel(hass)

    assert hass.http.registered == [panel.STATIC_URL]


async def test_reloading_does_not_raise_overwriting_panel():
    hass = FakeHass()

    await panel.async_register_panel(hass)
    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]


async def test_unregistering_an_unknown_panel_is_harmless():
    hass = FakeHass()

    panel.async_unregister_panel(hass)


async def test_the_panel_can_be_registered_again_after_unload():
    hass = FakeHass()

    await panel.async_register_panel(hass)
    panel.async_unregister_panel(hass)

    assert panel.PANEL_URL not in hass.data.get("frontend_panels", {})

    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]


#
# The dashboard card, which rides the same bundle
#


def _card_urls(hass) -> frozenset[str]:
    """Return the bundle URLs every dashboard is told to load."""

    return hass.data[DATA_EXTRA_MODULE_URL].urls


async def test_registering_the_panel_offers_the_card_to_dashboards():
    """Without this the card exists in the bundle and nothing ever loads it."""

    hass = FakeHass()

    await panel.async_register_panel(hass)

    assert _card_urls(hass) == {panel._module_url()}


async def test_the_card_and_the_panel_are_the_same_bundle():
    """Home Assistant is one page, so two bundles would be one crash.

    Both would run `customElements.define("se-balance-card")`; the second throws
    and takes the panel with it. The card riding the panel's own URL is what
    makes that impossible rather than merely avoided.
    """

    hass = FakeHass()

    await panel.async_register_panel(hass)

    registered = hass.data["frontend_panels"][panel.PANEL_URL]

    assert _card_urls(hass) == {registered.config["_panel_custom"]["module_url"]}


async def test_unloading_takes_the_card_back():
    hass = FakeHass()

    await panel.async_register_panel(hass)
    panel.async_unregister_panel(hass)

    assert _card_urls(hass) == frozenset()


async def test_rebuilding_leaves_no_stale_bundle_behind(tmp_path, monkeypatch):
    """The URL carries the bundle's mtime, so a rebuild changes it.

    Removing a recomputed URL would remove nothing, and every dashboard would
    go on loading a version that is no longer there. Exactly one URL is offered,
    always, however many times this is reloaded.
    """

    import os

    bundle = tmp_path / panel.BUNDLE_NAME
    bundle.write_text("first", encoding="utf-8")
    os.utime(bundle, (1_000_000, 1_000_000))

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    hass = FakeHass()

    await panel.async_register_panel(hass)

    first = set(_card_urls(hass))

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))

    await panel.async_register_panel(hass)

    assert len(_card_urls(hass)) == 1
    assert _card_urls(hass) != first
