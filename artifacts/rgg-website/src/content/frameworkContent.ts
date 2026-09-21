export interface FrameworkArgumentCard {
  label: string;
  text: string;
}

export interface GovernanceLayer {
  number: string;
  title: string;
  shortTitle?: string;
  description: string;
  detail?: string;
  outcome?: string;
}

export interface FrameworkInstrument {
  title: string;
  description: string;
  linkText: string;
  href: string;
}

export const FRAMEWORK_ARGUMENT = {
  eyebrow: "The Argument",
  title: "A Global Governance Transition",
  lead:
    "Cannabis reform is not a binary legal choice between prohibition and legalisation — it is a governance transition.",
  description:
    "Outcomes depend less on legal status than on the quality of institutions, coherence of policies, and adaptive learning capacity states bring to implementation.",
};

export const FRAMEWORK_ARGUMENT_CARDS: FrameworkArgumentCard[] = [
  {
    label: "The Governance Gap",
    text:
      "Countries are legalising faster than they are governing. Licences are issued before laboratories exist. Export frameworks are announced before certification systems are built.",
  },
  {
    label: "The Stakes for Developing Nations",
    text:
      "For LMICs and Small Island Developing States, the stakes are especially high. The window for deliberate appropriation is open — but it will not remain so indefinitely.",
  },
  {
    label: "The Defining Challenge",
    text:
      "The gap between legislative ambition and institutional reality is not a minor detail — it is the defining challenge of this transition. Markets are consolidating. Standards are being set.",
  },
];

export const GOVERNANCE_LAYERS: GovernanceLayer[] = [
  {
    number: "01",
    title: "Evidence Credibility",
    description:
      "Capacity to generate, interpret, and apply scientific and administrative data to inform policy. Without credible evidence, policy becomes vulnerable to ideology and misinformation.",
  },
  {
    number: "02",
    title: "Differentiated Public Health",
    description:
      "Ability to balance therapeutic access with proportionate safeguards and harm reduction calibrated to the actual distribution of risk across populations and products.",
  },
  {
    number: "03",
    title: "Value Capture",
    description:
      "Institutional capacity to retain economic benefits domestically through processing, standards, and value-chain upgrading. Without deliberate investment, producer countries risk the \"raw material trap.\"",
  },
  {
    number: "04",
    title: "Justice Repair",
    description:
      "Mechanisms for addressing historical harms: expungement, community reinvestment, and inclusive pathways for legacy actors. Justice repair transforms reform into a visible social settlement.",
  },
  {
    number: "05",
    title: "Inclusive Finance",
    description:
      "Financial systems enabling participation by smallholders, cooperatives, women, and SMEs rather than concentrating capital among well-resourced firms.",
  },
  {
    number: "06",
    title: "Digital Trust",
    description:
      "Traceability, data governance, and cybersecurity systems that build regulatory credibility without sacrificing sovereignty. The informational backbone of modern cannabis governance.",
  },
  {
    number: "07",
    title: "Adaptive Institutional Legitimacy",
    description:
      "Capacity to learn, recalibrate, and maintain public trust as conditions evolve. Ensures governance remains responsive to emerging evidence rather than ossifying over time.",
  },
];

export const FRAMEWORK_META = {
  eyebrow: "The Model",
  title: "RGG Governance Transition Model",
  subtitle:
    "A seven-layer framework for moving from legal reform toward durable governance.",
  description:
    "Weakness in any single layer can generate cascading effects that destabilise the entire transition. The model functions as both an assessment tool and a guide for sequencing governance investments.",
  coreArgument:
    "Cannabis is a governance issue, not a legal one.",
};

export const FRAMEWORK_INSTRUMENTS: FrameworkInstrument[] = [
  {
    title: "Cannabis Governance Transition Model",
    description: "A seven-layer diagnostic framework identifying the interconnected governance layers through which reform either consolidates into durable public value or unravels into institutional fatigue, market concentration, and legitimacy loss.",
    linkText: "Explore the model",
    href: "#layers"
  },
  {
    title: "National Cannabis Economy Self-Assessment Framework",
    description: "A guided diagnostic toolkit across 13 readiness dimensions in three clusters, enabling governments to assess institutional strengths, identify critical gaps, and sequence reforms realistically.",
    linkText: "Explore the toolkit",
    href: "#self-assessment"
  },
  {
    title: "Snapshot of the Global Cannabis Economy",
    description: "Key facts, figures, and market signals on demand, production, value chains, financial contribution, and growth potential — translating complex economic dynamics into accessible visual summaries.",
    linkText: "View snapshot",
    href: "/economy"
  },
  {
    title: "Comparative Cannabis Governance Models",
    description: "Analysis of how countries have designed and operated their regulatory systems — mapping the diversity of approaches from prohibition through medical access to commercial legalisation, with lessons for LMIC and SIDS.",
    linkText: "Compare models",
    href: "#comparative-models"
  }
];

