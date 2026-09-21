import express from "express";
import { once } from "node:events";
import type { Server } from "node:http";
import type { QueryConfig } from "pg";

const state = vi.hoisted(() => ({
  connect: vi.fn(),
}));

vi.mock("@workspace/db", () => ({
  pool: {
    connect: state.connect,
  },
}));

vi.mock("@workspace/api-zod", () => ({
  HealthCheckResponse: { parse: (value: unknown) => value },
  ReadinessCheckResponse: { parse: (value: unknown) => value },
}));

const { createReadinessProbe, default: healthRouter } = await import("./health");

function mockClient(
  query: ReturnType<typeof vi.fn> = vi.fn(),
) {
  return {
    query,
    release: vi.fn(),
  };
}

async function request(path: string, warn = vi.fn(), info = vi.fn()) {
  const app = express();
  app.use((_req, _res, next) => {
    Object.defineProperty(_req, "log", { value: {
      warn,
      info,
    } });
    next();
  });
  app.use("/api", healthRouter);

  const server: Server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test server address");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    return {
      status: response.status,
      body: await response.json(),
    };
  } finally {
    server.close();
    await once(server, "close");
  }
}

beforeEach(() => {
  state.connect.mockReset();
});

it("keeps liveness independent from the database", async () => {
  state.connect.mockRejectedValue(new Error("database unavailable"));

  await expect(request("/api/healthz")).resolves.toEqual({
    status: 200,
    body: { status: "ok" },
  });
  expect(state.connect).not.toHaveBeenCalled();
});

it("reports ready after a bounded PostgreSQL query succeeds", async () => {
  const client = mockClient(
    vi.fn()
      .mockResolvedValueOnce({ rows: [{ acquired: true }] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] }),
  );
  state.connect.mockResolvedValue(client);

  await expect(request("/api/readyz")).resolves.toEqual({
    status: 200,
    body: { status: "ready" },
  });
  expect(client.query).toHaveBeenNthCalledWith(1, {
    text: "SELECT pg_try_advisory_lock($1) AS acquired",
    values: [1_849_336_927],
    query_timeout: 1_000,
  });
  expect(client.query).toHaveBeenNthCalledWith(2, {
    text: "SELECT 1",
    query_timeout: 1_000,
  });
  expect(client.release).toHaveBeenCalledOnce();
});

it("returns a safe 503 envelope when PostgreSQL is unavailable", async () => {
  const warn = vi.fn();
  state.connect.mockRejectedValue(
    new Error("password=secret host=private.internal database unavailable"),
  );

  await expect(request("/api/readyz", warn)).resolves.toEqual({
    status: 503,
    body: { status: "unavailable" },
  });
  await expect(request("/api/readyz", warn)).resolves.toEqual({
    status: 503,
    body: { status: "unavailable" },
  });

  expect(state.connect).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledWith("Database readiness check failed or deferred");
});

it("allows only one API instance to run the recovery probe", async () => {
  let lockHeld = false;
  let releaseFirstProbe: (() => void) | undefined;
  const firstProbePaused = new Promise<void>((resolve) => {
    releaseFirstProbe = resolve;
  });

  function instancePool() {
    return {
      connect: vi.fn(async () => {
        const client = mockClient(vi.fn(async (query: QueryConfig) => {
          if (query.text.includes("pg_try_advisory_lock")) {
            if (lockHeld) return { rows: [{ acquired: false }] };
            lockHeld = true;
            return { rows: [{ acquired: true }] };
          }
          if (query.text === "SELECT 1") {
            await firstProbePaused;
            return { rows: [{ "?column?": 1 }] };
          }
          lockHeld = false;
          return { rows: [{ pg_advisory_unlock: true }] };
        }));
        return client;
      }),
    };
  }

  const firstInstance = createReadinessProbe(instancePool(), {
    retryDelayMs: () => 1_000,
  });
  const secondInstance = createReadinessProbe(instancePool(), {
    retryDelayMs: () => 1_000,
  });

  const firstResult = firstInstance();
  await vi.waitFor(() => expect(lockHeld).toBe(true));
  await expect(secondInstance()).resolves.toEqual({
    status: "unavailable",
    source: "fresh-check",
  });
  releaseFirstProbe?.();
  await expect(firstResult).resolves.toEqual({ status: "ready" });
});

it("uses a bounded local backoff after coordination fails, then detects recovery", async () => {
  let time = 10_000;
  const client = mockClient(
    vi.fn()
      .mockResolvedValueOnce({ rows: [{ acquired: false }] })
      .mockResolvedValueOnce({ rows: [{ acquired: true }] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] }),
  );
  const readinessPool = { connect: vi.fn().mockResolvedValue(client) };
  const probe = createReadinessProbe(readinessPool, {
    now: () => time,
    retryDelayMs: () => 900,
  });

  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "fresh-check",
  });
  time += 899;
  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "retry-cache",
  });
  expect(readinessPool.connect).toHaveBeenCalledOnce();

  time += 1;
  await expect(probe()).resolves.toEqual({
    status: "ready",
    recovery: {
      outageDurationMs: 900,
      retryCacheResponses: 1,
    },
  });
  expect(readinessPool.connect).toHaveBeenCalledTimes(2);
});

it("reports one outage summary and resets its counters after recovery", async () => {
  let time = 20_000;
  const client = mockClient(
    vi.fn()
      .mockResolvedValueOnce({ rows: [{ acquired: false }] })
      .mockResolvedValueOnce({ rows: [{ acquired: true }] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] })
      .mockResolvedValueOnce({ rows: [{ acquired: true }] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: true }] }),
  );
  const probe = createReadinessProbe(
    { connect: vi.fn().mockResolvedValue(client) },
    {
      now: () => time,
      retryDelayMs: () => 1_000,
    },
  );

  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "fresh-check",
  });
  time += 100;
  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "retry-cache",
  });
  time += 200;
  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "retry-cache",
  });
  time += 700;
  await expect(probe()).resolves.toEqual({
    status: "ready",
    recovery: {
      outageDurationMs: 1_000,
      retryCacheResponses: 2,
    },
  });

  time += 1_000;
  await expect(probe()).resolves.toEqual({ status: "ready" });
});

it("never reports ready when the coordinator itself fails", async () => {
  const readinessPool = {
    connect: vi.fn().mockRejectedValue(new Error("coordinator unavailable")),
  };
  const probe = createReadinessProbe(readinessPool);

  await expect(probe()).resolves.toEqual({
    status: "unavailable",
    source: "fresh-check",
  });
});

it("destroys a session when PostgreSQL says the advisory lock was not released", async () => {
  const client = mockClient(
    vi.fn()
      .mockResolvedValueOnce({ rows: [{ acquired: true }] })
      .mockResolvedValueOnce({ rows: [{ "?column?": 1 }] })
      .mockResolvedValueOnce({ rows: [{ unlocked: false }] }),
  );
  const probe = createReadinessProbe({
    connect: vi.fn().mockResolvedValue(client),
  });

  await expect(probe()).resolves.toEqual({ status: "ready" });
  expect(client.release).toHaveBeenCalledOnce();
  expect(client.release).toHaveBeenCalledWith(true);
});