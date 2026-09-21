---
name: Versioned database migrations
description: The project convention for safe development and production schema changes.
---

Use checked-in Drizzle SQL migrations for development schema changes. Post-merge
must apply those migrations non-interactively and fail closed; do not restore a
forced schema-push workflow. Production schema changes remain owned by Replit's
reviewed Publish flow rather than application startup or deployment scripts.

**Why:** Forced schema pushes can make destructive or ambiguous changes without
a reviewed SQL artifact or dependable rollback point. Replit separately reviews
and applies the development-to-production diff during Publish.

**How to apply:** Generate and review a migration with every schema change,
prefer additive forward changes, and verify migration failure stops setup. Use
development checkpoints and production point-in-time restore for data recovery.