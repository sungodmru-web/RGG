import { afterEach, describe, expect, it, vi } from "vitest";

const publication = {
  id: "publication-id",
  slug: "publication",
  title: "Publication",
  abstract: "Abstract",
  publicationType: "report",
  authors: [{ name: "Author" }],
  featured: false,
  status: "draft",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("adminApi CSRF handling", () => {
  it("fetches an in-memory token and sends it on mutations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: "token-one" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(publication), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { createAdminPublication } = await import("./adminApi");

    await createAdminPublication({
      ...publication,
      publicationType: "report",
    } as never);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin/csrf",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "X-CSRF-Token": "token-one" }),
      }),
    );
  });

  it("refreshes once after a CSRF 403 and reports safe JSON errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: "old" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: "new" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "No details exposed" }), { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    const { updateAdminPublication } = await import("./adminApi");

    await expect(updateAdminPublication("id", { title: "Updated" })).rejects.toThrow(
      "Unable to complete the request. Please try again.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({ "X-CSRF-Token": "new" }),
      }),
    );
  });

  it("does not retry non-CSRF forbidden responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Untrusted origin" }), { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);
    const { deleteAdminPublication } = await import("./adminApi");

    await expect(deleteAdminPublication("id")).rejects.toThrow(
      "Security or session verification rejected this request.",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports an authentication-required message for 401 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Internal auth detail" }), {
          status: 401,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { listAdminPublications } = await import("./adminApi");

    await expect(listAdminPublications()).rejects.toThrow(
      "Authentication required. Please sign in again.",
    );
  });
});