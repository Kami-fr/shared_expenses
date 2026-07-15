"""Group member roles."""

from enum import StrEnum


class GroupRole(StrEnum):
    """What somebody is in a group. There is exactly one admin.

    Two of them, where there used to be three: an owner, above an admin, above a
    member. The middle one was a step nobody needed — an admin could do
    everything an owner could except the two things that mattered, so it named
    somebody who was almost in charge, which is not a station worth having in a
    household's shopping list.

    A role is never handed out, only handed on. `transfer_admin` moves it, and
    whoever gives it up becomes an ordinary member; there is no other way for a
    role to change. That is what makes the whole permission model worth standing
    on: nobody can grant themselves one, because nobody can grant one at all.
    """

    ADMIN = "admin"
    """The one who runs the group.

    Above every permission, and alone in being able to delete the group, say
    what its members may do, and hand it on. Cannot leave without handing it on
    first: access comes from membership, so a group whose admin walked out would
    be a group nobody can run.
    """

    MEMBER = "member"
    """Everybody else. What they may do is the group's to say."""
