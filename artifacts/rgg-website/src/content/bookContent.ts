export interface BookChapter {
  number?: string;
  title: string;
  description?: string;
}

export interface BookPart {
  number?: string;
  title: string;
  subtitle?: string;
  description?: string;
  chapters: BookChapter[];
}

export interface WhyItMattersItem {
  number?: string;
  title: string;
  description: string;
}

export interface BookEdition {
  name: string;
  format?: string;
  price?: string;
  description?: string;
  href?: string;
  external?: boolean;
}

export interface BookAudience {
  number?: string;
  title: string;
  description: string;
}

export interface PracticalToolkitItem {
  number: string;
  title: string;
  description: string;
  details: string[];
  statistic?: string;
  statisticLabel?: string;
}

export interface CorePrinciple {
  title: string;
  description: string;
}

export interface GovernanceLayer {
  number: string;
  title: string;
  description: string;
}

export const CORE_PRINCIPLES: CorePrinciple[] = [
  {
    title: "Differentiation",
    description: "Policy models must be adapted to national history, economic structure, institutional capacity and social context."
  },
  {
    title: "Institutional Readiness",
    description: "Reform ambition must match the ability to license, regulate, monitor, coordinate and enforce."
  },
  {
    title: "Adaptive Governance",
    description: "Effective systems learn from evidence, adjust over time and remain credible under uncertainty."
  }
];

export const GOVERNANCE_LAYERS: GovernanceLayer[] = [
  { number: "1", title: "Evidence Credibility", description: "Data, science and public communication." },
  { number: "2", title: "Public Health", description: "Therapeutic access, safeguards and prevention." },
  { number: "3", title: "Value Capture", description: "Processing, standards and upgrading." },
  { number: "4", title: "Justice Repair", description: "Recognition, inclusion and community reinvestment." },
  { number: "5", title: "Inclusive Finance", description: "Participation by SMEs, cooperatives and smallholders." },
  { number: "6", title: "Digital Trust", description: "Traceability, data governance and regulatory confidence." },
  { number: "7", title: "Legitimacy", description: "Learning, adaptation and public trust." }
];

export const BOOK_PARTS: BookPart[] = [
  {
    number: "I",
    title: "Cannabis at the Crossroads",
    subtitle: "History, Culture & Legitimacy",
    description: "Explores cannabis as a historical, cultural and political issue, moving from prohibition towards governance and examining legitimacy, knowledge systems and trust.",
    chapters: [{ title: "Ch. 1–5" }],
  },
  {
    number: "II",
    title: "Science, Health & Risk Governance",
    subtitle: "From Prohibition to Evidence-Based Policy",
    description: "The endocannabinoid system repositions cannabis within human biology. Therapeutic potential for chronic pain, epilepsy, and chemotherapy-induced nausea examined with clear-eyed rigour.",
    chapters: [{ title: "Ch. 6–8" }],
  },
  {
    number: "III",
    title: "Sustainable Cannabis Economy",
    subtitle: "Value Chains & Structural Risks",
    description: 'Cultivation accounts for only 10–20% of final product value. The remaining 80–90% is in processing, extraction, formulation, branding. Producer countries risk the "raw material trap." This outcome is not inevitable. It is a governance choice.',
    chapters: [{ title: "Ch. 9–11" }],
  },
  {
    number: "IV",
    title: "Governance & Development Pathways",
    subtitle: "Regulatory design, justice repair, institutions & finance",
    description: "Eight country archetypes: Canada, Uruguay, Germany, Jamaica, Lesotho, Morocco, Colombia, South Africa. Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation.",
    chapters: [{ title: "Ch. 12–17" }],
  },
  {
    number: "V",
    title: "System Design & Futures",
    subtitle: "Implementation, digital sovereignty & adaptive learning",
    description: "For developing countries: the imperative to avoid foreign-hosted traceability platforms that harvest commercial intelligence. Regional cooperation as collective digital statecraft.",
    chapters: [{ title: "Ch. 18–20" }],
  }
];

