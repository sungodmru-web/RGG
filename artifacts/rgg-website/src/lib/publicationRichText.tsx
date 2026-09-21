import type { ReactNode } from "react";

export const RICH_TEXT_PREFIX = "rgg-rich-text-v1:";

export type RichTextMark =
  | { type: "bold" | "italic" }
  | { type: "link"; href: string };

export type RichTextText = {
  type: "text";
  text: string;
  marks?: RichTextMark[];
};

export type RichTextNode =
  | RichTextText
  | {
      type:
        | "paragraph"
        | "heading"
        | "blockquote"
        | "bulletList"
        | "orderedList"
        | "listItem";
      level?: 2 | 3;
      children: RichTextNode[];
    };

export type RichTextDocument = {
  type: "doc";
  version: 1;
  children: RichTextNode[];
};

function isSafeHref(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function isTextNode(value: unknown): value is RichTextText {
  if (!value || typeof value !== "object") return false;
  const node = value as RichTextText;
  return node.type === "text" && typeof node.text === "string" &&
    (node.marks === undefined || (
      Array.isArray(node.marks) &&
      node.marks.every((mark) => mark.type === "bold" || mark.type === "italic" ||
        (mark.type === "link" && typeof (mark as { href?: unknown }).href === "string" && isSafeHref((mark as { href: string }).href)))
    ));
}

function isRichTextNode(value: unknown, depth = 0): value is RichTextNode {
  if (depth > 12 || !value || typeof value !== "object") return false;
  if (isTextNode(value)) return true;
  const node = value as Exclude<RichTextNode, RichTextText>;
  const types = ["paragraph", "heading", "blockquote", "bulletList", "orderedList", "listItem"];
  if (!types.includes(node.type) || !Array.isArray(node.children)) return false;
  if (node.type === "heading" && node.level !== 2 && node.level !== 3) return false;
  return node.children.every((child) => isRichTextNode(child, depth + 1));
}

export function parseRichText(value: string | null | undefined): RichTextDocument | null {
  if (!value?.startsWith(RICH_TEXT_PREFIX)) return null;
  try {
    const document = JSON.parse(value.slice(RICH_TEXT_PREFIX.length)) as RichTextDocument;
    if (
      document.type === "doc" &&
      document.version === 1 &&
      Array.isArray(document.children) &&
      document.children.every((node) => isRichTextNode(node))
    ) {
      return document;
    }
  } catch {
    return null;
  }
  return null;
}

export function serializeRichText(document: RichTextDocument): string {
  return `${RICH_TEXT_PREFIX}${JSON.stringify(document)}`;
}

function textToHtml(node: RichTextText): string {
  const span = document.createElement("span");
  span.textContent = node.text;
  let html = span.innerHTML;
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") html = `<strong>${html}</strong>`;
    if (mark.type === "italic") html = `<em>${html}</em>`;
    if (mark.type === "link") {
      const anchor = document.createElement("a");
      anchor.href = mark.href;
      anchor.innerHTML = html;
      html = anchor.outerHTML;
    }
  }
  return html;
}

function nodeToHtml(node: RichTextNode): string {
  if (node.type === "text") return textToHtml(node);
  const children = node.children.map(nodeToHtml).join("");
  const tag = node.type === "heading" ? `h${node.level}` : ({
    paragraph: "p",
    blockquote: "blockquote",
    bulletList: "ul",
    orderedList: "ol",
    listItem: "li",
  } as const)[node.type];
  return `<${tag}>${children}</${tag}>`;
}

export function richTextToHtml(value: string | null | undefined): string {
  const parsed = parseRichText(value);
  if (parsed) return parsed.children.map(nodeToHtml).join("");
  if (!value) return "<p><br></p>";
  return value
    .split(/\n{2,}/)
    .map((paragraph) => {
      const span = document.createElement("span");
      span.textContent = paragraph;
      return `<p>${span.innerHTML.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function marksFromElement(element: Element, inherited: RichTextMark[]): RichTextMark[] {
  const marks = [...inherited];
  if (element.matches("strong,b")) marks.push({ type: "bold" });
  if (element.matches("em,i")) marks.push({ type: "italic" });
  if (element.matches("a")) {
    const href = element.getAttribute("href") ?? "";
    if (isSafeHref(href)) marks.push({ type: "link", href });
  }
  return marks;
}

function inlineNodes(node: Node, marks: RichTextMark[] = []): RichTextNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? [{ type: "text", text: node.textContent, ...(marks.length ? { marks } : {}) }] : [];
  }
  if (!(node instanceof Element)) return [];
  if (node.tagName === "BR") return [{ type: "text", text: "\n", ...(marks.length ? { marks } : {}) }];
  const nextMarks = marksFromElement(node, marks);
  return Array.from(node.childNodes).flatMap((child) => inlineNodes(child, nextMarks));
}

function blockNode(element: Element): RichTextNode | null {
  const tag = element.tagName.toLowerCase();
  const children = tag === "ul" || tag === "ol"
    ? Array.from(element.children).map(blockNode).filter((node): node is RichTextNode => Boolean(node))
    : tag === "li"
      ? Array.from(element.childNodes).flatMap((child) =>
          child instanceof Element && ["ul", "ol"].includes(child.tagName.toLowerCase())
            ? [blockNode(child)].filter((node): node is RichTextNode => Boolean(node))
            : inlineNodes(child),
        )
      : inlineNodes(element);
  if (!children.length) children.push({ type: "text", text: "" });
  if (tag === "h2" || tag === "h3") return { type: "heading", level: tag === "h2" ? 2 : 3, children };
  if (tag === "blockquote") return { type: "blockquote", children };
  if (tag === "ul") return { type: "bulletList", children };
  if (tag === "ol") return { type: "orderedList", children };
  if (tag === "li") return { type: "listItem", children };
  return { type: "paragraph", children };
}

export function htmlToRichText(html: string): string | null {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const children = Array.from(parsed.body.children)
    .map(blockNode)
    .filter((node): node is RichTextNode => Boolean(node));
  const document: RichTextDocument = { type: "doc", version: 1, children };
  const hasText = parsed.body.textContent?.trim();
  return hasText ? serializeRichText(document) : null;
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (node.type === "text") {
    let rendered: ReactNode = node.text;
    for (const [index, mark] of (node.marks ?? []).entries()) {
      if (mark.type === "bold") rendered = <strong key={`${key}-b-${index}`}>{rendered}</strong>;
      if (mark.type === "italic") rendered = <em key={`${key}-i-${index}`}>{rendered}</em>;
      if (mark.type === "link") rendered = <a key={`${key}-a-${index}`} href={mark.href} rel="noopener noreferrer">{rendered}</a>;
    }
    return rendered;
  }
  const children = node.children.map((child, index) => renderNode(child, `${key}-${index}`));
  if (node.type === "heading") return node.level === 2 ? <h2 key={key}>{children}</h2> : <h3 key={key}>{children}</h3>;
  if (node.type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
  if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
  if (node.type === "orderedList") return <ol key={key}>{children}</ol>;
  if (node.type === "listItem") return <li key={key}>{children}</li>;
  return <p key={key}>{children}</p>;
}

export function renderRichText(value: string): ReactNode {
  const document = parseRichText(value);
  if (!document) return <p className="whitespace-pre-wrap">{value}</p>;
  return document.children.map((node, index) => renderNode(node, `rich-${index}`));
}