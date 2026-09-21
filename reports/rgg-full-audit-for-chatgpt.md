# Reclaiming the Green Gold — Full Audit for ChatGPT

## Audit metadata

- **Original audit date:** 13 September 2026
- **Status refreshed:** 14 September 2026 after the mobile book-gesture merge and removal of explicit Mauritius references
- **System audited:** Reclaiming the Green Gold public website, Express API, PostgreSQL schema and migrations, Clerk-protected editorial area, build pipeline, SEO, accessibility, bilingual UX, performance, and deployment readiness
- **Methods:** workspace typechecking and builds, all registered automated tests, migration drift/rebuild checks, migration baseline test, dependency/SAST/privacy scanners, architecture review, static frontend review, direct HTTP checks, and browser testing at desktop and mobile sizes
- **Change policy:** read-only audit. No application or database records were modified.

## Executive verdict

**Conditional no-go for a public production launch until the high-priority items below are addressed.**

The platform has strong foundations: exact server-side Clerk role enforcement, safe signed-out behavior, good publication-state protections, bilingual public UI, responsive layouts, explicit WebGL fallback, and 97 passing automated tests. No critical access-control bypass, exposed secret, SAST finding, or privacy-dataflow finding was detected.

The main launch blockers are operational and discoverability-related rather than a demonstrated live compromise:

1. The dependency scanner reports 45 advisories, including 11 critical and 18 high. The most severe findings are primarily in development, build, test, and OpenAPI code-generation paths, which reduces direct production exposure but still requires prompt patching.
2. Public pages are client-rendered only. Crawlers and social scrapers receive generic homepage HTML rather than route-specific content.
3. The robots file points to an unrelated/stale domain, while sitemap.xml is absent and returns the SPA HTML fallback.
4. A migration regression test currently exits unsuccessfully, so upgrades over existing publication records are not fully protected by that test.
5. The health endpoint returns success without checking PostgreSQL readiness.
6. Public assets total 36.13 MB, and the welcome video plus large hero images create a significant first-load cost.

## Scorecard

| Area | Score | Summary |
|---|---:|---|
| Security | 6/10 | Strong auth boundaries and zero SAST/privacy findings, but urgent build-tool dependency advisories remain. |
| Reliability | 6/10 | Tests and migration drift/rebuild gates pass; readiness and one migration regression test need work. |
| Data integrity | 7/10 | Good transaction, slug, date, visibility, and rate-limit protections; some invariants remain application-only. |
| Performance | 4/10 | Heavy video, PNG assets, and JavaScript bundles create avoidable first-load cost. |
| SEO | 3/10 | Good client-side metadata abstraction, but no SSR/prerender, valid sitemap, or initial route metadata. |
| Accessibility | 7/10 | Strong navigation, focus styling, reduced motion, and alt text; welcome-dialog focus behavior needs correction. |
| Bilingual UX | 8/10 | English/French switching and html lang updates work; French has no crawlable URL strategy. |
| Maintainability | 6/10 | Clear modules and tests, but API contract coverage and package isolation are incomplete. |
| Deployment readiness | 5/10 | Builds can pass and migrations are controlled, but default build, readiness, crawler files, and dependency patching need attention. |

## Verified strengths

### Authentication and administrator security

- Exact server-side authorization checks Clerk publicMetadata.role === admin.
- Signed-out GET /api/admin/publications returns HTTP 401 with a safe Authentication required response.
- Non-administrator and malformed administrator routes are denied before publication database access.
- CSRF handling, trusted-origin checks, request-body limits, safe 500 envelopes, and administrator attack limiting are implemented and tested.
- Public publication queries exclude draft and archived records.
- No serious access-control bypass or secret exposure was identified by the architecture review.

### Database and migration discipline

- migration:check passes: checked-in migrations and the Drizzle schema are synchronized.
- migration:rebuild-check passes: migration history rebuilds a database matching the current schema.
- scripts/post-merge.test.sh passes, including migration-failure propagation.
- Publication slug and published-date constraints are present.
- Shared PostgreSQL-backed administrator rate limiting is tested for atomic behavior.

### Testing and engineering quality

- **97 automated tests pass.**
  - API: 67 tests across 4 files.
  - Website: 30 tests across 12 files.
- TypeScript passes across libraries, API, website, mockup artifact, and scripts.
- A full workspace build succeeds when required mockup environment values are supplied.
- SAST scanner: 0 findings.
- HoundDog privacy/dataflow scanner: 0 findings.

### Public UX and accessibility

- English and French selections update the site and document html lang correctly.
- Internal navigation does not replay the welcome gate.
- Mobile navigation uses dialog semantics, Escape handling, focus trapping, inert background behavior, and focus restoration.
- Public pages use a skip link and visible global focus treatment.
- Reduced-motion support exists for global animations, the welcome gate, and the 3D book.
- Decorative hero backgrounds use empty alt text; meaningful covers and author portraits use localized alt text.
- The 3D book has an explicit static fallback when WebGL is unavailable.
- Browser testing found no horizontal overflow in inspected desktop and 390-pixel mobile states.
- Contact-form required-field validation works without sending data.
- Unknown routes render a proper 404 page.

## Prioritized findings

## Critical scanner severity, exposure-limited

### SEC-01 — Patch vulnerable development and code-generation dependencies

**Status:** Confirmed by dependency scanner. Scanner severity is critical/high, but direct deployed-app exploitability was not demonstrated.

**Evidence:**

