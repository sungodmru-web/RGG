import { Link, useRoute } from "wouter";
import { useGetPublication } from "@workspace/api-client-react";
import {
  formatPublicationDate,
  getPublicationTypeLabel,
} from "@/lib/research";
import {
  applyPageMetadata,
  metadataForPublication,
} from "@/lib/pageMetadata";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect } from "react";
import { PublicationContent } from "@/components/publications/PublicationContent";

export default function ResearchArticle() {
  const [, params] = useRoute("/publications/:slug");
  const slug = params?.slug ?? "";
  const {
    data: publication,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPublication(slug, {
    query: {
      retry: (_failureCount, queryError) => queryError.status !== 404,
    },
  });
  const { text, language } = useLanguage();

  useEffect(() => {
    if (publication) {
      applyPageMetadata(
        metadataForPublication(publication),
        `${import.meta.env.BASE_URL.replace(/\/$/, "")}/publications/${publication.slug}`,
      );
    }
  }, [publication]);

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-[#0B0B0B] text-[#F4F1EA]">
        <div
          role="status"
          className="container mx-auto px-6 pb-24 pt-40 text-sm font-light text-[#718078]"
        >
          {text("Loading publication…", "Chargement de la publication…")}
        </div>
      </main>
    );
  }

  if (isError && error.status !== 404) {
    return (
      <main className="min-h-[70vh] bg-[#0B0B0B] text-[#F4F1EA]">
        <div className="container mx-auto px-6 pb-24 pt-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
            {text("Research & Insights", "Recherche et perspectives")}
          </p>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl tracking-[-0.03em] md:text-6xl">
            {text("Publication temporarily unavailable.", "Publication temporairement indisponible.")}
          </h1>
          <p className="mt-6 max-w-lg text-sm font-light leading-7 text-[#718078]">
            {text("The research service could not be reached. Please try again.", "Le service de recherche est inaccessible. Veuillez réessayer.")}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-9 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
          >
            {text("Try Again", "Réessayer")}
          </button>
        </div>
      </main>
    );
  }

  if (!publication) {
    return (
      <main className="min-h-[70vh] bg-[#0B0B0B] text-[#F4F1EA]">
        <div className="container mx-auto px-6 pb-24 pt-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A98C50]">
            {text("Research & Insights", "Recherche et perspectives")}
          </p>
          <h1 className="mt-6 max-w-2xl font-serif text-4xl tracking-[-0.03em] md:text-6xl">
            {text("Publication not found.", "Publication introuvable.")}
          </h1>
          <p className="mt-6 max-w-lg text-sm font-light leading-7 text-[#718078]">
            {text("This publication may not yet be published or the address may have changed.", "Cette publication n'est peut-être pas encore publiée ou l'adresse a pu changer.")}
          </p>
          <Link
            href="/publications"
            className="mt-9 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
          >
            {text("← Research Library", "← Bibliothèque de recherche")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0B0B0B] text-[#F4F1EA]">
      <article>
        <header className="border-b border-[#1A2E20] bg-[#07100A]">
          <div className="container mx-auto max-w-5xl px-6 pb-20 pt-36 md:pb-24 md:pt-40">
            <Link
              href="/publications"
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A98C50]"
            >
              {text("← Research & Insights", "← Recherche et perspectives")}
            </Link>

            <div className="mt-14 flex flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.19em]">
              <span className="text-[#C8A96B]">
                {getPublicationTypeLabel(publication.publicationType, text)}
              </span>
              <span className="text-[#56685D]">
                {formatPublicationDate(publication.publicationDate, language)}
              </span>
              {publication.readingTime && (
                <span className="text-[#56685D]">
                  {text(`${publication.readingTime} min read`, `${publication.readingTime} min de lecture`)}
                </span>
              )}
            </div>

            <h1 className="mt-8 max-w-4xl font-serif text-[clamp(3rem,6vw,6rem)] leading-[1] tracking-[-0.04em]">
              {publication.title}
            </h1>

            {publication.subtitle && (
              <p className="mt-7 max-w-3xl text-lg font-light leading-8 text-[#B8B39F]">
                {publication.subtitle}
              </p>
            )}

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-[#718078]">
              {publication.authors.map((author) => (
                <span key={author.name}>{author.name}</span>
              ))}
            </div>
          </div>
        </header>

        {publication.featuredImageMediaId && (
          <div className="container mx-auto max-w-5xl px-6 pt-16">
            <img
              src={`/api/media/${publication.featuredImageMediaId}`}
              alt=""
              className="max-h-[36rem] w-full border border-[#1A2E20] object-cover"
            />
          </div>
        )}

        <div className="container mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-[0.28fr_1fr] lg:gap-16">
          <aside>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#A98C50]">
              {text("Abstract", "Résumé")}
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
                {text("Full publication content is not currently available on the website.", "Le contenu complet de la publication n'est pas actuellement disponible sur le site web.")}
              </p>
            )}

            <div className="mt-14 flex flex-wrap gap-4">
              {(publication.pdfMediaId || publication.pdfUrl) && (
                <a
                  href={publication.pdfMediaId ? `/api/media/${publication.pdfMediaId}` : publication.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center border border-[#C8A96B] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#C8A96B]"
                >
                  {text("View PDF ↗", "Voir le PDF ↗")}
                </a>
              )}

              {publication.externalUrl && (
                <a
                  href={publication.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center border border-[#405246] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8B39F]"
                >
                  {text("External Publication ↗", "Publication externe ↗")}
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