export const SELF_ASSESSMENT_CLUSTERS = [
  {
    title: "Cluster A — Governance Foundations",
    dimensions: [
      {
        number: "1",
        title: "National Vision, Strategy & Policy Coherence",
        description: "Is there a clear national direction, shared across ministries and linked to development priorities?"
      },
      {
        number: "2",
        title: "Legal & Regulatory Framework",
        description: "Are cannabis and hemp categories clearly defined and supported by operational regulations?"
      },
      {
        number: "3",
        title: "Institutional & Governance Capacity",
        description: "Is there a capable lead authority with mandate, budget, technical capacity, and accountability safeguards?"
      }
    ]
  },
  {
    title: "Cluster B — People, Economy & Environment",
    dimensions: [
      {
        number: "4",
        title: "Public Health, Human Rights & Social Protection",
        description: "Does the system protect patients, reduce harm, and avoid disproportionate criminalisation?"
      },
      {
        number: "5",
        title: "Economic, Industrial & Market Development",
        description: "Does the market structure support SMEs, value addition, fair taxation, and export readiness?"
      },
      {
        number: "6",
        title: "Agriculture, Environment & Sustainability",
        description: "Are farmers supported, local genetic resources protected, and environmental impacts regulated?"
      },
      {
        number: "7",
        title: "Social Equity, Inclusion & Community Participation",
        description: "Are affected communities, women, youth, smallholders, and traditional growers meaningfully included?"
      }
    ]
  },
  {
    title: "Cluster C — Enablers, Accountability & Alignment",
    dimensions: [
      {
        number: "8",
        title: "Knowledge, Data, Innovation & Digital Systems",
        description: "Are data, research, and digital tools used to support evidence-based regulation?"
      },
      {
        number: "9",
        title: "Cultural, Spiritual & Recreational Dimensions",
        description: "Are cultural realities, traditional use, and recreational patterns addressed honestly and proportionately?"
      },
      {
        number: "10",
        title: "Monitoring, Evaluation, Learning & Accountability",
        description: "Are outcomes tracked, independently reviewed, and used to improve the system?"
      },
      {
        number: "11",
        title: "International & Regional Alignment",
        description: "Is the country compliant with international obligations and engaged in regional cooperation?"
      },
      {
        number: "12",
        title: "Community Participation, FPIC & Local Governance",
        description: "Are local communities consulted, protected, and empowered in decisions affecting them?"
      },
      {
        number: "13",
        title: "SDG & Green Economy Alignment",
        description: "Does the sector contribute measurably to sustainable development, climate action, and institutional integrity?"
      }
    ]
  }
];

export const SELF_ASSESSMENT_SCORING = [
  { label: "Y — Yes", description: "Fully in place, operational and documented" },
  { label: "P — Partial", description: "Partly in place or inconsistently applied" },
  { label: "N — No", description: "Not in place, absent or not functional" },
  { label: "Green", description: "Strong — maintain and monitor", type: "strong" },
  { label: "Orange", description: "Developing — consolidate and close gaps", type: "developing" },
  { label: "Red", description: "Weak — prioritise urgent reform", type: "weak" }
];

export const COMPARATIVE_MODELS = [
  { country: "Uruguay", description: "Public-health state model" },
  { country: "Canada", description: "Federal commercial model" },
  { country: "USA", description: "Fragmented subnational" },
  { country: "Germany", description: "Incremental European" },
  { country: "Jamaica", description: "Cultural-rights model" },
  { country: "South Africa", description: "Judiciary-led" },
  { country: "Lesotho/Colombia", description: "Export-led development" },
  { country: "SIDS", description: "Niche capability-based" }
];

import { useLanguage } from "@/i18n/LanguageContext";

