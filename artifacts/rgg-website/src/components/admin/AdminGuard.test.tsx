import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useClerk, useSession, useUser } from "@clerk/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminGuard from "./AdminGuard";

vi.mock("@clerk/react", () => ({
  useClerk: vi.fn(),
  useSession: vi.fn(),
  useUser: vi.fn(),
}));
const removeQueries = vi.fn();
const queryClient = { removeQueries };
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => queryClient,
}));

const mockUseUser = vi.mocked(useUser);
const mockUseSession = vi.mocked(useSession);
const mockUseClerk = vi.mocked(useClerk);
const signOut = vi.fn();

afterEach(() => {
  cleanup();
});

describe("AdminGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockUseClerk.mockReturnValue({ signOut } as unknown as ReturnType<typeof useClerk>);
    mockUseSession.mockReturnValue({
      session: null,
    } as ReturnType<typeof useSession>);
  });

  it("shows a loading screen while Clerk initializes", () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: undefined,
    } as unknown as ReturnType<typeof useUser>);

    render(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );

    expect(
      screen.getByRole("heading", { name: "Loading publishing workspace." }),
    ).toBeInTheDocument();
  });

  it("offers sign in to unauthenticated visitors", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    } as ReturnType<typeof useUser>);

    render(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );

    expect(
      screen.getByRole("link", { name: /administrator sign in/i }),
    ).toHaveAttribute("href", "/sign-in");
  });

  it("denies signed-in accounts rejected by the server", async () => {
    mockUseSession.mockReturnValue({
      session: { id: "session-ordinary" },
    } as ReturnType<typeof useSession>);
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { id: "ordinary-user", publicMetadata: {} },
    } as ReturnType<typeof useUser>);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ authenticated: false }), { status: 200 }),
      ),
    );

    render(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Administrator access required.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with another account/i }),
    );
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: "/sign-in" });
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders the dashboard for approved administrators", () => {
    mockUseSession.mockReturnValue({
      session: { id: "session-1" },
    } as ReturnType<typeof useSession>);
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { id: "admin-user", publicMetadata: { role: "admin" } },
    } as unknown as ReturnType<typeof useUser>);
    const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            authenticated: true,
            user: { role: "admin" },
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );

    return expect(screen.findByText("Dashboard")).resolves.toBeInTheDocument().then(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/admin/session", {
        cache: "no-store",
        credentials: "include",
      });
    });
  });

  it("retries temporary session verification failures without denying access", async () => {
    vi.useFakeTimers();
    try {
      mockUseSession.mockReturnValue({
        session: { id: "session-retry" },
      } as ReturnType<typeof useSession>);
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: "admin-user", publicMetadata: { role: "admin" } },
      } as unknown as ReturnType<typeof useUser>);
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Too many requests" }), {
            status: 429,
          }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              authenticated: true,
              user: { role: "admin" },
            }),
            { status: 200 },
          ),
        );
      vi.stubGlobal("fetch", fetchMock);

      render(
        <AdminGuard>
          <p>Dashboard</p>
        </AdminGuard>,
      );

      await act(async () => undefined);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(
        screen.queryByRole("heading", {
          name: "Administrator access required.",
        }),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens the dashboard after temporary verification recovers and the administrator tries again", async () => {
    vi.useFakeTimers();
    try {
      mockUseSession.mockReturnValue({
        session: { id: "session-error" },
      } as ReturnType<typeof useSession>);
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: "admin-user", publicMetadata: { role: "admin" } },
      } as unknown as ReturnType<typeof useUser>);
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Unavailable" }), {
            status: 503,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Unavailable" }), {
            status: 503,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "Unavailable" }), {
            status: 503,
          }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              authenticated: true,
              user: { role: "admin" },
            }),
            { status: 200 },
          ),
        );
      vi.stubGlobal("fetch", fetchMock);

      render(
        <AdminGuard>
          <p>Dashboard</p>
        </AdminGuard>,
      );

      await act(async () => undefined);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3_000);
      });

      expect(
        screen.getByRole("heading", {
          name: "Unable to verify your session.",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", {
          name: "Administrator access required.",
        }),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: "Verifying administrator access.",
        }),
      ).toBeInTheDocument();
      await act(async () => undefined);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(4);
    } finally {
      vi.useRealTimers();
    }
  });

  it("blocks stale approval when the Clerk session changes", async () => {
    let sessionId = "session-1";
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { id: "admin-user", publicMetadata: { role: "admin" } },
    } as unknown as ReturnType<typeof useUser>);
    mockUseSession.mockImplementation(() => ({
      session: { id: sessionId },
    } as ReturnType<typeof useSession>));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ authenticated: true, user: { role: "admin" } }), { status: 200 }))
      .mockImplementation(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    const view = render(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );
    await screen.findByText("Dashboard");

    sessionId = "session-2";
    view.rerender(
      <AdminGuard>
        <p>Dashboard</p>
      </AdminGuard>,
    );

    await waitFor(() => {
      expect(within(view.container).queryByText("Dashboard")).not.toBeInTheDocument();
      expect(
        within(view.container).getByRole("heading", { name: "Verifying administrator access." }),
      ).toBeInTheDocument();
    });
  });
});