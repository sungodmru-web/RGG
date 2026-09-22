import { once } from "node:events";
import type { Server } from "node:http";
import path from "node:path";

const clerkState = vi.hoisted(() => ({
  middlewareCalls: 0,
  middlewareExecutions: 0,
  publishableKeys: [] as string[],
}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: vi.fn(
    (options: (req: unknown) => { publishableKey?: string }) => {
      clerkState.middlewareCalls++;
      return (req: unknown, _res: unknown, next: () => void) => {
        clerkState.middlewareExecutions++;
        clerkState.publishableKeys.push(options(req).publishableKey ?? "");
        next();
      };
    },
  ),
  clerkClient: {
    users: {
      getUser: vi.fn(),
      updateUserMetadata: vi.fn(),
    },
    sessions: {
      revokeSession: vi.fn(),
    },
  },
  getAuth: vi.fn(() => ({ userId: null, sessionId: null })),
}));

vi.mock("@clerk/shared/keys", () => ({
  publishableKeyFromHost: vi.fn(
    (_host: string, fallback?: string) => fallback ?? "",
  ),
}));

vi.mock("./middlewares/clerkProxyMiddleware", () => ({
  CLERK_PROXY_PATH: "/__clerk",
  clerkProxyMiddleware: vi.fn(() => (
    _req: unknown,
    _res: unknown,
    next: () => void,
  ) => next()),
  getClerkProxyHost: vi.fn(() => "api.example.test"),
}));

vi.mock("@workspace/db", () => {
  const rateLimitClient = {
    query: vi.fn(async (query: string | { text: string }) =>
      typeof query === "string"
        ? { rows: [] }
        : { rows: [{ count: 1, retry_after: 60 }] }),
    release: vi.fn(),
  };
  const table = {
    id: "id",
    name: "name",
    slug: "slug",
    status: "status",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    displayOrder: "displayOrder",
  };

  return {
    db: {},
    pool: {
      connect: vi.fn(async () => rateLimitClient),
    },
    adminActivityTable: table,
    administratorsTable: table,
    endorsementsTable: table,
    enquiriesTable: table,
    mediaTable: table,
    publicationsTable: table,
    themesTable: table,
  };
});

process.env.NODE_ENV = "production";
process.env.APP_ORIGIN = "https://admin.example.test";
process.env.CSRF_SECRET = "test-only-csrf-secret";
process.env.CLERK_SECRET_KEY = "sk_test_startup_only";
process.env.CLERK_PUBLISHABLE_KEY = "pk_test_startup_only";
process.env.STATIC_DIR = path.resolve(
  process.cwd(),
  "../../artifacts/rgg-website/dist/public",
);

const { default: app } = await import("./app");

let server: Server;
let baseUrl: string;

async function request(pathname: string): Promise<Response> {
  return fetch(`${baseUrl}${pathname}`, {
    headers: { Connection: "close" },
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

describe("configured Clerk startup", () => {
  it("runs Clerk middleware while keeping admin routes private and public routes available", async () => {
    expect(clerkState.middlewareCalls).toBe(1);

    const health = await request("/api/healthz");
    const admin = await request("/api/admin/administrators");
    const spa = await request("/");

    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    expect(admin.status).toBe(401);
    expect(await admin.json()).toEqual({ error: "Authentication required" });

    expect(spa.status).toBe(200);
    expect(await spa.text()).toContain("<!DOCTYPE html>");

    expect(clerkState.middlewareExecutions).toBe(3);
    expect(clerkState.publishableKeys).toEqual([
      "pk_test_startup_only",
      "pk_test_startup_only",
      "pk_test_startup_only",
    ]);
  });
});