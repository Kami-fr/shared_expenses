"""Where an exchange rate came from."""

from enum import StrEnum


class RateSource(StrEnum):
    """What a rate is vouched for by."""

    ECB = "ecb"
    """Fetched from the European Central Bank, through Frankfurter."""

    MANUAL = "manual"
    """Typed by hand, because the source could not be reached.

    Outranks nothing: it is simply the rate known for that day, and the next
    fetch that succeeds for the same day replaces it.
    """
