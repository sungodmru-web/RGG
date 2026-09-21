import {
  betterStackTestAlert,
  createBetterStackAlertDelivery,
  redactAlertPayload,
} from "./betterStackAlerts";

const env = {
  BETTER_STACK_INGESTING_URL: "https://in.logs.betterstack.test",
  BETTER_STACK_SOURCE_TOKEN: "source-token",
};

function response(status = 202, body = "{}") {
  return new Response(body, {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Better Stack security alert delivery", () => {
  it("delivers a valid structured critical alert with a stable grouping key", async () => {
    const alertFetch = vi.fn().mockResolvedValue(response());
    const delivery = createBetterStackAlertDelivery(
      env,
      alertFetch,
      { warn: vi.fn() },
    );
    const alert = {
      ...betterStackTestAlert(),
      securityAlert: "sustained_admin_rejections" as const,
      securityEvent: "admin_rate_limited" as const,
      severity: "CRITICAL" as const,
      reasonCode: "admin_rate_limited",
    };

    await expect(delivery.deliver(alert)).resolves.toBe(true);
    const options = alertFetch.mock.calls[0]![1] as RequestInit;
    expect(JSON.parse(String(options.body))).toMatchObject({
      eventType: "sustained_admin_rejections",
      groupingKey: "sustained_admin_rejections:admin_rate_limited",
      severity: "CRITICAL",
    });
  });

  it("redacts secret-bearing fields recursively", () => {
    expect(
      redactAlertPayload({
        password: "nope",
        nested: { sessionToken: "nope", reasonCode: "safe" },
      }),
    ).toEqual({
      password: "[REDACTED]",
      nested: { sessionToken: "[REDACTED]", reasonCode: "safe" },
    });
  });

  it.each([
    ["provider failure", vi.fn().mockResolvedValue(response(503))],
    ["malformed provider response", vi.fn().mockResolvedValue(response(202, "{"))],
    ["network failure", vi.fn().mockRejectedValue(new Error("offline"))],
  ])(
    "continues safely after %s",
    async (_name: string, alertFetch: ReturnType<typeof vi.fn>) => {
    const logger = { warn: vi.fn() };
    const delivery = createBetterStackAlertDelivery(env, alertFetch, logger);

    await expect(delivery.deliver(betterStackTestAlert())).resolves.toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        securityAlertDelivery: "failed",
        provider: "better_stack",
      }),
      expect.any(String),
    );
    },
  );

  it("times out without throwing into the application", async () => {
    vi.useFakeTimers();
    const alertFetch = vi.fn((_url: string | URL | Request, options: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
    );
    const delivery = createBetterStackAlertDelivery(
      { ...env, BETTER_STACK_ALERT_TIMEOUT_MS: "10" },
      alertFetch as typeof fetch,
      { warn: vi.fn() },
    );
    const result = delivery.deliver(betterStackTestAlert());
    await vi.advanceTimersByTimeAsync(11);
    await expect(result).resolves.toBe(false);
    vi.useRealTimers();
  });

  it("does nothing when delivery is disabled", async () => {
    const alertFetch = vi.fn();
    const delivery = createBetterStackAlertDelivery({}, alertFetch, {
      warn: vi.fn(),
    });
    await expect(delivery.deliver(betterStackTestAlert())).resolves.toBe(false);
    expect(alertFetch).not.toHaveBeenCalled();
  });

  it.each(["http://logs.example.test", "not a url"])(
    "rejects an unsafe or malformed endpoint without exposing configuration: %s",
    async (endpoint: string) => {
      const alertFetch = vi.fn();
      const logger = { warn: vi.fn() };
      const delivery = createBetterStackAlertDelivery(
        {
          BETTER_STACK_INGESTING_URL: endpoint,
          BETTER_STACK_SOURCE_TOKEN: "must-not-appear",
        },
        alertFetch,
        logger,
      );

      await expect(delivery.deliver(betterStackTestAlert())).resolves.toBe(false);
      expect(alertFetch).not.toHaveBeenCalled();
      expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(endpoint);
      expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(
        "must-not-appear",
      );
    },
  );
});