export function useFrameworkContent() {
  const { text } = useLanguage();

  const TRANSLATED_FRAMEWORK_ARGUMENT = {
    eyebrow: text("The Argument", "L'argument"),
    title: text("A Global Governance Transition", "Une transition de gouvernance mondiale"),
    lead: text(
      "Cannabis reform is not a binary legal choice between prohibition and legalisation — it is a governance transition.",
      "La réforme du cannabis n'est pas un choix juridique binaire entre prohibition et légalisation — c'est une transition de gouvernance."
    ),
    description: text(
      "Outcomes depend less on legal status than on the quality of institutions, coherence of policies, and adaptive learning capacity states bring to implementation.",
      "Les résultats dépendent moins du statut juridique que de la qualité des institutions, de la cohérence des politiques et de la capacité d'apprentissage adaptatif que les États apportent à la mise en œuvre."
    ),
  };

  const TRANSLATED_FRAMEWORK_ARGUMENT_CARDS: FrameworkArgumentCard[] = [
    {
      label: text("The Governance Gap", "Le déficit de gouvernance"),
      text: text(
        "Countries are legalising faster than they are governing. Licences are issued before laboratories exist. Export frameworks are announced before certification systems are built.",
        "Les pays légalisent plus vite qu'ils ne gouvernent. Les autorisations sont délivrées avant que les laboratoires n'existent. Les cadres d'exportation sont annoncés avant que les systèmes de certification ne soient mis en place."
      ),
    },
    {
      label: text("The Stakes for Developing Nations", "Les enjeux pour les pays en développement"),
      text: text(
        "For LMICs and Small Island Developing States, the stakes are especially high. The window for deliberate appropriation is open — but it will not remain so indefinitely.",
        "Pour les PRFI et les petits États insulaires en développement, les enjeux sont particulièrement importants. La possibilité de se positionner de manière réfléchie est ouverte — mais elle ne le restera pas indéfiniment."
      ),
    },
    {
      label: text("The Defining Challenge", "Le défi déterminant"),
      text: text(
        "The gap between legislative ambition and institutional reality is not a minor detail — it is the defining challenge of this transition. Markets are consolidating. Standards are being set.",
        "L'écart entre l'ambition législative et la réalité institutionnelle n'est pas un détail mineur — c'est le défi déterminant de cette transition. Les marchés se consolident. Les normes se mettent en place."
      ),
    },
  ];

  const TRANSLATED_GOVERNANCE_LAYERS: GovernanceLayer[] = [
    {
      number: "01",
      title: text("Evidence Credibility", "Crédibilité des données probantes"),
      description: text(
        "Capacity to generate, interpret, and apply scientific and administrative data to inform policy. Without credible evidence, policy becomes vulnerable to ideology and misinformation.",
        "Capacité à produire, interpréter et utiliser des données scientifiques et administratives pour éclairer l'action publique. Sans données probantes crédibles, l'action publique devient vulnérable à l'idéologie et à la désinformation."
      ),
    },
    {
      number: "02",
      title: text("Differentiated Public Health", "Santé publique différenciée"),
      description: text(
        "Ability to balance therapeutic access with proportionate safeguards and harm reduction calibrated to the actual distribution of risk across populations and products.",
        "Capacité à équilibrer l'accès thérapeutique avec des garanties proportionnées et une réduction des risques calibrée en fonction de la répartition réelle des risques selon les populations et les produits."
      ),
    },
    {
      number: "03",
      title: text("Value Capture", "Capture de valeur"),
      description: text(
        "Institutional capacity to retain economic benefits domestically through processing, standards, and value-chain upgrading. Without deliberate investment, producer countries risk the \"raw material trap.\"",
        "Capacité institutionnelle à conserver les avantages économiques au niveau national grâce à la transformation, aux normes et à la valorisation de la chaîne de valeur. Sans investissement délibéré, les pays producteurs risquent le « piège de la matière première »."
      ),
    },
    {
      number: "04",
      title: text("Justice Repair", "Réparation des préjudices"),
      description: text(
        "Mechanisms for addressing historical harms: expungement, community reinvestment, and inclusive pathways for legacy actors. Justice repair transforms reform into a visible social settlement.",
        "Mécanismes de réparation des préjudices historiques : effacement des condamnations, réinvestissement communautaire et voies inclusives pour les acteurs issus des anciens marchés. La réparation des préjudices transforme la réforme en un pacte social tangible."
      ),
    },
    {
      number: "05",
      title: text("Inclusive Finance", "Finance inclusive"),
      description: text(
        "Financial systems enabling participation by smallholders, cooperatives, women, and SMEs rather than concentrating capital among well-resourced firms.",
        "Systèmes financiers permettant la participation des petits exploitants, des coopératives, des femmes et des PME plutôt que de concentrer le capital au sein des entreprises disposant de moyens importants."
      ),
    },
    {
      number: "06",
      title: text("Digital Trust", "Confiance numérique"),
      description: text(
        "Traceability, data governance, and cybersecurity systems that build regulatory credibility without sacrificing sovereignty. The informational backbone of modern cannabis governance.",
        "Systèmes de traçabilité, de gouvernance des données et de cybersécurité qui renforcent la crédibilité réglementaire sans sacrifier la souveraineté. L'épine dorsale informationnelle de la gouvernance moderne du cannabis."
      ),
    },
    {
      number: "07",
      title: text("Adaptive Institutional Legitimacy", "Légitimité institutionnelle adaptative"),
      description: text(
        "Capacity to learn, recalibrate, and maintain public trust as conditions evolve. Ensures governance remains responsive to emerging evidence rather than ossifying over time.",
        "Capacité à apprendre, à recalibrer et à maintenir la confiance du public au fur et à mesure de l'évolution des conditions. Garantit que la gouvernance reste réactive aux données probantes émergentes plutôt que de se rigidifier avec le temps."
      ),
    },
  ];

  const TRANSLATED_FRAMEWORK_META = {
    eyebrow: text("The Model", "Le modèle"),
    title: text("RGG Governance Transition Model", "Modèle de transition de la gouvernance RGG"),
    subtitle: text(
      "A seven-layer framework for moving from legal reform toward durable governance.",
      "Un cadre à sept niveaux pour passer de la réforme juridique à une gouvernance durable."
    ),
    description: text(
      "Weakness in any single layer can generate cascading effects that destabilise the entire transition. The model functions as both an assessment tool and a guide for sequencing governance investments.",
      "Une faiblesse dans un seul niveau peut générer des effets en cascade qui déstabilisent l'ensemble de la transition. Le modèle fonctionne à la fois comme un outil d'évaluation et un guide pour hiérarchiser et échelonner les investissements dans la gouvernance."
    ),
    coreArgument: text(
      "Cannabis is a governance issue, not a legal one.",
      "Le cannabis est une question de gouvernance, pas une question juridique."
    ),
  };

  const TRANSLATED_FRAMEWORK_INSTRUMENTS: FrameworkInstrument[] = [
    {
      title: text("Cannabis Governance Transition Model", "Modèle de transition de la gouvernance du cannabis"),
      description: text(
        "A seven-layer diagnostic framework identifying the interconnected governance layers through which reform either consolidates into durable public value or unravels into institutional fatigue, market concentration, and legitimacy loss.",
        "Un cadre de diagnostic à sept niveaux identifiant les niveaux de gouvernance interconnectés par lesquels la réforme se consolide en une valeur publique durable ou se délite, entraînant fatigue institutionnelle, concentration du marché et perte de légitimité."
      ),
      linkText: text("Explore the model", "Explorer le modèle"),
      href: "#layers"
    },
    {
      title: text("National Cannabis Economy Self-Assessment Framework", "Cadre national d'auto-évaluation de l'économie du cannabis"),
      description: text(
        "A guided diagnostic toolkit across 13 readiness dimensions in three clusters, enabling governments to assess institutional strengths, identify critical gaps, and sequence reforms realistically.",
        "Une boîte à outils de diagnostic guidé portant sur 13 dimensions de préparation réparties en trois axes, permettant aux gouvernements d'évaluer les forces institutionnelles, d'identifier les lacunes critiques et de séquencer les réformes de manière réaliste."
      ),
      linkText: text("Explore the toolkit", "Explorer la boîte à outils"),
      href: "#self-assessment"
    },
    {
      title: text("Snapshot of the Global Cannabis Economy", "Aperçu de l'économie mondiale du cannabis"),
      description: text(
        "Key facts, figures, and market signals on demand, production, value chains, financial contribution, and growth potential — translating complex economic dynamics into accessible visual summaries.",
        "Faits clés, chiffres et signaux du marché sur la demande, la production, les chaînes de valeur, la contribution financière et le potentiel de croissance — qui rendent accessibles, sous forme de synthèses visuelles, des dynamiques économiques complexes."
      ),
      linkText: text("View snapshot", "Voir l'aperçu"),
      href: "/economy"
    },
    {
      title: text("Comparative Cannabis Governance Models", "Modèles de gouvernance comparatifs du cannabis"),
      description: text(
        "Analysis of how countries have designed and operated their regulatory systems — mapping the diversity of approaches from prohibition through medical access to commercial legalisation, with lessons for LMIC and SIDS.",
        "Analyse de la manière dont les pays ont conçu et mis en œuvre leurs systèmes de réglementation — mettant en évidence la diversité des approches, de la prohibition à la légalisation commerciale en passant par l'accès médical, avec des leçons pour les PRFI et les PEID."
      ),
      linkText: text("Compare models", "Comparer les modèles"),
      href: "#comparative-models"
    }
  ];

  const TRANSLATED_SELF_ASSESSMENT_CLUSTERS = [
    {
      title: text("Cluster A — Governance Foundations", "Groupe A — Fondements de la gouvernance"),
      dimensions: [
        {
          number: "1",
          title: text("National Vision, Strategy & Policy Coherence", "Vision nationale, stratégie et cohérence des politiques"),
          description: text("Is there a clear national direction, shared across ministries and linked to development priorities?", "Y a-t-il une orientation nationale claire, partagée entre les ministères et liée aux priorités de développement ?")
        },
        {
          number: "2",
          title: text("Legal & Regulatory Framework", "Cadre juridique et réglementaire"),
          description: text("Are cannabis and hemp categories clearly defined and supported by operational regulations?", "Les catégories de cannabis et de chanvre sont-elles clairement définies et soutenues par des réglementations opérationnelles ?")
        },
        {
          number: "3",
          title: text("Institutional & Governance Capacity", "Capacité institutionnelle et de gouvernance"),
          description: text("Is there a capable lead authority with mandate, budget, technical capacity, and accountability safeguards?", "Existe-t-il une autorité chef de file dotée d'un mandat, d'un budget, des capacités techniques nécessaires et de garanties de redevabilité ?")
        }
      ]
    },
    {
      title: text("Cluster B — People, Economy & Environment", "Groupe B — Personnes, économie et environnement"),
      dimensions: [
        {
          number: "4",
          title: text("Public Health, Human Rights & Social Protection", "Santé publique, droits de l'homme et protection sociale"),
          description: text("Does the system protect patients, reduce harm, and avoid disproportionate criminalisation?", "Le système protège-t-il les patients, réduit-il les risques et évite-t-il une criminalisation disproportionnée ?")
        },
        {
          number: "5",
          title: text("Economic, Industrial & Market Development", "Développement économique, industriel et du marché"),
          description: text("Does the market structure support SMEs, value addition, fair taxation, and export readiness?", "La structure du marché soutient-elle les PME, la valeur ajoutée, une fiscalité équitable et la préparation à l'exportation ?")
        },
        {
          number: "6",
          title: text("Agriculture, Environment & Sustainability", "Agriculture, environnement et durabilité"),
          description: text("Are farmers supported, local genetic resources protected, and environmental impacts regulated?", "Les agriculteurs sont-ils soutenus, les ressources génétiques locales protégées et les impacts environnementaux réglementés ?")
        },
        {
          number: "7",
          title: text("Social Equity, Inclusion & Community Participation", "Équité sociale, inclusion et participation communautaire"),
          description: text("Are affected communities, women, youth, smallholders, and traditional growers meaningfully included?", "Les communautés affectées, les femmes, les jeunes, les petits exploitants et les producteurs traditionnels sont-ils inclus de manière significative ?")
        }
      ]
    },
    {
      title: text("Cluster C — Enablers, Accountability & Alignment", "Groupe C — Facteurs habilitants, redevabilité et alignement"),
      dimensions: [
        {
          number: "8",
          title: text("Knowledge, Data, Innovation & Digital Systems", "Connaissances, données, innovation et systèmes numériques"),
          description: text("Are data, research, and digital tools used to support evidence-based regulation?", "Les données, la recherche et les outils numériques sont-ils utilisés pour soutenir une réglementation fondée sur des données probantes ?")
        },
        {
          number: "9",
          title: text("Cultural, Spiritual & Recreational Dimensions", "Dimensions culturelles, spirituelles et récréatives"),
          description: text("Are cultural realities, traditional use, and recreational patterns addressed honestly and proportionately?", "Les réalités culturelles, l'utilisation traditionnelle et les schémas récréatifs sont-ils abordés honnêtement et proportionnellement ?")
        },
        {
          number: "10",
          title: text("Monitoring, Evaluation, Learning & Accountability", "Suivi, évaluation, apprentissage et redevabilité"),
          description: text("Are outcomes tracked, independently reviewed, and used to improve the system?", "Les résultats sont-ils suivis, évalués indépendamment et utilisés pour améliorer le système ?")
        },
        {
          number: "11",
          title: text("International & Regional Alignment", "Alignement international et régional"),
          description: text("Is the country compliant with international obligations and engaged in regional cooperation?", "Le pays est-il conforme aux obligations internationales et engagé dans la coopération régionale ?")
        },
        {
          number: "12",
          title: text("Community Participation, FPIC & Local Governance", "Participation communautaire, CLIP et gouvernance locale"),
          description: text("Are local communities consulted, protected, and empowered in decisions affecting them?", "Les communautés locales sont-elles consultées, protégées et habilitées à participer aux décisions qui les concernent ?")
        },
        {
          number: "13",
          title: text("SDG & Green Economy Alignment", "Alignement sur les ODD et l'économie verte"),
          description: text("Does the sector contribute measurably to sustainable development, climate action, and institutional integrity?", "Le secteur contribue-t-il de manière mesurable au développement durable, à l'action climatique et à l'intégrité institutionnelle ?")
        }
      ]
    }
  ];

  const TRANSLATED_SELF_ASSESSMENT_SCORING = [
    { label: text("Y — Yes", "O — Oui"), description: text("Fully in place, operational and documented", "Pleinement en place, opérationnel et documenté"), type: "strong" },
    { label: text("P — Partial", "P — Partiel"), description: text("Partly in place or inconsistently applied", "Partiellement en place ou appliqué de manière incohérente"), type: "developing" },
    { label: text("N — No", "N — Non"), description: text("Not in place, absent or not functional", "Non mis en place, absent ou non fonctionnel"), type: "weak" },
    { label: text("Green", "Vert"), description: text("Strong — maintain and monitor", "Solide — maintenir et suivre"), type: "strong" },
    { label: text("Orange", "Orange"), description: text("Developing — consolidate and close gaps", "En développement — consolider et combler les lacunes"), type: "developing" },
    { label: text("Red", "Rouge"), description: text("Weak — prioritise urgent reform", "Faible — donner la priorité à une réforme urgente"), type: "weak" }
  ];

  const TRANSLATED_COMPARATIVE_MODELS = [
    { country: "Uruguay", description: text("Public-health state model", "Modèle étatique de santé publique") },
    { country: "Canada", description: text("Federal commercial model", "Modèle commercial fédéral") },
    { country: "USA", description: text("Fragmented subnational", "Modèle infranational fragmenté") },
    { country: "Germany", description: text("Incremental European", "Modèle européen progressif") },
    { country: "Jamaica", description: text("Cultural-rights model", "Modèle de droits culturels") },
    { country: "South Africa", description: text("Judiciary-led", "Impulsé par le pouvoir judiciaire") },
    { country: "Lesotho/Colombia", description: text("Export-led development", "Développement axé sur l'exportation") },
    { country: "SIDS", description: text("Niche capability-based", "Fondé sur des capacités spécialisées de niche") }
  ];

  return {
    FRAMEWORK_ARGUMENT: TRANSLATED_FRAMEWORK_ARGUMENT,
    FRAMEWORK_ARGUMENT_CARDS: TRANSLATED_FRAMEWORK_ARGUMENT_CARDS,
    GOVERNANCE_LAYERS: TRANSLATED_GOVERNANCE_LAYERS,
    FRAMEWORK_META: TRANSLATED_FRAMEWORK_META,
    FRAMEWORK_INSTRUMENTS: TRANSLATED_FRAMEWORK_INSTRUMENTS,
    SELF_ASSESSMENT_CLUSTERS: TRANSLATED_SELF_ASSESSMENT_CLUSTERS,
    SELF_ASSESSMENT_SCORING: TRANSLATED_SELF_ASSESSMENT_SCORING,
    COMPARATIVE_MODELS: TRANSLATED_COMPARATIVE_MODELS,
  };
}
