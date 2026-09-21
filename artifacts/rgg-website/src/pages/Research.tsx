import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListPublications } from "@workspace/api-client-react";

import ResearchCard from "@/components/research/ResearchCard";
import { getTranslatedPublicationTypeOptions } from "@/content/researchContent";
import {
  getPublicationTypeLabel,
  sortPublicationsNewestFirst,
} from "@/lib/research";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type {
  PublicationType,
  ResearchPublication,
} from "@/types/research";
import { PUBLICATION_TYPES } from "@/types/research";

type FilterValue = "all" | PublicationType;

function getInitialPublicationType(): FilterValue {
  if (typeof window === "undefined") return "all";

  const type = new URLSearchParams(window.location.search).get("type");

  return PUBLICATION_TYPES.includes(type as PublicationType)
    ? (type as PublicationType)
    : "all";
}

function getInitialSearchQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") || "";
}

function matchesSearch(publication: ResearchPublication, query: string, text: (en: string, fr: string) => string) {
  if (!query) return true;

  const searchable = [
    publication.title,
    publication.subtitle ?? "",
    publication.abstract,
    publication.category ?? "",
    getPublicationTypeLabel(publication.publicationType),
    getPublicationTypeLabel(publication.publicationType, (en, fr) => fr),
    ...publication.authors.map((author) => author.name),
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query.toLowerCase());
}

