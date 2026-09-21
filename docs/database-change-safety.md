# Database change safety

## Versioned changes

`lib/db/src/schema` is the schema source of truth. Every schema change must include
a generated SQL migration under `lib/db/drizzle`:

```bash
pnpm --filter @workspace/db run migration:generate
```

Review the SQL for data loss, table locks, unsafe defaults, and backward
compatibility before committing it. Do not hand-edit the migration journal or
run `drizzle-kit push --force`.

Before merge, validate that the checked-in migration metadata still represents
the schema:

```bash
pnpm --filter @workspace/db run migration:check
pnpm --filter @workspace/db run migration:rebuild-check
pnpm --filter @workspace/scripts run test:migration-baseline
```

This check generates into a temporary directory, compares the result with
`lib/db/drizzle`, and fails when a schema change is missing its migration. It
does not modify tracked files. If it fails, run `migration:generate`, review the
SQL and metadata, and commit them with the schema change.

The rebuild check creates disposable PostgreSQL databases, applies every
checked-in migration in journal order, and compares the resulting structure
with a database materialized directly from the current Drizzle schema. It drops
both databases on success or failure. A mismatch means the migration history
cannot reproduce the schema and must be corrected with a new reviewed migration.

The migration baseline check creates fresh and legacy disposable databases,
upgrades both through the checked-in migration history, and verifies that every
legacy publication value survives unchanged except for the intentional
`is_published` to `status` transformation. Its fixture covers populated and
nullable fields for published and draft records. It also compares every legacy
endorsement value, including nullable attribution, link, and photo fields,
ordering, timestamps, and moderation status. The check verifies the
published-date constraint and drops both databases on success or failure.

After a merge, `scripts/post-merge.sh` applies pending migrations to the
development database. Drizzle records completed migrations, so rerunning setup
does not reapply them. The script exits immediately if installation or migration
fails; workflow reconciliation must not be treated as evidence that a failed
migration succeeded.

## Backup and rollback

Before approving a destructive or data-rewriting migration:

1. Take a Replit checkpoint that includes the development database.
2. Verify that the backup predates the migration and identify the checkpoint to
   restore.
3. Prefer a forward-compatible migration (add, backfill, switch reads, then
   remove later) over an immediate destructive change.

If a development migration fails, stop and inspect the migration error. Do not
force-push the schema or edit Drizzle's migration history to claim success.
Restore the pre-migration checkpoint when a failed migration made partial or
incorrect data changes; otherwise, add a new corrective migration. Never rewrite
a migration that may already have run in another environment.

## Production deployment

Application startup and deployment build commands must not run database DDL.
Production schema changes use Replit's Publish flow, which compares development
and production, validates the SQL diff, and asks for confirmation of ambiguous
renames or destructive changes.

Before publishing a destructive production change, review the generated diff
and confirm the point-in-time recovery plan. If the production schema step
fails, the release must be considered failed: inspect the deployment logs, test
the correction in development or a deployment preview, and publish again. Do
not bypass the failure with a startup script, direct production DDL, or a forced
schema push.

For a completed change that must be reversed, use production point-in-time
restore when data restoration is required, or publish a reviewed forward
migration when it is not. A database restore does not restore application code;
roll the code back to the matching checkpoint before publishing again when both
must move together.