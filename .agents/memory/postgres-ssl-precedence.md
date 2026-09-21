---
name: PostgreSQL SSL option precedence
description: Prevent connection-string SSL parameters from replacing an explicitly verified private-CA configuration in node-postgres.
---

When an explicit Node PostgreSQL TLS object is enabled, remove URL-level SSL
parameters before passing the connection string and TLS object to
`node-postgres`.

**Why:** In `pg` 8, SSL settings parsed from a connection string are applied
after other connection options and can replace the explicit object, silently
discarding `rejectUnauthorized` or a private CA.

**How to apply:** When `DATABASE_SSL` or the equivalent explicit verified TLS
configuration is active, strip `sslmode`, `sslrootcert`, `sslcert`, `sslkey`,
and `uselibpqcompat` from the URL. Test the effective `pg.Client` connection
parameters, not only the helper that builds the TLS object.