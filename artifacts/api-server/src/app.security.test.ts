import { createHmac, randomUUID } from "node:crypto";
import { once } from "node:events";
import type { Server } from "node:http";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  sessionId: "session-1" as string | null,
  role: "admin" as string | undefined,
  primaryEmail: null as string | null,
  emailVerified: false,
  locked: false,
  banned: false,
  metadataUpdateCalls: 0,
  selectMode: "normal" as "normal" | "error" | "concurrent-delete",
  insertMode: "normal" as "normal" | "unique",
  selectCalls: 0,
  insertCalls: 0,
  updateCalls: 0,
  deleteCalls: 0,
  userLookupCalls: 0,
  revokedSessionIds: new Set<string>(),
  rateLimits: new Map<string, { count: number; resetAt: Date }>(),
}));

const publication = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "a-publication",
  title: "A publication",
  abstract: "Abstract",
  publicationType: "report",
  authors: [{ name: "RGG" }],
  featured: false,
  status: "draft",
  publicationDate: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};
const fields = {
  id: "id",
  slug: "slug",
  status: "status",
  featured: "featured",
  publicationDate: "publicationDate",
  updatedAt: "updatedAt",
};

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  clerkClient: {
    users: {
      getUser: vi.fn(async () => {
        state.userLookupCalls++;
        return {
          publicMetadata: { role: state.role },
          primaryEmailAddressId: state.primaryEmail ? "email-1" : null,
          emailAddresses: state.primaryEmail
            ? [{
                id: "email-1",
                emailAddress: state.primaryEmail,
                verification: {
                  status: state.emailVerified ? "verified" : "unverified",
                },
              }]
            : [],
          locked: state.locked,
          banned: state.banned,
        };
      }),
      updateUserMetadata: vi.fn(async (
        _userId: string,
        input: { publicMetadata?: { role?: string } },
      ) => {
        state.metadataUpdateCalls++;
        state.role = input.publicMetadata?.role;
      }),
    },
    sessions: {
      revokeSession: vi.fn(async (sessionId: string) => {
        state.revokedSessionIds.add(sessionId);
      }),
    },
  },
  getAuth: () => {
    const revoked =
      state.sessionId !== null && state.revokedSessionIds.has(state.sessionId);
    return {
      userId: revoked ? null : state.userId,
      sessionId: revoked ? null : state.sessionId,
    };
  },
}));
vi.mock("./middlewares/clerkProxyMiddleware", () => ({
  CLERK_PROXY_PATH: "/__clerk",
  clerkProxyMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getClerkProxyHost: () => undefined,
}));
vi.mock("@workspace/db", () => {
  const select = vi.fn(() => ({
    from: vi.fn(() => {
      const query = {
        where: vi.fn(() => query),
        orderBy: vi.fn(async () => {
          if (state.selectMode === "error") throw new Error("SQL secret/path should not escape");
          return [publication];
        }),
        limit: vi.fn(async () => {
          state.selectCalls++;
          if (state.selectMode === "error") throw new Error("SQL secret/path should not escape");
          return [publication];
        }),
      };
      return query;
    }),
  }));
  const insert = vi.fn(() => {
    state.insertCalls++;
    return {
      values: () => ({
        returning: async () => {
          if (state.insertMode === "unique") {
            throw Object.assign(new Error("duplicate"), { cause: { code: "23505" } });
          }
          return [publication];
        },
      }),
    };
  });
  const update = vi.fn(() => {
    state.updateCalls++;
    return { set: () => ({ where: () => ({ returning: async () => state.selectMode === "concurrent-delete" ? [] : [publication] }) }) };
  });
  const remove = vi.fn(() => {
    state.deleteCalls++;
    return { where: () => ({ returning: async () => [{ id: publication.id }] }) };
  });
  const transaction = async (
    callback: (client: {
      select: typeof select;
      insert: typeof insert;
      update: typeof update;
      delete: typeof remove;
      execute: () => Promise<void>;
    }) => Promise<unknown>,
  ) =>
    callback({
      select,
      insert,
      update,
      delete: remove,
      execute: async () => undefined,
    });
  const consumeRateLimit = (values: unknown[] = []) => {
    const key = values[0] as string;
    const windowMs = Number(values[1] ?? 60_000);
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);
    const current = state.rateLimits.get(key);
    const next = !current || current.resetAt <= now
      ? { count: 1, resetAt }
      : { count: current.count + 1, resetAt: current.resetAt };
    state.rateLimits.set(key, next);
    return {
      rows: [{
        count: next.count,
        retry_after: Math.max(1, Math.ceil((next.resetAt.getTime() - now.getTime()) / 1000)),
      }],
    };
  };
  const client = {
    query: vi.fn(async (query: string | { text: string; values?: unknown[] }) =>
      typeof query === "string" || !query.values ? { rows: [] } : consumeRateLimit(query.values)
    ),
    release: vi.fn(),
  };
  return {
    db: { select, insert, update, delete: remove, transaction },
    pool: { connect: vi.fn(async () => client) },
    publicationsTable: fields,
  };
});
vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray) => strings.join(""),
  eq: (field: keyof typeof publication, value: unknown) => (row: typeof publication) => row[field] === value,
  and: (...predicates: ((row: typeof publication) => boolean)[]) => (row: typeof publication) =>
    predicates.every((predicate) => predicate(row)),
  desc: (field: string) => field,
}));