- 45 dependency advisories: 11 critical, 18 high, 12 moderate, 4 low.
- Orval 8.9.1 is a devDependency in lib/api-spec/package.json. Several code-generation injection advisories are fixed in 8.21.0 or 8.22.0 depending on the advisory.
- Vite 7.3.3 advisories include a fix in 7.3.5.
- PostCSS 8.5.14 advisories include a fix in 8.5.18.
- Transitive high findings include fast-uri, js-yaml, brace-expansion, browserslist, and linkify-it.
- pnpm why shows these paths are primarily OpenAPI codegen, build, documentation, and test dependencies.

**Impact:** A malicious OpenAPI/schema/build input or compromised development chain could exploit code-generation or parser weaknesses. Normal RGG operation uses project-controlled specifications, so this is not evidence of a remotely exploitable production endpoint.

**Remediation:**

1. Upgrade Orval to at least the highest fixed version required by all advisories, currently 8.22.0 or newer compatible release.
2. Upgrade Vite to at least 7.3.5 and PostCSS to at least 8.5.18 through the workspace catalog/direct parent packages.
3. Refresh transitive dependencies through compatible direct-parent upgrades.
4. Regenerate clients, run the full 97-test suite, typecheck, build, migration checks, and rescan.
5. Do not bypass package-security controls if an upgrade is blocked.

## High priority

### REL-01 — Repair the existing-record migration regression test

**Status:** Confirmed defect.

**Evidence:** scripts/migration-baseline.test.sh applies migrations and then exits 1. The architecture review found an assertion that assumes exactly one migration while the migration journal now contains three.

**Impact:** The project can verify fresh rebuilds but does not currently prove that existing publication records survive the full migration history unchanged.

**Remediation:** Update the test to validate every journal entry and add an already-migrated database fixture containing representative publication records. Keep this coordinated with the existing task Protect existing publication records when migrations change.

### SEO-01 — Public route content is not present in initial HTML

**Status:** Confirmed architectural limitation.

**Evidence:** artifacts/rgg-website/src/main.tsx uses React createRoot. artifacts/rgg-website/index.html contains an empty root element. Route metadata is applied later by effects in artifacts/rgg-website/src/App.tsx and src/lib/pageMetadata.ts. Direct HTTP responses for /, /book, and /research return the same generic title and no server-rendered H1.

**Impact:** Search engines and social scrapers that do not fully execute JavaScript may see generic homepage metadata and no route content. Research detail pages are especially difficult to discover.

**Remediation:** Prerender or server-render all public routes, including verified published research slugs. Keep admin and auth routes client-side if desired. Produce route-specific title, description, canonical, Open Graph, and language metadata in initial HTML.

### SEO-02 — Sitemap is missing and robots points to the wrong origin

**Status:** Confirmed defect.

**Evidence:** artifacts/rgg-website/public/sitemap.xml does not exist. A request to /sitemap.xml returns HTML with content-type text/html. public/robots.txt points to https://luxury-web-estate.replit.app/sitemap.xml rather than the RGG production origin.

**Impact:** Crawlers receive an invalid sitemap and an unrelated canonical location, reducing route discovery and creating brand/domain confusion.

**Remediation:** Generate an XML sitemap from all indexable public routes and approved published research records. Resolve the actual production URL through deployment configuration rather than hardcoding a development or remembered domain. Exclude admin, sign-in, sign-up, drafts, and archived records. Update robots.txt to the same canonical origin.

### OPS-01 — Health check reports false readiness when PostgreSQL is unavailable

**Status:** Confirmed defect.

**Evidence:** artifacts/api-server/src/routes/health.ts always parses and returns status ok. It performs no database query. Direct /api/healthz returns 200.

**Impact:** A deployment may be marked ready and receive traffic while publication endpoints cannot access PostgreSQL.

**Remediation:** Keep a lightweight liveness endpoint and add a separate readiness endpoint with a bounded SELECT 1 database check and strict timeout. Deployment health checks should use readiness. Do not expose connection details in failures.

### PERF-01 — Public assets are too heavy

**Status:** Confirmed performance risk.

**Measurements:**

- Total public assets: 36.13 MB.
- Welcome MP4: 8.54 MB.
- Official logo: 2.33 MB.
- Hero PNG files: approximately 1.58–2.16 MB each.
- Cover and journal PNG files: approximately 0.98–1.67 MB each.

**Impact:** Slow first visit, higher mobile data usage, delayed LCP, and a longer wait before useful content on constrained connections.

**Remediation:** Convert photographic PNGs to AVIF/WebP, supply responsive srcset and sizes, generate properly sized logo derivatives, compress/re-encode the welcome media, and set explicit caching. Preserve visual quality through screenshot comparison. This overlaps with the existing task Make the public site load faster on first visit.

### PERF-02 — JavaScript is large and route modules are eagerly loaded

**Status:** Confirmed performance risk.

**Measurements:** Main JavaScript is approximately 844 KB uncompressed/242 KB gzip. The lazy 3D chunk is approximately 922 KB/247 KB gzip. CSS is approximately 132 KB/22 KB gzip.

**Evidence:** artifacts/rgg-website/src/App.tsx eagerly imports public pages. WelcomeGate proactively imports the 3D module while the video plays. The welcome video uses preload auto.

**Impact:** More download, parse, and execution work before visitors reach the requested content.

**Remediation:** Add route-level lazy imports; preserve the existing lazy 3D split; reconsider preloading 3D on every landing visit; use poster-first or metadata video preload; and audit unused UI libraries. Measure before/after LCP, INP, CLS, transfer size, and cache behavior.

## Medium priority

### A11Y-01 — Welcome gate lacks complete modal focus management

**Status:** Confirmed static issue; runtime keyboard impact should be verified with assistive technology.

