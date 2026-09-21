import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useListPublications } from "@workspace/api-client-react";

import ResearchCard from "@/components/research/ResearchCard";
import { getTranslatedPublicationTypeOptions } from "@/content/researchContent";
import { getPublicationTypeLabel, sortPublicationsNewestFirst } from "@/lib/research";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PublicationType, ResearchPublication } from "@/types/research";
import { PUBLICATION_TYPES } from "@/types/research";

type FilterValue = "all" | PublicationType;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getInitialPublicationType(): FilterValue {
  if (typeof window === "undefined") return "all";
  const type = new URLSearchParams(window.location.search).get("type");
  return PUBLICATION_TYPES.includes(type as PublicationType) ? (type as PublicationType) : "all";
}

function getInitialSearchQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") || "";
}

function getInitialLetterQuery(): string {
  if (typeof window === "undefined") return "ALL";
  return new URLSearchParams(window.location.search).get("letter") || "ALL";
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
  ].join(" ").toLowerCase();

  return searchable.includes(query.toLowerCase());
}

export default function PublicationsPage() {
  const { text } = useLanguage();
  const { data: publications = [], isLoading, isError, refetch } = useListPublications();

  const [activeType, setActiveType] = useState<FilterValue>(getInitialPublicationType);
  const [searchQuery, setSearchQuery] = useState<string>(getInitialSearchQuery);
  const [activeLetter, setActiveLetter] = useState<string>(getInitialLetterQuery);
  const [activeTheme, setActiveTheme] = useState<string>("All Themes");

  // Derive unique themes from actual publication data
  const availableThemes = useMemo(() => {
    const themes = new Set<string>();
    publications.forEach(pub => {
      if (pub.category) themes.add(pub.category);
    });
    return ["All Themes", ...Array.from(themes).sort()];
  }, [publications]);

  const sortedPublications = useMemo(() => {
    let sorted = sortPublicationsNewestFirst(publications);
    
    // If a letter is selected, sort alphabetically instead
    if (activeLetter !== "ALL") {
       sorted = [...publications].sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [publications, activeLetter]);

  const filteredPublications = useMemo(() => {
    return sortedPublications.filter((publication) => {
      const typeMatches = activeType === "all" || publication.publicationType === activeType;
      const searchMatches = matchesSearch(publication, searchQuery.trim(), text);
      const letterMatches = activeLetter === "ALL" || (publication.title && publication.title.charAt(0).toUpperCase() === activeLetter);
      const themeMatches = activeTheme === "All Themes" || publication.category === activeTheme;

      return typeMatches && searchMatches && letterMatches && themeMatches;
    });
  }, [activeType, searchQuery, activeLetter, activeTheme, sortedPublications, text]);

  // Find letters that actually have publications
  const lettersWithPublications = useMemo(() => {
    const letters = new Set<string>();
    publications.forEach(pub => {
      if (pub.title && pub.title.length > 0) {
        letters.add(pub.title.charAt(0).toUpperCase());
      }
    });
    return letters;
  }, [publications]);

  const publicationTypeOptions = getTranslatedPublicationTypeOptions(text);

  const hasActiveFilters = activeType !== "all" || searchQuery !== "" || activeLetter !== "ALL" || activeTheme !== "All Themes";

  const clearFilters = () => {
    setActiveType("all");
    setSearchQuery("");
    setActiveLetter("ALL");
    setActiveTheme("All Themes");
  };

  return (
    <main
      className="min-h-[calc(100vh-68px)] overflow-x-hidden bg-[#0B0B0B] bg-cover bg-fixed bg-top bg-no-repeat pb-20 pt-24 text-[#F4F1EA]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6, 10, 7, 0.82), rgba(11, 11, 11, 0.94)), url("/images/publications-library-background.png")',
      }}
    >

      <div className="container mx-auto px-6 mb-16">
         <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("The Library", "La Bibliothèque")}
            </span>
         </div>
         <h1 className="max-w-4xl font-serif text-[clamp(2.75rem,5vw,5rem)] leading-[0.94] tracking-[-0.03em] mb-6">
            {text("Articles &", "Articles &")}{" "}
            <span className="italic text-[#EDD99A]">{text("Publications.", "Publications.")}</span>
         </h1>
      </div>

      <div className="container mx-auto px-6 border-b border-[#1A2E20] pb-12 mb-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* SEARCH */}
          <div className="lg:col-span-1">
            <label htmlFor="library-search" className="mb-3 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]">
              {text("Search", "Rechercher")}
            </label>
            <div className="flex w-full items-center border-b border-[#405246] focus-within:border-[#C8A96B] bg-[#07100A] px-4">
              <input
                id="library-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text("Search by title, author, or keyword...", "Rechercher par titre, auteur, ou mot-clé...")}
                className="h-12 w-full bg-transparent text-sm text-[#F4F1EA] outline-none placeholder:text-[#405246]"
              />
              <span aria-hidden="true" className="ml-2 text-[#56685D]">⌕</span>
            </div>
          </div>

          {/* THEMES */}
          <div className="lg:col-span-1">
            <label className="mb-3 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]">
              {text("Browse by Theme", "Parcourir par thème")}
            </label>
            <select
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value)}
              className="h-12 w-full bg-[#07100A] border-b border-[#405246] text-sm text-[#F4F1EA] outline-none focus:border-[#C8A96B] px-4 cursor-pointer appearance-none"
            >
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>
                  {theme === "All Themes" ? text("All Themes", "Tous les thèmes") : theme}
                </option>
              ))}
            </select>
          </div>

          {/* PUBLICATION TYPE */}
          <div className="lg:col-span-1">
             <label className="mb-3 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]">
              {text("Publication Type", "Type de publication")}
            </label>
             <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value as FilterValue)}
              className="h-12 w-full bg-[#07100A] border-b border-[#405246] text-sm text-[#F4F1EA] outline-none focus:border-[#C8A96B] px-4 cursor-pointer appearance-none"
            >
              {publicationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* A-Z INDEX */}
        <div className="mt-10">
           <label className="mb-4 block text-[9px] font-bold uppercase tracking-[0.22em] text-[#718078]">
              {text("A-Z Index", "Index de A à Z")}
            </label>
            <div className="flex flex-wrap gap-2">
               <button
                  onClick={() => {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.delete("letter");
                    window.history.replaceState({}, "", currentUrl.toString());
                    setActiveLetter("ALL");
                  }}
                  className={`flex h-8 w-12 items-center justify-center border text-[10px] font-bold transition-colors ${
                    activeLetter === "ALL"
                      ? "border-[#C8A96B] bg-[#C8A96B] text-[#0B0B0B]"
                      : "border-[#1A2E20] bg-[#07100A] text-[#718078] hover:border-[#405246] hover:text-[#B8B39F]"
                  }`}
               >
                 ALL
               </button>
               {ALPHABET.map(letter => {
                 const hasPubs = lettersWithPublications.has(letter);
                 const isActive = activeLetter === letter;

                 return (
                   <button
                    key={letter}
                    onClick={() => {
                      if (hasPubs) {
                        const currentUrl = new URL(window.location.href);
                        currentUrl.searchParams.set("letter", letter);
                        window.history.replaceState({}, "", currentUrl.toString());
                        setActiveLetter(letter);
                      }
                    }}
                    disabled={!hasPubs}
                    className={`flex h-8 w-8 items-center justify-center border text-[10px] font-bold transition-colors ${
                      isActive
                        ? "border-[#C8A96B] bg-[#C8A96B] text-[#0B0B0B]"
                        : hasPubs
                          ? "border-[#1A2E20] bg-[#07100A] text-[#B8B39F] hover:border-[#C8A96B] hover:text-[#EDD99A] cursor-pointer"
                          : "border-transparent bg-transparent text-[#2C3B33] cursor-not-allowed opacity-50"
                    }`}
                   >
                     {letter}
                   </button>
                 );
               })}
            </div>
        </div>

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] hover:text-[#EDD99A] border-b border-[#C8A96B]/50 pb-1"
            >
              {text("Clear all filters", "Effacer tous les filtres")}
            </button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="border border-[#1A2E20] bg-[#07100A] px-7 py-16 text-sm font-light text-[#718078]">
              {text("Loading publications…", "Chargement des publications…")}
            </div>
          ) : isError ? (
            <div className="border border-[#1A2E20] bg-[#07100A] px-7 py-16">
              <h3 className="font-serif text-3xl mb-4 text-[#F4F1EA]">
                {text("The publication library is temporarily unavailable.", "La bibliothèque de publications est temporairement indisponible.")}
              </h3>
              <button
                onClick={() => void refetch()}
                className="border-b border-[#C8A96B]/60 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
              >
                {text("Try Again", "Réessayer")}
              </button>
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="grid border-l border-t border-[#1A2E20] md:grid-cols-2 lg:grid-cols-3">
              {filteredPublications.map((publication) => (
                <ResearchCard key={publication.id} publication={publication} />
              ))}
            </div>
          ) : (
            <div className="border border-[#1A2E20] bg-[#07100A] px-7 py-20 text-center">
              <h3 className="font-serif text-3xl mb-4 text-[#F4F1EA]">
                {publications.length === 0
                  ? text("The publication library is being prepared.", "La bibliothèque de publications est en cours de préparation.")
                  : text("No publications match this selection.", "Aucune publication ne correspond à cette sélection.")}
              </h3>
              {publications.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-6 border-b border-[#C8A96B]/60 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B]"
                >
                  {text("Clear Filters", "Effacer les filtres")}
                </button>
              )}
            </div>
          )}
      </div>
    </main>
  );
}
