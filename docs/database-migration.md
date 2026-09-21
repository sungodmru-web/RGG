# RGG PostgreSQL migration runbook

This runbook prepares a non-destructive migration from the current Replit
deployment to another PostgreSQL provider. It does not change DNS, connect to
production, create a dump, restore data, delete the existing database, or
rewrite Drizzle migration history.

## Database and migration inventory

The schema source of truth is `lib/db/src/schema/index.ts`. The checked-in
Drizzle history currently contains migrations `0000` through `0008` under
`lib/db/drizzle`, plus Drizzle's migration bookkeeping table
`__drizzle_migrations` in a deployed database.

Application tables:

| Table | Columns and constraints |
| --- | --- |
| `publications` | `id` UUID primary key; `slug` unique not null; `title`, `abstract` not null; `subtitle`, `category`, `publication_date`, `reading_time`, `featured_image`, `pdf_url`, `external_url`, `doi`, `content`, `seo_title`, `seo_description`, `created_by`, `published_by`, `published_at`, `archived_by`, `archived_at`, `theme_id`, `featured_image_media_id`, `pdf_media_id`, `updated_by` nullable; `publication_type` enum (`research-paper`, `policy-brief`, `article`, `commentary`, `report`, `case-study`); `authors` JSONB not null; `featured` boolean not null default false; `status` enum (`draft`, `published`, `archived`) not null default `draft`; `created_at`, `updated_at` timestamptz not null; `language` enum (`english`, `french`, `bilingual`) not null default `english`; check requiring `publication_date` when status is `published`. |
| `themes` | `id` UUID primary key; `name` and `slug` unique not null; `english_label`, `french_label` not null; `description` nullable; `display_order` integer not null default 0; `active` boolean not null default true; `created_at`, `updated_at` timestamptz not null. |
| `endorsements` | `id` UUID primary key; `name`, `quote` not null; `title`, `organization`, `photo_url`, `source_url`, `verification_note`, `photo_media_id`, `created_by`, `updated_by`, `approved_by`, `approved_at` nullable; `status` enum (`draft`, `approved`, `archived`) not null default `draft`; `display_order` integer not null default 0; `created_at`, `updated_at` timestamptz not null; `language` enum (`english`, `french`, `bilingual`) not null default `english`; `verified` boolean not null default false; `photo_media_id` references `media.id` with `ON DELETE SET NULL`. |
| `media` | `id` UUID primary key; `storage_key` unique not null; `original_filename`, `mime_type`, `file_size`, `uploaded_by` not null; `media_type` enum (`pdf`, `image`) not null; `purpose` enum (`publication-pdf`, `publication-image`, `endorsement-portrait`, `general`) not null default `general`; `created_at` timestamptz not null. |
| `enquiries` | `id` UUID primary key; `name`, `email`, `enquiry_type`, `subject`, `message`, `language` not null; `organization`, `provider_id`, `provider_error`, `delivery_attempted_at` nullable; `review_status` enum (`new`, `in_progress`, `resolved`) not null default `new`; `delivery_status` enum (`pending`, `sent`, `failed`) not null default `pending`; `created_at`, `updated_at` timestamptz not null. |
| `administrators` | `id` UUID primary key; `name` unique not null; `clerk_user_id` unique nullable; `active` boolean not null default true; `created_at`, `updated_at` timestamptz not null. |
| `admin_activity` | `id` UUID primary key; `action`, `administrator_id` not null; `entity`, `entity_id` nullable; `created_at` timestamptz not null. |
| `admin_rate_limits` | `key` text primary key; `count` integer not null; `reset_at` timestamptz not null; index on `reset_at`. |
| `admin_security_alerts` | `event_type` text primary key; `event_timestamps` timestamptz array not null; `last_alert_at` nullable; `updated_at` timestamptz not null; index on `updated_at`. |

## Migration-history checks

Run these against a development or disposable PostgreSQL database before
cutover. They do not alter checked-in files:

```bash
pnpm --filter @workspace/db run migration:check
pnpm --filter @workspace/db run migration:rebuild-check
pnpm --filter @workspace/scripts run test:migration-baseline
pnpm --filter @workspace/db run record-counts:test
```

`migration:check` compares generated migrations with the checked-in journal.
`migration:rebuild-check` rebuilds disposable databases and compares their
schema. Never edit `meta/_journal.json` or an already-applied migration to
make a check pass. Add a reviewed forward migration instead.

