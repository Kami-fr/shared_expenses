"""Tests for the panel registration.

These bind the real Home Assistant signatures on purpose: a fake `hass` alone
let `async_register_panel(update=True)` ship even though `panel_custom` has no
such parameter, which broke setup at load time.
"""

from __future__ import annotations

import inspect
import os
from pathlib import Path
from types import SimpleNamespace

from homeassistant.components import panel_custom
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL, UrlManager
from homeassistant.components.lovelace.const import (
    LOVELACE_DATA,
    RESOURCE_CREATE_FIELDS,
    RESOURCE_UPDATE_FIELDS,
)
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
    ResourceYAMLCollection,
)
from homeassistant.helpers import collection
import pytest
import voluptuous as vol

from custom_components.shared_expenses import panel


class FakeRouter:
    """The aiohttp router, reduced to the one question asked of it."""

    def __init__(self, local: bool) -> None:
        self._resources = [SimpleNamespace(canonical="/local")] if local else []

    def resources(self):
        return list(self._resources)


class FakeHttp:
    """Record the static paths registered."""

    def __init__(self, local: bool) -> None:
        self.registered: list[str] = []
        self.app = SimpleNamespace(router=FakeRouter(local))

    async def async_register_static_paths(self, configs) -> None:
        self.registered.extend(config.url_path for config in configs)


class FakeBus:
    """Swallow the events fired by the frontend component."""

    def async_fire(self, *args, **kwargs) -> None:
        pass


class FakeConfig:
    """`hass.config`, returning paths under a base without creating them.

    Unlike the fixture in `conftest.py`, which makes the folder it names: here
    whether `www/` exists is the thing under test.
    """

    def __init__(self, base: Path) -> None:
        self._base = base

    def path(self, *parts: str) -> str:
        return str(self._base.joinpath(*parts))


class FakeResources:
    """The Lovelace resource store, as the integration speaks to it.

    Validated against the real schemas, so a dict the real collection would
    refuse is refused here too. A `store` attribute is what marks it as storage
    mode, which is the test the integration applies.
    """

    def __init__(self) -> None:
        self.store = object()
        self.items: list[dict] = []
        self.loads = 0

    async def async_get_info(self) -> dict:
        self.loads += 1

        return {"resources": len(self.items)}

    def async_items(self) -> list[dict]:
        return list(self.items)

    async def async_create_item(self, data: dict) -> dict:
        data = vol.Schema(RESOURCE_CREATE_FIELDS)(data)
        item = {
            "id": f"id{len(self.items)}",
            "type": data["res_type"],
            "url": data["url"],
        }
        self.items.append(item)

        return item

    async def async_update_item(self, item_id: str, updates: dict) -> dict:
        updates = vol.Schema(RESOURCE_UPDATE_FIELDS)(updates)

        for item in self.items:
            if item["id"] == item_id:
                item.update(updates)

                return item

        raise KeyError(item_id)

    async def async_delete_item(self, item_id: str) -> None:
        self.items = [item for item in self.items if item["id"] != item_id]


class FakeHass:
    """Enough of `hass` for the frontend, http and lovelace components."""

    def __init__(
        self,
        base: Path,
        *,
        local: bool = True,
        resources: FakeResources | SimpleNamespace | None = None,
    ) -> None:
        # The real `UrlManager`, seeded the way the frontend component seeds it
        # on setup. Home Assistant guarantees it is there — the manifest depends
        # on `frontend`, so it is set up before this integration — and a fake
        # holding a stand-in here would test a set that is not the one shipping.
        self.data: dict = {
            DATA_EXTRA_MODULE_URL: UrlManager(lambda *_args: None, []),
        }

        if resources is not None:
            self.data[LOVELACE_DATA] = SimpleNamespace(resources=resources)

        self.http = FakeHttp(local)
        self.bus = FakeBus()
        self.config = FakeConfig(base)

    async def async_add_executor_job(self, func, *args):
        return func(*args)


@pytest.fixture
def config_dir(tmp_path: Path) -> Path:
    """Return a configuration directory whose `www/` already exists, as most do."""

    base = tmp_path / "config"
    (base / "www").mkdir(parents=True)

    return base


def _copy(base: Path) -> Path:
    return base / "www" / panel.LOCAL_DIR / panel.BUNDLE_NAME


def _card_urls(hass) -> frozenset[str]:
    """Return the bundle URLs every dashboard is told to load."""

    return hass.data[DATA_EXTRA_MODULE_URL].urls


def _panel_url(hass) -> str:
    registered = hass.data["frontend_panels"][panel.PANEL_URL]

    return registered.config["_panel_custom"]["module_url"]


