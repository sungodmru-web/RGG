import express from "express";

const state = vi.hoisted(() => ({
  admin: false,
  metadata: { size: "1024", contentType: "application/pdf" } as Record<string, string>,
  bytes: Buffer.from("%PDF-1.7"),
  upload: vi.fn(),
  deleteObject: vi.fn(),
  deleteRecord: vi.fn(),
  selectResults: [] as unknown[][],
  insertResult: [{ id: "media-1" }],
}));

vi.mock("../middlewares/adminSecurity", () => ({
  requireAdministrator: (req: express.Request, res: express.Response, next: express.NextFunction) =>
    state.admin ? next() : res.status(401).json({ error: "Authentication required" }),
  requireTrustedAdminOrigin: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  verifyAdminCsrfToken: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  authenticatedAdministratorId: () => "admin-1",
  getAdministratorAccess: () => (state.admin ? "admin" : "unauthenticated"),
}));

vi.mock("../lib/objectStorage", () => ({
  ObjectNotFoundError: class extends Error {},
  ObjectStorageService: class {
    createUpload = state.upload;
    metadata = vi.fn(async () => state.metadata);
    firstBytes = vi.fn(async () => state.bytes);
    delete = state.deleteObject;
    file = vi.fn();
    response = vi.fn();
  },
}));

vi.mock("@workspace/db", () => {
  const table = new Proxy({}, { get: (_target, property) => property });
  const query = () => ({
    from: () => query(),
    where: () => query(),
    orderBy: () => query(),
    limit: async () => state.selectResults.shift() ?? [],
  });
  return {
    adminActivityTable: table,
    mediaTable: table,
    publicationsTable: table,
    endorsementsTable: table,
    themesTable: table,
    db: {
      select: () => query(),
      insert: () => ({
        values: () => ({
          returning: async () => state.insertResult,
          catch: async () => undefined,
        }),
      }),
      update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
      delete: () => ({ where: state.deleteRecord }),
    },
  };
});

vi.mock("drizzle-orm", () => ({
  and: (...values: unknown[]) => values,
  asc: (value: unknown) => value,
  desc: (value: unknown) => value,
  eq: (field: unknown, value: unknown) => [field, value],
  ilike: (field: unknown, value: unknown) => [field, value],
  or: (...values: unknown[]) => values,
}));

const { default: router } = await import("./adminContent");

function server() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  return app;
}

async function request(path: string, init?: RequestInit) {
  const app = server();
  const listener = app.listen(0);
  const address = listener.address();
  if (!address || typeof address === "string") throw new Error("test server did not start");
  try {
    return await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } finally {
    listener.close();
  }
}

