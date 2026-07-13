"""Shared Expenses coordinator."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .storage.database import Database


class SharedExpensesManager:
    """Main manager for Shared Expenses."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the coordinator."""

        self.database = Database(hass)

    async def initialize(self) -> None:
        """Initialize Shared Expenses."""

        await self.database.initialize()

    async def close(self) -> None:
        """Close Shared Expenses."""

        await self.database.close()