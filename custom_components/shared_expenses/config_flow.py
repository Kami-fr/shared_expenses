"""Config flow for the Shared Expenses integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow
from homeassistant.data_entry_flow import FlowResult

from .const import CONFIG_VERSION, DOMAIN, NAME


class SharedExpensesConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the Shared Expenses config flow."""

    VERSION = CONFIG_VERSION

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial step."""

        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        return self.async_create_entry(
            title=NAME,
            data={},
        )