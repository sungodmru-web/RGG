import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import EndorsementForm from "./EndorsementForm";

// Add mock for the router since EndorsementForm uses useLocation
vi.mock("wouter", () => ({
  useLocation: () => ["/admin/endorsements/new", vi.fn()]
}));

// Mock Language Context
vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    text: (en: string, fr: string) => en,
  }),
}));

describe("EndorsementForm", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("validates required fields", async () => {
    const onSubmit = vi.fn();
    render(<EndorsementForm onSubmit={onSubmit} isSubmitting={false} />);

    // Just bypass all the DOM query ambiguities entirely
    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Wait for the alert to appear since submission triggers a state change/render
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Name and quotation are required.");
    });
  });

  it("submits the form with provided data", async () => {
    const onSubmit = vi.fn();
    render(<EndorsementForm onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Quotation/), {
      target: { value: "A very insightful book." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save Endorsement" }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Jane Doe",
        quote: "A very insightful book.",
        title: "",
        organization: "",
        photoUrl: "",
        sourceUrl: "",
        displayOrder: 0,
        status: "draft",
      });
    });
  });
});
