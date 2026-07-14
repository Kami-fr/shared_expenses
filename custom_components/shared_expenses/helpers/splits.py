"""Split rule resolution and serialization."""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
import json
from typing import Any

from ..exceptions import InvalidSplitRuleError
from ..models import RemainderTarget, SplitRule


def resolve_shares(
    *,
    amount: int,
    payer_id: str,
    member_ids: Sequence[str],
    rule: SplitRule | None = None,
) -> dict[str, int]:
    """Resolve a split rule into absolute shares in cents.

    `member_ids` is the pool of members the expense may be split between,
    usually the active members of the group. A `None` rule splits the whole
    amount equally between that pool.

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

    _ensure_known(rule.fixed, pool, "fixed")

    if any(value < 0 for value in rule.fixed.values()):
        raise InvalidSplitRuleError("Fixed amounts cannot be negative.")

    if rule.cap is not None and rule.cap < 0:
        raise InvalidSplitRuleError("Cap cannot be negative.")

    distributable = amount - sum(rule.fixed.values())

    if distributable < 0:
        raise InvalidSplitRuleError("Fixed amounts exceed the expense amount.")

    participants = _resolve_participants(rule, pool)

    envelope = distributable

    if rule.cap is not None:
        envelope = min(envelope, rule.cap)

    if not participants:
        envelope = 0

    shares: dict[str, int] = {
        member_id: amount for member_id, amount in rule.fixed.items()
    }

    for member_id, share in _distribute(envelope, participants).items():
        shares[member_id] = shares.get(member_id, 0) + share

    surplus = distributable - envelope

    if surplus:
        target = _remainder_member(rule, payer_id)
        shares[target] = shares.get(target, 0) + surplus

    resolved = {
        member_id: value for member_id, value in shares.items() if value != 0
    }

    if sum(resolved.values()) != amount:
        raise InvalidSplitRuleError("Resolved shares do not add up to the amount.")

    return resolved


def rule_from_dict(data: Mapping[str, Any] | None) -> SplitRule | None:
    """Create a split rule from its serialized form."""

    if data is None:
        return None

    if not isinstance(data, Mapping):
        raise InvalidSplitRuleError("A split rule must be an object.")

    participants = data.get("participants")

    if participants is not None:
        if not isinstance(participants, Sequence) or isinstance(participants, str):
            raise InvalidSplitRuleError("Participants must be a list of member ids.")

        participants = tuple(str(member_id) for member_id in participants)

    fixed_data = data.get("fixed") or {}

    if not isinstance(fixed_data, Mapping):
        raise InvalidSplitRuleError("Fixed amounts must be an object.")

    fixed = {str(member_id): _as_int(value) for member_id, value in fixed_data.items()}

    cap = data.get("cap")

    remainder = data.get("remainder", RemainderTarget.PAYER)

    try:
        remainder = RemainderTarget(remainder)
    except ValueError as err:
        raise InvalidSplitRuleError(f"Unknown remainder target: {remainder}") from err

    return SplitRule(
        participants=participants,
        fixed=fixed,
        cap=None if cap is None else _as_int(cap),
        remainder=remainder,
    )


def rule_to_dict(rule: SplitRule | None) -> dict[str, Any] | None:
    """Return the serializable form of a split rule."""

    if rule is None:
        return None

    return {
        "participants": (
            list(rule.participants) if rule.participants is not None else None
        ),
        "fixed": dict(rule.fixed),
        "cap": rule.cap,
        "remainder": rule.remainder.value,
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


def _resolve_participants(rule: SplitRule, pool: tuple[str, ...]) -> tuple[str, ...]:
    """Return the members sharing the envelope."""

    if rule.participants is None:
        return pool

    participants = tuple(dict.fromkeys(rule.participants))

    _ensure_known(participants, pool, "participant")

    return participants


def _remainder_member(rule: SplitRule, payer_id: str) -> str:
    """Return the member receiving the surplus left above the cap."""

    if rule.remainder is RemainderTarget.PAYER:
        return payer_id

    raise InvalidSplitRuleError(f"Unsupported remainder target: {rule.remainder}")


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
