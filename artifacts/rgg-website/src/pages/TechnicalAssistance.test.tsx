import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TechnicalAssistance from "./TechnicalAssistance";

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => ({ text: (english: string) => english }),
}));
vi.mock("@/content/bookContent", () => ({
  useBookContent: () => ({ CORE_PRINCIPLES: [] }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("TechnicalAssistance enquiry form", () => {
  it("submits the API contract and shows success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accepted: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<TechnicalAssistance />);

    await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Organization"), "Analytical Engine");
    await user.type(screen.getByLabelText("Email Address"), "ada@example.com");
    await user.selectOptions(screen.getByLabelText("Enquiry Type"), "technical_assistance");
    await user.selectOptions(screen.getByLabelText("Subject"), "governance");
    await user.type(screen.getByLabelText("Message"), "Please contact me.");
    fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Ada Lovelace",
        email: "ada@example.com",
        organization: "Analytical Engine",
        enquiryType: "technical_assistance",
        subject: "governance",
        message: "Please contact me.",
        language: "english",
        honeypot: "",
      }),
    });
    expect(await screen.findByText("Thank you. Your enquiry has been received.")).toBeInTheDocument();
  });
});