def test_register_panel_matches_the_home_assistant_signature():
    signature = inspect.signature(panel_custom.async_register_panel)

    assert "update" not in signature.parameters

    for name in ("frontend_url_path", "webcomponent_name", "module_url"):
        assert name in signature.parameters


async def test_registering_the_panel_serves_the_bundle(config_dir):
    hass = FakeHass(config_dir)

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

    os.utime(bundle, (1_000_000, 1_000_000))
    before = panel._module_url()

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))
    after = panel._module_url()

    assert before != after


async def test_a_missing_bundle_still_registers_the_panel(
    tmp_path, config_dir, monkeypatch
):
    """Better a visibly broken panel than a silent setup failure."""

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]
    # Nothing to copy, so nothing is served from `/local/` or declared there.
    assert not _copy(config_dir).exists()
    assert _panel_url(hass).startswith(panel.STATIC_URL)


async def test_reloading_does_not_duplicate_the_static_route(config_dir):
    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)
    await panel.async_register_panel(hass)

    assert hass.http.registered == [panel.STATIC_URL]


async def test_reloading_does_not_raise_overwriting_panel(config_dir):
    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)
    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]


async def test_unregistering_an_unknown_panel_is_harmless(config_dir):
    hass = FakeHass(config_dir)

    panel.async_unregister_panel(hass)


async def test_the_panel_can_be_registered_again_after_unload(config_dir):
    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)
    panel.async_unregister_panel(hass)

    assert panel.PANEL_URL not in hass.data.get("frontend_panels", {})

    await panel.async_register_panel(hass)

    assert panel.PANEL_URL in hass.data["frontend_panels"]


#
# The dashboard card, which rides the same bundle
#


async def test_registering_the_panel_offers_the_card_to_dashboards(config_dir):
    """Without this the card exists in the bundle and nothing ever loads it."""

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    assert _card_urls(hass) == {panel._module_url(panel.LOCAL_URL)}


async def test_the_card_and_the_panel_are_the_same_bundle(config_dir):
    """Home Assistant is one page, so two bundles would be one crash.

    Both would run `customElements.define("se-balance-card")`; the second throws
    and takes the panel with it. The card riding the panel's own URL is what
    makes that impossible rather than merely avoided.
    """

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    assert _card_urls(hass) == {_panel_url(hass)}


async def test_unloading_takes_the_card_back(config_dir):
    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)
    panel.async_unregister_panel(hass)

    assert _card_urls(hass) == frozenset()


async def test_rebuilding_leaves_no_stale_bundle_behind(
    tmp_path, config_dir, monkeypatch
):
    """The URL carries the bundle's mtime, so a rebuild changes it.

    Removing a recomputed URL would remove nothing, and every dashboard would
    go on loading a version that is no longer there. Exactly one URL is offered,
    always, however many times this is reloaded.
    """

    bundle = tmp_path / panel.BUNDLE_NAME
    bundle.write_text("first", encoding="utf-8")
    os.utime(bundle, (1_000_000, 1_000_000))

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    first = set(_card_urls(hass))

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))

    await panel.async_register_panel(hass)

    assert len(_card_urls(hass)) == 1
    assert _card_urls(hass) != first


#
# Where the bundle is served from, and why there are two places — ADR-016
#


async def test_the_bundle_is_copied_into_the_configuration(config_dir):
    """`/local/` is served from the first moment; our own path is not."""

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    copy = _copy(config_dir)

    assert copy.is_file()
    assert copy.read_bytes() == (panel.WWW_PATH / panel.BUNDLE_NAME).read_bytes()


async def test_the_copy_is_served_when_local_is(config_dir):
    """Panel and card on the `/local/` URL, which exists before this code runs."""

    hass = FakeHass(config_dir, local=True)

    await panel.async_register_panel(hass)

    assert _panel_url(hass).startswith(f"{panel.LOCAL_BUNDLE_URL}?v=")
    assert _card_urls(hass) == {_panel_url(hass)}


async def test_our_own_path_is_served_when_local_is_not(tmp_path):
    """The run that creates `www/`: Home Assistant has not registered `/local/`.

    Serving the `/local/` URL would 404 on every dashboard until the next start.
    The copy is still made, so that the next start finds it.
    """

    base = tmp_path / "config"
    hass = FakeHass(base, local=False)

    await panel.async_register_panel(hass)

    assert _panel_url(hass).startswith(f"{panel.STATIC_URL}/{panel.BUNDLE_NAME}?v=")
    assert _card_urls(hass) == {_panel_url(hass)}
    assert _copy(base).is_file()


