import { cleanup, render, screen } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminHome from "./AdminHome";

const hookState = vi.hoisted(() => ({
  activity: [] as Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
  }>,
  publications: [] as Array<{ status: string }>,
  endorsements: [] as Array<{ status: string }>,
  media: [] as Array<{ mediaType: string }>,
  enquiries: {
    items: [],
    counts: { total: 0, new: 0, inProgress: 0, resolved: 0, deliveryFailed: 0 },
  },
}));

vi.mock("@/hooks/use-admin-api", () => {
  return {
    useAdminActivity: () => ({ data: hookState.activity, isLoading: false }),
    useAdminPublications: () => ({
      data: hookState.publications,
      isLoading: false,
    }),
    useAdminEndorsements: () => ({
      data: hookState.endorsements,
      isLoading: false,
    }),
    useAdminMedia: () => ({ data: hookState.media, isLoading: false }),
    useAdminEnquiries: () => ({ data: hookState.enquiries, isLoading: false }),
  };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminHome />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  hookState.activity = [];
  hookState.publications = [];
  hookState.endorsements = [];
  hookState.media = [];
  hookState.enquiries = {
    items: [],
    counts: { total: 0, new: 0, inProgress: 0, resolved: 0, deliveryFailed: 0 },
  };
});

describe("AdminHome", () => {
  it("shows live editorial counts and recent activity", () => {
    hookState.publications = [{ status: "draft" }, { status: "published" }];
    hookState.endorsements = [{ status: "approved" }, { status: "draft" }];
    hookState.media = [{ mediaType: "pdf" }, { mediaType: "image" }];
    hookState.enquiries.counts.new = 2;
    hookState.activity = [
      {
        id: "activity-1",
        action: "publication.published",
        entity: "publication",
        createdAt: "2026-09-10T10:00:00.000Z",
      },
    ];
    renderPage();

    expect(screen.getByText("publication published")).toBeInTheDocument();
    expect(screen.getByText("Publications").parentElement?.parentElement)
      .toHaveTextContent("1published");
    expect(screen.getByText("Endorsements").parentElement?.parentElement)
      .toHaveTextContent("1approved");
    expect(screen.getByText("Documents").parentElement?.parentElement)
      .toHaveTextContent("1PDFs");
    expect(screen.getByText("Enquiries").parentElement?.parentElement)
      .toHaveTextContent("2new");
  });

  it("shows an empty state without placeholder activity", () => {
    renderPage();

    expect(screen.getByText("No recent activity found.")).toBeInTheDocument();
    expect(screen.queryByText("publication published")).not.toBeInTheDocument();
  });
});