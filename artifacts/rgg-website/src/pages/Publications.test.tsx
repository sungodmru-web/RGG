import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useListPublications } from "@workspace/api-client-react";

import PublicationsPage from "./Publications";

// Mock the API client
vi.mock("@workspace/api-client-react", () => ({
  useListPublications: vi.fn(),
}));

// Mock the router
vi.mock("wouter", () => ({
  useLocation: () => ["/publications", vi.fn()],
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Language Context
vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    text: (en: string, fr: string) => en,
  }),
}));

// Provide some mock publications for testing
const mockPublications = [
  {
    id: "pub-1",
    slug: "apple-policy",
    title: "Apple Policy",
    abstract: "A policy about apples.",
    publicationType: "policy-brief",
    category: "Agriculture",
    authors: [{ name: "Alice Author" }],
    publicationDate: new Date().toISOString(),
    featured: false,
  },
  {
    id: "pub-2",
    slug: "banana-research",
    title: "Banana Research",
    abstract: "A research paper on bananas.",
    publicationType: "research-paper",
    category: "Science",
    authors: [{ name: "Bob Author" }],
    publicationDate: new Date().toISOString(),
    featured: true,
  },
];

describe("Publications combined filtering & A-Z", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables A-Z letters that have no matching publications", () => {
    vi.mocked(useListPublications).mockReturnValue({
      data: mockPublications,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<PublicationsPage />);
    
    // 'A' should be enabled because "Apple Policy" starts with 'A'
    const buttonA = screen.getByRole("button", { name: "A" });
    expect(buttonA).not.toBeDisabled();
    
    // 'B' should be enabled because "Banana Research" starts with 'B'
    const buttonB = screen.getByRole("button", { name: "B" });
    expect(buttonB).not.toBeDisabled();
    
    // 'C' should be disabled because there are no publications starting with 'C'
    const buttonC = screen.getByRole("button", { name: "C" });
    expect(buttonC).toBeDisabled();
  });

  it("filters correctly when letter is clicked", async () => {
    // Clear the document body before this test runs
    document.body.innerHTML = '';
    
     vi.mocked(useListPublications).mockReturnValue({
      data: mockPublications,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<PublicationsPage />);
    
    // We expect both initially because ALL is selected
    expect(screen.getAllByText("Apple Policy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Banana Research").length).toBeGreaterThan(0);
    
    // Find the A button directly by text to avoid ambiguity
    const buttons = Array.from(document.querySelectorAll('button'));
    const buttonA = buttons.find(b => b.textContent?.trim() === "A");
    if (buttonA) fireEvent.click(buttonA);
    
    // Re-render occurs, so Banana Research should be removed from DOM
    await waitFor(() => {
      const h2Elements = Array.from(document.querySelectorAll('h2'));
      const hasBananaResearch = h2Elements.some(el => el.textContent === 'Banana Research');
      expect(hasBananaResearch).toBe(false);
    });
  });
});
