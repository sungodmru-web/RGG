import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";

import { useFrameworkContent } from "@/content/frameworkContent";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Framework() {
  const [activeLayer, setActiveLayer] = useState(0);
  const layerTabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const { text } = useLanguage();
  const {
    FRAMEWORK_ARGUMENT,
    FRAMEWORK_ARGUMENT_CARDS,
    FRAMEWORK_INSTRUMENTS,
    FRAMEWORK_META,
    GOVERNANCE_LAYERS,
    SELF_ASSESSMENT_CLUSTERS,
    SELF_ASSESSMENT_SCORING,
    COMPARATIVE_MODELS,
  } = useFrameworkContent();

  const selectedLayer = GOVERNANCE_LAYERS[activeLayer];

  const selectLayer = (index: number) => {
    setActiveLayer(index);
    trackEvent("framework_layer_selected", {
      layer: GOVERNANCE_LAYERS[index].number,
      title: GOVERNANCE_LAYERS[index].title,
      index,
    });
  };

  const selectAndFocusLayer = (index: number) => {
    selectLayer(index);
    layerTabsRef.current[index]?.focus();
  };

  const handleLayerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % GOVERNANCE_LAYERS.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex =
        (index - 1 + GOVERNANCE_LAYERS.length) % GOVERNANCE_LAYERS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = GOVERNANCE_LAYERS.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectAndFocusLayer(nextIndex);
    }
  };

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative min-h-[78vh] overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/framework-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1440}
          height={1080}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.97)_0%,rgba(4,8,5,0.9)_38%,rgba(4,8,5,0.55)_68%,rgba(4,8,5,0.42)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050805]/75 via-transparent to-[#050805]/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-30"
        />

        <div className="container relative z-10 mx-auto flex min-h-[78vh] items-center px-6 pb-24 pt-36 md:pt-40">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <Eyebrow>{text("Governance Transition Model", "Modèle de transition de la gouvernance")}</Eyebrow>
            </div>
            <h1
              data-testid="text-framework-title"
              className="font-serif text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.94] tracking-[-0.045em]"
            >
              {text("Reform is a", "La réforme est une")}
              <br />
              <span className="italic text-[#EDD99A]">{text("governance transition.", "transition de gouvernance.")}</span>
            </h1>
            <p className="mt-9 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "A seven-layer institutional framework for moving from legal reform toward durable, legitimate and adaptive cannabis governance.",
                "Un cadre institutionnel à sept niveaux pour passer de la réforme juridique à une gouvernance durable, légitime et adaptative du cannabis."
              )}
            </p>
            <a
              href="#layers"
              data-testid="link-explore-layers"
              onClick={() =>
                trackEvent("framework_cta_clicked", {
                  action: "explore_layers",
                  location: "framework_hero",
                })
              }
              className="mt-10 inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] sm:min-w-[210px]"
            >
              {text("Explore the layers", "Explorer les niveaux")} <span aria-hidden="true" className="ml-6">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-20 md:py-28">
          <div className="mb-14 text-center">
            <Eyebrow>{text("Core Value Assets", "Actifs de valeur fondamentaux")}</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl md:text-5xl text-[#F4F1EA]">
              {text("The Four Pillars of the Knowledge Platform", "Les quatre piliers de la plateforme de connaissances")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FRAMEWORK_INSTRUMENTS.map((instrument, i) => (
              <a
                key={i}
                href={instrument.href}
                className="group flex flex-col border border-[#1A2E20] bg-[#080D09] p-8 transition-colors hover:border-[#C8A96B] hover:bg-[#0A120D]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#102219]">
                  <span className="text-[#C8A96B]">0{i + 1}</span>
                </div>
                <h3 className="mb-4 font-serif text-xl text-[#EDD99A] group-hover:text-[#F4F1EA]">
                  {instrument.title}
                </h3>
                <p className="mb-8 text-sm font-light leading-relaxed text-[#8D988F]">
                  {instrument.description}
                </p>
                <div className="mt-auto border-b border-[#405246] pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors group-hover:border-[#C8A96B] group-hover:text-[#EDD99A] self-start">
                  {instrument.linkText} <span aria-hidden="true" className="ml-2">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <Eyebrow>{FRAMEWORK_ARGUMENT.eyebrow}</Eyebrow>
              <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[1.06] tracking-[-0.035em] text-[#EDD99A] md:text-6xl">
                {FRAMEWORK_ARGUMENT.title}
              </h2>
              <p
                data-testid="text-framework-argument-lead"
                className="mt-8 max-w-xl text-lg font-light leading-8 text-[#F4F1EA]"
              >
                {FRAMEWORK_ARGUMENT.lead}
              </p>
              <p className="mt-5 max-w-xl text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {FRAMEWORK_ARGUMENT.description}
              </p>
            </div>

            <div className="border-t border-[#26382C]">
              {FRAMEWORK_ARGUMENT_CARDS.map((card, index) => (
                <article
                  key={card.label}
                  data-testid={`card-framework-argument-${index + 1}`}
                  className="grid gap-5 border-b border-[#26382C] py-9 md:grid-cols-[72px_1fr] md:py-11"
                >
                  <span className="font-serif text-lg text-[#8A713E]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#F4F1EA]">
                      {card.label}
                    </h3>
                    <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-[15px]">
                      {card.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="layers"
        className="scroll-mt-24 border-b border-[#1A2E20] bg-[#080D09]"
      >
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl">
            <Eyebrow>{FRAMEWORK_META.eyebrow}</Eyebrow>
            <h2
              data-testid="text-governance-layers-title"
              className="mt-6 font-serif text-[clamp(2.8rem,6vw,6rem)] leading-[0.98] tracking-[-0.04em]"
            >
              {FRAMEWORK_META.title}
            </h2>
            <p className="mt-8 max-w-3xl text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
              {FRAMEWORK_META.description}
            </p>
          </div>

          <div className="mt-16 grid border border-[#26382C] lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className="border-b border-[#26382C] lg:border-b-0 lg:border-r"
              role="tablist"
              aria-label={text("Governance layers", "Niveaux de gouvernance")}
            >
              {GOVERNANCE_LAYERS.map((layer, index) => {
                const isActive = activeLayer === index;
                return (
                  <button
                    ref={(element) => {
                      layerTabsRef.current[index] = element;
                    }}
                    key={layer.number}
                    id={`layer-tab-${layer.number}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-pressed={isActive}
                    aria-controls="layer-panel"
                    data-testid={`button-framework-layer-${layer.number}`}
                    onClick={() => selectLayer(index)}
                    onKeyDown={(event) => handleLayerKeyDown(event, index)}
                    className={`group grid w-full grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[#1A2E20] px-5 py-5 text-left transition-colors last:border-b-0 sm:px-7 ${
                      isActive ? "bg-[#102219]" : "hover:bg-[#0D1711]"
                    }`}
                  >
                    <span className="font-mono text-[10px] tracking-wider text-[#8A713E]">
                      {layer.number}
                    </span>
                    <span
                      className={`font-serif text-lg transition-colors md:text-xl ${
                        isActive ? "text-[#EDD99A]" : "text-[#C8C5B3] group-hover:text-[#F4F1EA]"
                      }`}
                    >
                      {layer.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`text-[#A98C50] transition-transform ${isActive ? "translate-x-1" : ""}`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-[420px] overflow-hidden p-8 sm:p-12 md:min-h-[500px] md:p-16">
              <span
                aria-hidden="true"
                className="absolute -bottom-16 -right-4 select-none font-serif text-[14rem] leading-none text-[#C8A96B]/[0.035] md:text-[22rem]"
              >
                {selectedLayer.number}
              </span>
              <AnimatePresence mode="wait">
                <motion.article
                  key={selectedLayer.number}
                  id="layer-panel"
                  role="tabpanel"
                  aria-labelledby={`layer-tab-${selectedLayer.number}`}
                  data-testid={`panel-framework-layer-${selectedLayer.number}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24 }}
                  className="relative z-10 flex h-full flex-col"
                >
                  <span className="font-mono text-xs tracking-[0.22em] text-[#A98C50]">
                    {text("Layer", "Niveau")} {selectedLayer.number}
                  </span>
                  <h3 className="mt-10 max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
                    {selectedLayer.title}
                  </h3>
                  <p className="mt-8 max-w-xl text-base font-light leading-8 text-[#8D988F] md:text-lg">
                    {selectedLayer.description}
                  </p>
                  <div className="mt-auto pt-12 text-[9px] uppercase tracking-[0.22em] text-[#56685D]">
                    {activeLayer + 1} {text("of", "sur")} {GOVERNANCE_LAYERS.length}
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>

          <blockquote className="mt-20 border-l border-[#C8A96B] py-2 pl-7 font-serif text-3xl italic leading-tight text-[#EDD99A] md:max-w-4xl md:text-5xl">
            “{FRAMEWORK_META.coreArgument}”
          </blockquote>
        </div>
      </section>

      <section
        id="self-assessment"
        className="scroll-mt-24 border-b border-[#1A2E20] bg-[#0B0B0B]"
      >
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl mb-16">
            <Eyebrow>{text("Practical Diagnostic Tool", "Outil de diagnostic pratique")}</Eyebrow>
            <h2 className="mt-6 font-serif text-[clamp(2.5rem,5vw,5rem)] leading-[1] tracking-[-0.03em] text-[#F4F1EA]">
              {text("National Cannabis Economy Self-Assessment Framework", "Cadre national d'auto-évaluation de l'économie du cannabis")}
            </h2>
            <p className="mt-8 text-base font-light leading-8 text-[#8D988F] md:text-lg">
              {text(
                "A guided toolkit for multi-ministry teams, organised across 13 readiness dimensions in three clusters. The framework helps governments assess institutional strengths, identify critical gaps, and sequence reforms realistically — following the logic: Assess → Score → Interpret → Prioritise → Act → Review.",
                "Une boîte à outils guidée pour les équipes interministérielles, organisée autour de 13 dimensions de préparation réparties en trois groupes. Le cadre aide les gouvernements à évaluer les forces institutionnelles, à identifier les lacunes critiques et à séquencer les réformes de manière réaliste — en suivant la logique : Évaluer → Noter → Interpréter → Prioriser → Agir → Réviser."
              )}
            </p>
          </div>

          <div className="space-y-16">
            {SELF_ASSESSMENT_CLUSTERS.map((cluster, clusterIndex) => (
              <div key={clusterIndex}>
                <h3 className="mb-8 border-b border-[#1A2E20] pb-4 font-serif text-2xl text-[#EDD99A]">
                  {cluster.title}
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {cluster.dimensions.map((dim) => (
                    <div key={dim.number} className="border border-[#1A2E20] bg-[#080D09] p-6">
                      <div className="mb-3 font-mono text-[10px] tracking-wider text-[#A98C50]">
                        {text("Dimension", "Dimension")} {dim.number}
                      </div>
                      <h4 className="mb-3 font-serif text-lg leading-snug text-[#F4F1EA]">
                        {dim.title}
                      </h4>
                      <p className="text-sm font-light leading-relaxed text-[#718078]">
                        {dim.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-[#26382C] bg-[#0D1711] p-8 md:p-10">
            <h4 className="mb-6 font-serif text-xl text-[#F4F1EA]">
              {text("Assessment Scoring Matrix", "Matrice de notation de l'évaluation")}
            </h4>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {SELF_ASSESSMENT_SCORING.map((score, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-bold text-sm text-[#EDD99A] mb-1">
                    {score.label}
                  </span>
                  <span className="text-sm font-light text-[#718078]">
                    {score.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="comparative-models"
        className="scroll-mt-24 border-b border-[#1A2E20] bg-[#080D09]"
      >
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl mb-16">
            <Eyebrow>{text("Annex 3", "Annexe 3")}</Eyebrow>
            <h2 className="mt-6 font-serif text-[clamp(2.5rem,5vw,5rem)] leading-[1] tracking-[-0.03em] text-[#F4F1EA]">
              {text("Comparative Analysis of Cannabis Governance Models", "Analyse comparative des modèles de gouvernance du cannabis")}
            </h2>
            <p className="mt-8 text-base font-light leading-8 text-[#8D988F] md:text-lg">
              {text(
                "Examines how countries have designed and operated their regulatory systems across the governance spectrum — from prohibition through medical access to commercial legalisation.",
                "Examine comment les pays ont conçu et exploité leurs systèmes de réglementation à travers le spectre de la gouvernance — de la prohibition à l'accès médical jusqu'à la légalisation commerciale."
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {COMPARATIVE_MODELS.map((model, i) => (
              <div key={i} className="border border-[#1A2E20] bg-[#0B0B0B] p-6 text-center hover:border-[#405246] transition-colors">
                <span className="block mb-2 text-xs font-bold uppercase tracking-wider text-[#A98C50]">
                  {model.country}
                </span>
                <span className="text-sm font-light text-[#F4F1EA]">
                  {model.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto grid gap-12 px-6 py-24 md:py-32 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <Eyebrow>{text("Transition & Sequencing", "Transition et séquençage")}</Eyebrow>
            <h2 className="mt-6 max-w-lg font-serif text-4xl leading-[1.06] tracking-[-0.035em] text-[#EDD99A] md:text-6xl">
              {text("Governance layers are interdependent.", "Les niveaux de gouvernance sont interdépendants.")}
            </h2>
          </div>
          <div className="self-end border-l border-[#C8A96B]/60 pl-7 md:pl-10">
            <p className="max-w-3xl font-serif text-2xl leading-relaxed text-[#F4F1EA] md:text-3xl">
              {FRAMEWORK_META.description}
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-48 top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full border border-[#284631]/25"
        />
        <div className="container relative z-10 mx-auto grid items-center gap-14 px-6 py-24 md:py-32 lg:grid-cols-[1fr_0.56fr] lg:gap-24">
          <div>
            <Eyebrow>{text("Connection to the Book", "Lien avec l'ouvrage")}</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.04] tracking-[-0.035em] md:text-6xl">
              {text("A Governance Handbook,", "Un manuel de gouvernance,")}
              <br />
              <span className="italic text-[#EDD99A]">{text("Not a Legal Manifesto.", "Pas un manifeste juridique.")}</span>
            </h2>
            <p className="mt-7 max-w-2xl text-base font-light leading-8 text-[#8D988F]">
              {text(
                "“Cannabis reform is not a binary legal choice. It is a governance transition.”",
                "« La réforme du cannabis n'est pas un choix juridique binaire. C'est une transition de gouvernance. »"
              )}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                onClick={() =>
                  trackEvent("framework_crosslink_clicked", {
                    destination: "book",
                    label: "view_the_book",
                  })
                }
                className="inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] sm:min-w-[190px]"
              >
                {text("View the Book", "Voir l'ouvrage")} <span aria-hidden="true" className="ml-6">→</span>
              </Link>
              <Link
                href="/book"
                onClick={() =>
                  trackEvent("framework_crosslink_clicked", {
                    destination: "book",
                    label: "explore_the_book",
                  })
                }
                className="inline-flex min-h-12 items-center justify-between border border-[#405246] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A] sm:min-w-[190px]"
              >
                {text("Explore the Book", "Explorer l'ouvrage")} <span aria-hidden="true" className="ml-6">→</span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[300px] lg:mr-0">
            <div className="border border-[#26382C] bg-[#09110C] p-4 shadow-[0_35px_80px_rgba(0,0,0,0.45)]">
              <img
                src={`${import.meta.env.BASE_URL}images/cover-front.png`}
                alt={text("Cover of Reclaiming the Green Gold", "Couverture de Reconquérir l'or vert")}
                width={800}
                height={1142}
                loading="lazy"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0B]">
        <div className="container mx-auto grid gap-px border-l border-t border-[#1A2E20] bg-[#1A2E20] md:grid-cols-3">
          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <Eyebrow>{text("Research", "Recherche")}</Eyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl">
              {text("Continue through research and analysis.", "Poursuivre par la recherche et l'analyse.")}
            </h2>
            <Link
              href="/research"
              onClick={() =>
                trackEvent("framework_crosslink_clicked", {
                  destination: "research",
                })
              }
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Research", "Recherche")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>

          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <Eyebrow>{text("Economy", "Économie")}</Eyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl">
              {text("Explore global market dynamics.", "Explorer la dynamique du marché mondial.")}
            </h2>
            <Link
              href="/economy"
              onClick={() =>
                trackEvent("framework_crosslink_clicked", {
                  destination: "economy",
                })
              }
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Economy", "Économie")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>

          <article className="bg-[#0B0B0B] p-8 md:p-10 lg:p-14">
            <Eyebrow>{text("Consultancy", "Conseil")}</Eyebrow>
            <h2 className="mt-6 font-serif text-3xl tracking-[-0.025em] md:text-4xl">
              {text("Apply the framework institutionally.", "Appliquer le cadre sur le plan institutionnel.")}
            </h2>
            <Link
              href="/consultancy"
              onClick={() =>
                trackEvent("framework_crosslink_clicked", {
                  destination: "consultancy",
                })
              }
              className="mt-10 inline-flex border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              {text("Consultancy", "Conseil")} <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}