## Read-only record-count verification

The `record-counts` script executes one aggregate `SELECT` and prints only
counts for publications (total and each status), themes, endorsements (total
and approved), media, and enquiries:

```bash
pnpm --filter @workspace/db run record-counts
```

Configure PostgreSQL using the process environment, not command-line
arguments. The script never accepts a connection string argument, never writes
a file, never prints connection details, and closes its pool after the query.
The PostgreSQL command-line tools use `PGSSLMODE=verify-full` and
`PGSSLROOTCERT=/path/outside/repository/ca.crt`. The Node verifier uses
`DATABASE_SSL=true` and, when the provider uses a private CA, the certificate
text in server-only `DATABASE_SSL_CA`. Explicit Node TLS settings take
precedence over conflicting `sslmode` parameters in `DATABASE_URL` and always
set `rejectUnauthorized: true`.

Run it once before export and once after restore. Save the JSON output outside
the repository as migration evidence and compare:

- publication total, draft, published, and archived counts;
- theme count;
- endorsement total and approved count;
- media count;
- enquiry count.

The verifier is intentionally not a substitute for spot-checking representative
records and validating media bytes and visibility.

## Full backup (owner-operated, no credentials in arguments)

Do this only after the owner selects the source database and confirms a backup
location outside this repository. Do not use `DATABASE_URL` directly as a
`pg_dump` argument because connection strings can appear in process listings.

1. Create a private `~/.pgpass` entry with mode `0600`, or use the provider's
   supported secret-injection mechanism. Keep it outside the repository.
2. Export `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, `PGSSLMODE=verify-full`,
   and `PGSSLROOTCERT` in the shell environment. Do not put passwords in shell
   history or scripts.
3. Choose an absolute backup path outside the repository:

```bash
umask 077
export BACKUP_FILE=/secure/migration/rgg-$(date -u +%Y%m%dT%H%M%SZ).dump
pg_dump \
  --format=custom \
  --file="$BACKUP_FILE" \
  --no-owner \
  --no-privileges \
  --verbose \
  --dbname="$PGDATABASE"
```

4. Record the SHA-256 checksum and store it separately from the dump:

```bash
sha256sum "$BACKUP_FILE" > "$BACKUP_FILE.sha256"
```

The custom-format dump contains schema and data. Protect both files as
confidential migration material. Never commit them or place them under
`attached_assets`, `uploads`, or the project directory.

## Restore to the future PostgreSQL provider

Restore only into a newly created, empty destination database. Do not restore
over the current Replit database.

1. Configure destination `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`,
   `PGSSLMODE=verify-full`, and `PGSSLROOTCERT` using the destination provider's
   verified certificate. For the Node record-count verifier, provide the same
   certificate text through server-only `DATABASE_SSL_CA`.
2. Verify the checksum outside the repository.
3. Restore schema and data:

```bash
pg_restore \
  --exit-on-error \
  --no-owner \
  --no-privileges \
  --dbname="$PGDATABASE" \
  "$BACKUP_FILE"
```

4. Run the read-only record-count verifier against the destination.
5. Compare counts and spot-check representative publications, themes,
   endorsements, media records, and enquiries.
6. Confirm Drizzle's migration bookkeeping table exists and contains the same
   applied migration history as the source. Do not mark migrations as applied
   manually and do not rerun old migrations against the restored database.
7. If the destination is missing a reviewed migration, run the normal
   `migration:migrate` process against the destination only after the owner
   reviews the SQL and the backup is verified.

## Cutover and rollback sequence

Keep the current Replit application, database, storage, and DNS unchanged while
the destination is validated. The safe sequence is:

1. Back up the source and capture pre-migration counts.
2. Restore into a new PostgreSQL destination.
3. Validate migration history, counts, representative records, and media.
4. Configure the application against the destination in a temporary deployment.
5. Test public routes, admin authorization, uploads, private drafts, enquiries,
   English/French UI, and mobile layouts.
6. Only after owner approval, perform a separate DNS cutover.
7. Keep the Replit deployment available as rollback until the new deployment is
   stable. If rollback is needed, point only the website records back; do not
   casually change MX or email records.

No step in this document changes DNS, production data, storage, or deployment.