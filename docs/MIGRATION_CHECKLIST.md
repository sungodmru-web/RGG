# RGG Replit → Hostinger migration checklist

This checklist is intentionally non-destructive. Do not shut down Replit,
delete the source database/storage, or change DNS while preparation is
incomplete.

## Repository and secrets

- [ ] Private Git repository created
- [ ] `.gitignore` reviewed for env files, dumps, keys, private exports,
      uploads, and logs
- [ ] Secret scan completed on working tree and Git history
- [ ] No populated `.env`, database dump, private key, token, or signed URL is
      tracked
- [ ] `.agents/agent_assets_metadata.toml` reviewed for private infrastructure
      metadata before any external repository push
- [ ] `.env.example` reviewed; it contains names/descriptions only

## Runtime and application

- [ ] Node 22 LTS and npm 10.x available
- [ ] `npm ci` succeeds from the checked-in `package-lock.json`
- [ ] `npm run typecheck:hostinger` succeeds
- [ ] `npm run build` succeeds with temporary deployment variables
- [ ] API start command succeeds on the assigned Hostinger port
- [ ] Static frontend is served with SPA fallback
- [ ] Direct refresh works for `/`, `/book`, `/publications`,
      `/publications/example-slug`, `/technical-assistance`, `/authors`,
      `/endorsements`, and `/admin`
- [ ] Health and readiness responses are sanitized and monitored
- [ ] SIGTERM/SIGINT shutdown is graceful

## Database

- [ ] Destination is PostgreSQL, not MySQL
- [ ] Source `pg_dump --format=custom` backup stored outside Git
- [ ] Destination database created with SSL configured
- [ ] Backup restored to the destination
- [ ] Drizzle migration journal and schema verified
- [ ] Migration drift check passes
- [ ] Migration rebuild check passes in an isolated test database
- [ ] Counts compared before/after for publications, published/draft/archived
      publications, themes, endorsements, approved endorsements, media, and
      enquiries
- [ ] Representative records checked, including nullable metadata and dates

## Media and storage

- [ ] Destination S3-compatible bucket created
- [ ] Private object policy and signed PUT/GET behavior verified
- [ ] Media manifest generated outside Git
- [ ] PDFs migrated and opened successfully
- [ ] Featured images migrated and rendered
- [ ] Endorsement portraits migrated and rendered
- [ ] Database storage keys point to destination objects
- [ ] Draft/private objects are not publicly enumerable
- [ ] Published visibility matches intended application behavior
- [ ] No media bytes were placed in PostgreSQL or the application repository

## Environment, auth, and email

- [ ] Production Clerk instance selected
- [ ] Temporary and final Clerk origins/callbacks configured
- [ ] `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` match production
- [ ] `APP_ORIGIN`/`APP_ORIGINS` contain only reviewed HTTPS origins
- [ ] `CSRF_SECRET` is a unique production secret
- [ ] Resend verified sender configured
- [ ] Resend API key is server-only
- [ ] Enquiry delivered to Sunny and configured administrator recipient
- [ ] CC delivered to `sweenmru@gmail.com`
- [ ] Reply-To is the visitor's validated email
- [ ] Better Stack ingestion is configured without exposing its source token

## Functional validation at 390 / 768 / 1440px

- [ ] Homepage
- [ ] English/French interface
- [ ] Book page and 360° English cover
- [ ] 360° French cover
- [ ] Front/spine/back textures
- [ ] Drag/swipe, keyboard controls, reduced motion, lazy loading, and WebGL
      fallback
- [ ] Publications list and detail
- [ ] Technical Assistance form
- [ ] Authors and endorsements
- [ ] Enquiry form
- [ ] Navigation and SEO metadata

## Admin and security validation

- [ ] Anonymous admin API returns 401
- [ ] Authenticated non-admin returns 403
- [ ] Approved administrator can sign in
- [ ] Dashboard loads
- [ ] Create/save draft article
- [ ] Upload PDF and image
- [ ] Private preview works
- [ ] Publish, archive, and permanent-delete guard work
- [ ] Draft and archived publications are absent from public routes
- [ ] Create endorsement, upload portrait, verify, and approve
- [ ] Draft endorsements are absent from public routes
- [ ] Media library works
- [ ] CSRF rejects missing/invalid mutation tokens
- [ ] Upload MIME, size, and filename validation works
- [ ] Rate limits and security alerts work

## Temporary deployment and cutover

- [ ] Temporary Hostinger URL passes every test above
- [ ] No Replit data/storage/deployment was modified
- [ ] Monitoring is active
- [ ] Rollback to Replit is tested/documented
- [ ] DNS TTL lowered only before approved cutover
- [ ] Website records switched only after owner approval
- [ ] MX, mail routing, nameservers, and unrelated records left unchanged
- [ ] SSL certificate works on the final domain
- [ ] Post-cutover smoke test passes
- [ ] Replit remains available as rollback
- [ ] Replit retirement explicitly approved