import express from "express";
import { createServer, request as httpRequest, type Server } from "node:http";

type Row = {
  id: string; name: string; email: string; organization: string | null;
  enquiryType: string; subject: string; message: string; language: string;
  reviewStatus: "new" | "in_progress" | "resolved";
  deliveryStatus: "pending" | "sent" | "failed";
  providerId: string | null; providerError: string | null;
  deliveryAttemptedAt: Date | null; createdAt: Date; updatedAt: Date;
};

const state = vi.hoisted(() => ({
  rows: [] as Row[],
  inserted: vi.fn(),
  sent: vi.fn(),
}));

vi.mock("@workspace/db", () => ({
  enquiriesTable: {
    id: "id", createdAt: "createdAt", reviewStatus: "reviewStatus",
    deliveryStatus: "deliveryStatus",
  },
  adminActivityTable: {},
  db: {
    insert: (...args: unknown[]) => {
      state.inserted(...args);
      return {
        values: (values: Partial<Row>) => ({
          returning: async () => {
            const row = {
              ...values, id: "00000000-0000-4000-8000-000000000001",
              organization: values.organization ?? null, providerId: null, providerError: null,
              deliveryAttemptedAt: null, reviewStatus: "new", deliveryStatus: "pending",
              createdAt: new Date(), updatedAt: new Date(),
            } as Row;
            state.rows.push(row);
            return [row];
          },
          catch: async () => undefined,
        }),
      };
    },
    select: () => ({
      from: () => ({
        orderBy: async () => state.rows,
        where: () => ({ limit: async () => state.rows.slice(0, 1) }),
      }),
    }),
    update: () => ({
      set: (values: Partial<Row>) => ({
        where: () => {
          const row = state.rows[0];
          if (row) Object.assign(row, values);
          const result = row ? [row] : [];
          Object.assign(result, { returning: async () => result });
          return result;
        },
      }),
    }),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: () => undefined,
  desc: () => undefined,
}));

vi.mock("../middlewares/adminSecurity", () => ({
  requireAdministrator: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.get("x-admin") !== "yes") { res.status(401).json({ error: "Authentication required" }); return; }
    next();
  },
  requireTrustedAdminOrigin: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  verifyAdminCsrfToken: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.get("x-csrf") !== "yes") { res.status(403).json({ error: "CSRF token required" }); return; }
    next();
  },
  authenticatedAdministratorId: () => "admin-user",
}));

vi.mock("../lib/enquiries", () => ({
  sendEnquiryEmail: async (...args: unknown[]) => {
    state.sent(...args);
    return { id: "provider-message-id" };
  },
}));

import router from "./enquiries";

async function request(server: Server, method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const address = server.address() as { port: number };
    const req = httpRequest({ port: address.port, path, method, headers: { "content-type": "application/json", ...headers } }, (res: any) => {
      let data = ""; res.on("data", (chunk: Buffer) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data || "{}") }));
    });
    req.on("error", reject); if (body !== undefined) req.write(JSON.stringify(body)); req.end();
  });
}

function start() {
  const app = express(); app.use(express.json()); app.use("/api", router);
  return new Promise<{ server: Server; close: () => Promise<void> }>((resolve) => {
    const server = createServer(app).listen(0, () => resolve({
      server, close: () => new Promise((done) => server.close(() => done())),
    }));
  });
}

const valid = {
  name: "A visitor", email: "visitor@example.com", organization: null,
  enquiryType: "technical_assistance", subject: "Hello", message: "A message", language: "english", honeypot: "",
};

beforeEach(() => { state.rows.length = 0; state.inserted.mockClear(); state.sent.mockClear(); });

it("rejects invalid public payload without inserting", async () => {
  const running = await start();
  const response = await request(running.server, "POST", "/api/enquiries", { ...valid, email: "bad" });
  expect(response.status).toBe(400); expect(state.inserted).not.toHaveBeenCalled();
  await running.close();
});

it("persists valid enquiries and exposes only the generic accepted response", async () => {
  const running = await start();
  const response = await request(running.server, "POST", "/api/enquiries", valid);
  expect(response.status).toBe(200); expect(response.body).toEqual({ accepted: true });
  expect(state.rows).toHaveLength(1); expect(state.sent).toHaveBeenCalledTimes(1);
  await running.close();
});

it("returns camelCase admin delivery failure counts", async () => {
  state.rows.push({ ...valid, id: "x", reviewStatus: "new", deliveryStatus: "failed", providerId: null, providerError: "safe", deliveryAttemptedAt: new Date(), createdAt: new Date(), updatedAt: new Date() } as Row);
  const running = await start();
  const response = await request(running.server, "GET", "/api/admin/enquiries", undefined, { "x-admin": "yes" });
  expect(response.status).toBe(200);
  expect(response.body.counts).toEqual({ total: 1, new: 1, inProgress: 0, resolved: 0, deliveryFailed: 1 });
  await running.close();
});

it("requires admin and CSRF for review status updates", async () => {
  state.rows.push({ ...valid, id: "x", reviewStatus: "new", deliveryStatus: "sent", providerId: null, providerError: null, deliveryAttemptedAt: null, createdAt: new Date(), updatedAt: new Date() } as Row);
  const running = await start();
  expect((await request(running.server, "PATCH", "/api/admin/enquiries/x", { reviewStatus: "resolved" })).status).toBe(401);
  expect((await request(running.server, "PATCH", "/api/admin/enquiries/x", { reviewStatus: "resolved" }, { "x-admin": "yes" })).status).toBe(403);
  const response = await request(running.server, "PATCH", "/api/admin/enquiries/x", { reviewStatus: "resolved" }, { "x-admin": "yes", "x-csrf": "yes" });
  expect(response.status).toBe(200); expect(response.body.reviewStatus).toBe("resolved");
  await running.close();
});