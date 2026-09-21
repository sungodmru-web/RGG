import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAdminPublication } from "@/lib/adminApi";
import AdminPublicationNew from "./AdminPublicationNew";

vi.mock("@/lib/adminApi", () => ({
  createAdminPublication: vi.fn(),
  listAdminThemes: vi.fn().mockResolvedValue([]),
}));

const mockCreateAdminPublication = vi.mocked(createAdminPublication);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("AdminPublicationNew", () => {
  it("submits a verified draft through the admin client", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    mockCreateAdminPublication.mockResolvedValue({
      id: "new-publication-id",
      slug: expect.any(String),
      title: "Verified Draft",
      abstract: "A verified abstract.",
      publicationType: "research-paper",
      authors: [{ name: "Research Author" }],
      featured: false,
      status: "draft",
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminPublicationNew />
      </QueryClientProvider>,
    );

    await user.type(screen.getByPlaceholderText("Publication title"), "Verified Draft");
    await user.type(
      screen.getByPlaceholderText("Brief summary of the publication..."),
      "A verified abstract.",
    );
    await user.type(screen.getByPlaceholderText("Author Name"), "Research Author");
    await user.click(
      screen.getByRole("button", { name: /Save Draft/i }),
    );

    await waitFor(() =>
      expect(mockCreateAdminPublication).toHaveBeenCalledOnce(),
    );
    expect(mockCreateAdminPublication.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        title: "Verified Draft",
        slug: expect.any(String),
        status: "draft",
        authors: [{ name: "Research Author" }],
      }),
    );
  });
});