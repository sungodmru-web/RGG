import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import AdminEnquiries from "./AdminEnquiries";

const state = vi.hoisted(() => ({ data: undefined as unknown }));
vi.mock("@/hooks/use-admin-api", () => ({
  useAdminEnquiries: () => ({ data: state.data, isLoading: false, isError: false }),
}));
vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

afterEach(() => {
  cleanup();
  state.data = undefined;
});

describe("AdminEnquiries", () => {
  it("renders each required enquiry column and row value", () => {
    state.data = {
      items: [{
        id: "e1", name: "Ada Lovelace", email: "ada@example.com",
        organization: "Analytical Engine", enquiryType: "technical_assistance",
        subject: "Governance", message: "Please help.", language: "en",
        deliveryStatus: "delivered", providerId: "mail-1", providerError: null,
        deliveryAttemptedAt: null, reviewStatus: "new",
        createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z",
      }],
      counts: { total: 1, new: 1, inProgress: 0, resolved: 0, deliveryFailed: 0 },
    };
    render(<AdminEnquiries />);
    for (const label of ["Date", "Name", "Email", "Organization", "Enquiry Type", "Subject", "Delivery Status"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Governance")).toBeInTheDocument();
  });
});