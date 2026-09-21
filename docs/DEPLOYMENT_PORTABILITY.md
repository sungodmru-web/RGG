# RGG deployment portability

## Portability target

RGG should run on any Node-compatible provider that can run a long-lived
Express process, serve a Vite static build with SPA fallback, connect securely
to PostgreSQL, and use persistent object storage. The product architecture
remains React/Vite + Express + Drizzle/PostgreSQL; migration is not a reason to
rewrite the application or convert PostgreSQL to MySQL.

## Provider boundaries

| Concern | Current implementation | Portable target |
| --- | --- | --- |
| Web | Vite output in `artifacts/rgg-website/dist` | Any static host/CDN with SPA fallback |
| API | Express in `artifacts/api-server` | Any Node 24 LTS process manager |
| Data | Drizzle + `pg` + PostgreSQL | External managed PostgreSQL over SSL |
| Migrations | `lib/db/drizzle` | Preserve ordered Drizzle SQL and journal |
| Auth | Clerk Express/React | Clerk production instance and configured origins |
| Uploads | Replit App Storage/GCS sidecar | S3-compatible private object storage adapter |
| Email | Replit connector proxy to Resend | Direct Resend API with server-only key |
| Monitoring | Pino and optional Better Stack | Provider-neutral logs plus Better Stack ingestion |

Storage and email now select portable S3-compatible and direct Resend paths
through environment configuration while retaining the existing Replit paths
for rollback. Validate the portable paths on the temporary deployment before
cutover.

## Required runtime contract

```text
Node: 24 LTS (verified locally with 24.13.0)
pnpm: 10.26.1
Install: corepack enable && corepack prepare pnpm@10.26.1 --activate
         pnpm install --frozen-lockfile
Build:   PORT=4173 BASE_PATH=/ PUBLIC_SITE_URL=... PUBLICATIONS_API_URL=... pnpm run build
Start:   PORT=3000 pnpm start
```

The production build currently requires `PORT` and `BASE_PATH`, and uses
`PUBLIC_SITE_URL`/`PUBLICATIONS_API_URL` for generated metadata and publication
content.
Do not use the development fallback origin in a production build.

## Database portability

`lib/db/src/schema` contains these tables:

- `publications`
- `themes`
- `endorsements`
- `media`
- `enquiries`
- `administrators`
- `admin_activity`
- `admin_rate_limits`
- `admin_security_alerts`

Keep all migration files and `lib/db/drizzle/meta` history. Use
`DATABASE_URL`; never commit it. PostgreSQL TLS options should be provided by
the provider connection string or the eventual adapter without disabling
certificate verification globally.

Safe source backup. Configure `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`,
`PGSSLMODE=verify-full`, and `PGSSLROOTCERT` outside the repository. Store the
password in a permission-restricted `.pgpass` file rather than a command
argument or shell history:

```sh
pg_dump --format=custom \
  --file=./outside-repository/rgg-$(date +%Y%m%d).dump \
  --dbname="$PGDATABASE"
```

Safe destination restore, after selecting the destination through the same
`PG*` variables and creating a new empty database:

```sh
createdb "$PGDATABASE"
pg_restore --exit-on-error --clean --if-exists --dbname="$PGDATABASE" \
  ./outside-repository/rgg-YYYYMMDD.dump
```

Run these only against explicitly selected source/destination databases.
Never place the dump in Git, and never run `--clean` against the live source.
Then run the repository's migration drift/rebuild checks and compare counts
for publications by status, themes, endorsements by status, media, and
enquiries.

## Storage portability and privacy

The `media` table stores metadata and a `storageKey`; it does not store file
bytes. Current private object paths are under `/objects/` and responses use
private caching. The S3-compatible adapter supports:

- private PUT and GET signed URLs
- metadata lookup (MIME, size, key)
- delete
- existence checks
- stable provider-neutral storage keys

Unpublished publication PDFs and private uploads must remain private and must
not be enumerable by prefix. Published delivery may be public only where the
application explicitly intends it. Use
`scripts/hostinger-media-manifest.example.json` as the migration row format.
The actual manifest must be generated outside the repository and must not
contain signed URLs.

## Authentication, origin, and proxy contract

Clerk remains the identity provider. The API must continue to enforce
administrator authorization and CSRF on mutations. Configure
`APP_ORIGIN`/`APP_ORIGINS` for the temporary domain, final domain, and Replit
rollback origin without wildcard CORS. The reverse proxy must preserve HTTPS
protocol handling and client IP behavior only to the degree required by the
actual Hostinger topology.

## Email portability

Default enquiry recipients are defined in
`artifacts/api-server/src/lib/administratorEmails.ts`. Hostinger can configure
the direct Resend adapter through `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`,
and `EMAIL_CC`; visitor Reply-To remains the validated enquiry address. Do not
put the API key in Vite variables or browser code.

## Health, shutdown, and operations

Monitor a process health endpoint and a database-aware readiness endpoint
without returning credentials or SQL details. The Node process should stop
accepting connections, drain requests, close the PostgreSQL pool, and then
exit on SIGTERM/SIGINT. Logs must exclude passwords, cookies, authorization
headers, database URLs, and provider credentials.

## Portability verification

Use the static inventory and environment audit scripts:

```sh
node scripts/hostinger-env-audit.mjs
node scripts/hostinger-static-inventory.mjs artifacts/rgg-website/dist
```

Review every generated asset, especially English/French front/spine/back
textures, fallback covers, welcome media, author imagery, fonts, and SEO
files. Repeat the 390/768/1440 route, admin, security, upload, email, and
mobile checks in `docs/HOSTINGER_DEPLOYMENT.md`.

The root package exposes `pnpm test`, `pnpm migration:check`,
`pnpm migration:rebuild-check`, `pnpm migration:baseline`, `pnpm audit:env`,
and `pnpm report:assets` for repeatable verification.
