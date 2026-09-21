import type {
  PublicationTypeOption,
  ResearchPublication,
} from "@/types/research";

export const PUBLICATION_TYPE_OPTIONS: PublicationTypeOption[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "research-paper",
    label: "Research Papers",
  },
  {
    value: "policy-brief",
    label: "Policy Briefs",
  },
  {
    value: "article",
    label: "Articles",
  },
  {
    value: "commentary",
    label: "Commentary",
  },
  {
    value: "report",
    label: "Reports",
  },
  {
    value: "case-study",
    label: "Case Studies",
  },
];

export function getTranslatedPublicationTypeOptions(text: (en: string, fr: string) => string): PublicationTypeOption[] {
  return [
    { value: "all", label: text("All", "Tous") },
    { value: "research-paper", label: text("Research Papers", "Articles de recherche") },
    { value: "policy-brief", label: text("Policy Briefs", "Notes d'orientation") },
    { value: "article", label: text("Articles", "Articles") },
    { value: "commentary", label: text("Commentary", "Commentaires") },
    { value: "report", label: text("Reports", "Rapports") },
    { value: "case-study", label: text("Case Studies", "Études de cas") },
  ];
}

/**
 * Code Pack 6 intentionally starts with no invented publications.
 *
 * Pack 7 will replace this static source with database/API data.
 *
 * Add only genuine RGG publications here before Pack 7 if their
 * title, authorship, date, abstract and source are verified.
 */
export const RESEARCH_PUBLICATIONS: ResearchPublication[] = [];
