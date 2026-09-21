import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

// Setup IntersectionObserver mock BEFORE importing components that use it
beforeEach(() => {
  cleanup();
  // IntersectionObserver isn't available in JSDOM, so we mock it
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

// Mock wouter
vi.mock("wouter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wouter")>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

// Mock LanguageContext
const languageContext = vi.hoisted(() => ({
  language: "en" as "en" | "fr",
}));

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    language: languageContext.language,
    text: (en: string, fr: string) =>
      languageContext.language === "fr" ? fr : en,
  }),
}));

import { useLocation } from "wouter";
import Home from "./Home";

describe("Horizontal Homepage Navigation", () => {
  let mockSetLocation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    languageContext.language = "en";
    mockSetLocation = vi.fn();
    vi.mocked(useLocation).mockReturnValue(["/", mockSetLocation]);
  });

  it("renders the Previous and Next scroll buttons", () => {
    render(<Home />);
    
    expect(screen.getByLabelText("Previous section")).toBeInTheDocument();
    expect(screen.getByLabelText("Next section")).toBeInTheDocument();
  });
  
  it("provides accessible horizontal scroll instructions", () => {
    render(<Home />);
    expect(screen.getAllByText(/Scroll or drag horizontally/i).length).toBeGreaterThan(0);
  });

  it("offers direct progress controls for every section", () => {
    render(<Home />);
    expect(screen.getAllByRole("button", { name: /Go to section/ })).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Go to section 1" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("uses the verified manuscript prologue in the second panel", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        name: /Transforming Challenge into Opportunity/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Legalisation is the easy part/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("The Library")).not.toBeInTheDocument();
  });

  it("translates the hero title when French is selected", () => {
    languageContext.language = "fr";
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /Reconquérir l'or vert/i }),
    ).toBeInTheDocument();
  });

  it("places the central thesis before the handbook-series artwork", () => {
    render(<Home />);
    expect(screen.getByText("Central Thesis")).toBeInTheDocument();
    expect(
      screen.getByText(/Reform is not merely the removal of prohibition/i),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/global handbook series in English and French/i),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("rgg-global-handbook-series.jpeg"),
    );
    expect(screen.queryByText("Strategic Advisory")).not.toBeInTheDocument();
  });

  it("handles right-arrow navigation through the horizontal gateway", () => {
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    render(<Home />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(scrollTo).toHaveBeenCalled();
  });
});
