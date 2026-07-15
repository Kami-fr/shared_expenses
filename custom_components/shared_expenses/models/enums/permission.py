"""What an ordinary member of a group is allowed to do."""

from enum import StrEnum


class Permission(StrEnum):
    """One thing a group either lets its members do, or does not.

    A setting of the group, the same for everybody in it: a household of three
    does not want a matrix to fill in, and the one dimension that is per person
    already exists — `GroupRole`. So these say what an ordinary member may do,
    and the admin is simply above them.

    Every one of them is granted by default, on a new group and on every group
    that existed before they did. Nobody is handed a household where people
    suddenly cannot do what they did yesterday; shutting a door is a deliberate
    act, taken by the admin.

    Deleting a group is not here and never will be: it takes every expense with
    it, and it belongs to the admin alone.
    """

    MANAGE_MEMBERS = "manage_members"
    """Add, remove and rename members, and tick the accounts taking part.

    Never who runs the group. A group has one admin and it is handed on rather
    than handed out, so there is no role to grant here and no door to prop open:
    a member who could hand one out could hand one to themselves, and every
    setting here would be worth nothing.
    """

    MANAGE_CATEGORIES = "manage_categories"
    """Create, change and delete the categories and their split rules."""

    MANAGE_GROUP = "manage_group"
    """Rename the group, change its description, its default rule, archive it."""

    EDIT_OTHERS = "edit_others"
    """Touch an expense or a payment that is not their own.

    Theirs means they entered it or they are the one it is about — whoever paid
    an expense, either party to a payment. Both, because either alone strands
    somebody: recording what your flatmate paid would leave you unable to fix
    your own typo, and only ever counting the typist would let a stranger to the
    money own the line.
    """
