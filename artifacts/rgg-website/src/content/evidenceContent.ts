export type ApprovalState = "approved" | "editorial-review" | "verification-required";

export type EvidenceRecord = {
  id: string;
  claim: string;
  owner: string;
  source: string;
  sourceUrl?: string;
  sourceDate: string;
  accessedDate: string;
  method: string;
  caveat: string;
  approvalState: ApprovalState;
};

export const BOOK_PUBLICATION = {
  status: "Forthcoming",
  statusDetail: "Pre-publication institutional review",
  plannedYear: "2026",
  edition: "First edition — not yet released",
  publicationDate: "Not assigned",
  isbn: "Not assigned",
  publisher: "Not yet announced",
  formats: "Proposed formats remain subject to editorial and operational approval",
  purchasing: "No purchase destination, price, or delivery service is currently available",
  lastReviewed: "12 September 2026",
} as const;

export const BOOK_PUBLICATION_FR = {
  status: "À paraître",
  statusDetail: "Examen institutionnel avant publication",
  plannedYear: "2026",
  edition: "Première édition — non encore publiée",
  publicationDate: "Non attribuée",
  isbn: "Non attribué",
  publisher: "Pas encore annoncé",
  formats: "Les formats proposés restent soumis à l'approbation éditoriale et opérationnelle",
  purchasing: "Aucune destination d'achat, prix ou service de livraison n'est actuellement disponible",
  lastReviewed: "12 septembre 2026",
} as const;

export const BOOK_PUBLICATION_COPY = {
  summary: `${BOOK_PUBLICATION.status} · Planned ${BOOK_PUBLICATION.plannedYear}`,
  heading: `${BOOK_PUBLICATION.status}; not yet available for purchase`,
  unresolvedFacts:
    "Publication date, publisher, ISBN, formats, and purchasing remain unfinalised.",
} as const;

export const BOOK_PUBLICATION_COPY_FR = {
  summary: `${BOOK_PUBLICATION_FR.status} · Prévu pour ${BOOK_PUBLICATION_FR.plannedYear}`,
  heading: `${BOOK_PUBLICATION_FR.status} ; pas encore disponible à l'achat`,
  unresolvedFacts:
    "La date de publication, l'éditeur, l'ISBN, les formats et l'achat restent à finaliser.",
} as const;

export const EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: "ECO-001",
    claim: "Global legal-market size and 2030 growth scenarios",
    owner: "Lead author — economics",
    source: "UNCTAD Commodities at a Glance: Special issue on industrial hemp; market-report synthesis pending primary-data reconciliation",
    sourceUrl: "https://unctad.org/publication/commodities-glance-special-issue-industrial-hemp",
    sourceDate: "2022",
    accessedDate: "12 September 2026",
    method: "Indicative synthesis across differently defined legal cannabis and hemp markets",
    caveat: "Definitions, currencies, coverage, and forecast assumptions are not yet harmonised.",
    approvalState: "editorial-review",
  },
  {
    id: "ECO-002",
    claim: "Worldwide past-year cannabis use",
    owner: "Lead author — public policy",
    source: "UNODC World Drug Report 2024",
    sourceUrl: "https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2024.html",
    sourceDate: "2024",
    accessedDate: "12 September 2026",
    method: "Rounded global estimate based on UNODC reporting; reference year varies by underlying national dataset",
    caveat: "The displayed rounded figure must be checked against the final cited table before release.",
    approvalState: "editorial-review",
  },
  {
    id: "ECO-003",
    claim: "Employment, regional sales, cross-border trade shares, segment values, and CBD pricing",
    owner: "Lead author — economics",
    source: "Author research synthesis; primary datasets and calculation workbook not yet approved",
    sourceDate: "2024",
    accessedDate: "12 September 2026",
    method: "Cross-market comparison using industry and national regulatory reporting",
    caveat: "Not comparable across jurisdictions without a documented scope, currency basis, and job-count methodology.",
    approvalState: "verification-required",
  },
  {
    id: "ECO-004",
    claim: "Value-chain shares, country production costs, export prices, and competitive-position table",
    owner: "Lead author — economics",
    source: "UNCTAD, national regulatory reporting, and author interviews; source workbook pending",
    sourceUrl: "https://unctad.org/topic/commodities",
    sourceDate: "2022–2024",
    accessedDate: "12 September 2026",
    method: "Indicative ranges compiled from heterogeneous public and author-supplied observations",
    caveat: "Ranges are not audited market quotations and vary by product, quality, certification, contract, and date.",
    approvalState: "verification-required",
  },
  {
    id: "POL-001",
    claim: "Governance guidance, institutional capability model, and reform pathways",
    owner: "Lead author — governance",
    source: "Author-developed analytical framework and comparative policy review",
    sourceDate: "2026 manuscript draft",
    accessedDate: "12 September 2026",
    method: "Normative synthesis of comparative governance experience; not a causal evaluation",
    caveat: "Application requires current local law, public-health evidence, institutional assessment, and stakeholder consultation.",
    approvalState: "editorial-review",
  },
  {
    id: "BIO-001",
    claim: "Dr Soobaschand (Sunil) Sweenarain biography and professional experience",
    owner: "Named author",
    source: "Author-supplied curriculum vitae and biography; documentary verification pending",
    sourceDate: "2026 submission",
    accessedDate: "12 September 2026",
    method: "Editorial comparison of public biography against supplied records",
    caveat: "Credentials and experience have not been independently verified for institutional publication.",
    approvalState: "verification-required",
  },
  {
    id: "BIO-002",
    claim: "Sunny Sweenarain biography and specialist description",
    owner: "Named author",
    source: "Author-supplied biography; documentary verification pending",
    sourceDate: "2026 submission",
    accessedDate: "12 September 2026",
    method: "Editorial comparison of public biography against supplied records",
    caveat: "Specialist description has not been independently verified for institutional publication.",
    approvalState: "verification-required",
  },
];