async def test_the_copy_carries_the_bundle_version(tmp_path, config_dir, monkeypatch):
    """Same mtime, so the `?v=` of the original is the `?v=` of the copy.

    An old copy is replaced when the bundle moves, and left alone when it has
    not: an update changes the file, a restart does not touch it.
    """

    bundle = tmp_path / panel.BUNDLE_NAME
    bundle.write_text("first", encoding="utf-8")
    os.utime(bundle, (1_000_000, 1_000_000))

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    hass = FakeHass(config_dir)

    await panel.async_register_panel(hass)

    copy = _copy(config_dir)

    assert int(copy.stat().st_mtime) == 1_000_000
    assert copy.read_text(encoding="utf-8") == "first"

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))

    await panel.async_register_panel(hass)

    assert int(copy.stat().st_mtime) == 2_000_000
    assert copy.read_text(encoding="utf-8") == "second"


async def test_the_copy_is_declared_as_a_lovelace_resource(config_dir):
    """The declaration a page served before we load can still find."""

    resources = FakeResources()
    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)

    assert resources.items == [
        {"id": "id0", "type": "module", "url": panel._module_url(panel.LOCAL_URL)}
    ]


async def test_the_resource_is_declared_even_before_local_is_served(tmp_path):
    """It is for the next start, which is exactly when `/local/` begins."""

    base = tmp_path / "config"
    resources = FakeResources()
    hass = FakeHass(base, local=False, resources=resources)

    await panel.async_register_panel(hass)

    assert [item["url"] for item in resources.items] == [
        panel._module_url(panel.LOCAL_URL)
    ]


async def test_reloading_does_not_duplicate_the_resource(config_dir):
    """Two resources would be the two-bundle crash by another road."""

    resources = FakeResources()
    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)
    await panel.async_register_panel(hass)

    assert len(resources.items) == 1


async def test_a_new_version_updates_the_resource_in_place(
    tmp_path, config_dir, monkeypatch
):
    bundle = tmp_path / panel.BUNDLE_NAME
    bundle.write_text("first", encoding="utf-8")
    os.utime(bundle, (1_000_000, 1_000_000))

    monkeypatch.setattr(panel, "WWW_PATH", tmp_path)

    resources = FakeResources()
    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)

    before = resources.items[0]

    bundle.write_text("second", encoding="utf-8")
    os.utime(bundle, (2_000_000, 2_000_000))

    await panel.async_register_panel(hass)

    assert len(resources.items) == 1
    assert resources.items[0]["id"] == before["id"]
    assert resources.items[0]["url"] == f"{panel.LOCAL_BUNDLE_URL}?v=2000000"


async def test_a_duplicate_resource_is_cleared(config_dir):
    """A hand-added second copy would load the bundle twice."""

    resources = FakeResources()
    url = panel._module_url(panel.LOCAL_URL)
    await resources.async_create_item({"res_type": "module", "url": url})
    await resources.async_create_item({"res_type": "module", "url": url})
    await resources.async_create_item(
        {"res_type": "module", "url": "/local/somebody-else.js"}
    )

    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)

    assert [item["url"] for item in resources.items] == [url, "/local/somebody-else.js"]


async def test_yaml_mode_resources_are_left_to_the_user(config_dir):
    """No store to write to, and no error either: the log says what to add."""

    yaml_resources = SimpleNamespace(async_items=lambda: [])
    hass = FakeHass(config_dir, resources=yaml_resources)

    await panel.async_register_panel(hass)

    assert _panel_url(hass).startswith(panel.LOCAL_BUNDLE_URL)


async def test_removing_the_integration_withdraws_the_copy_and_the_resource(config_dir):
    resources = FakeResources()
    await resources.async_create_item(
        {"res_type": "module", "url": "/local/somebody-else.js"}
    )

    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)

    assert _copy(config_dir).is_file()
    assert len(resources.items) == 2

    await panel.async_withdraw_bundle(hass)

    assert not _copy(config_dir).parent.exists()
    assert [item["url"] for item in resources.items] == ["/local/somebody-else.js"]


async def test_unloading_leaves_the_copy_and_the_resource(config_dir):
    """A reload is not a goodbye."""

    resources = FakeResources()
    hass = FakeHass(config_dir, resources=resources)

    await panel.async_register_panel(hass)
    panel.async_unregister_panel(hass)

    assert _copy(config_dir).is_file()
    assert len(resources.items) == 1


def test_the_resource_store_has_the_methods_this_integration_calls():
    """The fake above speaks for the real collection; make sure it can."""

    for name in (
        "async_get_info",
        "async_items",
        "async_create_item",
        "async_update_item",
        "async_delete_item",
    ):
        assert callable(getattr(ResourceStorageCollection, name))

    # `store` is what tells storage mode from YAML mode: the real collection
    # is built around one, and the YAML collection has none.
    parameters = inspect.signature(collection.StorageCollection.__init__).parameters

    assert "store" in parameters
    assert not hasattr(ResourceYAMLCollection, "store")
