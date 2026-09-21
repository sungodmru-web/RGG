import { ArrowLeft, ExternalLink, FileText, LockKeyhole } from "lucide-react";
import { Link, useParams } from "wouter";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPublicationPreview } from "@/hooks/use-admin-api";
import {
  formatPublicationDate,
  getPublicationTypeLabel,
} from "@/lib/research";
import { PublicationContent } from "@/components/publications/PublicationContent";

const english = (englishText: string) => englishText;

export default function AdminPublicationPreview() {
  const { id } = useParams<{ id: string }>();
  const {
    data: publication,
    isLoading,
    isError,
    refetch,
  } = useAdminPublicationPreview(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        <Skeleton className="h-10 w-72 bg-[#162B1E]" />
        <Skeleton className="h-[560px] w-full bg-[#162B1E]" />
      </div>
    );
  }

  if (isError || !publication) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center">
        <h1 className="font-serif text-3xl text-[#F4F1EA]">
          Preview unavailable.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#9AA79F]">
          The saved publication could not be loaded. No draft content has been
          exposed publicly.
        </p>
        <Button
          type="button"
          onClick={() => void refetch()}
          className="mt-8 rounded-none bg-[#C8A96B] text-[#07100A] hover:bg-[#EDD99A]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const pdfHref = publication.pdfMediaId
    ? `/api/media/${publication.pdfMediaId}`
    : publication.pdfUrl;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 border border-[#405246] bg-[#101A14] px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#C8A96B]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]">
              Private administrator preview
            </p>
            <p className="mt-1 text-xs leading-5 text-[#9AA79F]">
              This saved {publication.status} version is protected by the
              administrator session and is not part of the public library.
            </p>
          </div>
        </div>
        <Link
          href={`/admin/publications/${publication.id}`}
          className="inline-flex shrink-0 items-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4F1EA]"
        >
          <ArrowLeft className="mr-2 size-4" />
          Return to editor
        </Link>
      </div>

      <article className="overflow-hidden border border-[#1A2E20] bg-[#0B0B0B] text-[#F4F1EA]">
        {publication.featuredImageMediaId && (
          <img
            src={`/api/media/${publication.featuredImageMediaId}`}
            alt={`${publication.title} cover`}
            className="max-h-[520px] w-full object-cover"
          />
        )}

        <header className="border-b border-[#1A2E20] bg-[#07100A] px-6 py-16 md:px-14 md:py-20">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.19em]">
            <span className="text-[#C8A96B]">
              {getPublicationTypeLabel(publication.publicationType, english)}
            </span>
            {publication.publicationDate && (
              <span className="text-[#718078]">
                {formatPublicationDate(publication.publicationDate, "en")}
              </span>
            )}
            {publication.readingTime && (
              <span className="text-[#718078]">
                {publication.readingTime} min read
              </span>
            )}
          </div>

          <h1 className="mt-8 max-w-4xl font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-none tracking-[-0.04em]">
            {publication.title}
          </h1>
          {publication.subtitle && (
            <p className="mt-7 max-w-3xl text-lg font-light leading-8 text-[#B8B39F]">
              {publication.subtitle}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-[#718078]">
            {publication.authors.map((author) => (
              <span key={`${author.name}-${author.role ?? ""}`}>
                {author.name}
                {author.role ? ` — ${author.role}` : ""}
              </span>
            ))}
          </div>
        </header>

        <div className="grid gap-12 px-6 py-16 md:px-14 lg:grid-cols-[0.28fr_1fr] lg:gap-16">
          <aside>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#A98C50]">
              Abstract
            </p>
          </aside>
          <div>
            <p className="font-serif text-xl leading-9 text-[#C8C5B3] md:text-2xl">
              {publication.abstract}
            </p>
            {publication.content ? (
              <PublicationContent content={publication.content} />
            ) : (
              <p className="mt-14 border-l border-[#C8A96B]/40 pl-5 text-sm font-light leading-7 text-[#65736B]">
                Full publication content has not been added.
              </p>
            )}

            <div className="mt-14 flex flex-wrap gap-4">
              {pdfHref && (
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center border border-[#C8A96B] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#C8A96B]"
                >
                  <FileText className="mr-2 size-4" />
                  View PDF
                </a>
              )}
              {publication.externalUrl && (
                <a
                  href={publication.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center border border-[#405246] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8B39F]"
                >
                  External publication
                  <ExternalLink className="ml-2 size-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}