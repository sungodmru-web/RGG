import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { clerkClient, getAuth } from "@clerk/express";
import { pool } from "@workspace/db";
import type { NextFunction, Request, Response } from "express";
import {
  administratorSecurityAlertCounter,
  type AdministratorSecurityEvent,
  logger,
} from "../lib/logger";
import { APPROVED_ADMINISTRATOR_EMAILS } from "../lib/administratorEmails";

const TOKEN_TTL_SECONDS = 300;
const SESSION_LIMIT = 60;
const MUTATION_LIMIT = 30;
const LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_STORE_TIMEOUT_MS = 3_000;
const RATE_LIMIT_QUERY_TIMEOUT_MS = 1_500;
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const APPROVED_ADMINISTRATOR_BOOTSTRAP_EMAILS = new Set<string>(
  APPROVED_ADMINISTRATOR_EMAILS,
);

export type RateLimitResult = {
  count: number;
  retryAfter: number;
};

export type AdministratorRateLimitStore = {
  consume(key: string, now: number, windowMs: number): Promise<RateLimitResult>;
};

function clientFingerprint(req: Request): string {
  return createHash("sha256").update(req.ip || "unknown").digest("hex").slice(0, 16);
}

export function securityLog(
  req: Request,
  event: AdministratorSecurityEvent,
  details: Record<string, string | number | boolean> = {},
): void {
  const requestLogger = "log" in req && req.log ? req.log : logger;
  requestLogger.warn(
    {
      securityEvent: event,
      method: req.method,
      path: req.path,
      clientFingerprint: clientFingerprint(req),
      ...details,
    },
    "Administrator request rejected",
  );
  void administratorSecurityAlertCounter.record(event);
}

export function createPostgresAdministratorRateLimitStore(
  storePool: Pick<typeof pool, "connect">,
): AdministratorRateLimitStore {
  return {
  async consume(key, _now, windowMs) {
    const client = await storePool.connect();
    let releaseError: Error | undefined;
    try {
      await client.query(`SET statement_timeout TO '${RATE_LIMIT_QUERY_TIMEOUT_MS}ms'`);
      await client.query(`SET lock_timeout TO '${RATE_LIMIT_QUERY_TIMEOUT_MS}ms'`);
      const result = await client.query<{
        count: number;
        retry_after: number;
      }>({
        text: `
      WITH rate_limit_clock AS MATERIALIZED (
        SELECT clock_timestamp() AS now
      ), expired AS (
        DELETE FROM admin_rate_limits
        WHERE ctid IN (
          SELECT ctid
          FROM admin_rate_limits
          WHERE reset_at <= (SELECT now FROM rate_limit_clock)
          LIMIT 100
        )
      )
      INSERT INTO admin_rate_limits (key, count, reset_at)
      SELECT $1, 1, now + ($2 * interval '1 millisecond')
      FROM rate_limit_clock
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN admin_rate_limits.reset_at <= (SELECT now FROM rate_limit_clock) THEN 1
          ELSE admin_rate_limits.count + 1
        END,
        reset_at = CASE
          WHEN admin_rate_limits.reset_at <= (SELECT now FROM rate_limit_clock)
            THEN (SELECT now FROM rate_limit_clock) + ($2 * interval '1 millisecond')
          ELSE admin_rate_limits.reset_at
        END
      RETURNING
        count,
        GREATEST(
          1,
          LEAST(
            $3,
            CEIL(EXTRACT(EPOCH FROM (reset_at - (SELECT now FROM rate_limit_clock))))
          )
        )::integer AS retry_after
        `,
        values: [key, windowMs, Math.ceil(windowMs / 1000)],
      });
      const row = result.rows[0];
      if (!row) throw new Error("Rate limit store returned no counter");
      return { count: Number(row.count), retryAfter: Number(row.retry_after) };
    } catch (error) {
      releaseError = error instanceof Error ? error : new Error("Rate limit store failed");
      throw error;
    } finally {
      try {
        await client.query("RESET statement_timeout; RESET lock_timeout");
      } catch (error) {
        releaseError = error instanceof Error ? error : new Error("Rate limit client reset failed");
      }
      client.release(releaseError);
    }
  },
  };
}

