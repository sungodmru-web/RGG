const PREFIX = "rgg-rich-text-v1:";
const NODE_TYPES = new Set(["paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem"]);

function safeHref(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(value, "https://example.invalid").protocol);
  } catch {
    return false;
  }
}

function validNode(value: unknown, depth = 0): boolean {
  if (depth > 12 || !value || typeof value !== "object" || Array.isArray(value)) return false;
  const node = value as Record<string, unknown>;
  if (node.type === "text") {
    if (typeof node.text !== "string") return false;
    if (node.marks === undefined) return true;
    return Array.isArray(node.marks) && node.marks.every((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return false;
      const mark = value as Record<string, unknown>;
      return mark.type === "bold" || mark.type === "italic" || (mark.type === "link" && safeHref(mark.href));
    });
  }
  if (typeof node.type !== "string" || !NODE_TYPES.has(node.type) || !Array.isArray(node.children)) return false;
  if (node.type === "heading" && node.level !== 2 && node.level !== 3) return false;
  return node.children.every((child) => validNode(child, depth + 1));
}

export function isValidPublicationContent(value: string | null | undefined): boolean {
  if (!value || !value.startsWith(PREFIX)) return true;
  if (value.length > 500_000) return false;
  try {
    const document = JSON.parse(value.slice(PREFIX.length)) as Record<string, unknown>;
    return document.type === "doc" &&
      document.version === 1 &&
      Array.isArray(document.children) &&
      document.children.every((node) => validNode(node));
  } catch {
    return false;
  }
}