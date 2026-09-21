import { renderRichText } from "@/lib/publicationRichText";

export function PublicationContent({ content }: { content: string }) {
  return (
    <div className="publication-content mt-14 text-base font-light leading-8 text-[#9AA59D] [&_a]:text-[#C8A96B] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C8A96B]/60 [&_blockquote]:pl-6 [&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-[#E2DFD1] [&_h3]:mb-4 [&_h3]:mt-10 [&_h3]:font-serif [&_h3]:text-2xl [&_h3]:text-[#D3D0C1] [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6">
      {renderRichText(content)}
    </div>
  );
}