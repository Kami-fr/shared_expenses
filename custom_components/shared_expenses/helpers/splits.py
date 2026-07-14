"""Split rule resolution and serialization."""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
import json
from typing import Any

from ..exceptions import InvalidSplitRuleError
from ..models import Remainder, SplitRule


def resolve_shares(
    *,
    amount: int,
    payer_id: str,
    member_ids: Sequence[str],
    rule: SplitRule | None = None,
) -> dict[str, int]:
    """Resolve a split rule into absolute shares in cents.

    `member_ids` is the pool the expense may be split between, usually the
    active members of the group. A `None` rule splits the whole amount equally
    between that pool.

    The returned mapping only contains non-zero shares and always adds up to
    `amount`.
    """

    if amount <= 0:
        raise InvalidSplitRuleError("Expense amount must be positive.")

    pool = tuple(dict.fromkeys(member_ids))

    if not pool:
        raise InvalidSplitRuleError("The group has no member to split between.")

    if payer_id not in pool:
        raise InvalidSplitRuleError("The payer must be a member of the group.")

    rule = rule if rule is not None else SplitRule()

    envelope = _envelope(rule, amount)
    participants = _participants(rule, pool)

    if not participants:
        envelope = 0

    shares = _distribute(envelope, participants)

    left = amount - envelope

    if left > 0:
        for member_id, share in _resolve_remainder(
            rule.remainder,
            left,
            payer_id,
            pool,
        ).items():
            shares[member_id] = shares.get(member_id, 0) + share

    resolved = {
        member_id: value for member_id, value in shares.items() if value != 0
    }

    if sum(resolved.values()) != amount:
        raise InvalidSplitRuleError("Resolved shares do not add up to the amount.")

    return resolved


def _envelope(rule: SplitRule, amount: int) -> int:
    """Return the amount shared equally.

    No envelope means the whole expense: the plain equal split.
    """

    if rule.envelope is None:
        return amount

    if rule.envelope < 0:
        raise InvalidSplitRuleError("The shared amount cannot be negative.")

    return min(rule.envelope, amount)


def _participants(rule: SplitRule, pool: tuple[str, ...]) -> tuple[str, ...]:
    """Return the members sharing the envelope."""

    if rule.participants is None:
        return pool

    participants = tuple(dict.fromkeys(rule.participants))

    _ensure_known(participants, pool, "participant")

    return participants


#: A whole, in hundredths of a percent.
FULL_PERCENT = 10_000


def _resolve_remainder(
    remainder: Remainder,
    left: int,
    payer_id: str,
    pool: tuple[str, ...],
) -> dict[str, int]:
    """Return what each member owes out of what the envelope left behind.

    Same shape as the envelope, one level down. A member is written down for an
    amount, or for a share of what is left, or for neither — and those left take
    an equal part of whatever the first two did not claim.
    """

    _ensure_known(remainder.fixed, pool, "remainder")
    _ensure_known(remainder.percent, pool, "remainder")

    if any(value < 0 for value in remainder.fixed.values()):
        raise InvalidSplitRuleError("A remainder amount cannot be negative.")

    if any(value < 0 for value in remainder.percent.values()):
        raise InvalidSplitRuleError("A remainder share cannot be negative.")

    members = remainder.members

    if members is None:
        # Nobody named: the one who paid carries what is left.
        members = (payer_id,)
    else:
        members = tuple(dict.fromkeys(members))

        _ensure_known(members, pool, "remainder")

    if not members:
        raise InvalidSplitRuleError("Nobody takes the remainder.")

    fixed = {
        member_id: value
        for member_id, value in remainder.fixed.items()
        if member_id in members
    }

    percent = {
        member_id: value
        for member_id, value in remainder.percent.items()
        if member_id in members
    }

    both = sorted(set(fixed) & set(percent))

    if both:
        raise InvalidSplitRuleError(
            f"A member cannot owe both an amount and a share: {', '.join(both)}"
        )

    percent_total = sum(percent.values())

    if percent_total > FULL_PERCENT:
        raise InvalidSplitRuleError("The remainder shares exceed the whole.")

    # Both are taken out of what the envelope left, so a share means a share of
    # that — not of what the fixed amounts happen to leave behind. "60%" is 60%
    # of the same thing whether or not someone else owes a flat 10.
    from_percent = {
        member_id: left * value // FULL_PERCENT for member_id, value in percent.items()
    }

    fixed_total = sum(fixed.values())
    claimed = fixed_total + sum(from_percent.values())

    if claimed > left:
        raise InvalidSplitRuleError("The remainder exceeds what is left.")

    shares = {**fixed, **from_percent}

    sharing = tuple(
        member_id
        for member_id in members
        if member_id not in fixed and member_id not in percent
    )

    rest = left - claimed

    if sharing:
        for member_id, share in _distribute(rest, sharing).items():
            shares[member_id] = shares.get(member_id, 0) + share

        return shares

    if rest == 0:
        return shares

    # Nobody is left to take what the flooring lost. Shares claiming the whole
    # of it own those cents; anything else simply does not add up.
    if percent and percent_total == FULL_PERCENT:
        for member_id, share in _distribute(rest, tuple(from_percent)).items():
            shares[member_id] = shares.get(member_id, 0) + share

        return shares

    raise InvalidSplitRuleError("The remainder does not add up to what is left.")


