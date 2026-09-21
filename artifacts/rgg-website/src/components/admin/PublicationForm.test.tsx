import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import PublicationForm from "./PublicationForm";

afterEach(cleanup);

describe("PublicationForm", () => {
  it("generates a slug and submits structured publication values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PublicationForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title *"), "A Governance Test");
    await user.type(screen.getByLabelText("Abstract *"), "Verified abstract.");
    await user.type(
      screen.getByLabelText("Authors *"),
      "Dr Example | Lead author\nResearch Partner",
    );
    await user.click(screen.getByLabelText("published"));
    await user.click(
      screen.getByRole("button", { name: "Save Publication" }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "A Governance Test",
        slug: "a-governance-test",
        abstract: "Verified abstract.",
        publicationType: "research-paper",
        status: "published",
        featured: false,
        authors: [
          { name: "Dr Example", role: "Lead author" },
          { name: "Research Partner" },
        ],
      }),
    );
  });

  it("preserves a manually edited slug when the title changes", async () => {
    const user = userEvent.setup();

    render(<PublicationForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("Title *"), "Initial title");
    const slug = screen.getByLabelText("Slug *");
    await user.clear(slug);
    await user.type(slug, "custom-address");
    await user.clear(screen.getByLabelText("Title *"));
    await user.type(screen.getByLabelText("Title *"), "Changed title");

    expect(slug).toHaveValue("custom-address");
  });
});