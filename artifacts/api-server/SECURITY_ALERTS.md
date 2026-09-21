# Administrator security alerts

The API counts rejected administrator requests separately for:

- `admin_authentication_rejected`
- `admin_authorization_rejected`
- `admin_origin_rejected`
- `admin_csrf_rejected`
- `admin_rate_limited`
- `admin_malformed_request`

By default, 20 events of one type within a rolling five-minute window emit an
error-level `sustained_admin_rejections` alert. Further alerts for that event
type are suppressed for 15 minutes. An isolated rejection does not alert.

## Configuration

All values must be positive integers. Invalid values use the defaults.

| Environment variable | Default | Meaning |
| --- | ---: | --- |
| `ADMIN_SECURITY_ALERT_THRESHOLD` | `20` | Events of one type required to alert |
| `ADMIN_SECURITY_ALERT_WINDOW_SECONDS` | `300` | Rolling counting window |
| `ADMIN_SECURITY_ALERT_COOLDOWN_SECONDS` | `900` | Minimum time between alerts of one type |

Production delivers this threshold-crossing event to Better Stack when the
delivery environment variables below are configured. Ordinary request and
security log lines are not forwarded by this adapter.

The alert contains only the event type, aggregate count, threshold, window, and
cooldown. It does not include IP addresses, request headers, cookies, tokens,
origins, user IDs, or request bodies.

Counters and alert cooldowns are stored in PostgreSQL and coordinated with a
row lock per event type. API instances therefore share one threshold and
cooldown, and restarts do not reset either. Each event row retains at most the
configured threshold of timestamps, so high rejection volume cannot cause
unbounded bookkeeping growth.

If the counter store is unavailable, the rejected request remains rejected and
the API emits only a safe `securityAlertCounter=coordination_failed` warning
with the event type. Counter failures never include request data and never
weaken authentication, authorization, rate limiting, CSRF, or origin checks.
Counter writes use a dedicated two-connection pool with short query and lock
deadlines, so stalled alert bookkeeping cannot consume the API's main database
pool.

## Maintainer response

1. Identify the rejection type and the alert time range in centralized logs.
2. Check deployment traffic and application health for a correlated spike.
3. For origin or CSRF alerts, confirm trusted-origin and session configuration
   before treating the traffic as malicious.
4. For rate-limit alerts, distinguish store failures from repeated client
   requests using nearby error logs and database health.
5. Preserve relevant logs, block abusive traffic at the edge when appropriate,
   and rotate credentials only if there is evidence they were exposed.

## Better Stack delivery

### Required environment variables

| Environment variable | Required | Meaning |
| --- | --- | --- |
| `BETTER_STACK_INGESTING_URL` | Yes | HTTPS ingestion endpoint for the Better Stack source |
| `BETTER_STACK_SOURCE_TOKEN` | Yes | Source token stored only as a Replit secret |
| `BETTER_STACK_ALERT_TIMEOUT_MS` | No | Provider deadline; defaults to 3000 ms |
| `BETTER_STACK_TEST_ALERT_ENABLED` | No | Set to `true` for one safe startup test event; unset immediately afterward |

Removing either required Better Stack variable disables external delivery
without disabling local security logging, authentication, authorization, rate
limiting, CSRF protection, or trusted-origin checks.

### Events and severity

The adapter sends only `securityAlert=sustained_admin_rejections`, after one of
the existing event counters reaches its configured threshold:

- `admin_origin_rejected`
- `admin_csrf_rejected`
- `admin_rate_limited`
- `admin_authentication_rejected`
- `admin_authorization_rejected`
- `admin_malformed_request`

Threshold crossings are `CRITICAL` and must page the Better Stack on-call
policy. The controlled delivery test is `WARNING`, visible to maintainers but
must not page. Routine rejection logs remain operational warnings in the
application logs and are not sent directly to Better Stack.

The payload preserves the event type, severity, timestamp, aggregate count,
threshold, window, cooldown, and safe reason code. It intentionally excludes
passwords, credentials, Clerk or CSRF secrets, sessions, cookies, request
bodies, user IDs, and raw personal data. Sensitive-looking object keys are
redacted again at the delivery boundary.

### Grouping and failure behavior

Better Stack should group on `groupingKey`, whose value is
`sustained_admin_rejections:<securityEvent>`. The shared PostgreSQL counter also
suppresses repeat delivery for the configured cooldown (15 minutes by default).
Configure Better Stack recovery/incident grouping to keep events with this key
in one incident rather than opening a page for every event.

Delivery has a short timeout and runs outside the request path. Provider
timeouts, non-success responses, malformed responses, and network failures
produce a safe local warning only. They never fail an API request or bypass,
weaken, or replace an administrator security control.

### Safe delivery test

1. Create a Better Stack Logs source and store its HTTPS ingestion endpoint and
   source token in the production environment variables above.
2. Configure a monitor matching
   `eventType=sustained_admin_rejections AND severity=CRITICAL`, grouped by
   `groupingKey`, and route it to the on-call policy.
3. Configure a non-paging monitor or source view for
   `eventType=better_stack_test AND severity=WARNING`.
4. Temporarily set `BETTER_STACK_TEST_ALERT_ENABLED=true` and restart or publish
   the API once. Confirm one `controlled_delivery_test` event reaches Better
   Stack without request or secret fields.
5. Unset `BETTER_STACK_TEST_ALERT_ENABLED` and restart or publish again.

The primary on-call maintainer owns first response. Acknowledge a `CRITICAL`
incident within 15 minutes and escalate to the backup maintainer if it remains
unacknowledged after 15 minutes or unresolved after 30 minutes.