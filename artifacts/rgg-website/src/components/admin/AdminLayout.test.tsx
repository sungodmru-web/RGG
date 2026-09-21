import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout from "./AdminLayout";

const signOut = vi.fn();
const removeQueries = vi.fn();
const { logoutAdministrator, clearAdminSecurityState } = vi.hoisted(() => ({
  logoutAdministrator: vi.fn(),
  clearAdminSecurityState: vi.fn(),
}));

vi.mock("@clerk/react", () => ({
  useClerk: () => ({ signOut }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ removeQueries }),
}));
vi.mock("@/lib/adminApi", () => ({
  clearAdminSecurityState,
  logoutAdministrator,
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
  useLocation: () => ["/admin/publications"],
}));

describe("AdminLayout logout", () => {
  beforeEach(() => {
    cleanup();
    signOut.mockClear();
    removeQueries.mockClear();
    logoutAdministrator.mockReset();
    logoutAdministrator.mockResolvedValue(undefined);
    clearAdminSecurityState.mockClear();
  });

  it("uses Clerk signOut and redirects to sign-in", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<AdminLayout><p>Dashboard</p></AdminLayout>);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(logoutAdministrator).toHaveBeenCalledOnce();
    expect(clearAdminSecurityState).toHaveBeenCalledOnce();
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ["admin"] });
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: "/sign-in" });
  });

  it("provides all admin destinations in the mobile navigation", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<AdminLayout><p>Dashboard</p></AdminLayout>);

    const trigger = screen.getByRole("button", { name: /open admin navigation/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);

    expect(screen.getByRole("navigation", { name: /admin navigation/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Dashboard" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Publications" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Endorsements" })).toHaveLength(2);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});