export const EVIDENCE_RECORDS_FR: EvidenceRecord[] = [
  {
    id: "ECO-001",
    claim: "Taille du marché légal mondial et scénarios de croissance à l'horizon 2030",
    owner: "Auteur principal — économie",
    source: "UNCTAD Produits de base en un coup d'œil : Numéro spécial sur le chanvre industriel ; synthèse des rapports de marché en attente de la réconciliation des données primaires",
    sourceUrl: "https://unctad.org/publication/commodities-glance-special-issue-industrial-hemp",
    sourceDate: "2022",
    accessedDate: "12 septembre 2026",
    method: "Synthèse indicative sur des marchés légaux du cannabis et du chanvre définis différemment",
    caveat: "Les définitions, devises, périmètres couverts et hypothèses de prévision ne sont pas encore harmonisés.",
    approvalState: "editorial-review",
  },
  {
    id: "ECO-002",
    claim: "Usage du cannabis dans le monde au cours de l'année écoulée",
    owner: "Auteur principal — politiques publiques",
    source: "UNODC Rapport mondial sur les drogues 2024",
    sourceUrl: "https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report-2024.html",
    sourceDate: "2024",
    accessedDate: "12 septembre 2026",
    method: "Estimation mondiale arrondie basée sur les rapports de l'UNODC ; l'année de référence varie selon l'ensemble de données national sous-jacent",
    caveat: "Le chiffre arrondi affiché doit être vérifié par rapport au tableau final cité avant publication.",
    approvalState: "editorial-review",
  },
  {
    id: "ECO-003",
    claim: "Emploi, ventes régionales, parts du commerce transfrontalier, valeurs des segments et tarification du CBD",
    owner: "Auteur principal — économie",
    source: "Synthèse de recherche de l'auteur ; ensembles de données primaires et classeur de calcul non encore approuvés",
    sourceDate: "2024",
    accessedDate: "12 septembre 2026",
    method: "Comparaison inter-marchés utilisant les rapports réglementaires nationaux et de l'industrie",
    caveat: "Ces données ne sont pas comparables entre juridictions sans périmètre documenté, base monétaire commune et méthodologie de décompte des emplois.",
    approvalState: "verification-required",
  },
  {
    id: "ECO-004",
    claim: "Parts de la chaîne de valeur, coûts de production par pays, prix d'exportation et tableau de position concurrentielle",
    owner: "Auteur principal — économie",
    source: "UNCTAD, rapports réglementaires nationaux et entretiens de l'auteur ; classeur source en attente",
    sourceUrl: "https://unctad.org/topic/commodities",
    sourceDate: "2022–2024",
    accessedDate: "12 septembre 2026",
    method: "Fourchettes indicatives compilées à partir d'observations publiques hétérogènes et d'observations fournies par l'auteur",
    caveat: "Les plages ne sont pas des cotations de marché auditées et varient selon le produit, la qualité, la certification, le contrat et la date.",
    approvalState: "verification-required",
  },
  {
    id: "POL-001",
    claim: "Orientations en matière de gouvernance, modèle des capacités institutionnelles et voies de réforme",
    owner: "Auteur principal — gouvernance",
    source: "Cadre analytique développé par l'auteur et examen comparatif des politiques publiques",
    sourceDate: "Brouillon du manuscrit de 2026",
    accessedDate: "12 septembre 2026",
    method: "Synthèse normative d'expériences comparées de gouvernance ; il ne s'agit pas d'une évaluation causale",
    caveat: "L'application nécessite la législation locale en vigueur, les données probantes en matière de santé publique, l'évaluation institutionnelle et la consultation des parties prenantes.",
    approvalState: "editorial-review",
  },
  {
    id: "BIO-001",
    claim: "Biographie et expérience professionnelle du Dr Soobaschand (Sunil) Sweenarain",
    owner: "Auteur nommé",
    source: "Curriculum vitae et biographie fournis par l'auteur ; vérification documentaire en attente",
    sourceDate: "Soumission de 2026",
    accessedDate: "12 septembre 2026",
    method: "Comparaison éditoriale de la biographie publique avec les dossiers fournis",
    caveat: "Les qualifications et l'expérience n'ont pas été vérifiées indépendamment en vue d'une publication institutionnelle.",
    approvalState: "verification-required",
  },
  {
    id: "BIO-002",
    claim: "Biographie et profil de spécialiste de Sunny Sweenarain",
    owner: "Auteur nommé",
    source: "Biographie fournie par l'auteur ; vérification documentaire en attente",
    sourceDate: "Soumission de 2026",
    accessedDate: "12 septembre 2026",
    method: "Comparaison éditoriale de la biographie publique avec les dossiers fournis",
    caveat: "Le profil de spécialiste n'a pas été vérifié indépendamment en vue d'une publication institutionnelle.",
    approvalState: "verification-required",
  },
];

export function getEvidenceRecord(id: string) {
  const record = EVIDENCE_RECORDS.find((entry) => entry.id === id);
  if (!record) throw new Error(`Unknown evidence record: ${id}`);
  return record;
}

export function getEvidenceRecordFr(id: string) {
  const record = EVIDENCE_RECORDS_FR.find((entry) => entry.id === id);
  if (!record) throw new Error(`Unknown evidence record: ${id}`);
  return record;
}