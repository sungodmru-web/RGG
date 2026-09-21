import type {
  AdministratorSecurityAlertConfig,
  AdministratorSecurityAlertStore,
} from "./logger";
import {
  administratorSecurityAlertConfig,
  createAdministratorSecurityAlertCounter,
  handleAdministratorSecurityAlertPoolErrors,
} from "./logger";

function sharedMemoryStore(): AdministratorSecurityAlertStore {
  const states = new Map<
    string,
    { timestamps: number[]; lastAlertAt?: number }
  >();
  return {
    async record(event, recordedAt, config) {
      const state = states.get(event) ?? { timestamps: [] };
      state.timestamps = state.timestamps
        .filter((timestamp) => timestamp > recordedAt - config.windowMs)
        .concat(recordedAt)
        .slice(-config.threshold);
      const shouldAlert =
        state.timestamps.length >= config.threshold &&
        (state.lastAlertAt === undefined ||
          recordedAt - state.lastAlertAt >= config.cooldownMs);
      if (shouldAlert) state.lastAlertAt = recordedAt;
      states.set(event, state);
      return { eventCount: state.timestamps.length, shouldAlert };
    },
  };
}

const config: AdministratorSecurityAlertConfig = {
  threshold: 3,
  windowMs: 1_000,
  cooldownMs: 5_000,
};

describe("administrator security alert counter", () => {
  it("does not alert for isolated rejections", async () => {
    let currentTime = 0;
    const alertLogger = { error: vi.fn(), warn: vi.fn() };
    const counter = createAdministratorSecurityAlertCounter(
      config,
      alertLogger,
      () => currentTime,
      sharedMemoryStore(),
    );

    await counter.record("admin_origin_rejected");
    currentTime = 1_001;
    await counter.record("admin_origin_rejected");
    currentTime = 2_002;
    await counter.record("admin_origin_rejected");

    expect(alertLogger.error).not.toHaveBeenCalled();
  });

  it("counts each event type independently and alerts at the threshold", async () => {
    let currentTime = 10_000;
    const alertLogger = { error: vi.fn(), warn: vi.fn() };
    const counter = createAdministratorSecurityAlertCounter(
      config,
      alertLogger,
      () => currentTime,
      sharedMemoryStore(),
    );

    await counter.record("admin_origin_rejected");
    await counter.record("admin_csrf_rejected");
    currentTime += 100;
    await counter.record("admin_origin_rejected");
    currentTime += 100;
    await counter.record("admin_origin_rejected");

    expect(alertLogger.error).toHaveBeenCalledTimes(1);
    expect(alertLogger.error).toHaveBeenCalledWith(
      {
        securityAlert: "sustained_admin_rejections",
        securityEvent: "admin_origin_rejected",
        eventCount: 3,
        threshold: 3,
        windowSeconds: 1,
        cooldownSeconds: 5,
      },
      "Sustained administrator request rejections detected",
    );
  });

  it("shares counts and cooldowns across instances and restarts", async () => {
    let currentTime = 10_000;
    const alertLogger = { error: vi.fn(), warn: vi.fn() };
    const store = sharedMemoryStore();
    const instance = () =>
      createAdministratorSecurityAlertCounter(
        config,
        alertLogger,
        () => currentTime,
        store,
      );

    await instance().record("admin_rate_limited");
    await instance().record("admin_rate_limited");
    await instance().record("admin_rate_limited");
    currentTime += 1_000;
    await instance().record("admin_rate_limited");
    currentTime += 4_001;
    await instance().record("admin_rate_limited");
    await instance().record("admin_rate_limited");
    await instance().record("admin_rate_limited");

    expect(alertLogger.error).toHaveBeenCalledTimes(2);
  });

  it("supports authentication, authorization, and malformed-request events", async () => {
    const alertLogger = { error: vi.fn(), warn: vi.fn() };
    const counter = createAdministratorSecurityAlertCounter(
      { ...config, threshold: 1 },
      alertLogger,
      () => 10_000,
      sharedMemoryStore(),
    );

    await counter.record("admin_authentication_rejected");
    await counter.record("admin_authorization_rejected");
    await counter.record("admin_malformed_request");

    expect(alertLogger.error).toHaveBeenCalledTimes(3);
  });

  it("contains store failures without request data or throwing", async () => {
    const alertLogger = { error: vi.fn(), warn: vi.fn() };
    const counter = createAdministratorSecurityAlertCounter(
      config,
      alertLogger,
      () => 10_000,
      { record: vi.fn().mockRejectedValue(new Error("private database detail")) },
    );

    await expect(
      counter.record("admin_origin_rejected"),
    ).resolves.toBeUndefined();
    expect(alertLogger.warn).toHaveBeenCalledWith(
      {
        securityAlertCounter: "coordination_failed",
        securityEvent: "admin_origin_rejected",
      },
      "Security alert counter unavailable; request rejection continues",
    );
    expect(JSON.stringify(alertLogger.warn.mock.calls)).not.toContain(
      "private database detail",
    );
  });

  it("handles idle pool errors without exposing database details", () => {
    const counterLogger = { warn: vi.fn() };
    let errorHandler: ((error: Error) => void) | undefined;
    const storePool = {
      on: vi.fn((_event: string, handler: (error: Error) => void) => {
        errorHandler = handler;
        return storePool;
      }),
    };
    handleAdministratorSecurityAlertPoolErrors(
      storePool as never,
      counterLogger,
    );

    expect(() =>
      errorHandler?.(new Error("private database connection detail")),
    ).not.toThrow();
    expect(counterLogger.warn).toHaveBeenCalledWith(
      { securityAlertCounter: "coordination_failed" },
      "Security alert counter connection failed; API operation continues",
    );
    expect(JSON.stringify(counterLogger.warn.mock.calls)).not.toContain(
      "private database connection detail",
    );
  });

  it("uses safe defaults for missing or invalid environment values", () => {
    expect(
      administratorSecurityAlertConfig({
        ADMIN_SECURITY_ALERT_THRESHOLD: "0",
        ADMIN_SECURITY_ALERT_WINDOW_SECONDS: "invalid",
        ADMIN_SECURITY_ALERT_COOLDOWN_SECONDS: "30",
      }),
    ).toEqual({
      threshold: 20,
      windowMs: 300_000,
      cooldownMs: 30_000,
    });
  });
});