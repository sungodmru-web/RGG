import {
  BOOK_PUBLICATION as BOOK_PUBLICATION_EN,
  BOOK_PUBLICATION_COPY as BOOK_PUBLICATION_COPY_EN,
  BOOK_PUBLICATION_FR,
  BOOK_PUBLICATION_COPY_FR,
} from "@/content/evidenceContent";
import { useLanguage } from "@/i18n/LanguageContext";

export function PublicationStatus({ compact = false }: { compact?: boolean }) {
  const { language, text } = useLanguage();

  const BOOK_PUBLICATION = language === "fr" ? BOOK_PUBLICATION_FR : BOOK_PUBLICATION_EN;
  const BOOK_PUBLICATION_COPY = language === "fr" ? BOOK_PUBLICATION_COPY_FR : BOOK_PUBLICATION_COPY_EN;

  if (compact) {
    return (
      <div className="border-l-2 border-[#C8A96B] bg-[#07100A] px-5 py-4 text-xs leading-6 text-[#8B978F]">
        <strong className="text-[#EDD99A]">{BOOK_PUBLICATION.status}</strong>
        {" · "}
        {BOOK_PUBLICATION.statusDetail}. {text("Planned year", "Année prévue :")} {BOOK_PUBLICATION.plannedYear};
        {" "}{BOOK_PUBLICATION_COPY.unresolvedFacts} {text("Last reviewed", "Dernière révision")} {BOOK_PUBLICATION.lastReviewed}.
      </div>
    );
  }

  const facts = [
    [text("Status", "Statut"), `${BOOK_PUBLICATION.status} — ${BOOK_PUBLICATION.statusDetail}`],
    [text("Edition", "Édition"), BOOK_PUBLICATION.edition],
    [text("Publication date", "Date de publication"), BOOK_PUBLICATION.publicationDate],
    [text("Publisher / imprint", "Éditeur / maison d'édition"), BOOK_PUBLICATION.publisher],
    [text("ISBN", "ISBN"), BOOK_PUBLICATION.isbn],
    [text("Formats", "Formats"), BOOK_PUBLICATION.formats],
  ];

  return (
    <section aria-labelledby="publication-status-heading" className="border-b border-[#1A2E20] bg-[#080D09]">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
          {text("Publication record", "Dossier de publication")}
        </p>
        <h2 id="publication-status-heading" className="font-serif text-3xl text-[#F4F1EA]">
          {BOOK_PUBLICATION_COPY.heading}
        </h2>
        <dl className="mt-8 grid gap-px bg-[#1A2E20] sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([term, detail]) => (
            <div key={term} className="bg-[#07100A] p-5">
              <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078]">{term}</dt>
              <dd className="mt-2 text-sm leading-6 text-[#C8C5B3]">{detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs leading-6 text-[#718078]">
          {BOOK_PUBLICATION.purchasing}. {text("Record last reviewed", "Dossier révisé le")} {BOOK_PUBLICATION.lastReviewed}.
        </p>
      </div>
    </section>
  );
}