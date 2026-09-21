import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  RemoveFormatting,
  Unlink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { htmlToRichText, richTextToHtml } from "@/lib/publicationRichText";

type Props = {
  value: string;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
};

type EditorCommand = {
  label: string;
  icon: typeof Bold;
  command: string;
  value?: string;
};

const commands: EditorCommand[] = [
  { label: "Paragraph", icon: Pilcrow, command: "formatBlock", value: "p" },
  { label: "Heading 2", icon: Heading2, command: "formatBlock", value: "h2" },
  { label: "Heading 3", icon: Heading3, command: "formatBlock", value: "h3" },
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Quotation", icon: Quote, command: "formatBlock", value: "blockquote" },
];

export function PublicationRichTextEditor({ value, onChange, onBlur }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (!editorRef.current || value === lastValueRef.current) return;
    editorRef.current.innerHTML = richTextToHtml(value);
    lastValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = richTextToHtml(value);
  }, []);

  const emitChange = () => {
    const next = htmlToRichText(editorRef.current?.innerHTML ?? "");
    lastValueRef.current = next ?? "";
    onChange(next);
  };

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const addLink = () => {
    const href = window.prompt("Enter a web or email address");
    if (!href) return;
    try {
      const url = new URL(href, window.location.origin);
      if (!["http:", "https:", "mailto:"].includes(url.protocol)) return;
      run("createLink", href);
    } catch {
      return;
    }
  };

  return (
    <div className="overflow-hidden border border-[#1A2E20] bg-[#0B1510] focus-within:border-[#C8A96B]">
      <div
        role="toolbar"
        aria-label="Article formatting"
        className="flex flex-wrap gap-1 border-b border-[#1A2E20] bg-[#101D15] p-2"
      >
        {commands.map(({ label, icon: Icon, command, value: commandValue }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon"
            title={label}
            aria-label={label}
            data-testid={`button-format-${label.toLowerCase().replaceAll(" ", "-")}`}
            className="size-9 rounded-none text-[#B8B39F] hover:bg-[#1A2E20] hover:text-[#F4F1EA]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(command, commandValue)}
          >
            <Icon className="size-4" />
          </Button>
        ))}
        <Button type="button" variant="ghost" size="icon" title="Add link" aria-label="Add link" data-testid="button-format-add-link" className="size-9 rounded-none text-[#B8B39F] hover:bg-[#1A2E20]" onMouseDown={(event) => event.preventDefault()} onClick={addLink}>
          <LinkIcon className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" title="Remove link" aria-label="Remove link" data-testid="button-format-remove-link" className="size-9 rounded-none text-[#B8B39F] hover:bg-[#1A2E20]" onMouseDown={(event) => event.preventDefault()} onClick={() => run("unlink")}>
          <Unlink className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" title="Clear formatting" aria-label="Clear formatting" data-testid="button-format-clear" className="size-9 rounded-none text-[#B8B39F] hover:bg-[#1A2E20]" onMouseDown={(event) => event.preventDefault()} onClick={() => run("removeFormat")}>
          <RemoveFormatting className="size-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Article content"
        data-testid="editor-publication-content"
        onInput={emitChange}
        onBlur={onBlur}
        className="min-h-[400px] px-5 py-4 text-sm leading-7 text-[#F4F1EA] outline-none [&_a]:text-[#C8A96B] [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C8A96B] [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:list-disc"
      />
      <p className="border-t border-[#1A2E20] px-3 py-2 text-xs text-[#718078]">
        Use the toolbar or standard keyboard shortcuts such as Ctrl+B and Ctrl+I.
      </p>
    </div>
  );
}