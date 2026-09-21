import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  htmlToRichText,
  parseRichText,
  renderRichText,
} from "./publicationRichText";

describe("publication rich text", () => {
  it("converts editor HTML into a structured document", () => {
    const stored = htmlToRichText(
      "<h2>Safe heading</h2><p><strong>Important</strong> detail</p><ul><li>First</li></ul>",
    );

    expect(stored).toMatch(/^rgg-rich-text-v1:/);
    expect(parseRichText(stored)).toMatchObject({
      type: "doc",
      version: 1,
      children: [
        { type: "heading", level: 2 },
        { type: "paragraph" },
        { type: "bulletList" },
      ],
    });
  });

  it("renders structured content without injecting HTML", () => {
    const stored = htmlToRichText(
      '<p><strong>Trusted</strong> <a href="https://example.com/source">source</a></p>',
    );
    render(<>{renderRichText(stored!)}</>);

    expect(screen.getByText("Trusted").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "source" })).toHaveAttribute(
      "href",
      "https://example.com/source",
    );
  });

  it("keeps existing plain-text publications readable", () => {
    render(<>{renderRichText("First line\nSecond line")}</>);
    expect(screen.getByText(/First line/)).toHaveClass("whitespace-pre-wrap");
  });

  it("drops unsafe links while serializing editor content", () => {
    const stored = htmlToRichText('<p><a href="javascript:alert(1)">Unsafe</a></p>');
    expect(JSON.stringify(parseRichText(stored))).not.toContain("javascript:");
  });
});