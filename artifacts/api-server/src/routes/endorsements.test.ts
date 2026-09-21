import express from "express";

type Status = "draft" | "approved" | "archived";
type Record = {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  quote: string;
  photoUrl: string | null;
  sourceUrl: string | null;
  status: Status;
  displayOrder: number;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const state = vi.hoisted(() => {
  const rows: Record[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Approved reviewer",
      title: "Researcher",
      organization: "Verified Institute",
      quote: "A verified quotation.",
      photoUrl: null,
      sourceUrl: "https://example.com/review",
      status: "approved",
      displayOrder: 2,
      createdAt: new Date("2026-01-02T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Unpublished reviewer",
      title: null,
      organization: null,
      quote: "This must not be public.",
      photoUrl: null,
      sourceUrl: null,
      status: "draft",
      displayOrder: 1,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    },
  ];
  return { rows };
});

const table = {
  id: "id",
  status: "status",
  displayOrder: "displayOrder",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

type Predicate = (row: Record) => boolean;
const matches = (row: Record, predicate?: Predicate) => !predicate || predicate(row);

const select = vi.fn(() => ({
  from: vi.fn(() => {
    let predicate: Predicate | undefined;
    const query = {
      where(next: Predicate) {
        predicate = next;
        return query;
      },
      orderBy() {
        return Promise.resolve(state.rows.filter((row: Record) => matches(row, predicate)));
      },
      limit(count: number) {
        return Promise.resolve(state.rows.filter((row: Record) => matches(row, predicate)).slice(0, count));
      },
    };
    return query;
  }),
}));

const insert = vi.fn(() => ({
  values: vi.fn((values: Omit<Record, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Record, "displayOrder">>) => ({
    returning: vi.fn(async () => {
      const now = new Date("2026-02-01T00:00:00Z");
      const row: Record = {
        ...values,
      title: values.title ?? null,
      organization: values.organization ?? null,
      photoUrl: values.photoUrl ?? null,
      sourceUrl: values.sourceUrl ?? null,
      displayOrder: values.displayOrder ?? 0,
        id: "00000000-0000-4000-8000-000000000003",
        createdAt: now,
        updatedAt: now,
      };
      state.rows.push(row);
      return [row];
    }),
  })),
}));

const update = vi.fn(() => ({
  set: vi.fn((values: Partial<Record>) => ({
    where: vi.fn((predicate: Predicate) => ({
      returning: vi.fn(async () => {
        const row = state.rows.find(predicate);
        if (!row) return [];
        Object.assign(row, values);
        return [row];
      }),
    })),
  })),
}));

const remove = vi.fn(() => ({
  where: vi.fn((predicate: Predicate) => ({
    returning: vi.fn(async () => {
      const index = state.rows.findIndex(predicate);
      if (index < 0) return [];
      const [row] = state.rows.splice(index, 1);
      return [{ id: row.id }];
    }),
  })),
}));

type DbMock = {
  select: typeof select;
  insert: typeof insert;
  update: typeof update;
  delete: typeof remove;
};

vi.mock("@workspace/db", () => ({
  db: {
    select,
    insert,
    update,
    delete: remove,
    transaction: async (callback: (transaction: DbMock) => Promise<unknown>) => {
      const snapshot: Record[] = state.rows.map((row: Record) => ({ ...row }));
      try {
        return await callback({ select, insert, update, delete: remove });
      } catch (error) {
        state.rows.splice(0, state.rows.length, ...snapshot);
        throw error;
      }
    },
  },
  endorsementsTable: table,
}));

vi.mock("drizzle-orm", () => ({
  eq: (field: keyof Record, value: unknown): Predicate => (row) => row[field] === value,
  asc: (field: string) => field,
}));

vi.mock("../middlewares/adminSecurity", () => ({
  authenticatedAdministratorId: () => "user_admin_test",
  requireAdministrator: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireTrustedAdminOrigin: (_req: unknown, _res: unknown, next: () => void) => next(),
  verifyAdminCsrfToken: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

const { default: router } = await import("./endorsements");

function startServer() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Server did not bind");
  return {
    server,
    request: (path: string, init?: RequestInit) =>
      fetch(`http://127.0.0.1:${address.port}${path}`, init),
  };
}

describe("endorsement API contract and publication boundary", () => {
  beforeEach(() => {
    state.rows.splice(
      0,
      state.rows.length,
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Approved reviewer",
        title: "Researcher",
        organization: "Verified Institute",
        quote: "A verified quotation.",
        photoUrl: null,
        sourceUrl: "https://example.com/review",
        status: "approved",
        displayOrder: 2,
        createdAt: new Date("2026-01-02T00:00:00Z"),
        updatedAt: new Date("2026-01-02T00:00:00Z"),
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "Unpublished reviewer",
        title: null,
        organization: null,
        quote: "This must not be public.",
        photoUrl: null,
        sourceUrl: null,
        status: "draft",
        displayOrder: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      },
    );
  });

  it("returns approved records only, ordered for display", async () => {
    const { server, request } = startServer();
    const response = await request("/api/endorsements");
    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ name: string }>;
    expect(body).toHaveLength(1);
    expect(body[0]?.name).toBe("Approved reviewer");
    expect(JSON.stringify(body)).not.toContain("Unpublished reviewer");
    server.close();
  });

  it("supports create, approve, reorder, and delete through the admin contract", async () => {
    const { server, request } = startServer();
    const create = await request("/api/admin/endorsements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "New reviewer",
        quote: "Awaiting approval.",
        status: "draft",
      }),
    });
    expect(create.status).toBe(201);
    const created = (await create.json()) as { id: string; status: Status };
    expect(created.status).toBe("draft");

    const approve = await request(`/api/admin/endorsements/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: "approved",
        approvalConfirmation:
          "I confirm that this endorsement is authentic and authorized for publication.",
      }),
    });
    expect(approve.status).toBe(200);
    const approved = await approve.json() as {
      status: Status;
      approvedBy: string;
      approvedAt: string;
    };
    expect(approved.status).toBe("approved");
    expect(approved.approvedBy).toBe("user_admin_test");
    expect(approved.approvedAt).toBeTruthy();

    const reorder = await request("/api/admin/endorsements/order", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: created.id, displayOrder: 0 },
          { id: "00000000-0000-4000-8000-000000000001", displayOrder: 1 },
        ],
      }),
    });
    expect(reorder.status).toBe(200);

    const removeResponse = await request(`/api/admin/endorsements/${created.id}`, {
      method: "DELETE",
    });
    expect(removeResponse.status).toBe(204);
    server.close();
  });

  it("rejects approval without the exact authenticity confirmation", async () => {
    const { server, request } = startServer();
    const response = await request(
      "/api/admin/endorsements/00000000-0000-4000-8000-000000000002",
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      },
    );

    expect(response.status).toBe(400);
    expect(state.rows[1]?.status).toBe("draft");
    server.close();
  });

  it("rejects malformed IDs and server-controlled fields", async () => {
    insert.mockClear();
    const { server, request } = startServer();
    const malformed = await request("/api/admin/endorsements/not-a-uuid");
    expect(malformed.status).toBe(400);
    const unknownField = await request("/api/admin/endorsements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Reviewer",
        quote: "Quotation",
        status: "draft",
        id: "00000000-0000-4000-8000-000000000099",
      }),
    });
    expect(unknownField.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
    server.close();
  });

  it("rolls back every reorder update when one endorsement is missing", async () => {
    const originalOrder = state.rows.map(
      ({ id, displayOrder }: Record) => ({
        id,
        displayOrder,
      }),
    );
    const { server, request } = startServer();
    const response = await request("/api/admin/endorsements/order", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            id: "00000000-0000-4000-8000-000000000001",
            displayOrder: 99,
          },
          {
            id: "00000000-0000-4000-8000-000000000099",
            displayOrder: 0,
          },
        ],
      }),
    });
    expect(response.status).toBe(404);
    expect(
      state.rows.map(({ id, displayOrder }: Record) => ({ id, displayOrder })),
    ).toEqual(originalOrder);
    server.close();
  });
});