**Evidence:** artifacts/rgg-website/src/components/welcome/WelcomeGate.tsx declares role=dialog but does not implement initial focus, focus trapping, Escape dismissal, or focus restoration.

**Impact:** Keyboard users may move focus into hidden underlying page controls while the full-screen gate is present.

**Remediation:** Use an accessible dialog primitive or implement initial focus, focus trap, Escape behavior, background inertness, and focus restoration. Retain a visible immediate skip path and reduced-motion behavior.

### API-01 — Administrator API contract is incomplete

**Status:** Confirmed maintainability risk.

**Evidence:** The OpenAPI specification omits /admin/session, /admin/csrf, and /admin/logout while artifacts/rgg-website/src/lib/adminApi.ts contains handwritten calls.

**Impact:** Error shapes, security requirements, and clients can drift without generated contract checks.

**Remediation:** Specify all administrator endpoints and error responses, generate a single typed client, and add contract tests for authorization, CSRF, and malformed paths.

### DATA-01 — Single-featured-publication invariant is application-only

**Status:** Confirmed risk.

**Evidence:** The API uses an advisory lock and transactions, but no database partial unique index guarantees only one featured publication.

**Impact:** Direct imports, maintenance scripts, or future services could create multiple featured publications.

**Remediation:** Add a partial unique index for the featured state, with a reviewed migration and existing-data precheck.

### BUILD-01 — Default root build is not self-contained

**Status:** Confirmed developer/CI reliability defect.

**Evidence:** pnpm run build fails because the mockup Vite configuration requires PORT and BASE_PATH. PORT=8081 BASE_PATH=/mockup pnpm run build succeeds.

**Impact:** A clean CI environment or new contributor can receive a failed root build without knowing the required values.

**Remediation:** Give the mockup production build safe explicit defaults or set required values in its package build script. Add a root check command that runs typecheck, tests, migration checks, and builds with deterministic configuration.

### BUILD-02 — Root quality gate omits tests and migration checks

**Status:** Confirmed.

**Evidence:** Root package.json build runs typecheck and package builds only. API tests invoke Vitest from the website node_modules path.

**Impact:** Filtered installs and CI may miss regressions or break package isolation.

**Remediation:** Give the API package its own Vitest dependency. Add a root validation command covering tests, migration drift, migration rebuild, migration-baseline protection, and build.

### API-02 — Unique-constraint error classification is too broad

**Status:** Confirmed risk.

**Evidence:** Publication routing recursively maps any PostgreSQL 23505 unique violation to slug already exists.

**Impact:** A future unrelated unique constraint could return a misleading duplicate-slug response rather than a generic safe server error.

**Remediation:** Match the exact PostgreSQL constraint name. This overlaps with the existing task Keep unexpected database failures from being shown as duplicate links.

### OPS-02 — Security alert delivery and aggregation are incomplete

**Status:** Confirmed operational gap, already tracked.

**Evidence:** Attack alerts currently emit logs. Delivery to an on-call destination and cross-instance threshold aggregation require separate infrastructure.

**Impact:** Distributed attacks may not cross a per-process threshold, and maintainers may not receive actionable notifications.

**Remediation:** Complete the existing tasks Deliver administrator attack alerts to the on-call channel and Keep attack detection accurate across multiple API instances.

### OPS-03 — Graceful shutdown and query timeouts need strengthening

**Status:** Architecture risk.

**Evidence:** The architecture review did not find explicit server shutdown/pool draining or bounded timeouts on general publication queries.

**Impact:** Deploy shutdowns may drop in-flight work, and slow database operations may consume resources longer than intended.

**Remediation:** Add SIGTERM/SIGINT handling, stop accepting requests, drain the pool, and apply bounded statement/request timeouts with safe logging.

### SEO-03 — Social and bilingual search metadata are incomplete

**Status:** Confirmed.

**Evidence:** Initial HTML lacks canonical and social-image tags. og:url starts as /. French metadata and html lang are applied only after hydration. English and French share the same URLs, with no hreflang strategy.

**Impact:** Weak link previews, duplicate-language ambiguity, and limited French search visibility.

**Remediation:** Add absolute og:image, twitter:image, image alt, locale metadata, route-specific canonicals, and a deliberate French URL/hreflang approach if French SEO is required.

## Low priority and manual-review items

### A11Y-02 — Complete rendered accessibility verification

- Run axe and keyboard checks on every rendered route.
- Measure contrast for small gold/muted text, overlays, placeholders, hover/focus states, and disabled controls.
- Confirm ScrollToTop behavior across Safari and older browsers; behavior auto is safer than non-standard instant where compatibility matters.
- Verify 3D rotation announcements with assistive technology. Mobile touch-pan behavior now has merged regression coverage, and the dedicated book visual workflow passes 3/3 tests; automatic enforcement before release remains pending.
- The Clerk sign-in password field produced a browser recommendation for autocomplete=current-password.

### CONTENT-01 — Maintain an approved bilingual terminology glossary

Static review found potential inconsistency between translating the book title as Reconquérir l'Or Vert in some alt strings and leaving Reclaiming the Green Gold as the protected title elsewhere. Decide whether the title is always a proper name and enforce the approved form in UI, metadata, and alt text.

### LEGAL-01 — Confirm claims, legal versioning, and analytics disclosures

- Verify that footer format labels do not imply present availability while the site states that no purchase or license is currently offered.
- Confirm the 2026 copyright, rights owner, and author names. Explicit Mauritius references have been removed from the website.
- Add effective dates/version history to legal pages if required.
- Cookies content describes cookie-free Umami behavior, while analytics code only calls an optional window.umami. Confirm production injection, retention, Do-Not-Track handling, lawful basis, and opt-out behavior before enabling analytics.

