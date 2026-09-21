import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  FRAMEWORK_ARGUMENT,
  FRAMEWORK_ARGUMENT_CARDS,
  FRAMEWORK_META,
  GOVERNANCE_LAYERS,
} from "@/content/frameworkContent";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Framework from "@/pages/Framework";

vi.mock("framer-motion", async () => {
  const React = await import("react");

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      article: React.forwardRef<
        HTMLElement,
        React.HTMLAttributes<HTMLElement>
      >(function MotionArticle({ children, ...props }, ref) {
        const {
          initial: _initial,
          animate: _animate,
          exit: _exit,
          transition: _transition,
          ...elementProps
        } = props as React.HTMLAttributes<HTMLElement> & {
          initial?: unknown;
          animate?: unknown;
          exit?: unknown;
          transition?: unknown;
        };

        return (
          <article ref={ref} {...elementProps}>
            {children}
          </article>
        );
      }),
    },
  };
});

describe("Framework page", () => {
  it("keeps every archived governance layer and argument visible and keyboard accessible", async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Framework />
      </LanguageProvider>,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(7);

    GOVERNANCE_LAYERS.forEach((layer, index) => {
      expect(tabs[index]).toHaveTextContent(layer.number);
      expect(tabs[index]).toHaveTextContent(layer.title);
    });

    expect(screen.getByText(FRAMEWORK_ARGUMENT.title)).toBeVisible();
    expect(screen.getByText(FRAMEWORK_ARGUMENT.lead)).toBeVisible();
    expect(screen.getByText(FRAMEWORK_ARGUMENT.description)).toBeVisible();

    const argumentCards = FRAMEWORK_ARGUMENT_CARDS.map((card) =>
      screen.getByRole("heading", { name: card.label }).closest("article"),
    );
    expect(argumentCards).toHaveLength(3);

    FRAMEWORK_ARGUMENT_CARDS.forEach((card, index) => {
      expect(argumentCards[index]).not.toBeNull();
      expect(within(argumentCards[index]!).getByText(card.text)).toBeVisible();
    });

    expect(screen.getByText(`“${FRAMEWORK_META.coreArgument}”`)).toBeVisible();

    for (let index = 0; index < GOVERNANCE_LAYERS.length; index += 1) {
      if (index > 0) {
        await user.click(tabs[index]);
      }

      const panel = screen.getByRole("tabpanel");
      expect(tabs[index]).toHaveAttribute("aria-selected", "true");
      expect(panel).toHaveAccessibleName(
        `${GOVERNANCE_LAYERS[index].number} ${GOVERNANCE_LAYERS[index].title}`,
      );
      expect(
        within(panel).getByRole("heading", {
          name: GOVERNANCE_LAYERS[index].title,
        }),
      ).toBeVisible();
      expect(
        within(panel).getByText(GOVERNANCE_LAYERS[index].description),
      ).toBeVisible();
    }

    tabs[0].focus();
    await user.keyboard("{ArrowDown}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(tabs.at(-1)).toHaveFocus();
    expect(tabs.at(-1)).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(
      `${GOVERNANCE_LAYERS.at(-1)!.number} ${GOVERNANCE_LAYERS.at(-1)!.title}`,
    );

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });
});