import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { EvidenceNote } from "@/components/content/EvidenceNote";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Policymakers() {
  const { text } = useLanguage();

  const GUIDING_CONSIDERATIONS = [
    {
      title: text("Reframe as a Governance Issue", "Repenser le cannabis comme un enjeu de gouvernance"),
      description: text(
        "Position cannabis within national development strategies — particularly agriculture, industrial policy, and green economy agendas.",
        "Positionner le cannabis dans les stratégies de développement national — en particulier l'agriculture, la politique industrielle et les objectifs liés à l'économie verte."
      )
    },
    {
      title: text("Align with Institutional Capacity", "S'aligner sur la capacité institutionnelle"),
      description: text(
        "Ambitious regulatory models require robust capacity. Adopt phased approaches matching policy complexity with institutional readiness.",
        "Les modèles réglementaires ambitieux exigent des capacités solides. Adopter des approches progressives adaptant la complexité des politiques à la capacité institutionnelle."
      )
    },
    {
      title: text("Promote Inclusive Participation", "Promouvoir une participation inclusive"),
      description: text(
        "Facilitate access for smallholders, cooperatives, and local enterprises to prevent market concentration.",
        "Faciliter l'accès des petits exploitants, des coopératives et des entreprises locales pour prévenir la concentration du marché."
      )
    },
    {
      title: text("Move Towards Value Addition", "Progresser vers la valeur ajoutée"),
      description: text(
        "Capture greater value by advancing into processing, manufacturing, and innovation rather than relying on primary production.",
        "Capter une plus grande valeur en progressant dans la transformation, la fabrication et l'innovation plutôt qu'en s'appuyant sur la production primaire."
      )
    },
    {
      title: text("Strengthen Regulatory Systems", "Renforcer les systèmes de réglementation"),
      description: text(
        "Effective governance depends on monitoring and adaptation. Invest in licensing, quality assurance, traceability, and data systems.",
        "Une gouvernance efficace dépend du suivi et de l'adaptation. Investir dans les licences, l'assurance qualité, la traçabilité et les systèmes de données."
      )
    },
    {
      title: text("Integrate Environmental Sustainability", "Intégrer la durabilité environnementale"),
      description: text(
        "Align cultivation and processing with environmental objectives, particularly in resource-constrained contexts.",
        "Aligner la culture et la transformation sur les objectifs environnementaux, en particulier dans les contextes de ressources limitées."
      )
    },
    {
      title: text("Manage External Dependency Risks", "Gérer les risques de dépendance externe"),
      description: text(
        "Implement safeguards to protect national interests, including transparent licensing and clear investment frameworks.",
        "Mettre en œuvre des garanties pour protéger les intérêts nationaux, notamment des licences transparentes et des cadres d'investissement clairs."
      )
    },
    {
      title: text("Adopt Adaptive Approaches", "Adopter des approches adaptatives"),
      description: text(
        "Incorporate mechanisms for evaluation, feedback, and revision. Pilot programmes and continuous learning reduce risks.",
        "Intégrer des mécanismes d'évaluation, de retour d'information et de révision. Les programmes pilotes et l'apprentissage continu réduisent les risques."
      )
    }
  ];

  const CAPABILITIES = [
    {
      title: text("Regulatory & Institutional Strengthening", "Renforcement réglementaire et institutionnel"),
      description: text(
        "Clear mandates, inter-agency coordination, licensing systems, inspection capacity, and anti-capture safeguards.",
        "Mandats clairs, coordination inter-agences, systèmes de licences, capacité d'inspection et garanties anti-capture."
      )
    },
    {
      title: text("Scientific & Laboratory Infrastructure", "Infrastructures scientifiques et de laboratoire"),
      description: text(
        "Accredited testing facilities, GMP certification pathways, pharmacovigilance systems, and research partnerships.",
        "Installations de test accréditées, parcours de certification BPF, systèmes de pharmacovigilance et partenariats de recherche."
      )
    },
    {
      title: text("Data Systems & Digital Governance", "Systèmes de données et gouvernance numérique"),
      description: text(
        "Traceability, licensing portals, market monitoring databases, and evidence-based policy frameworks.",
        "Traçabilité, portails de licences, bases de données de surveillance du marché et cadres politiques fondés sur des données probantes."
      )
    },
    {
      title: text("Market & Value Chain Development", "Développement du marché et de la chaîne de valeur"),
      description: text(
        "Domestic processing capacity, SME support, cooperative models, export readiness, and fair taxation frameworks.",
        "Capacité de transformation nationale, soutien aux PME, modèles coopératifs, préparation à l'exportation et cadres fiscaux équitables."
      )
    },
    {
      title: text("Public Health & Social Protection", "Santé publique et protection sociale"),
      description: text(
        "Patient access pathways, prevention programmes, harm reduction strategies, and human rights safeguards.",
        "Parcours d'accès pour les patients, programmes de prévention, stratégies de réduction des risques et garanties des droits de l'homme."
      )
    },
    {
      title: text("Regional Cooperation Platforms", "Plateformes de coopération régionale"),
      description: text(
        "Shared laboratories, harmonised standards, pooled training, and mutual recognition of certification.",
        "Laboratoires partagés, normes harmonisées, formation mutualisée et reconnaissance mutuelle de la certification."
      )
    }
  ];

  const PATHWAYS = [
    {
      title: text("LMIC Pathway", "Parcours PRFI"),
      description: text(
        "Phased reform aligned with capacity, inclusive development and institutional strengthening.",
        "Réforme progressive alignée sur les capacités, le développement inclusif et le renforcement institutionnel."
      )
    },
    {
      title: text("SIDS Pathway", "Parcours PEID"),
      description: text(
        "Focused on niche markets, sustainability and regional cooperation.",
        "Axé sur les marchés de niche, la durabilité et la coopération régionale."
      )
    },
    {
      title: text("Medical-First Approach", "Approche donnant la priorité à l’accès médical"),
      description: text(
        "Prioritising patient access, clinical systems and regulatory safeguards.",
        "Priorité à l'accès des patients, aux systèmes cliniques et aux garanties réglementaires."
      )
    },
    {
      title: text("Industrial Hemp Entry", "Entrée par le chanvre industriel"),
      description: text(
        "A lower-risk pathway through agriculture and industrial applications.",
        "Une voie à moindre risque par l'agriculture et les applications industrielles."
      )
    },
    {
      title: text("Public Health Approach", "Approche de santé publique"),
      description: text(
        "Emphasising prevention, harm reduction and responsible regulation.",
        "Mettre l'accent sur la prévention, la réduction des risques et une réglementation responsable."
      )
    },
    {
      title: text("Comprehensive Regulatory Model", "Modèle réglementaire global"),
      description: text(
        "Advanced systems including licensing, taxation, traceability and market control.",
        "Systèmes avancés comprenant autorisations, fiscalité, traçabilité et contrôle du marché."
      )
    }
  ];

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#07100A]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10%] top-0 h-[600px] w-[600px] rounded-full border border-[#284631]/20 bg-[#0D3B2E]/5 blur-[4px]"
        />

        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pb-28 md:pt-40">
          <div className="max-w-4xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Institutional Guidance", "Orientations institutionnelles")}
              </span>
            </div>

            <h1 className="font-serif text-[clamp(3rem,6.5vw,6rem)] leading-[0.94] tracking-[-0.04em]">
              {text("For Policymakers", "Pour les décideurs")}
              <br />
              <span className="italic text-[#EDD99A]">{text("& Institutions.", "& les institutions.")}</span>
            </h1>

            <p className="mt-9 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "Governance transition models, readiness frameworks, capacity-building resources, and technical assistance for national and regional cannabis policy development.",
                "Modèles de transition de gouvernance, cadres de préparation, ressources de renforcement des capacités et assistance technique pour l'élaboration de politiques nationales et régionales sur le cannabis."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Guiding Considerations */}
      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Policy Guidance", "Orientations politiques")}</SectionEyebrow>
          <h2 className="max-w-2xl font-serif text-3xl leading-tight tracking-[-0.02em] text-[#F4F1EA] md:text-5xl">
            {text("Eight Guiding Considerations", "Huit considérations directrices")}
          </h2>
          <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-base">
            {text(
              "Strategic principles designed for governments, regulators, and regional bodies navigating complex reform.",
              "Principes stratégiques conçus pour les gouvernements, les organismes de réglementation et les organismes régionaux confrontés à des réformes complexes."
            )}
          </p>
          <EvidenceNote ids={["POL-001"]} noReliance />

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {GUIDING_CONSIDERATIONS.map((item, index) => (
              <article
                key={item.title}
                className="flex flex-col border border-[#1A2E20] bg-[#0B0B0B] p-8 transition-colors hover:border-[#26382C]"
              >
                <span className="mb-6 font-serif text-3xl text-[#8A713E]/50">
                  0{index + 1}
                </span>
                <h3 className="mb-4 font-serif text-xl leading-tight text-[#EDD99A]">
                  {item.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-[#718078]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Capability */}
      <section className="border-b border-[#1A2E20] bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>{text("Knowledge & Capacity", "Connaissances et capacités")}</SectionEyebrow>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.02em] text-[#F4F1EA] md:text-5xl">
              {text("Building Institutional Capability", "Renforcement des capacités institutionnelles")}
            </h2>
            <p className="mt-6 text-sm font-light leading-7 text-[#8D988F] md:text-base">
              {text("Cannabis reform is a test of institutional capability, policy coherence, and social contract.", "La réforme du cannabis est un test de capacité institutionnelle, de cohérence des politiques et de contrat social.")}{" "}
              {text("The central finding is that outcomes are determined by ", "La conclusion centrale est que les résultats sont déterminés par ")}<strong className="font-medium text-[#C8C5B3]">{text("governance design, not market size, climate, or comparative advantage", "la conception de la gouvernance, et non par la taille du marché, le climat ou l'avantage comparatif")}</strong>.
            </p>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <div key={item.title} className="border-t border-[#1A2E20] pt-6">
                <h3 className="mb-3 font-serif text-lg text-[#EDD99A]">
                  {item.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-[#718078]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <EvidenceNote ids={["POL-001"]} noReliance />
        </div>
      </section>

      {/* Strategic Reform Pathways */}
      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Strategic Sequencing", "Séquençage stratégique")}</SectionEyebrow>
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-serif text-3xl leading-tight tracking-[-0.02em] text-[#F4F1EA] md:text-5xl">
                {text("Illustrative Reform Pathways", "Parcours de réforme illustratifs")}
              </h2>
              <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {text(
                  "The models below represent potential strategic sequences, not universal recommendations, guarantees of success, or promised outcomes. The suitability of any pathway depends strictly on local law, robust evidence, institutional readiness, public-health priorities, and extensive stakeholder consultation.",
                  "Les modèles ci-dessous représentent des séquences stratégiques potentielles, et non des recommandations universelles, des garanties de réussite ou des résultats promis. La pertinence de toute voie dépend strictement du droit local, de données probantes solides, de l’état de préparation institutionnelle, des priorités de santé publique et d’une large consultation des parties prenantes."
                )}
              </p>

              <div className="mt-10 flex flex-col items-start gap-4">
                <Link
                  href="/framework#self-assessment"
                  onClick={() => trackEvent("policymakers_crosslink_clicked", { destination: "self_assessment" })}
                  className="inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
                >
                  {text("Assess Readiness", "Évaluer l'état de préparation")} <span aria-hidden="true" className="ml-3">→</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => trackEvent("policymakers_crosslink_clicked", { destination: "contact" })}
                  className="inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
                >
                  {text("Discuss Sequencing", "Discuter du séquençage")} <span aria-hidden="true" className="ml-3">→</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {PATHWAYS.map((item) => (
                <div key={item.title} className="border border-[#1A2E20] bg-[#0B0B0B] p-6 transition-colors hover:border-[#26382C]">
                  <h3 className="mb-3 font-serif text-lg text-[#EDD99A]">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-[#718078]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Assistance & Resources */}
      <section className="border-b border-[#1A2E20] bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionEyebrow>{text("Technical Assistance", "Assistance technique")}</SectionEyebrow>
              <h2 className="mt-6 max-w-lg font-serif text-3xl leading-tight tracking-[-0.02em] text-[#F4F1EA] md:text-4xl">
                {text("Support for Policy Development & Implementation", "Soutien à l'élaboration et à la mise en œuvre des politiques")}
              </h2>
              <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {text(
                  "The framework serves as a practical instrument for evaluating readiness, guiding transition sequencing, and structuring comparative analysis. It provides potential engagement pathways for development partners and civil-society stakeholders.",
                  "Le cadre sert d'instrument pratique pour évaluer l'état de préparation, guider le séquençage de la transition et structurer l'analyse comparative. Il offre des voies d'engagement potentielles pour les partenaires de développement et les acteurs de la société civile."
                )}
              </p>
              
              <blockquote className="mt-10 border-l border-[#C8A96B] pl-6 font-serif text-xl italic leading-relaxed text-[#EDD99A]">
                {text(
                  "“Countries which invest in the seven governance layers now — before markets consolidate, before regulatory capture sets in, before the political moment passes — will not merely regulate cannabis better. They will have built governance infrastructure capable of navigating whatever complex transition comes next.”",
                  "« Les pays qui investissent maintenant dans les sept niveaux de gouvernance — avant que les marchés ne se consolident, avant que la capture réglementaire ne s'installe, avant que le moment politique ne passe — ne se contenteront pas de mieux réglementer le cannabis. Ils auront bâti une infrastructure de gouvernance capable de naviguer dans n'importe quelle transition complexe à venir. »"
                )}
              </blockquote>
            </div>

            <div className="space-y-6">
              <Link 
                href="/framework"
                onClick={() => trackEvent("policymakers_crosslink_clicked", { destination: "framework" })}
                className="group flex flex-col border border-[#1A2E20] bg-[#080D09] p-8 transition-colors hover:border-[#C8A96B]"
              >
                <h3 className="font-serif text-xl text-[#C8C5B3] group-hover:text-[#EDD99A]">
                  {text("Governance Transition Model", "Modèle de transition de la gouvernance")}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#718078]">
                  {text(
                    "A diagnostic framework structured across seven governance layers for moving from legal reform toward adaptive systems.",
                    "Un cadre diagnostique structuré sur sept niveaux de gouvernance pour passer de la réforme juridique à des systèmes adaptatifs."
                  )}
                </p>
                <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98C50] group-hover:text-[#EDD99A]">
                  {text("Explore Layers →", "Explorer les niveaux →")}
                </span>
              </Link>

              <Link 
                href="/framework#self-assessment"
                onClick={() => trackEvent("policymakers_crosslink_clicked", { destination: "self_assessment" })}
                className="group flex flex-col border border-[#1A2E20] bg-[#080D09] p-8 transition-colors hover:border-[#C8A96B]"
              >
                <h3 className="font-serif text-xl text-[#C8C5B3] group-hover:text-[#EDD99A]">
                  {text("National Self-Assessment Framework", "Cadre national d'auto-évaluation")}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#718078]">
                  {text(
                    "A guided toolkit for multi-ministry teams, organised across 13 readiness dimensions in three core clusters.",
                    "Une boîte à outils guidée pour les équipes interministérielles, organisée autour de 13 dimensions de préparation réparties en trois groupes principaux."
                  )}
                </p>
                <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98C50] group-hover:text-[#EDD99A]">
                  {text("View Framework →", "Voir le cadre →")}
                </span>
              </Link>

              <Link 
                href="/framework#comparative-models"
                onClick={() => trackEvent("policymakers_crosslink_clicked", { destination: "comparative_models" })}
                className="group flex flex-col border border-[#1A2E20] bg-[#080D09] p-8 transition-colors hover:border-[#C8A96B]"
              >
                <h3 className="font-serif text-xl text-[#C8C5B3] group-hover:text-[#EDD99A]">
                  {text("Comparative Governance Models", "Modèles de gouvernance comparatifs")}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#718078]">
                  {text(
                    "Analysis of diverse regulatory systems across the governance spectrum from medical access to commercial models.",
                    "Analyse de divers systèmes réglementaires sur tout le spectre de la gouvernance, de l'accès médical aux modèles commerciaux."
                  )}
                </p>
                <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98C50] group-hover:text-[#EDD99A]">
                  {text("Read Analysis →", "Lire l'analyse →")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Crosslinks */}
      <section className="bg-[#0B0B0B]">
        <div className="container mx-auto grid gap-px border-l border-t border-[#1A2E20] bg-[#1A2E20] md:grid-cols-2">
          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <SectionEyebrow>{text("Dialogue & Engagement", "Dialogue et engagement")}</SectionEyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl text-[#F4F1EA]">
              {text("Collaboration Enquiries", "Demandes de collaboration")}
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-[#718078]">
              {text(
                "We welcome engagement from governments, regional economic communities, development partners, research institutions, and civil society organisations seeking technical support on cannabis governance, policy design, institutional capacity-building, and reform sequencing.",
                "Nous accueillons favorablement l'engagement des gouvernements, des communautés économiques régionales, des partenaires de développement, des instituts de recherche et des organisations de la société civile recherchant un soutien technique sur la gouvernance du cannabis, la conception des politiques, le renforcement des capacités institutionnelles et le séquençage des réformes."
              )}
            </p>
            <Link
              href="/contact"
              onClick={() =>
                trackEvent("policymakers_crosslink_clicked", {
                  destination: "contact",
                })
              }
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Contact / Dialogue", "Contact / Dialogue")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>

          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <SectionEyebrow>{text("Research & Analysis", "Recherche et analyse")}</SectionEyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl text-[#F4F1EA]">
              {text("Evidence-Based Advisory", "Conseil fondé sur des données probantes")}
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-[#718078]">
              {text(
                "Advisory enquiries can explore how independent analysis, institutional-readiness tools, and comparative evidence may support governments and decision-makers evaluating complex regulatory transitions.",
                "Les échanges peuvent examiner comment une analyse indépendante, des outils d'évaluation des capacités institutionnelles et des données comparatives peuvent soutenir les gouvernements et les décideurs qui évaluent des transitions réglementaires complexes."
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-6">
              <Link
                href="/consultancy"
                onClick={() =>
                  trackEvent("policymakers_crosslink_clicked", {
                    destination: "consultancy",
                  })
                }
                className="inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
              >
                {text("Consultancy", "Conseil")} <span aria-hidden="true" className="ml-3">→</span>
              </Link>
              <Link
                href="/research"
                onClick={() =>
                  trackEvent("policymakers_crosslink_clicked", {
                    destination: "research",
                  })
                }
                className="inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
              >
                {text("Research Library", "Bibliothèque de recherche")} <span aria-hidden="true" className="ml-3">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
