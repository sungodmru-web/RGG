---
name: Distributed readiness probes
description: Coordination and failure-safety rules for database recovery checks across API instances.
---

Coordinate cross-instance database recovery checks with a non-blocking database
advisory lock, then apply a short randomized local retry delay when another
instance owns the lock or coordination fails. Never interpret a coordination
failure as evidence that the database is healthy.

**Why:** During an outage, independently scheduled API instances can synchronize
their recovery probes and multiply pressure on the database. Non-blocking
coordination limits concurrent probes, while jitter prevents repeated probe
spikes and keeps recovery detection bounded.

**How to apply:** Hold and release the advisory lock on the same database
session, destroy that session if unlock fails, and test separate logical
instances contending for the shared lock.