### PERF-03 — Remove duplicated font loading

Static review found Google Fonts loaded in both src/index.css and index.html. Consolidate to one strategy and consider self-hosting/subsetting for performance and privacy.

### UX-01 — Administrator signed-out state is slow but correct

Browser testing observed approximately 2.5 seconds of Confirming your session before the correct Sign in to continue state. This is not an authorization failure, but the loading experience could be faster and less ambiguous.

## Browser audit summary

The browser pass inspected /, /book, /framework, /economy, /policymakers, /research, /consultancy, /authors, /about, /contact, /formats, /partnerships, /media, /disclaimer, /cookies, an unknown route, /admin, and /sign-in at desktop and mobile sizes.

Verified:

- English and French selection works.
- French homepage metadata and html lang update correctly after hydration.
- Mobile navigation opens and navigates successfully.
- Internal navigation does not replay the gate.
- No horizontal overflow or broken document images appeared in inspected states.
- Static/WebGL fallback appears when the test browser lacks WebGL.
- Contact validation works without sending.
- Signed-out administrator access resolves to the correct restricted state.
- No JavaScript console errors appeared; recurring warnings were Clerk development-key and Three.js development/deprecation warnings.

Limitations:

- Research detail pages could not be tested because the current public listing contains zero publications.
- No real contact email, account creation, OAuth flow, administrator mutation, or database mutation was performed.
- The browser tester reported the welcome video request as missing, but direct verification returned HTTP 200 video/mp4 with 8,959,119 bytes. Treat the browser observation as a transient development-environment false positive unless production monitoring reproduces it.
- Full-page navigation replaying the gate is intentional. It must not be logged as a defect.
- Development responses included Replit noindex headers; production headers were not checked, so no production conclusion should be drawn from those headers.

## Validation evidence

| Check | Result |
|---|---|
| Workspace TypeScript | Pass |
| Website automated tests | 30/30 pass |
| API automated tests | 67/67 pass |
| Migration drift check | Pass |
| Migration rebuild check | Pass |
| Post-merge setup script tests | Pass |
| Dedicated book visual workflow | Pass: 3/3 Playwright tests |
| Migration baseline existing-record test | Fail |
| Default root build | Fail: missing mockup PORT and BASE_PATH |
| Root build with PORT=8081 and BASE_PATH=/mockup | Pass |
| Dependency audit | 45 advisories: 11 critical, 18 high, 12 moderate, 4 low |
| SAST | 0 findings |
| Privacy/dataflow scan | 0 findings |
| Signed-out admin API | Pass: HTTP 401 |
| Health endpoint | HTTP 200, but database-blind |
| Welcome video direct request | Pass: HTTP 200 video/mp4 |
| sitemap.xml | Fail: HTML fallback, no XML source file |

## Existing task overlap

Do not create duplicate work for these already tracked items:

- Make the public site load faster on first visit.
- Protect existing publication records when migrations change.
- Catch cropped or unreadable book views on smaller screens.
- Catch mobile book gestures that block page scrolling — merged and verified.
- Keep unexpected database failures from being shown as duplicate links.
- Deliver administrator attack alerts to the on-call channel.
- Keep attack detection accurate across multiple API instances.
- Prevent publication facts and evidence labels from drifting again.
- Let editors approve evidence without changing website code.
- Catch flipped or mirrored book artwork before release.
- Run the iPhone book gesture check automatically before release — pending.
- Keep malformed administrator edit links private from non-administrators — in progress.
- Keep authorization-service failures from exposing administrator route details — proposed.

## Recommended remediation sequence

### Now — before production launch

1. Patch Orval, Vite, PostCSS, and affected transitive build dependencies; regenerate and rescan.
2. Fix scripts/migration-baseline.test.sh and verify existing publication preservation.
3. Create a valid production sitemap and correct robots.txt to the actual published origin.
4. Add database-aware readiness and point deployment health checks to it.
5. Make the root build and validation commands deterministic without undocumented environment requirements.

### Next — launch quality

1. Prerender or server-render public routes and research slugs.
2. Optimize the 36.13 MB public asset set and first-load video/3D strategy.
3. Implement complete welcome-dialog focus management.
4. Add complete social, canonical, locale, and hreflang metadata.
5. Complete API contract coverage and package isolation.
6. Add the single-featured-publication database constraint.

### Later — resilience and governance

1. Add graceful shutdown and bounded database query timeouts.
2. Complete rendered axe, screen-reader, contrast, short-landscape, and 320-pixel testing.
3. Standardize bilingual terminology.
4. Complete legal and analytics deployment review.
5. Improve signed-out administrator loading feedback.

## Prompt to give ChatGPT

Copy this report and use the following prompt:

> Act as a senior staff engineer and delivery lead. Turn this audit into a sequenced implementation plan for the Reclaiming the Green Gold project. Preserve the stated product decisions and do not invent facts. For each action, provide: priority, user/business impact, exact known file or module, implementation steps, dependency on existing tasks, risk of breaking behavior, automated verification, manual verification, and rollback strategy. Do not duplicate the existing tasks listed in the audit. Separate security scanner severity from actual deployed exposure. Keep Wouter as the router, Clerk as the only authentication provider, PostgreSQL/Drizzle as the database stack, and English/French public-site parity. Do not reintroduce Mauritius references into the public website. Treat the welcome gate replay on every fresh public load as intentional, and do not report the welcome MP4 as missing unless a new direct HTTP check fails.
# Reclaiming the Green Gold — Full Audit for ChatGPT

