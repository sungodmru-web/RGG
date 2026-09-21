import express from "express";
import { createHmac, randomBytes } from "node:crypto";

type PublicationStatus = "draft" | "published" | "archived";

type TestPublication = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  abstract: string;
  publicationType: "report";
  category: string | null;
  authors: { name: string }[];
  publicationDate: string | null;
  readingTime: number | null;
  featured: boolean;
  featuredImage: string | null;
  pdfUrl: string | null;
  externalUrl: string | null;
  doi: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  themeId?: string | null;
  language?: "english" | "french" | "bilingual";
  updatedBy?: string | null;
  status: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

const fields = {
  id: "id",
  slug: "slug",
  status: "status",
  featured: "featured",
  publicationDate: "publicationDate",
  updatedAt: "updatedAt",
};

const initialPublications: TestPublication[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "public-report",
    title: "Public report",
    subtitle: null,
    abstract: "Available to everyone",
    publicationType: "report",
    category: null,
    authors: [{ name: "RGG" }],
    publicationDate: "2026-09-01",
    readingTime: null,
    featured: false,
    featuredImage: null,
    pdfUrl: null,
    externalUrl: null,
    doi: null,
    content: null,
    seoTitle: null,
    seoDescription: null,
    themeId: null,
    language: "english",
    status: "published",
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "private-draft",
    title: "Private draft",
    subtitle: null,
    abstract: "Must never be public",
    publicationType: "report",
    category: null,
    authors: [{ name: "RGG" }],
    publicationDate: null,
    readingTime: null,
    featured: false,
    featuredImage: null,
    pdfUrl: null,
    externalUrl: null,
    doi: null,
    content: null,
    seoTitle: null,
    seoDescription: null,
    themeId: "00000000-0000-4000-8000-000000000099",
    language: "french",
    updatedBy: "administrator-1",
    status: "draft",
    createdAt: new Date("2026-09-02T00:00:00Z"),
    updatedAt: new Date("2026-09-02T00:00:00Z"),
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "archived-report",
    title: "Archived report",
    subtitle: null,
    abstract: "Must remain absent from the public API",
    publicationType: "report",
    category: null,
    authors: [{ name: "RGG" }],
    publicationDate: "2025-09-01",
    readingTime: null,
    featured: false,
    featuredImage: null,
    pdfUrl: null,
    externalUrl: null,
    doi: null,
    content: null,
    seoTitle: null,
    seoDescription: null,
    themeId: null,
    language: "bilingual",
    status: "archived",
    createdAt: new Date("2025-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-03T00:00:00Z"),
  },
];

let publications: TestPublication[] = [];
let authenticatedUserId: string | null = null;
let authenticatedUserRole: string | undefined = "admin";
let roleLookupFailure: "throw" | "unusable" | null = null;
const authenticatedSessionId = "test-session";
process.env.CSRF_SECRET = "test-csrf-secret";

const getUser = vi.fn(async () => {
  if (roleLookupFailure === "throw") {
    throw new Error("identity provider private failure detail");
  }
  if (roleLookupFailure === "unusable") return null;
  return {
    publicMetadata: { role: authenticatedUserRole },
  };
});

type Predicate = (publication: TestPublication) => boolean;

const select = vi.fn(() => ({
  from: vi.fn(() => {
    let predicate: Predicate = () => true;
    const query = {
      where(nextPredicate: Predicate) {
        predicate = nextPredicate;
        return query;
      },
      orderBy() {
        return Promise.resolve(publications.filter(predicate));
      },
      limit(count: number) {
        return Promise.resolve(publications.filter(predicate).slice(0, count));
      },
    };
    return query;
  }),
}));

const adminActivityTable = Symbol("adminActivity");
const insert = vi.fn((table?: unknown) => {
  if (table === adminActivityTable) {
    return {
      values: vi.fn(async () => undefined),
    };
  }

  return {
    values: vi.fn((values: Partial<TestPublication> & Pick<
      TestPublication,
      | "slug"
      | "title"
      | "abstract"
      | "publicationType"
      | "authors"
      | "featured"
      | "status"
    >) => ({
      returning: vi.fn(async () => {
        if (publications.some((publication) => publication.slug === values.slug)) {
          throw Object.assign(new Error("duplicate key value"), { code: "23505" });
        }

        const now = new Date("2026-09-10T12:00:00Z");
        const publication: TestPublication = {
          subtitle: null,
          category: null,
          publicationDate: null,
          readingTime: null,
          featuredImage: null,
          pdfUrl: null,
          externalUrl: null,
          doi: null,
          content: null,
          seoTitle: null,
          seoDescription: null,
          ...values,
          id: "00000000-0000-4000-8000-000000000003",
          createdAt: now,
          updatedAt: now,
        };
        publications.push(publication);
        return [publication];
      }),
    })),
  };
});

