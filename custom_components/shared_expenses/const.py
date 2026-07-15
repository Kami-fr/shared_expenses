"""Constants for the Shared Expenses integration."""

from typing import Final

DOMAIN: Final = "shared_expenses"
NAME: Final = "Shared Expenses"

CONFIG_VERSION: Final = 1

DATABASE_NAME: Final = "shared_expenses.db"
DATABASE_SCHEMA: Final = "schema_v1.sql"
DATABASE_VERSION: Final = 11
STORAGE_KEY: Final = DOMAIN

DEFAULT_CURRENCY: Final = "EUR"

PANEL_URL: Final = DOMAIN
PANEL_TITLE: Final = NAME
PANEL_ICON: Final = "mdi:cash-multiple"
