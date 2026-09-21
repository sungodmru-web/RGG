import { isValidPublicationContent } from "./publicationRichText";

const encode = (document: unknown) =>
  `rgg-rich-text-v1:${JSON.stringify(document)}`;

describe("publication rich-text validation", () => {
  it("accepts legacy plain text and valid structured content", () => {
    expect(isValidPublicationContent("Existing plain text")).toBe(true);
    expect(isValidPublicationContent(encode({
      type: "doc",
      version: 1,
      children: [{
        type: "paragraph",
        children: [{
          type: "text",
          text: "Read the source",
          marks: [{ type: "link", href: "https://example.com" }],
        }],
      }],
    }))).toBe(true);
  });

  it("rejects malformed documents, unknown nodes, and unsafe links", () => {
    expect(isValidPublicationContent("rgg-rich-text-v1:not-json")).toBe(false);
    expect(isValidPublicationContent(encode({
      type: "doc",
      version: 1,
      children: [{ type: "script", children: [] }],
    }))).toBe(false);
    expect(isValidPublicationContent(encode({
      type: "doc",
      version: 1,
      children: [{
        type: "paragraph",
        children: [{
          type: "text",
          text: "Unsafe",
          marks: [{ type: "link", href: "javascript:alert(1)" }],
        }],
      }],
    }))).toBe(false);
  });
});