const update = vi.fn(() => ({
  set: vi.fn((values: Partial<TestPublication>) => ({
    where: vi.fn((predicate: Predicate) => ({
      returning: vi.fn(async () => {
        const publication = publications.find(predicate);
        if (!publication) return [];
        if (
          values.slug &&
          publications.some(
            (candidate) =>
              candidate.id !== publication.id && candidate.slug === values.slug,
          )
        ) {
          throw Object.assign(new Error("duplicate key value"), {
            code: "23505",
          });
        }
        Object.assign(publication, values, {
          updatedAt: new Date("2026-09-10T13:00:00Z"),
        });
        return [publication];
      }),
    })),
  })),
}));

const deletePublication = vi.fn(() => ({
  where: vi.fn((predicate: Predicate) => ({
    returning: vi.fn(async () => {
      const index = publications.findIndex(predicate);
      if (index === -1) return [];
      const [publication] = publications.splice(index, 1);
      return [{ id: publication.id }];
    }),
  })),
}));

const execute = vi.fn(async () => undefined);
const transaction = vi.fn(
  async (
    callback: (transactionClient: {
      select: typeof select;
      insert: typeof insert;
      update: typeof update;
      delete: typeof deletePublication;
      execute: typeof execute;
    }) => Promise<unknown>,
  ) => {
    const snapshot = publications.map((publication) => ({
      ...publication,
      authors: publication.authors.map((author) => ({ ...author })),
      createdAt: new Date(publication.createdAt),
      updatedAt: new Date(publication.updatedAt),
    }));
    try {
      return await callback({
        select,
        insert,
        update,
        delete: deletePublication,
        execute,
      });
    } catch (error) {
      publications = snapshot;
      throw error;
    }
  },
);

vi.mock("@workspace/db", () => ({
  db: { select, insert, update, delete: deletePublication, transaction },
  pool: { connect: vi.fn() },
  adminActivityTable,
  publicationsTable: fields,
}));

vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray) => strings.join(""),
  eq: (field: keyof TestPublication, value: unknown): Predicate =>
    (publication) => publication[field] === value,
  and: (...predicates: Predicate[]): Predicate =>
    (publication) => predicates.every((predicate) => predicate(publication)),
  desc: (field: string) => field,
}));

vi.mock("@clerk/express", () => ({
  clerkClient: {
    users: {
      getUser,
    },
  },
  getAuth: () => ({
    userId: authenticatedUserId,
    sessionId: authenticatedUserId ? authenticatedSessionId : null,
  }),
}));

const { default: publicationsRouter } = await import("./publications");

function startServer() {
  const app = express();
  app.use(express.json());
  app.use("/api", publicationsRouter);
  const server = app.listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port");
  }

  return {
    server,
    request: (path: string, init?: RequestInit) => {
      const method = (init?.method ?? "GET").toUpperCase();
      const headers = new Headers(init?.headers);
      if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
        headers.set("origin", "http://localhost:5173");
        if (authenticatedUserId) {
          const payload = Buffer.from(
            JSON.stringify({
              userId: authenticatedUserId,
              sessionId: authenticatedSessionId,
              exp: Math.floor(Date.now() / 1000) + 300,
              nonce: randomBytes(16).toString("hex"),
            }),
          ).toString("base64url");
          headers.set(
            "x-csrf-token",
            `${payload}.${createHmac("sha256", process.env.CSRF_SECRET!).update(payload).digest("base64url")}`,
          );
        }
      }
      return fetch(`http://127.0.0.1:${address.port}${path}`, {
        ...init,
        headers,
      });
    },
  };
}