describe("admin content media boundaries", () => {
  beforeEach(() => {
    state.admin = false;
    state.metadata = { size: "1024", contentType: "application/pdf" };
    state.bytes = Buffer.from("%PDF-1.7");
    state.selectResults = [];
    state.insertResult = [{ id: "media-1" }];
    state.upload.mockReset();
    state.deleteObject.mockReset();
    state.deleteObject.mockResolvedValue(undefined);
    state.deleteRecord.mockReset();
    state.deleteRecord.mockResolvedValue(undefined);
    state.upload.mockResolvedValue({ uploadURL: "https://upload.test", objectPath: "/objects/uploads/1" });
    delete process.env.MAX_PDF_UPLOAD_MB;
    delete process.env.MAX_IMAGE_UPLOAD_MB;
  });

  it.each(["/api/admin/themes", "/api/admin/media", "/api/admin/media/request-url"])(
    "denies anonymous access to %s",
    async (path: string) => expect((await request(path)).status).toBe(401),
  );

  it("denies a non-admin even when authenticated", async () => {
    state.admin = false;
    expect((await request("/api/admin/themes")).status).toBe(401);
  });

  it("allows an admin to request a valid PDF upload", async () => {
    state.admin = true;
    const response = await request("/api/admin/media/request-url", {
      method: "POST",
      body: JSON.stringify({ name: "report.pdf", size: 100, contentType: "application/pdf", purpose: "publication-pdf" }),
    });
    expect(response.status).toBe(200);
    expect(state.upload).toHaveBeenCalled();
  });

  it.each([
    [{ name: "report.txt", size: 100, contentType: "application/pdf", purpose: "publication-pdf" }],
    [{ name: "report.pdf", size: 100, contentType: "text/plain", purpose: "publication-pdf" }],
    [{ name: "report.pdf", size: 26 * 1024 * 1024, contentType: "application/pdf", purpose: "publication-pdf" }],
  ])("rejects invalid PDF request metadata", async (body: {
    name: string; size: number; contentType: string; purpose: string;
  }) => {
    state.admin = true;
    expect((await request("/api/admin/media/request-url", { method: "POST", body: JSON.stringify(body) })).status).toBe(400);
    expect(state.upload).not.toHaveBeenCalled();
  });

  it("enforces the configurable image request limit", async () => {
    state.admin = true;
    process.env.MAX_IMAGE_UPLOAD_MB = "1";
    const response = await request("/api/admin/media/request-url", {
      method: "POST",
      body: JSON.stringify({ name: "photo.png", size: 2 * 1024 * 1024, contentType: "image/png", purpose: "publication-image" }),
    });
    expect(response.status).toBe(400);
  });

  it("registers a valid PDF and rejects spoofed or MIME-mismatched objects", async () => {
    state.admin = true;
    const body = { name: "report.pdf", size: 100, contentType: "application/pdf", purpose: "publication-pdf", objectPath: "/objects/private.uploads/1" };
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(201);
    state.bytes = Buffer.from("not a pdf");
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(400);
    state.bytes = Buffer.from("%PDF-1.7");
    state.metadata = { size: "100", contentType: "text/plain" };
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(400);
  });

  it.each([
    "/objects/uploads/../private/file.pdf",
    "/objects/uploads//file.pdf",
    "/objects/uploads/file.pdf?download=true",
    "/objects/uploads\\file.pdf",
  ])("rejects unsafe object paths", async (objectPath: string) => {
    state.admin = true;
    const body = { name: "report.pdf", size: 100, contentType: "application/pdf", purpose: "publication-pdf", objectPath };
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(400);
  });

  it("validates AVIF brands and rejects invalid image magic", async () => {
    state.admin = true;
    const body = { name: "photo.avif", size: 100, contentType: "image/avif", purpose: "publication-image", objectPath: "/objects/uploads/1" };
    state.metadata = { size: "100", contentType: "image/avif" };
    state.bytes = Buffer.from("xxxxftypnopexxxx");
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(400);
    state.bytes = Buffer.from("xxxxftypavifxxxx");
    expect((await request("/api/admin/media/register", { method: "POST", body: JSON.stringify(body) })).status).toBe(201);
  });

  it("rejects deletion while media is attached and denies draft media publicly", async () => {
    state.admin = true;
    state.selectResults = [[{ id: "media-1" }], [{ id: "publication-1" }]];
    expect((await request("/api/admin/media/media-1", { method: "DELETE" })).status).toBe(409);
    state.admin = false;
    state.selectResults = [[{ id: "media-1", storageKey: "/objects/uploads/1" }], [], []];
    expect((await request("/api/media/media-1")).status).toBe(401);
  });

  it("deletes the stored object before deleting an unattached media record", async () => {
    state.admin = true;
    state.selectResults = [[{ id: "media-1", storageKey: "/objects/uploads/1" }], [], []];
    expect((await request("/api/admin/media/media-1", { method: "DELETE" })).status).toBe(204);
    expect(state.deleteObject).toHaveBeenCalledWith("/objects/uploads/1");
    expect(state.deleteRecord).toHaveBeenCalled();
  });

  it("preserves media metadata when object storage is unavailable", async () => {
    state.admin = true;
    state.selectResults = [[{ id: "media-1", storageKey: "/objects/uploads/1" }], [], []];
    state.deleteObject.mockRejectedValue(new Error("storage unavailable"));

    expect((await request("/api/admin/media/media-1", { method: "DELETE" })).status).toBe(503);
    expect(state.deleteRecord).not.toHaveBeenCalled();
  });
});