## Audit metadata

- **Original audit date:** 13 September 2026
- **Status refreshed:** 14 September 2026 after the mobile book-gesture merge and removal of explicit Mauritius references
- **System audited:** Reclaiming the Green Gold public website, Express API, PostgreSQL schema and migrations, Clerk-protected editorial area, build pipeline, SEO, accessibility, bilingual UX, performance, and deployment readiness
- **Methods:** workspace typechecking and builds, all registered automated tests, migration drift/rebuild checks, migration baseline test, dependency/SAST/privacy scanners, architecture review, static frontend review, direct HTTP checks, and browser testing at desktop and mobile sizes
- **Change policy:** read-only audit. No application or database records were modified.

## Executive verdict

**Conditional no-go for a public production launch until the high-priority items below are addressed.**

The platform has strong foundations: exact server-side Clerk role enforcement, safe signed-out behavior, good publication-state protections, bilingual public UI, responsive layouts, explicit WebGL fallback, and 97 passing automated tests. No critical access-control bypass, exposed secret, SAST finding, or privacy-dataflow finding was detected.

The main launch blockers are operational and discoverability-related rather than a demonstrated live compromise:

1. The dependency scanner reports 45 advisories, including 11 critical and 18 high. The most severe findings are primarily in development, build, test, and OpenAPI code-generation paths, which reduces direct production exposure but still requires prompt patching.
2. Public pages are client-rendered only. Crawlers and social scrapers receive generic homepage HTML rather than route-specific content.
3. The robots file points to an unrelated/stale domain, while sitemap.xml is absent and returns the SPA HTML fallback.
4. A migration regression test currently exits unsuccessfully, so upgrades over existing publication records are not fully protected by that test.
5. The health endpoint returns success without checking PostgreSQL readiness.
6. Public assets total 36.13 MB, and the welcome video plus large hero images create a significant first-load cost.

## Scorecard

| Area | Score | Summary |
|---|---:|---|
| Security | 6/10 | Strong auth boundaries and zero SAST/privacy findings, but urgent build-tool dependency advisories remain. |
| Reliability | 6/10 | Tests and migration drift/rebuild gates pass; readiness and one migration regression test need work. |
| Data integrity | 7/10 | Good transaction, slug, date, visibility, and rate-limit protections; some invariants remain application-only. |
| Performance | 4/10 | Heavy video, PNG assets, and JavaScript bundles create avoidable first-load cost. |
| SEO | 3/10 | Good client-side metadata abstraction, but no SSR/prerender, valid sitemap, or initial route metadata. |
| Accessibility | 7/10 | Strong navigation, focus styling, reduced motion, and alt text; welcome-dialog focus behavior needs correction. |
| Bilingual UX | 8/10 | English/French switching and html lang updates work; French has no crawlable URL strategy. |
| Maintainability | 6/10 | Clear modules and tests, but API contract coverage and package isolation are incomplete. |
| Deployment readiness | 5/10 | Builds can pass and migrations are controlled, but default build, readiness, crawler files, and dependency patching need attention. |

## Verified strengths

### Authentication and administrator security

- Exact server-side authorization checks Clerk publicMetadata.role === admin.
- Signed-out GET /api/admin/publications returns HTTP 401 with a safe Authentication required response.
- Non-administrator and malformed administrator routes are denied before publication database access.
- CSRF handling, trusted-origin checks, request-body limits, safe 500 envelopes, and administrator attack limiting are implemented and tested.
- Public publication queries exclude draft and archived records.
- No serious access-control bypass or secret exposure was identified by the architecture review.

### Database and migration discipline

- migration:check passes: checked-in migrations and the Drizzle schema are synchronized.
- migration:rebuild-check passes: migration history rebuilds a database matching the current schema.
- scripts/post-merge.test.sh passes, including migration-failure propagation.
- Publication slug and published-date constraints are present.
- Shared PostgreSQL-backed administrator rate limiting is tested for atomic behavior.

### Testing and engineering quality

- **97 automated tests pass.**
  - API: 67 tests across 4 files.
  - Website: 30 tests across 12 files.
- TypeScript passes across libraries, API, website, mockup artifact, and scripts.
- A full workspace build succeeds when required mockup environment values are supplied.
- SAST scanner: 0 findings.
- HoundDog privacy/dataflow scanner: 0 findings.

### Public UX and accessibility

- English and French selections update the site and document html lang correctly.
- Internal navigation does not replay the welcome gate.
- Mobile navigation uses dialog semantics, Escape handling, focus trapping, inert background behavior, and focus restoration.
- Public pages use a skip link and visible global focus treatment.
- Reduced-motion support exists for global animations, the welcome gate, and the 3D book.
- Decorative hero backgrounds use empty alt text; meaningful covers and author portraits use localized alt text.
- The 3D book has an explicit static fallback when WebGL is unavailable.
- Browser testing found no horizontal overflow in inspected desktop and 390-pixel mobile states.
- Contact-form required-field validation works without sending data.
- Unknown routes render a proper 404 page.

## Prioritized findings

## Critical scanner severity, exposure-limited

### SEC-01 — Patch vulnerable development and code-generation dependencies

**Status:** Confirmed by dependency scanner. Scanner severity is critical/high, but direct deployed-app exploitability was not demonstrated.

**Evidence:**

