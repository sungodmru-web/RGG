import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listAdminPublications } from "@/lib/adminApi";
import type { AdminPublication } from "@/types/admin";
import AdminPublications from "./AdminPublications";

vi.mock("@/lib/adminApi", () => ({
  listAdminPublications: vi.fn(),
  listAdminThemes: vi.fn().mockResolvedValue([]),
  deleteAdminPublication: vi.fn(),
}));

const mockListAdminPublications = vi.mocked(listAdminPublications);

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPublications />
    </QueryClientProvider>,
  );
}

const records: AdminPublication[] = [
  {
    id: "published-id",
    slug: "published-work",
    title: "Published Work",
    abstract: "A verified publication.",
    publicationType: "research-paper",
    authors: [{ name: "Research Author" }],
    featured: true,
    status: "published",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-09T00:00:00.000Z",
  },
  {
    id: "draft-id",
    slug: "draft-work",
    title: "Draft Work",
    abstract: "An editorial draft.",
    publicationType: "policy-brief",
    authors: [{ name: "Policy Author" }],
    featured: false,
    status: "draft",
    createdAt: "2026-09-02T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminPublications", () => {
  it("shows a clear empty state without placeholder publications", async () => {
    mockListAdminPublications.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText("No publications found."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /new publication/i }),
    ).toHaveAttribute("href", "/admin/publications/new");
  });

  it("filters verified records by search text", async () => {
    const user = userEvent.setup();
    mockListAdminPublications.mockResolvedValue(records);
    renderPage();

    expect(await screen.findByText("Published Work")).toBeInTheDocument();
    expect(screen.getByText("Draft Work")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/search title, author, or slug/i),
      "Draft",
    );

    await waitFor(() => {
      expect(screen.getByText("Draft Work")).toBeInTheDocument();
      expect(screen.queryByText("Published Work")).not.toBeInTheDocument();
    });
  });
});