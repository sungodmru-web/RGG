import pino from "pino";
import pg from "pg";
import {
  betterStackTestAlert,
  createBetterStackAlertDelivery,
} from "./betterStackAlerts";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});

const betterStackAlerts = createBetterStackAlertDelivery(
  process.env,
  fetch,
  logger,
);

export const ADMIN_SECURITY_EVENT_TYPES = [
  "admin_authentication_rejected",
  "admin_authorization_rejected",
  "admin_origin_rejected",
  "admin_csrf_rejected",
  "admin_rate_limited",
  "admin_malformed_request",
] as const;

export type AdministratorSecurityEvent =
  (typeof ADMIN_SECURITY_EVENT_TYPES)[number];

type SecurityCounterLogger = Pick<typeof logger, "error" | "warn">;

export type AdministratorSecurityAlertConfig = {
  threshold: number;
  windowMs: number;
  cooldownMs: number;
};

export type AdministratorSecurityAlertStoreResult = {
  eventCount: number;
  shouldAlert: boolean;
};

export type AdministratorSecurityAlertStore = {
  record(
    event: AdministratorSecurityEvent,
    recordedAt: number,
    config: AdministratorSecurityAlertConfig,
  ): Promise<AdministratorSecurityAlertStoreResult>;
};

const SECURITY_COUNTER_QUERY_TIMEOUT_MS = 2_000;
const SECURITY_COUNTER_LOCK_TIMEOUT_MS = 1_000;

export function createPostgresAdministratorSecurityAlertStore(
  storePool: Pick<pg.Pool, "connect">,
): AdministratorSecurityAlertStore {
  return {
    async record(event, _recordedAt, config) {
      const client = await storePool.connect();
      let releaseError: Error | undefined;
      try {
        await client.query("BEGIN");
        await client.query(
          `SET LOCAL statement_timeout = '${SECURITY_COUNTER_QUERY_TIMEOUT_MS}ms';
           SET LOCAL lock_timeout = '${SECURITY_COUNTER_LOCK_TIMEOUT_MS}ms'`,
        );
        await client.query(
          `INSERT INTO admin_security_alerts
             (event_type, event_timestamps, last_alert_at, updated_at)
           VALUES ($1, ARRAY[]::timestamptz[], NULL, clock_timestamp())
           ON CONFLICT (event_type) DO NOTHING`,
          [event],
        );
        const locked = await client.query<{
          event_timestamps: Date[];
          last_alert_at: Date | null;
        }>(
          `SELECT event_timestamps, last_alert_at
             FROM admin_security_alerts
            WHERE event_type = $1
            FOR UPDATE`,
          [event],
        );
        const row = locked.rows[0];
        if (!row) throw new Error("Security alert counter returned no state");
        const clock = await client.query<{ recorded_at: Date }>(
          "SELECT clock_timestamp() AS recorded_at",
        );
        const recordedAt = clock.rows[0]?.recorded_at.getTime();
        if (recordedAt === undefined) {
          throw new Error("Security alert counter returned no clock");
        }

        const cutoff = recordedAt - config.windowMs;
        const timestamps = row.event_timestamps
          .map((timestamp) => timestamp.getTime())
          .filter((timestamp) => timestamp > cutoff)
          .sort((left, right) => left - right);
        timestamps.push(recordedAt);
        const retained = timestamps.slice(-config.threshold);
        const lastAlertAt = row.last_alert_at?.getTime();
        const shouldAlert =
          retained.length >= config.threshold &&
          (lastAlertAt === undefined ||
            recordedAt - lastAlertAt >= config.cooldownMs);

        await client.query(
          `UPDATE admin_security_alerts
              SET event_timestamps = $2::timestamptz[],
                  last_alert_at = CASE WHEN $3 THEN $4::timestamptz ELSE last_alert_at END,
                  updated_at = $4::timestamptz
            WHERE event_type = $1`,
          [
            event,
            retained.map((timestamp) => new Date(timestamp)),
            shouldAlert,
            new Date(recordedAt),
          ],
        );
        await client.query("COMMIT");
        return { eventCount: retained.length, shouldAlert };
      } catch (error) {
        releaseError =
          error instanceof Error ? error : new Error("Security alert counter failed");
        try {
          await client.query("ROLLBACK");
        } catch {
          // The original store error is the useful failure.
        }
        throw error;
      } finally {
        client.release(releaseError);
      }
    },
  };
}