export const WHY_MATTERS: WhyItMattersItem[] = [
  {
    number: "01",
    title: "Governance",
    description: "Durable reform depends on coherent governance architectures that align regulatory design, institutional capacity, inclusive participation, and sustainable finance. Weakness in any dimension can destabilise the entire transition.",
  },
  {
    number: "02",
    title: "Justice",
    description: "Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation in governing the systems now built in their name. Reforms that fail here reproduce the asymmetries they claim to leave behind.",
  },
  {
    number: "03",
    title: "Sustainable Development",
    description: "Industrial hemp aligns with sustainable production, climate resilience, and circular economy strategies. Cannabis offers developing countries economic pathways unimaginable a decade ago.",
  },
  {
    number: "04",
    title: "Economic Transformation",
    description: "Countries that do not invest now in governance capacities risk being confined to supplying raw biomass while value is captured elsewhere. This outcome is not inevitable — it is a governance choice.",
  },
  {
    number: "05",
    title: "Adaptive Governance",
    description: "Policy must be treated as testable hypotheses — monitored, evaluated, and refined over time. The ones succeeding are those building systems capable of honest self-assessment and continuous adaptation.",
  },
];

export const BOOK_EDITIONS: BookEdition[] = [
  {
    name: "Hardcover",
    format: "Collector",
    description: "The collector's institutional edition.",
    price: "Price TBC",
  },
  {
    name: "Paperback",
    format: "Standard",
    description: "The accessible strategic edition.",
    price: "Price TBC",
  },
  {
    name: "Kindle / eBook",
    format: "Digital",
    description: "The portable global handbook.",
    price: "Price TBC",
  },
  {
    name: "Licensed PDF",
    format: "Executive",
    description: "Executive format for professional use.",
    price: "Price TBC",
  },
];

export const BOOK_AUDIENCES: BookAudience[] = [
  {
    number: "01",
    title: "Governments & Regulators",
    description: "National ministries, health authorities, and regulatory agencies designing or reforming cannabis frameworks.",
  },
  {
    number: "02",
    title: "Regional Economic Communities",
    description: "AU, CARICOM, ASEAN, MERCOSUR, and Commonwealth bodies building harmonised regional approaches.",
  },
  {
    number: "03",
    title: "Development Partners",
    description: "International organisations, donors, and agencies supporting evidence-based governance transitions.",
  },
  {
    number: "04",
    title: "Research Institutions",
    description: "Universities, think tanks, and policy institutes conducting comparative and applied governance research.",
  },
  {
    number: "05",
    title: "Civil Society & Advocates",
    description: "Organisations ensuring that reform serves equity, justice, and community benefit at every level.",
  },
  {
    number: "06",
    title: "Investors & Industry",
    description: "Businesses and investors requiring credible regulatory intelligence to operate responsibly across jurisdictions.",
  },
];

export const PRACTICAL_TOOLKIT: PracticalToolkitItem[] = [
  {
    number: "Annex 1",
    title: "Global Cannabis Economy Snapshot",
    description: "Key facts, market signals, value-chain dynamics and visual summaries of the global cannabis economy.",
    details: [
      "This annex maps the global cannabis economy from cultivation and processing through research, medicine, manufacturing, trade and retail. It highlights the signals that help readers distinguish durable market development from short-term speculation.",
      "Visual summaries connect market growth with regulation, investment, public health and participation in the value chain, helping decision-makers identify where national capabilities and economic opportunities align.",
    ],
  },
  {
    number: "Annex 2",
    title: "Comparative Governance Models",
    description: "A comparative view of how countries design and operate cannabis regulatory systems.",
    details: [
      "This annex compares governance choices across medical, industrial, adult-use and mixed regulatory systems. It examines how mandates are divided among ministries, regulators, licensing authorities and enforcement bodies.",
      "The comparison focuses on practical design questions: institutional coordination, licensing, product standards, market access, monitoring, equity and the ability to adapt regulation as evidence develops.",
    ],
  },
  {
    number: "Annex 3",
    title: "National Readiness Toolkit",
    description: "A guided self-assessment framework to diagnose institutional strengths, gaps and reform priorities.",
    details: [
      "This annex guides countries through a structured assessment of legal foundations, institutional capacity, public-health safeguards, enforcement readiness, data systems and economic participation.",
      "The resulting readiness profile helps leaders sequence reforms, identify capacity gaps and set realistic priorities before committing to a regulatory model or implementation timetable.",
    ],
  }
];

