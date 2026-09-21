import type { AdministratorSecurityEvent } from "./logger";

export type BetterStackAlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type BetterStackSecurityAlert = {
  securityAlert: "sustained_admin_rejections" | "better_stack_test";
  securityEvent: AdministratorSecurityEvent | "delivery_test";
  severity: BetterStackAlertSeverity;
  eventCount: number;
  threshold: number;
  windowSeconds: number;
  cooldownSeconds: number;
  requestId?: string;
  route?: string;
  reasonCode: string;
};

type AlertLogger = {
  warn(fields: Record<string, unknown>, message: string): void;
};

type AlertFetch = typeof fetch;

const DEFAULT_TIMEOUT_MS = 3_000;
const SENSITIVE_KEY = /authorization|cookie|password|secret|token|credential|session|csrf/i;

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function redactAlertPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAlertPayload);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactAlertPayload(item),
    ]),
  );
}

export function createBetterStackAlertDelivery(
  env: NodeJS.ProcessEnv = process.env,
  alertFetch: AlertFetch = fetch,
  deliveryLogger: AlertLogger,
) {
  const endpoint = env.BETTER_STACK_INGESTING_URL;
  const sourceToken = env.BETTER_STACK_SOURCE_TOKEN;
  const timeoutMs = positiveInteger(
    env.BETTER_STACK_ALERT_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  );

  async function deliver(alert: BetterStackSecurityAlert): Promise<boolean> {
    if (!endpoint || !sourceToken) return false;
    let ingestionUrl: URL;
    try {
      ingestionUrl = new URL(endpoint);
      if (ingestionUrl.protocol !== "https:") throw new Error("HTTPS required");
    } catch {
      deliveryLogger.warn(
        {
          securityAlertDelivery: "disabled",
          provider: "better_stack",
          reason: "invalid_https_endpoint",
        },
        "Security alert delivery is disabled by invalid provider configuration",
      );
      return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    timeout.unref();
    try {
      const response = await alertFetch(ingestionUrl, {
        method: "POST",
        redirect: "error",
        headers: {
          Authorization: `Bearer ${sourceToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          redactAlertPayload({
            dt: new Date().toISOString(),
            eventType: alert.securityAlert,
            groupingKey: `${alert.securityAlert}:${alert.securityEvent}`,
            ...alert,
          }),
        ),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Better Stack returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        await response.json();
      } else {
        await response.text();
      }
      return true;
    } catch (error) {
      deliveryLogger.warn(
        {
          securityAlertDelivery: "failed",
          provider: "better_stack",
          reason:
            error instanceof Error && error.name === "AbortError"
              ? "timeout"
              : "provider_error",
        },
        "Security alert delivery failed; API operation continues",
      );
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  return { deliver };
}

export function betterStackTestAlert(): BetterStackSecurityAlert {
  return {
    securityAlert: "better_stack_test",
    securityEvent: "delivery_test",
    severity: "WARNING",
    eventCount: 1,
    threshold: 1,
    windowSeconds: 0,
    cooldownSeconds: 0,
    reasonCode: "controlled_delivery_test",
  };
}