import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Consultancy() {
  const { text } = useLanguage();

  const ADVISORY_AREAS = [
    {
      title: text("Policy Formulation", "Formulation de politiques"),
      description: text("Discussion around national cannabis strategies and governance frameworks.", "Échanges sur les stratégies nationales relatives au cannabis et les cadres de gouvernance.")
    },
    {
      title: text("Institutional Readiness", "Préparation institutionnelle"),
      description: text("Readiness questions spanning capacity, coordination and regulatory systems.", "Enjeux liés à la préparation, couvrant les capacités, la coordination et les systèmes réglementaires.")
    },
    {
      title: text("Value-Chain Development", "Développement de la chaîne de valeur"),
      description: text("Analyse economic opportunities and market positioning.", "Analyser les opportunités économiques et le positionnement sur le marché.")
    },
    {
      title: text("Capacity-Building", "Renforcement des capacités"),
      description: text("Potential workshops, training and policy-learning formats.", "Ateliers, formations et formats d'apprentissage politique potentiels.")
    },
    {
      title: text("Programme Design", "Conception de programmes"),
      description: text("Programme-design considerations for public-interest institutions.", "Considérations relatives à la conception de programmes pour les institutions d'intérêt public.")
    },
    {
      title: text("Policy Dialogue", "Dialogue politique"),
      description: text("Options for structured discussions on reform and governance.", "Options pour des discussions structurées sur la réforme et la gouvernance.")
    }
  ];

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#07100A]">
        <img
          src={`${import.meta.env.BASE_URL}images/consultancy-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full rotate-180 scale-[1.02] object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.97)_0%,rgba(4,8,5,0.88)_40%,rgba(4,8,5,0.52)_70%,rgba(4,8,5,0.4)_100%)]"
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
          <div className="max-w-4xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Research into Implementation", "Recherche appliquée à la mise en œuvre")}
              </span>
            </div>

            <h1 className="font-serif text-[clamp(3rem,6.5vw,6rem)] leading-[0.94] tracking-[-0.04em]">
              {text("Advisory &", "Conseil &")} <br />
              <span className="italic text-[#EDD99A]">{text("Technical Assistance.", "Assistance technique.")}</span>
            </h1>

            <p className="mt-9 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text("Areas for evidence-led dialogue with governments, institutions and organisations navigating cannabis governance, public health, sustainable development and regulatory transformation.", "Domaines de dialogue fondés sur des données probantes avec les gouvernements, les institutions et les organisations qui œuvrent dans la gouvernance du cannabis, la santé publique, le développement durable et la transformation réglementaire.")}
            </p>
          </div>
        </div>
      </section>

      {/* Areas of Focus */}
      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Advisory Domains", "Domaines de conseil")}</SectionEyebrow>
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="max-w-md font-serif text-3xl leading-tight tracking-[-0.02em] text-[#F4F1EA] md:text-5xl">
                {text("Potential Areas of Engagement", "Domaines d'engagement potentiels")}
              </h2>
              <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {text("All potential engagements and technical assistance scopes are developed through structured enquiry. Outlined discussion areas do not imply active programmes, retained clients, established affiliations, guaranteed policy outcomes, or pre-defined deliverables.", "Tous les engagements potentiels et les périmètres d’assistance technique sont définis dans le cadre d’une demande structurée. Les domaines de discussion présentés n’impliquent ni programmes actifs, ni clients sous mandat, ni affiliations établies, ni résultats garantis en matière de politiques publiques, ni livrables prédéfinis.")}
              </p>

              <div className="mt-10">
                <Link
                  href="/contact"
                  onClick={() => trackEvent("consultancy_cta_clicked", { destination: "contact" })}
                  className="inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
                >
                  {text("Submit an Enquiry", "Soumettre une demande")} <span aria-hidden="true" className="ml-4">→</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {ADVISORY_AREAS.map((area, index) => (
                <div key={area.title} className="border border-[#1A2E20] bg-[#0B0B0B] p-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#102219]">
                    <span className="text-[10px] font-bold text-[#C8A96B]">0{index + 1}</span>
                  </div>
                  <h3 className="mb-3 font-serif text-xl text-[#EDD99A]">
                    {area.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-[#718078]">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Crosslinks */}
      <section className="bg-[#0B0B0B]">
        <div className="container mx-auto grid gap-px border-l border-t border-[#1A2E20] bg-[#1A2E20] md:grid-cols-3">
          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <SectionEyebrow>{text("For Institutions", "Pour les institutions")}</SectionEyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl text-[#F4F1EA]">
              {text("Policymakers", "Décideurs")}
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-[#718078]">
              {text("Guidance models, readiness frameworks and resources for national and regional cannabis policy development.", "Modèles d'orientation, cadres de préparation et ressources pour l'élaboration de politiques nationales et régionales sur le cannabis.")}
            </p>
            <Link
              href="/policymakers"
              onClick={() => trackEvent("consultancy_crosslink_clicked", { destination: "policymakers" })}
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Explore Guidance", "Explorer les orientations")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>

          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <SectionEyebrow>{text("Practical Tools", "Outils pratiques")}</SectionEyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl text-[#F4F1EA]">
              {text("The Framework", "Le Cadre")}
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-[#718078]">
              {text("A seven-layer institutional model for moving from legal reform toward durable, adaptive governance.", "Un modèle institutionnel à sept niveaux pour passer de la réforme juridique à une gouvernance durable et adaptative.")}
            </p>
            <Link
              href="/framework"
              onClick={() => trackEvent("consultancy_crosslink_clicked", { destination: "framework" })}
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("View the Model", "Voir le modèle")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>

          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <SectionEyebrow>{text("Evidence Base", "Base factuelle")}</SectionEyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl text-[#F4F1EA]">
              {text("Research Library", "Bibliothèque de recherche")}
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-[#718078]">
              {text("Strategic insights on cannabis governance, sustainable development, and economic transformation.", "Aperçus stratégiques sur la gouvernance du cannabis, le développement durable et la transformation économique.")}
            </p>
            <Link
              href="/research"
              onClick={() => trackEvent("consultancy_crosslink_clicked", { destination: "research" })}
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Browse Library", "Parcourir la bibliothèque")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