describe("publication API security boundaries", () => {
  let server: ReturnType<typeof startServer>["server"];
  let request: ReturnType<typeof startServer>["request"];

  beforeEach(() => {
    publications = initialPublications.map((publication) => ({
      ...publication,
      authors: publication.authors.map((author) => ({ ...author })),
      createdAt: new Date(publication.createdAt),
      updatedAt: new Date(publication.updatedAt),
    }));
    authenticatedUserId = null;
    authenticatedUserRole = "admin";
    roleLookupFailure = null;
    ({ server, request } = startServer());
    getUser.mockClear();
    select.mockClear();
    insert.mockClear();
    update.mockClear();
    deletePublication.mockClear();
    transaction.mockClear();
    execute.mockClear();
  });

  afterEach(() => {
    server.close();
  });

  it.each([
    ["GET", "/api/admin/publications", undefined],
    [
      "GET",
      "/api/admin/publications/00000000-0000-4000-8000-000000000001",
      undefined,
    ],
    ["GET", "/api/admin/publications/not-a-uuid", undefined],
    ["POST", "/api/admin/publications", { title: "Unauthorized" }],
    [
      "PATCH",
      "/api/admin/publications/00000000-0000-4000-8000-000000000001",
      { title: "Unauthorized" },
    ],
    [
      "DELETE",
      "/api/admin/publications/00000000-0000-4000-8000-000000000001",
      undefined,
    ],
  ])(
    "returns 401 for unauthenticated %s %s",
    async (
      method: string,
      path: string,
      body: Record<string, string> | undefined,
    ) => {
    const response = await request(path, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required" });
    expect(getUser).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    },
  );

  describe("signed-in non-administrator publication management", () => {
    beforeEach(() => {
      authenticatedUserId = "ordinary-user";
      authenticatedUserRole = undefined;
    });

    it.each([
      ["GET", undefined],
      ["PATCH", { id: "client-controlled" }],
      ["DELETE", undefined],
    ])(
      "rejects a malformed publication ID before validation or database access for %s",
      async (
        method: string,
        body: Record<string, string> | undefined,
      ) => {
        const response = await request(
          "/api/admin/publications/not-a-uuid",
          {
            method,
            headers: body ? { "content-type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined,
          },
        );

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
          error: "Administrator role required",
        });
        expect(getUser).toHaveBeenCalledWith("ordinary-user");
        expect(select).not.toHaveBeenCalled();
        expect(transaction).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
        expect(deletePublication).not.toHaveBeenCalled();
      },
    );

    it.each([
      ["GET", "/api/admin/publications", undefined],
      [
        "GET",
        "/api/admin/publications/00000000-0000-4000-8000-000000000001",
        undefined,
      ],
      ["POST", "/api/admin/publications", { title: "Forbidden" }],
      [
        "PATCH",
        "/api/admin/publications/00000000-0000-4000-8000-000000000001",
        { title: "Forbidden" },
      ],
      [
        "DELETE",
        "/api/admin/publications/00000000-0000-4000-8000-000000000001",
        undefined,
      ],
    ])(
      "returns 403 without querying or mutating publications for %s %s",
      async (
        method: string,
        path: string,
        body: Record<string, string> | undefined,
      ) => {
        const response = await request(path, {
          method,
          headers: body ? { "content-type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
          error: "Administrator role required",
        });
        expect(getUser).toHaveBeenCalledWith("ordinary-user");
        expect(select).not.toHaveBeenCalled();
        expect(insert).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
        expect(deletePublication).not.toHaveBeenCalled();
      },
    );
  });

  for (const [label, failure] of [
    ["throws", "throw"],
    ["returns an unusable result", "unusable"],
  ] as const) {
    describe(`when the administrator role lookup ${label}`, () => {
      beforeEach(() => {
        authenticatedUserId = "admin-user";
        roleLookupFailure = failure;
      });

      it.each([
        ["GET", "/api/admin/publications/not-a-uuid", undefined],
        [
          "POST",
          "/api/admin/publications",
          { id: "client-controlled", title: "Private validation detail" },
        ],
        [
          "PATCH",
          "/api/admin/publications/not-a-uuid",
          { id: "client-controlled" },
        ],
        ["DELETE", "/api/admin/publications/not-a-uuid", undefined],
      ])(
        "fails closed before publication validation or database access for %s %s",
        async (
          method: string,
          path: string,
          body: Record<string, string> | undefined,
        ) => {
          const response = await request(path, {
            method,
            headers: body ? { "content-type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined,
          });

          expect(response.status).toBe(503);
          expect(await response.json()).toEqual({
            error: "Authorization service unavailable",
          });
          expect(getUser).toHaveBeenCalledWith("admin-user");
          expect(select).not.toHaveBeenCalled();
          expect(insert).not.toHaveBeenCalled();
          expect(transaction).not.toHaveBeenCalled();
          expect(update).not.toHaveBeenCalled();
          expect(deletePublication).not.toHaveBeenCalled();
        },
      );
    });
  }

  it("keeps the public list accessible and excludes unpublished records", async () => {
    const response = await request("/api/publications");

    expect(response.status).toBe(200);
    const body = (await response.json()) as { slug: string }[];
    expect(body.map((publication: { slug: string }) => publication.slug)).toEqual([
      "public-report",
    ]);
    expect(JSON.stringify(body)).not.toContain("private-draft");
  });

  it("returns a published detail record", async () => {
    const response = await request("/api/publications/public-report");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ slug: "public-report" });
  });

  it("returns 404 rather than exposing an unpublished detail record", async () => {
    const response = await request("/api/publications/private-draft");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Publication not found" });
  });

  describe("administrator publication management", () => {
    beforeEach(() => {
      authenticatedUserId = "admin-user";
    });

    it("allows an administrator session to continue to the route handler", async () => {
      const response = await request("/api/admin/publications");

      expect(response.status).toBe(200);
      expect(getUser).toHaveBeenCalledWith("admin-user");
      expect(select).toHaveBeenCalledOnce();
    });

    it("lists publications and gets a draft by ID", async () => {
      const listResponse = await request("/api/admin/publications");

      expect(listResponse.status).toBe(200);
      const list = (await listResponse.json()) as {
        id: string;
        slug: string;
        status: PublicationStatus;
      }[];
      expect(list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: "public-report",
            status: "published",
          }),
          expect.objectContaining({
            slug: "private-draft",
            status: "draft",
          }),
        ]),
      );

      const detailResponse = await request(
        "/api/admin/publications/00000000-0000-4000-8000-000000000002",
      );

      expect(detailResponse.status).toBe(200);
      expect(await detailResponse.json()).toMatchObject({
        slug: "private-draft",
        status: "draft",
        themeId: "00000000-0000-4000-8000-000000000099",
        language: "french",
        updatedBy: "administrator-1",
      });
    });

    it("preserves theme and language when updating an unrelated field", async () => {
      const path =
        "/api/admin/publications/00000000-0000-4000-8000-000000000002";
      const updateResponse = await request(path, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Updated French draft" }),
      });

      expect(updateResponse.status).toBe(200);
      expect(await updateResponse.json()).toMatchObject({
        title: "Updated French draft",
        themeId: "00000000-0000-4000-8000-000000000099",
        language: "french",
        updatedBy: "admin-user",
      });
    });

    it.each(["GET", "PATCH", "DELETE"])(
      "rejects a malformed publication ID before database access for %s",
      async (method: string) => {
        select.mockClear();
        const response = await request("/api/admin/publications/not-a-uuid", {
          method,
          headers:
            method === "PATCH" ? { "content-type": "application/json" } : undefined,
          body: method === "PATCH" ? JSON.stringify({ title: "Ignored" }) : undefined,
        });

        expect(response.status).toBe(400);
        expect(select).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
        expect(deletePublication).not.toHaveBeenCalled();
      },
    );

    it("creates a draft and dates a published record when the date is absent", async () => {
      const publication = {
        slug: "new-draft",
        title: "New draft",
        abstract: "Prepared by an administrator",
        publicationType: "report",
        authors: [{ name: "RGG" }],
        featured: false,
        status: "draft",
      };
      const createResponse = await request("/api/admin/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(publication),
      });

      expect(createResponse.status).toBe(201);
      expect(await createResponse.json()).toMatchObject({
        id: "00000000-0000-4000-8000-000000000003",
        slug: "new-draft",
        status: "draft",
      });

      const publishedResponse = await request("/api/admin/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...publication,
          slug: "missing-date",
          status: "published",
        }),
      });

      expect(publishedResponse.status).toBe(201);
      expect(await publishedResponse.json()).toMatchObject({
        slug: "missing-date",
        status: "published",
        publicationDate: new Date().toISOString().slice(0, 10),
      });
      expect(transaction).toHaveBeenCalledTimes(2);
    });

    it("returns a clear conflict when creating a publication with an existing slug", async () => {
      const response = await request("/api/admin/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "public-report",
          title: "Duplicate report",
          abstract: "Uses an existing publication link",
          publicationType: "report",
          authors: [{ name: "RGG" }],
          featured: false,
          status: "draft",
        }),
      });

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "Publication slug already exists",
      });
    });

    it.each(["id", "createdAt", "updatedAt", "serverMetadata"])(
      "rejects the server-controlled %s field on create and update",
      async (field: string) => {
        const createResponse = await request("/api/admin/publications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug: `protected-${field.toLowerCase()}`,
            title: "Protected metadata",
            abstract: "Client metadata must be rejected",
            publicationType: "report",
            authors: [{ name: "RGG" }],
            featured: false,
            status: "draft",
            [field]: field === "id"
              ? "00000000-0000-4000-8000-000000000099"
              : "2020-01-01T00:00:00.000Z",
          }),
        });
        const updateResponse = await request(
          "/api/admin/publications/00000000-0000-4000-8000-000000000002",
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ [field]: "client-controlled" }),
          },
        );

        expect(createResponse.status).toBe(400);
        expect(updateResponse.status).toBe(400);
        expect(insert).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
      },
    );

    it("normalizes optional empty values and rejects invalid URLs", async () => {
      const createResponse = await request("/api/admin/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "normalized-optionals",
          title: "Normalized optionals",
          abstract: "Empty optional fields become null",
          publicationType: "report",
          authors: [{ name: "RGG" }],
          featured: false,
          status: "draft",
          publicationDate: "",
          readingTime: "",
          pdfUrl: "",
          externalUrl: "",
          featuredImage: "",
        }),
      });
      const invalidUrlResponse = await request("/api/admin/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "invalid-url",
          title: "Invalid URL",
          abstract: "Unsafe URL input",
          publicationType: "report",
          authors: [{ name: "RGG" }],
          featured: false,
          status: "draft",
          externalUrl: "not a URL",
        }),
      });

      expect(createResponse.status).toBe(201);
      expect(await createResponse.json()).not.toHaveProperty("publicationDate");
      expect(invalidUrlResponse.status).toBe(400);
      expect(
        insert.mock.calls.filter(([table]: [unknown]) => table === fields),
      ).toHaveLength(1);
    });

    it("returns a clear conflict when changing a publication to another publication's slug", async () => {
      const response = await request(
        "/api/admin/publications/00000000-0000-4000-8000-000000000002",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug: "public-report" }),
        },
      );

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "Publication slug already exists",
      });
      expect(publications[1].slug).toBe("private-draft");
    });

    it("sets publicationDate on first publish and preserves it on later edits", async () => {
      const path =
        "/api/admin/publications/00000000-0000-4000-8000-000000000002";
      const publishResponse = await request(path, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      expect(publishResponse.status).toBe(200);
      const firstPublicationDate = new Date().toISOString().slice(0, 10);
      expect(await publishResponse.json()).toMatchObject({
        slug: "private-draft",
        status: "published",
        publicationDate: firstPublicationDate,
      });

      const editResponse = await request(path, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Edited after publication" }),
      });

      expect(editResponse.status).toBe(200);
      expect(await editResponse.json()).toMatchObject({
        title: "Edited after publication",
        status: "published",
        publicationDate: firstPublicationDate,
      });
    });

    it("selects exactly one featured publication inside one transaction", async () => {
      publications[0].featured = true;
      const response = await request(
        "/api/admin/publications/00000000-0000-4000-8000-000000000002",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ featured: true }),
        },
      );

      expect(response.status).toBe(200);
      expect(transaction).toHaveBeenCalledOnce();
      expect(execute).toHaveBeenCalledOnce();
      expect(publications.filter((publication) => publication.featured)).toEqual([
        expect.objectContaining({
          id: "00000000-0000-4000-8000-000000000002",
        }),
      ]);
    });

    it("rolls back featured clearing if selecting the replacement fails", async () => {
      publications[0].featured = true;
      const response = await request(
        "/api/admin/publications/00000000-0000-4000-8000-000000000002",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ featured: true, slug: "public-report" }),
        },
      );

      expect(response.status).toBe(409);
      expect(publications.filter((publication) => publication.featured)).toEqual([
        expect.objectContaining({
          id: "00000000-0000-4000-8000-000000000001",
        }),
      ]);
    });

    it("sets updatedAt on the server for publication updates", async () => {
      const before = publications[1].updatedAt;
      const response = await request(
        "/api/admin/publications/00000000-0000-4000-8000-000000000002",
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: "Server timestamp" }),
        },
      );

      expect(response.status).toBe(200);
      expect(publications[1].updatedAt.getTime()).toBeGreaterThan(
        before.getTime(),
      );
    });

    it("deletes an archived publication and returns an empty 204 response", async () => {
      const path =
        "/api/admin/publications/00000000-0000-4000-8000-000000000004";
      const deleteResponse = await request(path, { method: "DELETE" });

      expect(deleteResponse.status).toBe(204);
      expect(await deleteResponse.text()).toBe("");

      const detailResponse = await request(path);
      expect(detailResponse.status).toBe(404);
      expect(await detailResponse.json()).toEqual({
        error: "Publication not found",
      });
    });

    it("rejects permanent deletion until a publication is archived", async () => {
      const path =
        "/api/admin/publications/00000000-0000-4000-8000-000000000002";
      const deleteResponse = await request(path, { method: "DELETE" });

      expect(deleteResponse.status).toBe(409);
      expect(await deleteResponse.json()).toEqual({
        error: "Only archived publications can be permanently deleted",
      });

      const detailResponse = await request(path);
      expect(detailResponse.status).toBe(200);
    });
  });
});
