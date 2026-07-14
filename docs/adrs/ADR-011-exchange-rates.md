# ADR-011 - Exchange Rates

## Status

Accepted

## Context

A group counts in one currency. Someone pays for dinner in another. Until now
such an expense was refused, because nothing converted it and 100 USD would have
settled against 100 EUR — two members would have walked away thinking they were
square when one was out of pocket.

Converting needs a rate, and a rate is not something the household knows. It has
to come from somewhere, and every source is outside the instance.

This is the first time Shared Expenses reaches the network. ADR-002 chose SQLite
partly for having no external dependency, and everything since has been local by
construction. The question was asked plainly: is depending on an external API a
normal, accepted thing to do in a Home Assistant integration?

It is. Home Assistant has a name for it — `iot_class: cloud_polling` — and a
large share of the official integrations are exactly that. The class is a
promise to the user about what the integration does with their network, not an
apology.

## Decision

An expense may be in any currency. The rate is fetched once, on the way in, and
**frozen onto the expense**.

Rates come from [Frankfurter](https://frankfurter.dev): free, open-source,
sourcing from central banks, needing no key and no account.

`manifest.json` declares `iot_class: cloud_polling`. The README says what leaves
the instance, and when.

Three rules govern the failure case, and none of them is negotiable:

1. **A rate always says how old it is.** A stale rate presented as today's is
   worse than no rate at all.
2. **A hand-typed rate always wins.** The field is there precisely because the
   service can be down and the instance can be offline.
3. **Neither ever blocks an expense.** Somebody standing in a shop must be able
   to write down what they just spent.

Every rate ever seen is kept in `exchange_rates`, from the service or typed by
hand, with the day it is from. A fallback asks that table for the last one
known.

## Why

- The alternative — refusing foreign expenses — is not a smaller product, it is
  a wrong one for anyone who travels.
- The alternative — asking the user to type every rate — makes the common case
  pay for the rare one.
- Frankfurter needs no key, so there is nothing to configure and no secret to
  store. An integration that demanded an API key would have been a different
  decision entirely.
- Nothing about the expense is sent. The request carries a pair of currency
  codes and a date, and that is all there is to leak.

## Consequences

`clients/frankfurter.py` is the only code in this integration that reaches the
network. Keeping it to one file is deliberate: the blast radius of the outside
world is one module, and it is the one place that has to be defensive.

The rate is frozen, so a balance is stable. What someone owes was settled on the
day they were owed it; a rate that moved afterwards is a fact about the market,
not about the debt. This also means a rate entered wrongly is corrected by
editing the expense, not by waiting.

Money and rates stay integers throughout — rates in millionths. See ADR-008.

The service publishes nothing at the weekend, so a Sunday is answered with
Friday's rate. The day **given** is stored, never the day asked for, or a
balance would claim a precision it does not have.

Home Assistant users who never leave their own currency pay nothing for any of
this: no request is made, and the rate row never appears.