const postgresRateLimitStore = createPostgresAdministratorRateLimitStore(pool);

async function consumeWithDeadline(
  store: AdministratorRateLimitStore,
  key: string,
  now: number,
): Promise<RateLimitResult> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      store.consume(key, now, LIMIT_WINDOW_MS),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Rate limit store deadline exceeded")),
          RATE_LIMIT_STORE_TIMEOUT_MS,
        );
        timeout.unref();
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/**
 * Uses an atomic shared store so separate API instances consume one budget.
 * Store failures fail closed for at most one rate-limit window.
 */
export function createAdministratorRateLimiter(
  store: AdministratorRateLimitStore = postgresRateLimitStore,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const isMutation = MUTATION_METHODS.has(req.method);
    const name = isMutation ? "mutation" : "session";
    const limit = isMutation ? MUTATION_LIMIT : SESSION_LIMIT;
    const now = Date.now();
    let result: RateLimitResult;
    try {
      result = await consumeWithDeadline(
        store,
        `${name}:${clientFingerprint(req)}`,
        now,
      );
    } catch {
      const retryAfter = LIMIT_WINDOW_MS / 1000;
      res.setHeader("Retry-After", String(retryAfter));
      securityLog(req, "admin_rate_limited", { limiter: name, retryAfter });
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    if (result.count > limit) {
      const retryAfter = Math.max(1, Math.min(LIMIT_WINDOW_MS / 1000, result.retryAfter));
      res.setHeader("Retry-After", String(retryAfter));
      securityLog(req, "admin_rate_limited", { limiter: name, retryAfter });
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    next();
  };
}

export const limitAdministratorRequests = createAdministratorRateLimiter();

function sessionDetails(req: Request) {
  const auth = getAuth(req);
  return { userId: auth.userId, sessionId: auth.sessionId };
}

export function authenticatedAdministratorId(req: Request): string {
  const { userId } = sessionDetails(req);
  if (!userId) throw new Error("Authenticated session required");
  return userId;
}

function clerkUserPublicMetadata(user: unknown): Record<string, unknown> {
  if (
    typeof user !== "object" ||
    user === null ||
    !("publicMetadata" in user) ||
    typeof user.publicMetadata !== "object" ||
    user.publicMetadata === null
  ) {
    throw new Error("Administrator role lookup returned an unusable result");
  }
  return user.publicMetadata as Record<string, unknown>;
}

function verifiedPrimaryEmail(user: unknown): string | null {
  if (
    typeof user !== "object" ||
    user === null ||
    !("primaryEmailAddressId" in user) ||
    typeof user.primaryEmailAddressId !== "string" ||
    !("emailAddresses" in user) ||
    !Array.isArray(user.emailAddresses)
  ) {
    return null;
  }
  const primaryEmail = user.emailAddresses.find(
    (entry): entry is {
      id: string;
      emailAddress: string;
      verification: { status: string };
    } =>
      typeof entry === "object" &&
      entry !== null &&
      "id" in entry &&
      entry.id === user.primaryEmailAddressId &&
      "emailAddress" in entry &&
      typeof entry.emailAddress === "string" &&
      "verification" in entry &&
      typeof entry.verification === "object" &&
      entry.verification !== null &&
      "status" in entry.verification &&
      typeof entry.verification.status === "string",
  );
  return primaryEmail?.verification.status === "verified"
    ? primaryEmail.emailAddress.trim().toLowerCase()
    : null;
}

export async function getAdministratorAccess(
  req: Request,
): Promise<"unauthenticated" | "forbidden" | "admin"> {
  const { userId } = sessionDetails(req);
  if (!userId) return "unauthenticated";

  const user: unknown = await clerkClient.users.getUser(userId);
  const metadata = clerkUserPublicMetadata(user);
  if (metadata.role === "admin") return "admin";

  const email = verifiedPrimaryEmail(user);
  if (!email || !APPROVED_ADMINISTRATOR_BOOTSTRAP_EMAILS.has(email)) {
    return "forbidden";
  }
  if (
    typeof user === "object" &&
    user !== null &&
    (("banned" in user && user.banned === true) ||
      ("locked" in user && user.locked === true))
  ) {
    return "forbidden";
  }

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { ...metadata, role: "admin" },
  });
  const updatedUser: unknown = await clerkClient.users.getUser(userId);
  return clerkUserPublicMetadata(updatedUser).role === "admin"
    ? "admin"
    : "forbidden";
}

