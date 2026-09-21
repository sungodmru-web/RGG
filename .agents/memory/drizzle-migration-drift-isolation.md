---
name: Drizzle migration drift isolation
description: A Drizzle Kit path-resolution constraint for non-destructive migration drift checks.
---

Run migration generation for drift checks in a temporary directory beneath the
database package and give Drizzle package-relative schema and output paths.

**Why:** The current Drizzle Kit release prefixes an absolute migration output
path with the working directory, reports a missing snapshot, and can still exit
with status zero. That can make a drift check silently pass.

**How to apply:** Keep drift-check generation isolated under the package, clean
the directory in a `finally` block, and treat generator output beginning with
`Error:` as failure even when the process status is zero.

When adding columns to an existing PostgreSQL table, keep the Drizzle schema
fields in the same physical order produced by `ALTER TABLE ... ADD COLUMN`
(new fields after existing fields).

**Why:** The migration rebuild check compares normalized schema dumps, including
column order. Declaring new fields before existing timestamp fields causes an
otherwise equivalent generated migration to fail that check.

**How to apply:** Append new Drizzle fields after the table's existing fields,
regenerate the migration and snapshot, then run both migration drift and rebuild
checks.