import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { previewAdminPublication } from "@/lib/adminApi";
import type { AdminPublication } from "@/types/admin";
import AdminPublicationPreview from "./AdminPublicationPreview";

vi.mock("wouter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wouter")>();
  return {
    ...actual,
    useParams: () => ({ id: "draft-id" }),
  };
});

vi.mock("@/lib/adminApi", () => ({
  previewAdminPublication: vi.fn(),
}));

const mockPreviewAdminPublication = vi.mocked(previewAdminPublication);

const draft: AdminPublication = {
  id: "draft-id",
  slug: "private-draft",
  title: "Private Draft",
  subtitle: "A protected editorial preview",
  abstract: "This abstract remains private until publication.",
  content: "Saved body content.",
  publicationType: "policy-brief",
  authors: [{ name: "Research Author", role: "Lead author" }],
  publicationDate: "2026-09-21",
  readingTime: 7,
  featured: false,
  pdfMediaId: "pdf-id",
  featuredImageMediaId: "image-id",
  status: "draft",
  createdAt: "2026-09-20T00:00:00.000Z",
  updatedAt: "2026-09-21T00:00:00.000Z",
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPublicationPreview />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminPublicationPreview", () => {
  it("renders a saved draft as a private administrator preview", async () => {
    mockPreviewAdminPublication.mockResolvedValue(draft);

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Private Draft" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Private administrator preview")).toBeInTheDocument();
    expect(
      screen.getByText(/not part of the public library/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View PDF" })).toHaveAttribute(
      "href",
      "/api/media/pdf-id",
    );
    expect(screen.getByRole("img", { name: "Private Draft cover" })).toHaveAttribute(
      "src",
      "/api/media/image-id",
    );
  });

  it("does not substitute public content when preview loading fails", async () => {
    mockPreviewAdminPublication.mockRejectedValue(new Error("Forbidden"));

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Preview unavailable." }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Private Draft")).not.toBeInTheDocument();
  });
});