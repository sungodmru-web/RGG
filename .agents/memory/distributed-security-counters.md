---
name: Distributed security counters
description: Concurrency and failure-isolation rules for database-coordinated security counters.
---

Use an authoritative database clock after acquiring the counter row lock for
all shared window and cooldown decisions. Run security bookkeeping through a
small dedicated connection pool with query and lock deadlines, and handle idle
pool errors without logging database details.

**Why:** Instance clocks and lock acquisition order can otherwise corrupt a
shared sliding window, while stalled or idle-error connections can exhaust the
main application pool or terminate the process during an attack.

**How to apply:** Follow this rule for security counters or cooldowns shared
across processes. Tests should use separate pools, recreate a pool to model a
restart, and hold a row lock to verify bounded safe failure.