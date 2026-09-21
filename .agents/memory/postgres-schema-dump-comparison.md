---
name: PostgreSQL schema dump comparison
description: A nondeterministic pg_dump detail that affects structural schema comparisons.
---

Remove the `\restrict` and `\unrestrict` lines before comparing schema-only
dumps from separate databases.

**Why:** PostgreSQL 16 generates a different random session restriction key for
every dump, so structurally identical databases otherwise compare as different.

**How to apply:** Normalize only those session-key lines and continue comparing
the rest of each schema-only dump exactly.