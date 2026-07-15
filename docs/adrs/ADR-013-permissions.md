# ADR-013 - Permissions

## Status

Accepted

## Context

`group_members.role` has existed since v1, holding `owner`, `admin` or `member`.
It was stored, served to the panel and settable through the API — and not one
command ever read it. There was exactly one rule in the whole integration: the
owner could not leave their own group.

So being an active member of a group meant being able to do everything in it.
Any member could remove any other, rewrite anybody's expenses, and delete the
group with every expense in it. `admin` and `member` were the same thing spelled
differently, and the only thing the role achieved was locking the owner into
their own group for life, with no way out and nothing to hand it to.

That is defensible for a couple splitting a holiday. It stops being defensible
the moment a household has a flatmate who comes and goes, or a teenager, or a
shared tablet in the kitchen — and it is not what anybody expects of an
integration that says who owes what.

The obvious answer is a permission per person per action. It is also the wrong
one: four settings across five people is a twenty-cell matrix to fill in, for a
household, where the honest answer is almost always "we all can" with one or two
exceptions.

## Decision

Two dials, not a matrix.

**A group says what its members may do**, the same for everybody in it. Four
switches, one column each on `groups`:

| Permission | What it covers |
|------------|----------------|
| `manage_members` | Add, remove and rename people; tick the accounts taking part |
| `manage_categories` | The categories and their split rules |
| `manage_group` | Rename, describe, default rule, archive |
| `edit_others` | Touch an expense or a payment that is not theirs |

**The role says who is above them.** An owner and an admin bypass every switch.
That is the per-person dimension, it already existed, and it is enough: the
switches set the floor, the role lifts one person off it.

**Everything is granted by default**, on a new group and on every group that
existed before this. Nobody comes back from a restart to find they cannot do
what they did yesterday. Shutting a door is a deliberate act, taken by the
owner.

**Two things are the owner's alone and will never be switches.** Deleting the
group, because it takes every expense with it and cannot be undone. And handing
the group on, which is new, and which finally lets the old owner leave: they
become an admin, and the group always has exactly one owner.

### The floor

**Roles are never governed by the switches.** A member who could hand out a role
could bring in a second account of their own as an admin, and every setting here
would be worth precisely nothing. Handing out `admin` is the owner's and the
admins'; handing out `owner` is refused to everybody, including the owner —
ownership moves through `transfer_ownership` or not at all. Two owners is a
group with two people who can delete it and no way to say which of them is
wrong, and nothing stopped that before today.

**A group is never handed to somebody without a Home Assistant account.** They
carry expenses but never open the panel: made owner, they would hold every right
nobody can exercise, and the group could never be handed on again.

**You are always yours.** Your own name, your own colour, and your own way out:
none of them is managing the members. Being unable to leave is the very trap the
owner was in.

### Where it is enforced

In the decorator, beside the wall that was already there:

```python
@api_command(Scope.GROUP, Permission.MANAGE_CATEGORIES)
@api_command(Scope.EXPENSE, Requires.MINE)
@api_command(Scope.GROUP, Requires.OWNER)
```

A rule each handler has to remember to apply is a rule one of them will forget.
`requires=None` is the explicit way out and means every member may do it.

Two different questions, kept apart on purpose. **The scope** asks whether the
caller may see the thing at all, and answers a refusal by pretending it does not
exist — hiding is the only honest answer to somebody who must not know the group
is there. **`requires`** asks whether they may do this to a thing they are
already looking at, and says so plainly: by then there is nothing left to hide,
and an unexplained failure would only make the panel look broken.

### What "theirs" means

An expense is theirs if they **entered** it or they **paid** it. A payment, if
they wrote it down or it is about them — either party.

Both halves are needed. Counting only the payer means recording what your
flatmate paid costs you the right to fix your own typo. Counting only the typist
lets somebody with no stake in the money own the line. Hence
`created_by_member_id` in v10, recovered for the past from the `created`
revision where one exists, and NULL where nobody ever wrote it down.

## Consequences

The panel hides what the backend would refuse. That is a courtesy and never the
guard: the panel is a program on somebody else's machine, and `ensure_permission`
is the door. But a button that always errors is worse than no button, so the two
rules have to agree — and when they drift, the backend is the one that is right.

`update_member` now requires `group_id`. A guard that can be skipped by leaving
a field out is not a guard, and a member is global — one per Home Assistant
account, across every group — so there was no group to ask about otherwise.

The switches are per group, so the same person can be trusted in one project and
not in another without anybody configuring a matrix.

None of this is a security boundary against a hostile Home Assistant account.
Anybody who can log in can call the WebSocket API directly, and these rules are
what the API enforces — but the group wall (ADR-006, `Scope`) is what keeps
households apart, and it came first for a reason. These settings are about who
in a household may do what, not about defending one from the other.

## Alternatives considered

**A permission per person.** The matrix nobody fills in. Rejected: the role
already carries the per-person dimension, and two dials beat twenty cells.

**Dropping `admin`.** It meant nothing, so it was a candidate for deletion
rather than for a meaning. Kept, because without it the only way to lift one
person above the switches is to hand them the group — and the owner has two
rights nobody should get by accident.

**Permissions as a JSON blob on the group.** One column, one migration, and new
permissions for free. Rejected: `docs/database.md` and the schema are where the
shape of this integration is written down, and a permission nobody can see by
reading them is a permission nobody will remember to check. A permission is a
contract, and a contract deserves a migration.

**Defaulting new groups to closed.** Safer on paper. Rejected: a household is
not a company, and a project where nobody can add a category until the owner
goes and finds a setting is a project that annoys four people to protect against
nothing.