export default function Research() {
  const { text } = useLanguage();
  const {
    data: publications = [],
    isLoading,
    isError,
    refetch,
  } = useListPublications();
  const [activeType, setActiveType] = useState<FilterValue>(
    getInitialPublicationType,
  );
  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearchQuery);

  const sortedPublications = useMemo(
    () => sortPublicationsNewestFirst(publications),
    [publications],
  );

  const featuredPublication = sortedPublications.find(
    (publication) => publication.featured,
  );

  const filteredPublications = useMemo(() => {
    return sortedPublications.filter((publication) => {
      const typeMatches =
        activeType === "all" || publication.publicationType === activeType;
      const searchMatches = matchesSearch(publication, searchQuery.trim(), text);

      return typeMatches && searchMatches;
    });
  }, [activeType, searchQuery, sortedPublications, text]);

  const topics = [
    { value: "North America", label: text("North America", "Amérique du Nord") },
    { value: "Europe", label: text("Europe", "Europe") },
    { value: "Latin America", label: text("Latin America", "Amérique latine") },
    { value: "Africa", label: text("Africa", "Afrique") },
    { value: "Global Economy", label: text("Global Economy", "Économie mondiale") },
    { value: "Caribbean & SIDS", label: text("Caribbean & SIDS", "Caraïbes et PEID") },
  ];

  const publicationTypeOptions = getTranslatedPublicationTypeOptions(text);

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#07100A]">
        <img
          src={`${import.meta.env.BASE_URL}images/research-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.97)_0%,rgba(4,8,5,0.88)_40%,rgba(4,8,5,0.52)_70%,rgba(4,8,5,0.38)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050805]/70 via-transparent to-[#050805]/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-25"
        />

        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pb-28 md:pt-40">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Research & Insights", "Recherche et perspectives")}
              </span>
            </div>

            <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,7.5vw,7.4rem)] leading-[0.94] tracking-[-0.045em]">
              {text("Ideas built", "Des idées conçues")}
              <br />
              <span className="italic text-[#EDD99A]">{text("to travel.", "pour voyager.")}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "Research papers, policy briefs, articles, reports and commentary examining cannabis through health, justice, governance and sustainable development.",
                "Articles de recherche, notes d'orientation, articles, rapports et commentaires examinant le cannabis à travers le prisme de la santé, de la justice, de la gouvernance et du développement durable."
              )}
            </p>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-[#718078]">
              {text(
                "Research & Insights extends Reclaiming the Green Gold beyond the publication, creating a growing body of work around institutional reform and implementation.",
                "La section Recherche et perspectives prolonge Reclaiming the Green Gold au-delà de la publication, en créant un corpus croissant de travaux autour de la réforme institutionnelle et de sa mise en œuvre."
              )}
            </p>
          </div>
        </div>
      </section>

      {featuredPublication && (
        <section className="border-b border-[#1A2E20] bg-[#080D09]">
          <div className="container mx-auto px-6 py-20 md:py-24">
            <p className="mb-8 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("Featured Publication", "Publication en vedette")}
            </p>
            <div className="grid gap-10 lg:grid-cols-[0.32fr_1fr] lg:gap-20">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#56685D]">
                {getPublicationTypeLabel(featuredPublication.publicationType, text)}
              </div>
              <div className="max-w-4xl">
                <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
                  {featuredPublication.title}
                </h2>
                <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-[#718078]">
                  {featuredPublication.abstract}
                </p>
                <Link
                  href={`/research/${featuredPublication.slug}`}
                  className="mt-8 inline-flex items-center border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] hover:text-[#EDD99A]"
                >
                  {text("Read Publication", "Lire la publication")} <span aria-hidden="true" className="ml-3">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-[#1A2E20] bg-[#0A120D]">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
            {text("Browse by Topic", "Parcourir par sujet")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {topics.map(topic => (
              <button
                key={topic.value}
                type="button"
                onClick={() => {
                  setSearchQuery(topic.value);
                  window.history.replaceState(
                    null,
                    "",
                    `${import.meta.env.BASE_URL}research?q=${encodeURIComponent(topic.value)}`,
                  );
                  trackEvent("research_topic_selected", { topic: topic.value });
                }}
                className="border border-[#1A2E20] bg-[#080D09] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <label
                htmlFor="research-search"
                className="mb-3 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]"
              >
                {text("Search Publications", "Rechercher des publications")}
              </label>
              <div className="flex w-full max-w-[440px] items-center border-b border-[#405246] focus-within:border-[#C8A96B]">
                <input
                  id="research-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={text("Search title, topic or author", "Rechercher un titre, un sujet ou un auteur")}
                  className="h-12 w-full bg-transparent text-sm text-[#F4F1EA] outline-none placeholder:text-[#405246]"
                />
                <span aria-hidden="true" className="ml-4 text-[#56685D]">⌕</span>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]">
                {text("Publication Type", "Type de publication")}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {publicationTypeOptions.map((option) => {
                  const active = option.value === activeType;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setActiveType(option.value as FilterValue);
                        trackEvent("research_filter_selected", {
                          type: option.value,
                        });
                      }}
                      className={`border-b pb-1 text-[9px] font-bold uppercase tracking-[0.17em] transition-colors ${
                        active
                          ? "border-[#C8A96B] text-[#EDD99A]"
                          : "border-transparent text-[#56685D] hover:text-[#C8A96B]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Publication Library", "Bibliothèque de publications")}
              </p>
              <h2 className="font-serif text-4xl tracking-[-0.03em] md:text-5xl">
                {text("Latest work.", "Derniers travaux.")}
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#56685D]">
              {filteredPublications.length} publication{filteredPublications.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isLoading ? (
            <div
              role="status"
              className="border border-[#1A2E20] bg-[#0B0B0B] px-7 py-16 text-sm font-light text-[#718078] md:px-10"
            >
              {text("Loading publications…", "Chargement des publications…")}
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="border border-[#1A2E20] bg-[#0B0B0B] px-7 py-16 md:px-10"
            >
              <h3 className="max-w-xl font-serif text-3xl tracking-[-0.025em] md:text-4xl">
                {text("The research library is temporarily unavailable.", "La bibliothèque de recherche est temporairement indisponible.")}
              </h3>
              <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#718078]">
                {text("Please try again. No publication information has been replaced with placeholder content.", "Veuillez réessayer. Aucune information de publication n'a été remplacée par du contenu de substitution.")}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-8 border-b border-[#C8A96B]/60 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
              >
                {text("Try Again", "Réessayer")}
              </button>
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="grid border-l border-t border-[#1A2E20] md:grid-cols-2 xl:grid-cols-3">
              {filteredPublications.map((publication) => (
                <ResearchCard
                  key={publication.id}
                  publication={publication}
                />
              ))}
            </div>
          ) : (
            <div className="border border-[#1A2E20] bg-[#0B0B0B] px-7 py-16 md:px-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8A713E]">
                {text("Research & Insights", "Recherche et perspectives")}
              </p>
              <h3 className="mt-5 max-w-xl font-serif text-3xl tracking-[-0.025em] md:text-4xl">
                {publications.length === 0
                  ? text("The research library is being prepared.", "La bibliothèque de recherche est en cours de préparation.")
                  : text("No publications match this search.", "Aucune publication ne correspond à cette recherche.")}
              </h3>
              <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#718078]">
                {publications.length === 0
                  ? text("Verified papers, policy briefs, articles and reports will appear here as they are published.", "Les documents vérifiés, notes d'orientation, articles et rapports apparaîtront ici dès leur publication.")
                  : text("Try another publication type or change your search terms.", "Essayez un autre type de publication ou modifiez vos termes de recherche.")}
              </p>
              {publications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveType("all");
                    setSearchQuery("");
                  }}
                  className="mt-8 border-b border-[#C8A96B]/60 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
                >
                  {text("Clear Filters", "Effacer les filtres")}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#1A2E20] bg-[#07100A]">
        <div className="container mx-auto grid gap-12 px-6 py-24 md:py-32 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("The Framework", "Le cadre")}
            </p>
            <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em]">
              {text("A model for institutional readiness.", "Un modèle de préparation institutionnelle.")}
            </h2>
            <Link
              href="/framework"
              className="mt-8 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
            >
              {text("Explore Framework →", "Explorer le cadre →")}
            </Link>
          </div>

          <div className="border-l border-[#1A2E20] pl-8 md:pl-10">
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("Strategic Advisory", "Conseil stratégique")}
            </p>
            <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em]">
              {text("From research to implementation.", "De la recherche à la mise en œuvre.")}
            </h2>
            <Link
              href="/consultancy"
              className="mt-8 inline-flex border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
            >
              {text("Explore Consultancy →", "Explorer le conseil →")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
