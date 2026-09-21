# RGG Hostinger deployment runbook

This is a preparation document for **Reclaiming the Green Gold**. It does not
perform a deployment, DNS change, database restore, or media transfer. Keep the
working Replit deployment, database, storage, and DNS as the rollback until the
owner explicitly approves retirement.

## Current application facts

- Monorepo package manager: pnpm (the root `preinstall` rejects npm and yarn).
- Frontend: React 19, Vite 7, TypeScript, Tailwind, Wouter, Three.js/R3F.
- API: Express 5, Drizzle, PostgreSQL, Clerk.
- Current Replit deployments retain App Storage through the GCS/Replit sidecar.
  Hostinger selects the implemented S3-compatible adapter with
  `OBJECT_STORAGE_PROVIDER=s3`; never use ephemeral application storage.
- Enquiry delivery uses direct Resend HTTP when `RESEND_API_KEY` is configured,
  while retaining the current Replit connector as the rollback path.
- The database has PostgreSQL/Drizzle migrations and must remain PostgreSQL.

## Required Hostinger architecture

Use a Hostinger Node.js application for the unified Express API and Vite static
build, plus managed PostgreSQL and S3-compatible object storage. The root start
command serves `artifacts/rgg-website/dist/public`, preserves `/api/*`, and
returns `index.html` for direct requests to public and admin SPA routes.

Hostinger requirements:

1. Node.js 22 LTS (the workspace is verified with Node 22.22.0; Vite 7
   requires Node 20.19+ or 22.12+).
2. pnpm 10.26.1, or Corepack with the repository's approved pnpm version.
3. A long-running Node process for Express, not a short-lived shared-PHP task.
4. TLS/HTTPS and configurable reverse-proxy headers.
5. External managed PostgreSQL with SSL support.
6. Persistent S3-compatible object storage with private objects and signed
   GET/PUT URLs.

## Exact commands

Run from the repository root:

```sh
npx --yes pnpm@10.26.1 install --frozen-lockfile

# Build the production API and frontend.
PORT=4173 BASE_PATH=/ \
PUBLIC_SITE_URL=https://YOUR_FINAL_DOMAIN \
PUBLICATIONS_API_URL=https://YOUR_API_ORIGIN/api/publications \
npx --yes pnpm@10.26.1 run build
```

Do not use `pnpm@latest`, `corepack use pnpm@latest`, or an unpinned package
manager install command. The repository's `packageManager` and `engines.pnpm`
fields both require pnpm 10.26.1, matching the checked-in lockfile.
The `npx` command invokes pnpm directly at the required version and bypasses
Hostinger's Corepack resolver. It does not add npm metadata or create
`package-lock.json`.

Pinned Corepack remains an equivalent alternative on hosts where Corepack is
working correctly:

```sh
corepack pnpm@10.26.1 install --frozen-lockfile
```

Do not run `corepack enable` on a managed runtime with a read-only global binary
directory; it may fail while attempting to create a global pnpm shim.

The root build typechecks the workspace and builds the production API and
frontend. The optional `pnpm run build:all` command also builds the Replit
mockup sandbox, which is not part of the Hostinger production process. Start
the unified production process with:

```sh
PORT=3000 npx --yes pnpm@10.26.1 start
```

Hostinger should proxy HTTPS traffic to that assigned port. `vite preview` is
for local verification only and is not the production process.

Repository verification commands:

```sh
pnpm test
pnpm migration:check
pnpm migration:rebuild-check
pnpm migration:baseline
pnpm audit:env
pnpm report:assets
```

## Environment variables

Copy `.env.example` to the deployment secret/configuration store and populate
names according to the classification there. Never commit the populated file.

Required:

- `DATABASE_URL`
- `PORT`, `NODE_ENV`
- `CSRF_SECRET`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `APP_ORIGIN`, `APP_ORIGINS`
- `PUBLIC_SITE_URL`, `PUBLICATIONS_API_URL`
- `TRUST_PROXY_HOPS` (`STATIC_DIR` is optional because the server defaults to
  `artifacts/rgg-website/dist/public`)