export async function requireAdministrator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const access = await getAdministratorAccess(req);
    if (access === "unauthenticated") {
      securityLog(req, "admin_authentication_rejected");
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (access === "forbidden") {
      securityLog(req, "admin_authorization_rejected");
      res.status(403).json({ error: "Administrator role required" });
      return;
    }
    next();
  } catch (error) {
    logger.error({ err: error }, "Administrator role lookup failed");
    res.status(503).json({ error: "Authorization service unavailable" });
  }
}

export function requireClerkSession(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { userId, sessionId } = sessionDetails(req);
  if (!userId || !sessionId) {
    securityLog(req, "admin_authentication_rejected");
    res.status(401).json({ error: "Authenticated session required" });
    return;
  }
  next();
}

export async function revokeCurrentClerkSession(req: Request): Promise<void> {
  const { sessionId } = sessionDetails(req);
  if (!sessionId) throw new Error("Authenticated session required");
  await clerkClient.sessions.revokeSession(sessionId);
}

function secret() {
  return process.env.CSRF_SECRET || process.env.SESSION_SECRET;
}

export function trustedOrigins(): string[] {
  const origins = [
    process.env.APP_ORIGIN,
    ...(process.env.APP_ORIGINS?.split(",") ?? []),
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (process.env.NODE_ENV === "production") {
    for (const domain of process.env.REPLIT_DOMAINS?.split(",") ?? []) {
      const hostname = domain.trim();
      if (hostname) origins.push(`https://${hostname}`);
    }
  } else {
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    origins.push(
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    );
  }

  return [...new Set(origins)];
}

export function createCsrfToken(req: Request): string {
  const signingSecret = secret();
  if (!signingSecret) throw new Error("CSRF signing secret is not configured");
  const { userId, sessionId } = sessionDetails(req);
  if (!userId || !sessionId) throw new Error("Authenticated session required");
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", signingSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function validCsrfToken(req: Request, token: string): boolean {
  const signingSecret = secret();
  if (!signingSecret) return false;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return false;
  const expectedSignature = createHmac("sha256", signingSecret).update(payload).digest("base64url");
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      userId?: string;
      sessionId?: string;
      exp?: number;
      nonce?: string;
    };
    const { userId, sessionId } = sessionDetails(req);
    return Boolean(
      decoded.userId &&
        decoded.userId === userId &&
        decoded.sessionId &&
        sessionId &&
        decoded.sessionId === sessionId &&
        typeof decoded.nonce === "string" &&
        typeof decoded.exp === "number" &&
        decoded.exp >= Math.floor(Date.now() / 1000),
    );
  } catch {
    return false;
  }
}

function trustedOrigin(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return false;
  return trustedOrigins().includes(origin);
}

export function requireTrustedAdminOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!MUTATION_METHODS.has(req.method)) {
    next();
    return;
  }
  if (!trustedOrigin(req)) {
    securityLog(req, "admin_origin_rejected", {
      originPresent: Boolean(req.get("origin")),
    });
    res.status(403).json({ error: "Untrusted origin" });
    return;
  }
  next();
}

export function verifyAdminCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.get("x-csrf-token");
  if (!token || !validCsrfToken(req, token)) {
    securityLog(req, "admin_csrf_rejected", {
      tokenPresent: Boolean(token),
    });
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  next();
}
