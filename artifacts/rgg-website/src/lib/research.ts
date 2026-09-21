import type {
  PublicationType,
  ResearchPublication,
} from "@/types/research";

const PUBLICATION_LABELS: Record<PublicationType, string> = {
  "research-paper": "Research Paper",
  "policy-brief": "Policy Brief",
  article: "Article",
  commentary: "Commentary",
  report: "Report",
  "case-study": "Case Study",
};

const PUBLICATION_LABELS_FR: Record<PublicationType, string> = {
  "research-paper": "Article de recherche",
  "policy-brief": "Note d'orientation",
  article: "Article",
  commentary: "Commentaire",
  report: "Rapport",
  "case-study": "Étude de cas",
};

export function getPublicationTypeLabel(
  type: PublicationType,
  text?: (en: string, fr: string) => string
) {
  const en = PUBLICATION_LABELS[type];
  if (!text) return en;
  return text(en, PUBLICATION_LABELS_FR[type] || en);
}

export function formatPublicationDate(value: string, language: string = "en") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function sortPublicationsNewestFirst(
  publications: ResearchPublication[],
) {
  return [...publications].sort((a, b) => {
    return (
      new Date(b.publicationDate).getTime() -
      new Date(a.publicationDate).getTime()
    );
  });
}