process.env.NODE_ENV = "production";
process.env.APP_ORIGIN = "https://admin.example.test";
process.env.APP_ORIGINS = "https://alternate.example.test";
process.env.CSRF_SECRET = "test-only-csrf-secret";
process.env.CLERK_PUBLISHABLE_KEY = "pk_test_not-a-secret";

const { default: app } = await import("./app");
let server: Server;
let baseUrl: string;

function token(userId = state.userId!, sessionId = state.sessionId ?? "", exp = Math.floor(Date.now() / 1000) + 300) {
  const payload = Buffer.from(JSON.stringify({ userId, sessionId, exp, nonce: randomUUID() })).toString("base64url");
  return `${payload}.${createHmac("sha256", process.env.CSRF_SECRET!).update(payload).digest("base64url")}`;
}

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Connection: "close",
      ...init.headers,
    },
  });
}

beforeAll(async () => {
  server = app.listen(0);
  await once(server, "listening");
  const address = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

beforeEach(() => {
  state.userId = null;
  state.sessionId = "session-1";
  state.role = "admin";
  state.primaryEmail = null;
  state.emailVerified = false;
  state.locked = false;
  state.banned = false;
  state.metadataUpdateCalls = 0;
  state.selectMode = "normal";
  state.insertMode = "normal";
  state.selectCalls = state.insertCalls = state.updateCalls = state.deleteCalls = 0;
  state.userLookupCalls = 0;
  state.revokedSessionIds.clear();
  state.rateLimits.clear();
});

describe("application security middleware", () => {
  it("sets security headers and only emits HSTS in production", async () => {
    const response = await request("/api/not-a-route");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("strict-transport-security")).toContain("max-age=31536000");
  });

  it("does not emit HSTS outside production", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const response = await request("/api/not-a-route");
      expect(response.headers.get("strict-transport-security")).toBeNull();
    } finally {
      process.env.NODE_ENV = previous;
    }
  });

  it("allows configured CORS origins, rejects malicious origins, and never wildcards credentials", async () => {
    const allowed = await request("/api/not-a-route", { headers: { Origin: "https://admin.example.test" } });
    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://admin.example.test");
    expect(allowed.headers.get("access-control-allow-credentials")).toBe("true");
    const malicious = await request("/api/not-a-route", { headers: { Origin: "https://evil.example.test" } });
    expect(malicious.headers.get("access-control-allow-origin")).not.toBe("https://evil.example.test");
    expect(malicious.headers.get("access-control-allow-origin")).not.toBe("*");
    expect(malicious.headers.get("access-control-allow-credentials")).toBeNull();
    const sameOrigin = await request("/api/healthz");
    expect(sameOrigin.status).toBe(200);
    expect(sameOrigin.headers.get("access-control-allow-origin")).toBeNull();
    expect(sameOrigin.headers.get("access-control-allow-credentials")).toBeNull();
  });

  it("protects the admin session endpoint", async () => {
    const signedOut = await request("/api/admin/session");
    expect(signedOut.status).toBe(200);
    expect(signedOut.headers.get("cache-control")).toBe("no-store");
    expect(await signedOut.json()).toEqual({ authenticated: false });
    state.userId = "ordinary-user";
    state.role = undefined;
    const nonAdmin = await request("/api/admin/session");
    expect(nonAdmin.status).toBe(200);
    expect(await nonAdmin.json()).toEqual({ authenticated: false });
    state.userId = "admin-user";
    state.role = "admin";
    const response = await request("/api/admin/session");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      authenticated: true,
      user: { role: "admin" },
    });
  });

  it.each([
    "SUNNY@RECLAIMINGTHEGREENGOLD.COM",
    "soobaschand@reclaimingthegreengold.com",
  ])(
    "repairs the approved verified production administrator role for %s before granting access",
    async (email: string) => {
      state.userId = "production-admin-user";
      state.role = undefined;
      state.primaryEmail = email;
      state.emailVerified = true;

      const response = await request("/api/admin/session");

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        authenticated: true,
        user: { role: "admin" },
      });
      expect(state.metadataUpdateCalls).toBe(1);
      expect(state.role).toBe("admin");
      expect(state.userLookupCalls).toBe(2);
    },
  );

  it("does not bootstrap an unverified or unapproved Clerk identity", async () => {
    state.userId = "ordinary-user";
    state.role = undefined;
    state.primaryEmail = "sunny@reclaimingthegreengold.com";
    state.emailVerified = false;

    const unverified = await request("/api/admin/session");
    expect(await unverified.json()).toEqual({ authenticated: false });
    expect(state.metadataUpdateCalls).toBe(0);

    state.primaryEmail = "other@example.com";
    state.emailVerified = true;
    const unapproved = await request("/api/admin/session");
    expect(await unapproved.json()).toEqual({ authenticated: false });
    expect(state.metadataUpdateCalls).toBe(0);
  });

  it("allows normal administrator session checks and limits repeated checks safely", async () => {
    state.userId = "admin-user";
    state.role = "admin";
    const client = `203.0.113.${Math.floor(Math.random() * 100) + 1}`;

    for (let attempt = 0; attempt < 10; attempt++) {
      const response = await request("/api/admin/session", {
        headers: { "x-forwarded-for": client },
      });
      expect(response.status).toBe(200);
    }

    let limited: Response | undefined;
    for (let attempt = 0; attempt < 51; attempt++) {
      limited = await request("/api/admin/session", {
        headers: { "x-forwarded-for": client },
      });
    }

    expect(limited?.status).toBe(429);
    expect(await limited?.json()).toEqual({ error: "Too many requests" });
    expect(limited?.headers.get("retry-after")).toMatch(/^\d+$/);
  });

  it("shares concurrent session and mutation budgets across simulated API instances", async () => {
    const { createAdministratorRateLimiter } = await import("./middlewares/adminSecurity");
    const counters = new Map<string, { count: number; resetAt: number }>();
    const store = {
      async consume(key: string, now: number, windowMs: number) {
        await Promise.resolve();
        const current = counters.get(key);
        const next = !current || current.resetAt <= now
          ? { count: 1, resetAt: now + windowMs }
          : { count: current.count + 1, resetAt: current.resetAt };
        counters.set(key, next);
        return {
          count: next.count,
          retryAfter: Math.ceil((next.resetAt - now) / 1000),
        };
      },
    };
    const instances = [
      createAdministratorRateLimiter(store),
      createAdministratorRateLimiter(store),
    ];
    function consumeAcrossInstances(method: "GET" | "POST", attempts: number) {
      return Promise.all(
        Array.from({ length: attempts }, (_, attempt) =>
          new Promise<number>((resolve) => {
            const req = {
              method,
              ip: "203.0.113.200",
              path: "/session",
            } as never;
            const response = {
              setHeader: vi.fn(),
              status: vi.fn(function (this: { statusCode?: number }, status: number) {
                this.statusCode = status;
                return this;
              }),
              json: vi.fn(function (this: { statusCode?: number }) {
                resolve(this.statusCode ?? 200);
              }),
            };
            void instances[attempt % 2](req, response as never, () => resolve(200));
          }),
        ),
      );
    }
    const [sessionStatuses, mutationStatuses] = await Promise.all([
      consumeAcrossInstances("GET", 62),
      consumeAcrossInstances("POST", 32),
    ]);

    expect(sessionStatuses.filter((status) => status === 200)).toHaveLength(60);
    expect(sessionStatuses.filter((status) => status === 429)).toHaveLength(2);
    expect(mutationStatuses.filter((status) => status === 200)).toHaveLength(30);
    expect(mutationStatuses.filter((status) => status === 429)).toHaveLength(2);
  });

  it("fails closed with the existing bounded limit response when the shared store fails", async () => {
    const { createAdministratorRateLimiter } = await import("./middlewares/adminSecurity");
    const limiter = createAdministratorRateLimiter({
      consume: async () => {
        throw new Error("database details must not escape");
      },
    });
    const req = { method: "GET", ip: "192.0.2.200", path: "/session" } as never;
    const response = {
      setHeader: vi.fn(),
      status: vi.fn(function (this: { statusCode?: number }, status: number) {
        this.statusCode = status;
        return this;
      }),
      json: vi.fn(),
    };

    await limiter(req, response as never, vi.fn());

    expect(response.setHeader).toHaveBeenCalledWith("Retry-After", "60");
    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.json).toHaveBeenCalledWith({ error: "Too many requests" });
  });

  it("fails closed within a bounded deadline when the shared store stalls", async () => {
    vi.useFakeTimers();
    try {
      const { createAdministratorRateLimiter } = await import("./middlewares/adminSecurity");
      const limiter = createAdministratorRateLimiter({
        consume: () => new Promise(() => undefined),
      });
      const response = {
        setHeader: vi.fn(),
        status: vi.fn(function (this: object) { return this; }),
        json: vi.fn(),
      };
      const pending = limiter(
        { method: "GET", ip: "192.0.2.201", path: "/session" } as never,
        response as never,
        vi.fn(),
      );

      await vi.advanceTimersByTimeAsync(3_000);
      await pending;

      expect(response.setHeader).toHaveBeenCalledWith("Retry-After", "60");
      expect(response.status).toHaveBeenCalledWith(429);
      expect(response.json).toHaveBeenCalledWith({ error: "Too many requests" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("limits repeated administrator mutations before Clerk or database work", async () => {
    state.userId = "admin-user";
    const client = `198.51.100.${Math.floor(Math.random() * 100) + 1}`;
    const headers = {
      "x-forwarded-for": client,
      Origin: "https://admin.example.test",
      "x-csrf-token": token(),
      "content-type": "application/json",
    };

    for (let attempt = 0; attempt < 30; attempt++) {
      const response = await request("/api/admin/publications", {
        method: "POST",
        headers,
        body: "{}",
      });
      expect(response.status).toBe(400);
    }

    const writesBeforeLimit = state.insertCalls + state.updateCalls + state.deleteCalls;
    const limited = await request("/api/admin/publications", {
      method: "POST",
      headers,
      body: "{}",
    });

    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: "Too many requests" });
    expect(state.insertCalls + state.updateCalls + state.deleteCalls).toBe(writesBeforeLimit);
  });

  it("limits repeated unauthorized administrator reads before more Clerk lookups", async () => {
    state.userId = "ordinary-user";
    state.role = undefined;
    const client = `192.0.2.${Math.floor(Math.random() * 100) + 1}`;

    for (let attempt = 0; attempt < 60; attempt++) {
      const response = await request("/api/admin/publications", {
        headers: { "x-forwarded-for": client },
      });
      expect(response.status).toBe(403);
    }

    const lookupsBeforeLimit = state.userLookupCalls;
    const limited = await request("/api/admin/publications", {
      headers: { "x-forwarded-for": client },
    });

    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: "Too many requests" });
    expect(state.userLookupCalls).toBe(lookupsBeforeLimit);
  });

  it("counts malformed administrator mutations before body parsing", async () => {
    const client = `100.64.0.${Math.floor(Math.random() * 100) + 1}`;
    const headers = {
      "x-forwarded-for": client,
      "content-type": "application/json",
    };

    for (let attempt = 0; attempt < 30; attempt++) {
      const response = await request("/api/admin/publications", {
        method: "POST",
        headers,
        body: "{",
      });
      expect(response.status).toBe(400);
    }

    const limited = await request("/api/admin/publications", {
      method: "POST",
      headers,
      body: "{",
    });

    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: "Too many requests" });
  });

  it("does not allow ADMIN_API_ENABLED to authorize an unauthenticated request", async () => {
    const previous = process.env.ADMIN_API_ENABLED;
    process.env.ADMIN_API_ENABLED = "true";
    state.userId = null;
    try {
      const response = await request("/api/admin/publications");
      expect(response.status).toBe(401);
      expect(state.selectCalls).toBe(0);
      expect(
        state.insertCalls + state.updateCalls + state.deleteCalls,
      ).toBe(0);
    } finally {
      if (previous === undefined) delete process.env.ADMIN_API_ENABLED;
      else process.env.ADMIN_API_ENABLED = previous;
    }
  });

  it("revokes the administrator session and expires its authentication cookie", async () => {
    state.userId = "admin-user";
    state.sessionId = "session-logout";
    state.role = "admin";

    const beforeLogout = await request("/api/admin/publications");
    expect(beforeLogout.status).toBe(200);

    const logout = await request("/api/admin/logout", {
      method: "POST",
      headers: {
        Origin: "https://admin.example.test",
        "x-csrf-token": token(),
      },
    });
    expect(logout.status).toBe(204);
    expect(state.revokedSessionIds.has("session-logout")).toBe(true);
    expect(logout.headers.get("set-cookie")).toContain("__session=;");
    expect(logout.headers.get("set-cookie")).toContain("Path=/");
    expect(logout.headers.get("set-cookie")).toContain("HttpOnly");
    expect(logout.headers.get("set-cookie")).toContain("Secure");
    expect(logout.headers.get("set-cookie")).toContain("SameSite=Lax");

    const afterLogout = await request("/api/admin/publications");
    expect(afterLogout.status).toBe(401);
  });

  it("requires an administrator for CSRF tokens and returns fresh nonce tokens", async () => {
    expect((await request("/api/admin/csrf")).status).toBe(401);
    state.userId = "admin-user";
    state.sessionId = null;
    expect((await request("/api/admin/csrf")).status).toBe(401);
    state.sessionId = "session-1";
    const first = await request("/api/admin/csrf");
    const second = await request("/api/admin/csrf");
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as { csrfToken: string };
    const secondBody = (await second.json()) as { csrfToken: string };
    expect(firstBody.csrfToken).not.toBe(secondBody.csrfToken);
  });

  it("rejects mutations when Clerk provides no session ID", async () => {
    state.userId = "admin-user";
    state.sessionId = null;
    const response = await request("/api/admin/publications", {
      method: "POST",
      headers: {
        Origin: "https://admin.example.test",
        "x-csrf-token": token("admin-user", ""),
        "content-type": "application/json",
      },
      body: "{}",
    });
    expect(response.status).toBe(403);
    expect(state.insertCalls + state.updateCalls + state.deleteCalls).toBe(0);
  });

  const invalidMutationHeaders: [string, Record<string, string>][] = [
    ["missing origin", {}],
    ["malicious origin", { Origin: "https://evil.example" }],
    ["missing token", { Origin: "https://admin.example.test" }],
    ["malformed token", { Origin: "https://admin.example.test", "x-csrf-token": "bad" }],
    ["expired token", { Origin: "https://admin.example.test", "x-csrf-token": "expired" }],
    ["wrong user token", { Origin: "https://admin.example.test", "x-csrf-token": "wrong-user" }],
    ["wrong session token", { Origin: "https://admin.example.test", "x-csrf-token": "wrong-session" }],
  ];
  it.each(invalidMutationHeaders)("rejects mutation security: %s without database writes", async (_name: string, headers: Record<string, string>) => {
    state.userId = "admin-user";
    const values = headers["x-csrf-token"] === "expired"
      ? token("admin-user", "session-1", 1)
      : headers["x-csrf-token"] === "wrong-user"
        ? token("other-user")
        : headers["x-csrf-token"] === "wrong-session"
          ? token("admin-user", "other-session")
          : headers["x-csrf-token"];
    const response = await request("/api/admin/publications", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers, ...(values ? { "x-csrf-token": values } : {}) },
      body: "{}",
    });
    expect(response.status).toBe(403);
    expect(state.insertCalls + state.updateCalls + state.deleteCalls).toBe(0);
  });

  it("allows a configured origin with a valid CSRF token to reach mutation handling", async () => {
    state.userId = "admin-user";
    const response = await request("/api/admin/publications", {
      method: "POST",
      headers: { Origin: "https://admin.example.test", "x-csrf-token": token(), "content-type": "application/json" },
      body: JSON.stringify({ slug: "new", title: "New", abstract: "A", publicationType: "report", authors: [{ name: "A" }], featured: false, status: "draft" }),
    });
    expect(response.status).toBe(201);
    expect(state.insertCalls).toBe(1);
  });

  it("rejects PATCH without a CSRF token before updating the database", async () => {
    state.userId = "admin-user";
    const response = await request(
      `/api/admin/publications/${publication.id}`,
      {
        method: "PATCH",
        headers: {
          Origin: "https://admin.example.test",
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: "Must not be saved" }),
      },
    );
    expect(response.status).toBe(403);
    expect(state.updateCalls).toBe(0);
  });

  it("maps wrapped duplicate-key database errors to 409", async () => {
    state.userId = "admin-user";
    state.insertMode = "unique";
    const response = await request("/api/admin/publications", {
      method: "POST",
      headers: { Origin: "https://admin.example.test", "x-csrf-token": token(), "content-type": "application/json" },
      body: JSON.stringify({ slug: "duplicate", title: "Duplicate", abstract: "A", publicationType: "report", authors: [{ name: "A" }], featured: false, status: "draft" }),
    });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Publication slug already exists" });
  });

  it("returns deterministic 404 when a publication is deleted after PATCH existence read", async () => {
    state.userId = "admin-user";
    state.selectMode = "concurrent-delete";
    const response = await request(`/api/admin/publications/${publication.id}`, {
      method: "PATCH",
      headers: { Origin: "https://admin.example.test", "x-csrf-token": token(), "content-type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Publication not found" });
    expect(state.updateCalls).toBe(1);
  });

  it("returns safe JSON for malformed and oversized JSON", async () => {
    const malformed = await request("/api/admin/publications", { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    expect(malformed.status).toBe(400);
    expect(await malformed.json()).toEqual({ error: "Malformed JSON body" });
    const oversized = await request("/api/admin/publications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: "x".repeat(257 * 1024) }) });
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({ error: "Request body too large" });
  });

  it("returns generic JSON for route/database failures", async () => {
    state.selectMode = "error";
    const response = await request("/api/publications");
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/stack|SQL|secret|path|env/i);
  });
});