- 45 dependency advisories: 11 critical, 18 high, 12 moderate, 4 low.
- Orval 8.9.1 is a devDependency in lib/api-spec/package.json. Several code-generation injection advisories are fixed in 8.21.0 or 8.22.0 depending on the advisory.
- Vite 7.3.3 advisories include a fix in 7.3.5.
- PostCSS 8.5.14 advisories include a fix in 8.5.18.
- Transitive high findings include fast-uri, js-yaml, brace-expansion, browserslist, and linkify-it.
- pnpm why shows these paths are primarily OpenAPI codegen, build, documentation, and test dependencies.

**Impact:** A malicious OpenAPI/schema/build input or compromised development chain could exploit code-generation or parser weaknesses. Normal RGG operation uses project-controlled specifications, so this is not evidence of a remotely exploitable production endpoint.

**Remediation:**

1. Upgrade Orval to at least the highest fixed version required by all advisories, currently 8.22.0 or newer compatible release.
2. Upgrade Vite to at least 7.3.5 and PostCSS to at least 8.5.18 through the workspace catalog/direct parent packages.
3. Refresh transitive dependencies through compatible direct-parent upgrades.
4. Regenerate clients, run the full 97-test suite, typecheck, build, migration checks, and rescan.
5. Do not bypass package-security controls if an upgrade is blocked.

## High priority

### REL-01 — Repair the existing-record migration regression test

**Status:** Confirmed defect.

**Evidence:** scripts/migration-baseline.test.sh applies migrations and then exits 1. The architecture review found an assertion that assumes exactly one migration while the migration journal now contains three.

**Impact:** The project can verify fresh rebuilds but does not currently prove that existing publication records survive the full migration history unchanged.

**Remediation:** Update the test to validate every journal entry and add an already-migrated database fixture containing representative publication records. Keep this coordinated with the existing task Protect existing publication records when migrations change.

### SEO-01 — Public route content is not present in initial HTML

**Status:** Confirmed architectural limitation.

**Evidence:** artifacts/rgg-website/src/main.tsx uses React createRoot. artifacts/rgg-website/index.html contains an empty root element. Route metadata is applied later by effects in artifacts/rgg-website/src/App.tsx and src/lib/pageMetadata.ts. Direct HTTP responses for /, /book, and /research return the same generic title and no server-rendered H1.

**Impact:** Search engines and social scrapers that do not fully execute JavaScript may see generic homepage metadata and no route content. Research detail pages are especially difficult to discover.

**Remediation:** Prerender or server-render all public routes, including verified published research slugs. Keep admin and auth routes client-side if desired. Produce route-specific title, description, canonical, Open Graph, and language metadata in initial HTML.

### SEO-02 — Sitemap is missing and robots points to the wrong origin

**Status:** Confirmed defect.

**Evidence:** artifacts/rgg-website/public/sitemap.xml does not exist. A request to /sitemap.xml returns HTML with content-type text/html. public/robots.txt points to https://luxury-web-estate.replit.app/sitemap.xml rather than the RGG production origin.

**Impact:** Crawlers receive an invalid sitemap and an unrelated canonical location, reducing route discovery and creating brand/domain confusion.

**Remediation:** Generate an XML sitemap from all indexable public routes and approved published research records. Resolve the actual production URL through deployment configuration rather than hardcoding a development or remembered domain. Exclude admin, sign-in, sign-up, drafts, and archived records. Update robots.txt to the same canonical origin.

### OPS-01 — Health check reports false readiness when PostgreSQL is unavailable

**Status:** Confirmed defect.

**Evidence:** artifacts/api-server/src/routes/health.ts always parses and returns status ok. It performs no database query. Direct /api/healthz returns 200.

**Impact:** A deployment may be marked ready and receive traffic while publication endpoints cannot access PostgreSQL.

**Remediation:** Keep a lightweight liveness endpoint and add a separate readiness endpoint with a bounded SELECT 1 database check and strict timeout. Deployment health checks should use readiness. Do not expose connection details in failures.

### PERF-01 — Public assets are too heavy

**Status:** Confirmed performance risk.

**Measurements:**

- Total public assets: 36.13 MB.
- Welcome MP4: 8.54 MB.
- Official logo: 2.33 MB.
- Hero PNG files: approximately 1.58–2.16 MB each.
- Cover and journal PNG files: approximately 0.98–1.67 MB each.

**Impact:** Slow first visit, higher mobile data usage, delayed LCP, and a longer wait before useful content on constrained connections.

**Remediation:** Convert photographic PNGs to AVIF/WebP, supply responsive srcset and sizes, generate properly sized logo derivatives, compress/re-encode the welcome media, and set explicit caching. Preserve visual quality through screenshot comparison. This overlaps with the existing task Make the public site load faster on first visit.

### PERF-02 — JavaScript is large and route modules are eagerly loaded

**Status:** Confirmed performance risk.

**Measurements:** Main JavaScript is approximately 844 KB uncompressed/242 KB gzip. The lazy 3D chunk is approximately 922 KB/247 KB gzip. CSS is approximately 132 KB/22 KB gzip.

**Evidence:** artifacts/rgg-website/src/App.tsx eagerly imports public pages. WelcomeGate proactively imports the 3D module while the video plays. The welcome video uses preload auto.

**Impact:** More download, parse, and execution work before visitors reach the requested content.

**Remediation:** Add route-level lazy imports; preserve the existing lazy 3D split; reconsider preloading 3D on every landing visit; use poster-first or metadata video preload; and audit unused UI libraries. Measure before/after LCP, INP, CLS, transfer size, and cache behavior.

## Medium priority

### A11Y-01 — Welcome gate lacks complete modal focus management

**Status:** Confirmed static issue; runtime keyboard impact should be verified with assistive technology.