RULE_KEYS = frozenset({"envelope", "participants", "remainder"})
REMAINDER_KEYS = frozenset({"members", "fixed", "percent"})


def rule_from_dict(data: Mapping[str, Any] | None) -> SplitRule | None:
    """Create a split rule from its serialized form."""

    if data is None:
        return None

    if not isinstance(data, Mapping):
        raise InvalidSplitRuleError("A split rule must be an object.")

    _ensure_no_stray_keys(data, RULE_KEYS, "split rule")

    envelope = data.get("envelope")

    return SplitRule(
        envelope=None if envelope is None else _as_int(envelope),
        participants=_members_from(data.get("participants")),
        remainder=_remainder_from_dict(data.get("remainder")),
    )


def _remainder_from_dict(data: Any) -> Remainder:
    """Create the remainder of a rule from its serialized form."""

    if data is None:
        return Remainder()

    if not isinstance(data, Mapping):
        raise InvalidSplitRuleError("A remainder must be an object.")

    _ensure_no_stray_keys(data, REMAINDER_KEYS, "remainder")

    fixed_data = data.get("fixed") or {}

    if not isinstance(fixed_data, Mapping):
        raise InvalidSplitRuleError("Remainder amounts must be an object.")

    percent_data = data.get("percent") or {}

    if not isinstance(percent_data, Mapping):
        raise InvalidSplitRuleError("Remainder shares must be an object.")

    return Remainder(
        members=_members_from(data.get("members")),
        fixed={
            str(member_id): _as_int(value) for member_id, value in fixed_data.items()
        },
        percent={
            str(member_id): _as_int(value) for member_id, value in percent_data.items()
        },
    )


def rule_to_dict(rule: SplitRule | None) -> dict[str, Any] | None:
    """Return the serializable form of a split rule."""

    if rule is None:
        return None

    return {
        "envelope": rule.envelope,
        "participants": (
            list(rule.participants) if rule.participants is not None else None
        ),
        "remainder": {
            "members": (
                list(rule.remainder.members)
                if rule.remainder.members is not None
                else None
            ),
            "fixed": dict(rule.remainder.fixed),
            "percent": dict(rule.remainder.percent),
        },
    }


def rule_from_json(raw: str | None) -> SplitRule | None:
    """Create a split rule from its stored JSON form."""

    if raw is None:
        return None

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as err:
        raise InvalidSplitRuleError("Stored split rule is not valid JSON.") from err

    return rule_from_dict(data)


def rule_to_json(rule: SplitRule | None) -> str | None:
    """Return the stored JSON form of a split rule."""

    if rule is None:
        return None

    return json.dumps(rule_to_dict(rule), separators=(",", ":"))


def _ensure_no_stray_keys(
    data: Mapping[str, Any],
    known: frozenset[str],
    label: str,
) -> None:
    """Refuse a shape this reader does not understand.

    A rule written by an older version carries keys that no longer mean
    anything. Ignoring them would quietly resolve to a rule nobody wrote, and
    silently wrong money is worse than a visible error.
    """

    stray = sorted(set(data) - known)

    if stray:
        raise InvalidSplitRuleError(
            f"Unknown {label} field: {', '.join(stray)}. "
            "This rule was written by another version."
        )


def _members_from(value: Any) -> tuple[str, ...] | None:
    """Return a list of member ids, or None when unset."""

    if value is None:
        return None

    if not isinstance(value, Sequence) or isinstance(value, str):
        raise InvalidSplitRuleError("Expected a list of member ids.")

    return tuple(str(member_id) for member_id in value)


def _distribute(amount: int, member_ids: Sequence[str]) -> dict[str, int]:
    """Split an amount in cents as evenly as possible.

    The extra cents that cannot be divided evenly go to the first members, so
    that the result stays deterministic.
    """

    if amount <= 0 or not member_ids:
        return {}

    base, extra = divmod(amount, len(member_ids))

    shares = {member_id: base for member_id in member_ids}

    for member_id in member_ids[:extra]:
        shares[member_id] += 1

    return shares


def _ensure_known(
    member_ids: Iterable[str],
    pool: tuple[str, ...],
    label: str,
) -> None:
    """Raise when a member is not part of the pool."""

    unknown = sorted(set(member_ids) - set(pool))

    if unknown:
        raise InvalidSplitRuleError(f"Unknown {label} member: {', '.join(unknown)}")


def _as_int(value: Any) -> int:
    """Return an amount in cents."""

    if isinstance(value, bool) or not isinstance(value, int):
        raise InvalidSplitRuleError(f"Expected an amount in cents, got {value!r}")

    return value