export const BOOK_META = {
  title: "Reclaiming the Green Gold",
  subtitle: "Cannabis at the Crossroads of Health, Justice and Sustainable Development",
  year: "2026",
};

import { useLanguage } from "@/i18n/LanguageContext";

export function useBookContent() {
  const { text } = useLanguage();

  const TRANSLATED_CORE_PRINCIPLES: CorePrinciple[] = [
    {
      title: text("Differentiation", "Différenciation"),
      description: text("Policy models must be adapted to national history, economic structure, institutional capacity and social context.", "Les modèles d'action publique doivent être adaptés à l'histoire nationale, à la structure économique, à la capacité institutionnelle et au contexte social.")
    },
    {
      title: text("Institutional Readiness", "Préparation institutionnelle"),
      description: text("Reform ambition must match the ability to license, regulate, monitor, coordinate and enforce.", "L'ambition de la réforme doit correspondre à la capacité d'octroyer des autorisations, de réglementer, de surveiller, de coordonner et de faire respecter la réglementation.")
    },
    {
      title: text("Adaptive Governance", "Gouvernance adaptative"),
      description: text("Effective systems learn from evidence, adjust over time and remain credible under uncertainty.", "Les systèmes efficaces tirent les enseignements des données probantes, s'ajustent au fil du temps et restent crédibles dans un contexte d'incertitude.")
    }
  ];

  const TRANSLATED_GOVERNANCE_LAYERS: GovernanceLayer[] = [
    { number: "1", title: text("Evidence Credibility", "Crédibilité des données probantes"), description: text("Data, science and public communication.", "Données, science et communication publique.") },
    { number: "2", title: text("Public Health", "Santé publique"), description: text("Therapeutic access, safeguards and prevention.", "Accès aux traitements, garanties et prévention.") },
    { number: "3", title: text("Value Capture", "Capture de valeur"), description: text("Processing, standards and upgrading.", "Transformation, normes et valorisation.") },
    { number: "4", title: text("Justice Repair", "Réparation des préjudices"), description: text("Recognition, inclusion and community reinvestment.", "Reconnaissance, inclusion et réinvestissement communautaire.") },
    { number: "5", title: text("Inclusive Finance", "Finance inclusive"), description: text("Participation by SMEs, cooperatives and smallholders.", "Participation des PME, coopératives et petits exploitants.") },
    { number: "6", title: text("Digital Trust", "Confiance numérique"), description: text("Traceability, data governance and regulatory confidence.", "Traçabilité, gouvernance des données et confiance réglementaire.") },
    { number: "7", title: text("Legitimacy", "Légitimité"), description: text("Learning, adaptation and public trust.", "Apprentissage, adaptation et confiance du public.") }
  ];

  const TRANSLATED_BOOK_PARTS: BookPart[] = [
    {
      number: "I",
      title: text("Cannabis at the Crossroads", "Le cannabis à la croisée des chemins"),
      subtitle: text("History, Culture & Legitimacy", "Histoire, culture et légitimité"),
      description: text("Explores cannabis as a historical, cultural and political issue, moving from prohibition towards governance and examining legitimacy, knowledge systems and trust.", "Explore le cannabis en tant qu'enjeu historique, culturel et politique, passant de la prohibition à la gouvernance et examinant la légitimité, les systèmes de connaissances et la confiance."),
      chapters: [{ title: text("Ch. 1–5", "Chap. 1–5") }],
    },
    {
      number: "II",
      title: text("Science, Health & Risk Governance", "Science, santé et gouvernance des risques"),
      subtitle: text("From Prohibition to Evidence-Based Policy", "De la prohibition à une politique fondée sur des preuves"),
      description: text("The endocannabinoid system repositions cannabis within human biology. Therapeutic potential for chronic pain, epilepsy, and chemotherapy-induced nausea examined with clear-eyed rigour.", "Le système endocannabinoïde replace le cannabis dans le cadre de la biologie humaine. Le potentiel thérapeutique pour la douleur chronique, l'épilepsie et les nausées induites par la chimiothérapie est examiné avec une rigueur lucide."),
      chapters: [{ title: text("Ch. 6–8", "Chap. 6–8") }],
    },
    {
      number: "III",
      title: text("Sustainable Cannabis Economy", "Économie durable du cannabis"),
      subtitle: text("Value Chains & Structural Risks", "Chaînes de valeur et risques structurels"),
      description: text('Cultivation accounts for only 10–20% of final product value. The remaining 80–90% is in processing, extraction, formulation, branding. Producer countries risk the "raw material trap." This outcome is not inevitable. It is a governance choice.', 'La culture ne représente que 10 à 20 % de la valeur du produit final. Les 80 à 90 % restants se trouvent dans la transformation, l\'extraction, la formulation et la valorisation de la marque. Les pays producteurs risquent le « piège de la matière première ». Ce résultat n\'est pas inévitable. C\'est un choix de gouvernance.'),
      chapters: [{ title: text("Ch. 9–11", "Chap. 9–11") }],
    },
    {
      number: "IV",
      title: text("Governance & Development Pathways", "Gouvernance et trajectoires de développement"),
      subtitle: text("Regulatory design, justice repair, institutions & finance", "Conception réglementaire, réparation de la justice, institutions et finance"),
      description: text("Eight country archetypes: Canada, Uruguay, Germany, Jamaica, Lesotho, Morocco, Colombia, South Africa. Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation.", "Huit archétypes de pays : Canada, Uruguay, Allemagne, Jamaïque, Lesotho, Maroc, Colombie, Afrique du Sud. Les communautés qui ont supporté les coûts les plus lourds de la prohibition ont droit à la reconnaissance, à la réparation et à une véritable participation."),
      chapters: [{ title: text("Ch. 12–17", "Chap. 12–17") }],
    },
    {
      number: "V",
      title: text("System Design & Futures", "Conception de systèmes et avenirs"),
      subtitle: text("Implementation, digital sovereignty & adaptive learning", "Mise en œuvre, souveraineté numérique et apprentissage adaptatif"),
      description: text("For developing countries: the imperative to avoid foreign-hosted traceability platforms that harvest commercial intelligence. Regional cooperation as collective digital statecraft.", "Pour les pays en développement : l'impératif d'éviter les plateformes de traçabilité hébergées à l'étranger qui exploitent des données commerciales. La coopération régionale comme instrument collectif de souveraineté numérique."),
      chapters: [{ title: text("Ch. 18–20", "Chap. 18–20") }],
    }
  ];

  const TRANSLATED_WHY_MATTERS: WhyItMattersItem[] = [
    {
      number: "01",
      title: text("Governance", "Gouvernance"),
      description: text("Durable reform depends on coherent governance architectures that align regulatory design, institutional capacity, inclusive participation, and sustainable finance. Weakness in any dimension can destabilise the entire transition.", "Une réforme durable dépend d'architectures de gouvernance cohérentes qui mettent en cohérence la conception réglementaire, la capacité institutionnelle, la participation inclusive et le financement durable. Une faiblesse dans n'importe quelle dimension peut déstabiliser l'ensemble de la transition."),
    },
    {
      number: "02",
      title: text("Justice", "Justice"),
      description: text("Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation in governing the systems now built in their name. Reforms that fail here reproduce the asymmetries they claim to leave behind.", "Les communautés qui ont supporté les coûts les plus lourds de la prohibition ont droit à la reconnaissance, à la réparation et à une véritable participation à la gouvernance des systèmes désormais construits en leur nom. Les réformes qui échouent ici reproduisent les asymétries qu'elles prétendent laisser derrière elles."),
    },
    {
      number: "03",
      title: text("Sustainable Development", "Développement durable"),
      description: text("Industrial hemp aligns with sustainable production, climate resilience, and circular economy strategies. Cannabis offers developing countries economic pathways unimaginable a decade ago.", "Le chanvre industriel s'aligne sur les stratégies de production durable, de résilience climatique et d'économie circulaire. Le cannabis offre aux pays en développement des voies économiques inimaginables il y a dix ans."),
    },
    {
      number: "04",
      title: text("Economic Transformation", "Transformation économique"),
      description: text("Countries that do not invest now in governance capacities risk being confined to supplying raw biomass while value is captured elsewhere. This outcome is not inevitable — it is a governance choice.", "Les pays qui n'investissent pas maintenant dans les capacités de gouvernance risquent d'être confinés à fournir de la biomasse brute tandis que la valeur est capturée ailleurs. Ce résultat n'est pas inévitable — c'est un choix de gouvernance."),
    },
    {
      number: "05",
      title: text("Adaptive Governance", "Gouvernance adaptative"),
      description: text("Policy must be treated as testable hypotheses — monitored, evaluated, and refined over time. The ones succeeding are those building systems capable of honest self-assessment and continuous adaptation.", "Les politiques doivent être traitées comme des hypothèses testables — suivies, évaluées et affinées au fil du temps. Celles qui réussissent sont celles qui construisent des systèmes capables d'une auto-évaluation honnête et d'une adaptation continue."),
    },
  ];

  const TRANSLATED_BOOK_EDITIONS: BookEdition[] = [
    {
      name: text("Hardcover", "Relié"),
      format: text("Collector", "Collection"),
      description: text("The collector's institutional edition.", "L'édition institutionnelle de collection."),
      price: text("Price TBC", "Prix à confirmer"),
    },
    {
      name: text("Paperback", "Broché"),
      format: text("Standard", "Standard"),
      description: text("The accessible strategic edition.", "L'édition stratégique accessible."),
      price: text("Price TBC", "Prix à confirmer"),
    },
    {
      name: text("Kindle / eBook", "Kindle / eBook"),
      format: text("Digital", "Numérique"),
      description: text("The portable global handbook.", "Le manuel de portée mondiale, utilisable partout."),
      price: text("Price TBC", "Prix à confirmer"),
    },
    {
      name: text("Licensed PDF", "PDF sous licence"),
      format: text("Executive", "Pour cadres dirigeants"),
      description: text("Executive format for professional use.", "Format exécutif pour un usage professionnel."),
      price: text("Price TBC", "Prix à confirmer"),
    },
  ];

  const TRANSLATED_BOOK_AUDIENCES: BookAudience[] = [
    {
      number: "01",
      title: text("Governments & Regulators", "Gouvernements et régulateurs"),
      description: text("National ministries, health authorities, and regulatory agencies designing or reforming cannabis frameworks.", "Ministères nationaux, autorités sanitaires et agences de régulation concevant ou réformant les cadres du cannabis."),
    },
    {
      number: "02",
      title: text("Regional Economic Communities", "Communautés économiques régionales"),
      description: text("AU, CARICOM, ASEAN, MERCOSUR, and Commonwealth bodies building harmonised regional approaches.", "Organismes de l'UA, de la CARICOM, de l'ASEAN, du MERCOSUR et du Commonwealth qui élaborent des approches régionales harmonisées."),
    },
    {
      number: "03",
      title: text("Development Partners", "Partenaires de développement"),
      description: text("International organisations, donors, and agencies supporting evidence-based governance transitions.", "Organisations internationales, bailleurs de fonds et agences soutenant les transitions de gouvernance fondées sur des données probantes."),
    },
    {
      number: "04",
      title: text("Research Institutions", "Institutions de recherche"),
      description: text("Universities, think tanks, and policy institutes conducting comparative and applied governance research.", "Universités, groupes de réflexion et instituts d'analyse des politiques publiques menant des recherches comparatives et appliquées sur la gouvernance."),
    },
    {
      number: "05",
      title: text("Civil Society & Advocates", "Société civile et défenseurs"),
      description: text("Organisations ensuring that reform serves equity, justice, and community benefit at every level.", "Organisations veillant à ce que la réforme serve l'équité, la justice et l'intérêt des communautés à tous les niveaux."),
    },
    {
      number: "06",
      title: text("Investors & Industry", "Investisseurs et industrie"),
      description: text("Businesses and investors requiring credible regulatory intelligence to operate responsibly across jurisdictions.", "Entreprises et investisseurs ayant besoin d'informations réglementaires crédibles pour exercer leurs activités de manière responsable dans différents cadres juridictionnels."),
    },
  ];

  const TRANSLATED_PRACTICAL_TOOLKIT: PracticalToolkitItem[] = [
    {
      number: text("Annex 1", "Annexe 1"),
      title: text("Global Cannabis Economy Snapshot", "Aperçu de l'économie mondiale du cannabis"),
      description: text("Key facts, market signals, value-chain dynamics and visual summaries of the global cannabis economy.", "Faits clés, signaux du marché, dynamique de la chaîne de valeur et résumés visuels de l'économie mondiale du cannabis."),
      details: [
        text(
          "This annex maps the global cannabis economy from cultivation and processing through research, medicine, manufacturing, trade and retail. It highlights the signals that help readers distinguish durable market development from short-term speculation.",
          "Cette annexe cartographie l'économie mondiale du cannabis, de la culture et de la transformation à la recherche, à la médecine, à la fabrication, au commerce et à la vente au détail. Elle met en évidence les signaux qui permettent de distinguer un développement durable du marché d'une spéculation à court terme."
        ),
        text(
          "Visual summaries connect market growth with regulation, investment, public health and participation in the value chain, helping decision-makers identify where national capabilities and economic opportunities align.",
          "Des synthèses visuelles relient la croissance du marché à la réglementation, à l'investissement, à la santé publique et à la participation à la chaîne de valeur, afin d'aider les décideurs à identifier les points de convergence entre capacités nationales et possibilités économiques."
        ),
      ],
    },
    {
      number: text("Annex 2", "Annexe 2"),
      title: text("Comparative Governance Models", "Modèles de gouvernance comparatifs"),
      description: text("A comparative view of how countries design and operate cannabis regulatory systems.", "Un aperçu comparatif de la manière dont les pays conçoivent et mettent en œuvre leurs systèmes de réglementation du cannabis."),
      details: [
        text(
          "This annex compares governance choices across medical, industrial, adult-use and mixed regulatory systems. It examines how mandates are divided among ministries, regulators, licensing authorities and enforcement bodies.",
          "Cette annexe compare les choix de gouvernance dans les systèmes médicaux, industriels, à usage adulte et mixtes. Elle examine la répartition des responsabilités entre ministères, régulateurs, autorités chargées des licences et organismes d'application."
        ),
        text(
          "The comparison focuses on practical design questions: institutional coordination, licensing, product standards, market access, monitoring, equity and the ability to adapt regulation as evidence develops.",
          "La comparaison porte sur des questions concrètes de conception : coordination institutionnelle, octroi de licences, normes de produits, accès au marché, suivi, équité et capacité à adapter la réglementation à l'évolution des données probantes."
        ),
      ],
    },
    {
      number: text("Annex 3", "Annexe 3"),
      title: text("National Readiness Toolkit", "Outil de préparation nationale"),
      description: text("A guided self-assessment framework to diagnose institutional strengths, gaps and reform priorities.", "Un cadre d'auto-évaluation guidé pour diagnostiquer les forces institutionnelles, les lacunes et les priorités de réforme."),
      details: [
        text(
          "This annex guides countries through a structured assessment of legal foundations, institutional capacity, public-health safeguards, enforcement readiness, data systems and economic participation.",
          "Cette annexe guide les pays dans une évaluation structurée des fondements juridiques, de la capacité institutionnelle, des garanties de santé publique, de la préparation à l'application, des systèmes de données et de la participation économique."
        ),
        text(
          "The resulting readiness profile helps leaders sequence reforms, identify capacity gaps and set realistic priorities before committing to a regulatory model or implementation timetable.",
          "Le profil de préparation qui en résulte aide les responsables à ordonner les réformes, à identifier les lacunes de capacité et à fixer des priorités réalistes avant d'adopter un modèle réglementaire ou un calendrier de mise en œuvre."
        ),
      ],
    }
  ];

  const TRANSLATED_BOOK_META = {
    title: text("Reclaiming the Green Gold", "Reconquérir l'or vert"),
    subtitle: text("Cannabis at the Crossroads of Health, Justice and Sustainable Development", "Le cannabis à la croisée de la santé, de la justice et du développement durable"),
    year: "2026",
  };

  return {
    CORE_PRINCIPLES: TRANSLATED_CORE_PRINCIPLES,
    GOVERNANCE_LAYERS: TRANSLATED_GOVERNANCE_LAYERS,
    BOOK_PARTS: TRANSLATED_BOOK_PARTS,
    WHY_MATTERS: TRANSLATED_WHY_MATTERS,
    BOOK_EDITIONS: TRANSLATED_BOOK_EDITIONS,
    BOOK_AUDIENCES: TRANSLATED_BOOK_AUDIENCES,
    PRACTICAL_TOOLKIT: TRANSLATED_PRACTICAL_TOOLKIT,
    BOOK_META: TRANSLATED_BOOK_META,
  };
}