**Evidence:** artifacts/rgg-website/src/components/welcome/WelcomeGate.tsx declares role=dialog but does not implement initial focus, focus trapping, Escape dismissal, or focus restoration.

**Impact:** Keyboard users may move focus into hidden underlying page controls while the full-screen gate is present.

**Remediation:** Use an accessible dialog primitive or implement initial focus, focus trap, Escape behavior, background inertness, and focus restoration. Retain a visible immediate skip path and reduced-motion behavior.

### API-01 — Administrator API contract is incomplete

**Status:** Confirmed maintainability risk.

**Evidence:** The OpenAPI specification omits /admin/session, /admin/csrf, and /admin/logout while artifacts/rgg-website/src/lib/adminApi.ts contains handwritten calls.

**Impact:** Error shapes, security requirements, and clients can drift without generated contract checks.

**Remediation:** Specify all administrator endpoints and error responses, generate a single typed client, and add contract tests for authorization, CSRF, and malformed paths.

### DATA-01 — Single-featured-publication invariant is application-only

**Status:** Confirmed risk.

**Evidence:** The API uses an advisory lock and transactions, but no database partial unique index guarantees only one featured publication.

**Impact:** Direct imports, maintenance scripts, or future services could create multiple featured publications.

**Remediation:** Add a partial unique index for the featured state, with a reviewed migration and existing-data precheck.

### BUILD-01 — Default root build is not self-contained

**Status:** Confirmed developer/CI reliability defect.

**Evidence:** pnpm run build fails because the mockup Vite configuration requires PORT and BASE_PATH. PORT=8081 BASE_PATH=/mockup pnpm run build succeeds.

**Impact:** A clean CI environment or new contributor can receive a failed root build without knowing the required values.

**Remediation:** Give the mockup production build safe explicit defaults or set required values in its package build script. Add a root check command that runs typecheck, tests, migration checks, and builds with deterministic configuration.

### BUILD-02 — Root quality gate omits tests and migration checks

**Status:** Confirmed.

**Evidence:** Root package.json build runs typecheck and package builds only. API tests invoke Vitest from the website node_modules path.

**Impact:** Filtered installs and CI may miss regressions or break package isolation.

**Remediation:** Give the API package its own Vitest dependency. Add a root validation command covering tests, migration drift, migration rebuild, migration-baseline protection, and build.

### API-02 — Unique-constraint error classification is too broad

**Status:** Confirmed risk.

**Evidence:** Publication routing recursively maps any PostgreSQL 23505 unique violation to slug already exists.

**Impact:** A future unrelated unique constraint could return a misleading duplicate-slug response rather than a generic safe server error.

**Remediation:** Match the exact PostgreSQL constraint name. This overlaps with the existing task Keep unexpected database failures from being shown as duplicate links.

### OPS-02 — Security alert delivery and aggregation are incomplete

**Status:** Confirmed operational gap, already tracked.

**Evidence:** Attack alerts currently emit logs. Delivery to an on-call destination and cross-instance threshold aggregation require separate infrastructure.

**Impact:** Distributed attacks may not cross a per-process threshold, and maintainers may not receive actionable notifications.

**Remediation:** Complete the existing tasks Deliver administrator attack alerts to the on-call channel and Keep attack detection accurate across multiple API instances.

### OPS-03 — Graceful shutdown and query timeouts need strengthening

**Status:** Architecture risk.

**Evidence:** The architecture review did not find explicit server shutdown/pool draining or bounded timeouts on general publication queries.

**Impact:** Deploy shutdowns may drop in-flight work, and slow database operations may consume resources longer than intended.

**Remediation:** Add SIGTERM/SIGINT handling, stop accepting requests, drain the pool, and apply bounded statement/request timeouts with safe logging.

### SEO-03 — Social and bilingual search metadata are incomplete

**Status:** Confirmed.

**Evidence:** Initial HTML lacks canonical and social-image tags. og:url starts as /. French metadata and html lang are applied only after hydration. English and French share the same URLs, with no hreflang strategy.

**Impact:** Weak link previews, duplicate-language ambiguity, and limited French search visibility.

**Remediation:** Add absolute og:image, twitter:image, image alt, locale metadata, route-specific canonicals, and a deliberate French URL/hreflang approach if French SEO is required.

## Low priority and manual-review items

### A11Y-02 — Complete rendered accessibility verification

- Run axe and keyboard checks on every rendered route.
- Measure contrast for small gold/muted text, overlays, placeholders, hover/focus states, and disabled controls.
- Confirm ScrollToTop behavior across Safari and older browsers; behavior auto is safer than non-standard instant where compatibility matters.
- Verify 3D rotation announcements with assistive technology. Mobile touch-pan behavior now has merged regression coverage, and the dedicated book visual workflow passes 3/3 tests; automatic enforcement before release remains pending.
- The Clerk sign-in password field produced a browser recommendation for autocomplete=current-password.

### CONTENT-01 — Maintain an approved bilingual terminology glossary

Static review found potential inconsistency between translating the book title as Reconquérir l'Or Vert in some alt strings and leaving Reclaiming the Green Gold as the protected title elsewhere. Decide whether the title is always a proper name and enforce the approved form in UI, metadata, and alt text.

### LEGAL-01 — Confirm claims, legal versioning, and analytics disclosures

- Verify that footer format labels do not imply present availability while the site states that no purchase or license is currently offered.
- Confirm the 2026 copyright, rights owner, and author names. Explicit Mauritius references have been removed from the website.
- Add effective dates/version history to legal pages if required.
- Cookies content describes cookie-free Umami behavior, while analytics code only calls an optional window.umami. Confirm production injection, retention, Do-Not-Track handling, lawful basis, and opt-out behavior before enabling analytics.

