import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import SiteHeader from "@/components/layout/SiteHeader";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: vi.fn(),
    text: (english: string) => english,
  }),
}));
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const Div = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    function Div(props, ref) {
      return <div ref={ref} {...props} />;
    },
  );
  return { AnimatePresence: ({ children }: { children: React.ReactNode }) => children, motion: { div: Div } };
});

describe("mobile navigation", () => {
  it("moves focus into the dialog, traps it, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <Router>
        <div id="main-content"><button>Background action</button></div>
        <footer>Footer</footer>
        <SiteHeader />
      </Router>,
    );
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    await user.click(trigger);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });
    expect(document.getElementById("main-content")).toHaveAttribute("aria-hidden", "true");
    expect(dialog.querySelector("a")).toHaveFocus();

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable[focusable.length - 1].focus();
    await user.tab();
    expect(focusable[0]).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.getElementById("main-content")).not.toHaveAttribute("aria-hidden");

    await user.click(trigger);
    await user.click(
      screen.getByRole("button", { name: "Close navigation menu" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