- `OBJECT_STORAGE_PROVIDER=s3`
- `PRIVATE_OBJECT_DIR` plus the selected S3 provider's server-only endpoint,
  bucket, region, access key, and secret key
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`, `EMAIL_CC`

Optional operational values include upload limits, `LOG_LEVEL`, Better Stack
ingestion settings, and the safe one-shot Better Stack test flag. Do not set
`REPLIT_*` values on Hostinger except temporarily if an explicitly reviewed
compatibility path still requires them.

## Clerk production configuration

Create/select the production Clerk instance and configure the final domain and
temporary Hostinger domain as allowed origins and redirect/callback URLs.
Use the matching production publishable and secret keys. Test `/admin` with an
approved administrator account, then test that anonymous requests receive
401 and authenticated non-administrators receive 403. Keep authorization on
the server; do not replace it with a password or frontend-only guard.

## Resend configuration

Verify the sending domain and use a domain mailbox for `EMAIL_FROM`. Preserve
the current delivery policy:

- To: `sunny@reclaimingthegreengold.com`
- Also configured administrator recipient:
  `soobaschand@reclaimingthegreengold.com`
- CC: `sweenmru@gmail.com`
- Reply-To: the validated visitor email

Send a test enquiry only on the temporary deployment and confirm all delivery
and reply-to requirements before cutover. Do not change MX records to test web
email delivery.

## Temporary-domain validation

Before any DNS change, test the temporary Hostinger URL at 390, 768, and
1440px:

- `/`, `/book`, `/publications`, a publication detail route,
  `/technical-assistance`, `/authors`, `/endorsements`, and `/admin`
- English/French interface and English/French 360-degree hardcover covers
- 360 front/spine/back textures, drag/swipe controls, reduced-motion behavior,
  lazy loading, and WebGL fallback
- publication list/detail, draft privacy, PDF/image uploads, preview, publish,
  archive, and permanent-delete guard
- endorsement creation, portrait upload, verification, approval, and public
  visibility
- enquiry submission and email delivery
- health/readiness endpoints, CSRF rejection, upload validation, rate limits,
  and private object non-enumerability
- direct browser refresh on every SPA route (must not return a Hostinger 404)

## Database and media sequence

1. Create the destination PostgreSQL database.
2. Take a source `pg_dump` backup without putting it in Git.
3. Restore into the destination and verify migration state.
4. Compare counts and representative records.
5. Export the media manifest and copy objects to the destination bucket.
6. Verify each media reference, size/MIME, and private/public visibility.
7. Configure Clerk, Resend, object storage, and application variables.
8. Run the full temporary-domain validation above.
9. Keep Replit available while monitoring.
10. Only after owner approval, perform website-only DNS cutover.

## DNS cutover and rollback

Reduce the website-record TTL before the approved cutover. Change only the
records required for the website. Do **not** change MX, mail routing,
nameservers, or unrelated records; the RGG email service must remain
uninterrupted.

If Hostinger fails after cutover, restore the prior website DNS target to the
known-good Replit deployment, without deleting the Hostinger database or
storage. Keep Replit live until the owner approves retirement.

## Resource guidance

The build is TypeScript/Vite plus an API bundle and requires Node build memory
and disk for pnpm dependencies, generated assets, and the 3D bundle. Start
with a Node plan that provides a long-running process and at least 2 GB RAM
during builds; use CI or a build-capable deployment runner if Hostinger's
runtime is smaller. Runtime storage must not be the media store. Budget
persistent PostgreSQL and object-storage capacity from the actual database and
media inventory rather than guessing.

## Owner actions

1. Select a Hostinger Node-capable plan and temporary hostname.
2. Create private Git hosting and connect it to Hostinger.
3. Provision external managed PostgreSQL and S3-compatible storage.
4. Configure production Clerk origins and Resend verified sender.
5. Add environment variables without committing them.
6. Run the backup, restore, media transfer, and count verification.
7. Complete temporary-domain validation and email testing.
8. Approve website DNS cutover; leave MX unchanged.
9. Keep Replit as rollback until stability is confirmed.
