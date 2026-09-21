import { within } from "@testing-library/react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteAdminPublication,
  getAdminPublication,
  listAdminThemes,
  listAdministrators,
  updateAdminPublication,
} from "@/lib/adminApi";
import type { AdminPublication } from "@/types/admin";
import AdminPublicationEdit from "./AdminPublicationEdit";

vi.mock("wouter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wouter")>();
  return {
    ...actual,
    useParams: () => ({ id: "123-abc" })
  };
});
vi.mock("@/lib/adminApi", () => ({
  deleteAdminPublication: vi.fn(),
  getAdminPublication: vi.fn(),
  listAdministrators: vi.fn().mockResolvedValue([]),
  updateAdminPublication: vi.fn(),
  listAdminThemes: vi.fn().mockResolvedValue([]),
}));

const mockDeleteAdminPublication = vi.mocked(deleteAdminPublication);
const mockGetAdminPublication = vi.mocked(getAdminPublication);
  const mockListAdminThemes = vi.mocked(listAdminThemes);
  const mockListAdministrators = vi.mocked(listAdministrators);

const publication: AdminPublication = {
  id: "publication-id",
  slug: "verified-publication",
  title: "Verified Publication",
  subtitle: "Original subtitle",
  abstract: "A verified abstract.",
  content: "Reviewed body content.",
  publicationType: "policy-brief",
  category: "Governance",
  authors: [{ name: "Research Author", role: "Lead author" }],
  publicationDate: "2026-09-10",
  readingTime: 8,
  featured: false,
  status: "archived",
  createdAt: "2026-09-09T00:00:00.000Z",
  updatedAt: "2026-09-10T00:00:00.000Z",
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPublicationEdit />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminPublicationEdit", () => {
  it("loads the existing record and exposes unsaved changes", async () => {
    const user = userEvent.setup();
    mockGetAdminPublication.mockResolvedValue({...publication, status: "draft"});
    mockListAdminThemes.mockResolvedValue([]);
    mockListAdministrators.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText(publication.title)).toBeInTheDocument();
    const subtitle = screen.getByLabelText("Subtitle");
    expect(subtitle).toHaveValue("Original subtitle");

    await user.clear(subtitle);
    await user.type(subtitle, "Reviewed subtitle");
    expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeEnabled();
  });

  it("shows an explicit load failure without replacement content", async () => {
    mockGetAdminPublication.mockRejectedValue(new Error("Not found"));
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "This publication could not be loaded.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(publication.title)).not.toBeInTheDocument();
  });

  it("requires confirmation before deleting the publication", async () => {
    const user = userEvent.setup();
    mockGetAdminPublication.mockResolvedValue(publication);
    mockDeleteAdminPublication.mockResolvedValue();
    renderPage();

    await screen.findByText(publication.title);
    await user.click(
      screen.getByRole("button", { name: "Delete Permanently" }),
    );

    expect(
      screen.getByText("Delete Permanently?")
    ).toBeInTheDocument();
    expect(mockDeleteAdminPublication).not.toHaveBeenCalled();

    const dialog = await screen.findByRole("alertdialog");
    const confirmBtn = within(dialog).getByRole("button", { name: "Delete Permanently" });
    await user.click(confirmBtn);

    await waitFor(() =>
      expect(mockDeleteAdminPublication).toHaveBeenCalledWith(
        "123-abc",
        expect.anything(),
      ),
    );
  });
});