const { Pool } = pg;
const administratorSecurityAlertPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 500,
  query_timeout: SECURITY_COUNTER_QUERY_TIMEOUT_MS,
  max: 2,
  idleTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

export function handleAdministratorSecurityAlertPoolErrors(
  storePool: Pick<pg.Pool, "on">,
  counterLogger: Pick<typeof logger, "warn"> = logger,
): void {
  storePool.on("error", () => {
    counterLogger.warn(
      { securityAlertCounter: "coordination_failed" },
      "Security alert counter connection failed; API operation continues",
    );
  });
}

handleAdministratorSecurityAlertPoolErrors(administratorSecurityAlertPool);
const postgresAdministratorSecurityAlertStore =
  createPostgresAdministratorSecurityAlertStore(
    administratorSecurityAlertPool,
  );

const DEFAULT_ADMIN_SECURITY_ALERT_CONFIG: AdministratorSecurityAlertConfig = {
  threshold: 20,
  windowMs: 5 * 60_000,
  cooldownMs: 15 * 60_000,
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function administratorSecurityAlertConfig(
  env: NodeJS.ProcessEnv = process.env,
): AdministratorSecurityAlertConfig {
  return {
    threshold: positiveInteger(
      env.ADMIN_SECURITY_ALERT_THRESHOLD,
      DEFAULT_ADMIN_SECURITY_ALERT_CONFIG.threshold,
    ),
    windowMs: positiveInteger(
      env.ADMIN_SECURITY_ALERT_WINDOW_SECONDS,
      DEFAULT_ADMIN_SECURITY_ALERT_CONFIG.windowMs / 1000,
    ) * 1000,
    cooldownMs: positiveInteger(
      env.ADMIN_SECURITY_ALERT_COOLDOWN_SECONDS,
      DEFAULT_ADMIN_SECURITY_ALERT_CONFIG.cooldownMs / 1000,
    ) * 1000,
  };
}

/**
 * Counts administrator rejections in a sliding window and emits an aggregate,
 * high-severity log that production monitoring can route to maintainers.
 */
export function createAdministratorSecurityAlertCounter(
  config: AdministratorSecurityAlertConfig = administratorSecurityAlertConfig(),
  alertLogger: SecurityCounterLogger = logger,
  now: () => number = Date.now,
  store: AdministratorSecurityAlertStore =
    postgresAdministratorSecurityAlertStore,
) {
  return {
    async record(event: AdministratorSecurityEvent): Promise<void> {
      const recordedAt = now();
      let result: AdministratorSecurityAlertStoreResult;
      try {
        result = await store.record(event, recordedAt, config);
      } catch {
        alertLogger.warn(
          {
            securityAlertCounter: "coordination_failed",
            securityEvent: event,
          },
          "Security alert counter unavailable; request rejection continues",
        );
        return;
      }
      if (!result.shouldAlert) return;
      alertLogger.error(
        {
          securityAlert: "sustained_admin_rejections",
          securityEvent: event,
          eventCount: result.eventCount,
          threshold: config.threshold,
          windowSeconds: config.windowMs / 1000,
          cooldownSeconds: config.cooldownMs / 1000,
        },
        "Sustained administrator request rejections detected",
      );
      void betterStackAlerts.deliver({
        securityAlert: "sustained_admin_rejections",
        securityEvent: event,
        severity: "CRITICAL",
        eventCount: result.eventCount,
        threshold: config.threshold,
        windowSeconds: config.windowMs / 1000,
        cooldownSeconds: config.cooldownMs / 1000,
        reasonCode: event,
      });
    },
  };
}

export const administratorSecurityAlertCounter =
  createAdministratorSecurityAlertCounter();

export async function sendConfiguredBetterStackTestAlert(): Promise<boolean> {
  if (process.env.BETTER_STACK_TEST_ALERT_ENABLED !== "true") return false;
  return betterStackAlerts.deliver(betterStackTestAlert());
}