### PERF-03 — Remove duplicated font loading

Static review found Google Fonts loaded in both src/index.css and index.html. Consolidate to one strategy and consider self-hosting/subsetting for performance and privacy.

### UX-01 — Administrator signed-out state is slow but correct

Browser testing observed approximately 2.5 seconds of Confirming your session before the correct Sign in to continue state. This is not an authorization failure, but the loading experience could be faster and less ambiguous.

## Browser audit summary

The browser pass inspected /, /book, /framework, /economy, /policymakers, /research, /consultancy, /authors, /about, /contact, /formats, /partnerships, /media, /disclaimer, /cookies, an unknown route, /admin, and /sign-in at desktop and mobile sizes.

Verified:

- English and French selection works.
- French homepage metadata and html lang update correctly after hydration.
- Mobile navigation opens and navigates successfully.
- Internal navigation does not replay the gate.
- No horizontal overflow or broken document images appeared in inspected states.
- Static/WebGL fallback appears when the test browser lacks WebGL.
- Contact validation works without sending.
- Signed-out administrator access resolves to the correct restricted state.
- No JavaScript console errors appeared; recurring warnings were Clerk development-key and Three.js development/deprecation warnings.

Limitations:

- Research detail pages could not be tested because the current public listing contains zero publications.
- No real contact email, account creation, OAuth flow, administrator mutation, or database mutation was performed.
- The browser tester reported the welcome video request as missing, but direct verification returned HTTP 200 video/mp4 with 8,959,119 bytes. Treat the browser observation as a transient development-environment false positive unless production monitoring reproduces it.
- Full-page navigation replaying the gate is intentional. It must not be logged as a defect.
- Development responses included Replit noindex headers; production headers were not checked, so no production conclusion should be drawn from those headers.

## Validation evidence

| Check | Result |
|---|---|
| Workspace TypeScript | Pass |
| Website automated tests | 30/30 pass |
| API automated tests | 67/67 pass |
| Migration drift check | Pass |
| Migration rebuild check | Pass |
| Post-merge setup script tests | Pass |
| Dedicated book visual workflow | Pass: 3/3 Playwright tests |
| Migration baseline existing-record test | Fail |
| Default root build | Fail: missing mockup PORT and BASE_PATH |
| Root build with PORT=8081 and BASE_PATH=/mockup | Pass |
| Dependency audit | 45 advisories: 11 critical, 18 high, 12 moderate, 4 low |
| SAST | 0 findings |
| Privacy/dataflow scan | 0 findings |
| Signed-out admin API | Pass: HTTP 401 |
| Health endpoint | HTTP 200, but database-blind |
| Welcome video direct request | Pass: HTTP 200 video/mp4 |
| sitemap.xml | Fail: HTML fallback, no XML source file |

## Existing task overlap

Do not create duplicate work for these already tracked items:

- Make the public site load faster on first visit.
- Protect existing publication records when migrations change.
- Catch cropped or unreadable book views on smaller screens.
- Catch mobile book gestures that block page scrolling — merged and verified.
- Keep unexpected database failures from being shown as duplicate links.
- Deliver administrator attack alerts to the on-call channel.
- Keep attack detection accurate across multiple API instances.
- Prevent publication facts and evidence labels from drifting again.
- Let editors approve evidence without changing website code.
- Catch flipped or mirrored book artwork before release.
- Run the iPhone book gesture check automatically before release — pending.
- Keep malformed administrator edit links private from non-administrators — in progress.
- Keep authorization-service failures from exposing administrator route details — proposed.

## Recommended remediation sequence

### Now — before production launch

1. Patch Orval, Vite, PostCSS, and affected transitive build dependencies; regenerate and rescan.
2. Fix scripts/migration-baseline.test.sh and verify existing publication preservation.
3. Create a valid production sitemap and correct robots.txt to the actual published origin.
4. Add database-aware readiness and point deployment health checks to it.
5. Make the root build and validation commands deterministic without undocumented environment requirements.

### Next — launch quality

1. Prerender or server-render public routes and research slugs.
2. Optimize the 36.13 MB public asset set and first-load video/3D strategy.
3. Implement complete welcome-dialog focus management.
4. Add complete social, canonical, locale, and hreflang metadata.
5. Complete API contract coverage and package isolation.
6. Add the single-featured-publication database constraint.

### Later — resilience and governance

1. Add graceful shutdown and bounded database query timeouts.
2. Complete rendered axe, screen-reader, contrast, short-landscape, and 320-pixel testing.
3. Standardize bilingual terminology.
4. Complete legal and analytics deployment review.
5. Improve signed-out administrator loading feedback.

## Prompt to give ChatGPT

Copy this report and use the following prompt:

> Act as a senior staff engineer and delivery lead. Turn this audit into a sequenced implementation plan for the Reclaiming the Green Gold project. Preserve the stated product decisions and do not invent facts. For each action, provide: priority, user/business impact, exact known file or module, implementation steps, dependency on existing tasks, risk of breaking behavior, automated verification, manual verification, and rollback strategy. Do not duplicate the existing tasks listed in the audit. Separate security scanner severity from actual deployed exposure. Keep Wouter as the router, Clerk as the only authentication provider, PostgreSQL/Drizzle as the database stack, and English/French public-site parity. Do not reintroduce Mauritius references into the public website. Treat the welcome gate replay on every fresh public load as intentional, and do not report the welcome MP4 as missing unless a new direct HTTP check fails.
