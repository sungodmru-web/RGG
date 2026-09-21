import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

import { trackEvent } from "@/lib/analytics";
import { useBookContent } from "@/content/bookContent";
import { useFrameworkContent } from "@/content/frameworkContent";
import { PublicationStatus } from "@/components/content/PublicationStatus";
import {
  BOOK_PUBLICATION_COPY,
  BOOK_PUBLICATION_COPY_FR,
} from "@/content/evidenceContent";

const RGGBook3D = lazy(() => import("@/components/book/RGGBook3D"));

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

function FadeIn({
  children,
  delay = 0,
  className = "",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isInView = useInView(ref, {
    once: true,
    margin: "-70px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.75,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { text, language } = useLanguage();
  const { BOOK_PARTS } = useBookContent();
  const { FRAMEWORK_INSTRUMENTS } = useFrameworkContent();
  const publicationCopy = language === "fr" ? BOOK_PUBLICATION_COPY_FR : BOOK_PUBLICATION_COPY;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [openBookPart, setOpenBookPart] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const panelCount = 5;

  const goToPanel = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetIndex = Math.max(0, Math.min(index, panelCount - 1));
    const target = container.querySelectorAll<HTMLElement>("section")[targetIndex];
    if (!target) return;
    container.focus({ preventScroll: true });
    container.scrollTo({
      left: target.offsetLeft,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
    setActivePanel(targetIndex);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let animationFrame = 0;
    const updateActivePanel = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const panels = Array.from(
          container.querySelectorAll<HTMLElement>("section"),
        );
        const closestIndex = panels.reduce((closest, panel, index) => {
          const currentDistance = Math.abs(panel.offsetLeft - container.scrollLeft);
          const closestDistance = Math.abs(
            panels[closest].offsetLeft - container.scrollLeft,
          );
          return currentDistance < closestDistance ? index : closest;
        }, 0);
        setActivePanel(closestIndex);
      });
    };
    container.addEventListener("scroll", updateActivePanel, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener("scroll", updateActivePanel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          'a, button, input, textarea, select, [contenteditable="true"]',
        )
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPanel(activePanel - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToPanel(activePanel + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, shouldReduceMotion]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] pt-[82px] text-[#F4F1EA]">
      <div className="relative h-[calc(100dvh-82px)]">
        <div
          ref={scrollContainerRef}
          aria-label={text("Homepage sections", "Sections de la page d’accueil")}
          tabIndex={0}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar overscroll-x-contain"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* PANEL 1: Welcome & Book */}
          <section className="min-w-full lg:min-w-[85vw] snap-start relative isolate h-full overflow-y-auto flex flex-col justify-start py-20 pb-32 max-[360px]:pt-0 md:justify-center md:py-0 border-r border-[#1A2E20]">
            <img
              src={`${import.meta.env.BASE_URL}images/home-cinematic-background.png`}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-50"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-[#0B0B0B]/40" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />

            <div className="container mx-auto px-6 relative z-10 lg:pl-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center min-h-max py-12 md:py-0">
              <FadeIn>
                <div className="mb-8 flex items-center gap-4">
                  <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                    {text("The Knowledge Platform", "La Plateforme de Connaissances")}
                  </span>
                </div>

                <h1 className="max-w-4xl font-serif text-[clamp(3.2rem,5.5vw,5.5rem)] leading-[0.92] tracking-[-0.04em] text-[#F4F1EA]">
                  {text("Reclaiming the ", "Reconquérir l'or ")}
                  <br />
                  <span className="italic text-[#EDD99A]">{text("Green Gold", "vert")}</span>
                </h1>

                <p className="mt-8 max-w-xl text-base font-light leading-8 text-[#B8B39F]">
                  {text("Cannabis at the crossroads of health, justice and sustainable development.", "Le cannabis au carrefour de la santé, de la justice et du développement durable.")}
                </p>

                <p className="mt-4 mb-10 max-w-2xl text-sm font-light leading-7 text-[#718078]">
                  {text("A publication and knowledge platform examining what it takes to move beyond legal reform toward credible institutions, inclusive economies and durable governance.", "Une publication et une plateforme de connaissances examinant ce qu'il faut pour aller au-delà de la réforme juridique vers des institutions crédibles, des économies inclusives et une gouvernance durable.")}
                </p>

                <Link
                  href="/book"
                  className="inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
                >
                  {text("Explore the Book", "Explorer le livre")} <span aria-hidden="true" className="ml-6">→</span>
                </Link>
              </FadeIn>

              <div className="flex justify-center lg:justify-end items-center pb-12 lg:pb-0">
                <FadeIn delay={0.2} className="relative shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                  <div className="w-[260px] md:w-[300px] xl:w-[360px]">
                    <Suspense fallback={<div className="h-[390px] md:h-[450px] bg-[#09110C] border border-[#1A2E20]" />}>
                      <RGGBook3D cameraDistance={2.2} />
                    </Suspense>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>

          {/* PANEL 2: Prologue */}
          <section
            className="relative flex h-full min-w-full snap-start flex-col justify-start overflow-y-auto border-r border-[#1A2E20] bg-[#0B0B0B] bg-cover bg-center bg-no-repeat py-20 pb-32 md:justify-center md:py-0 lg:min-w-[85vw]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6, 10, 7, 0.78), rgba(11, 11, 11, 0.92)), url("/images/home-prologue-background.jpeg")',
            }}
          >
            <div className="container mx-auto px-6 lg:px-16 relative z-10 grid -translate-y-8 md:-translate-y-12 lg:grid-cols-[0.78fr_1.22fr] gap-12 lg:gap-24 items-center">
              <FadeIn className="lg:border-r lg:border-[#1A2E20] lg:pr-16">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-xl font-serif text-[#9A7A3A]">01</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                    {text("From the Manuscript", "Extrait du manuscrit")}
                  </span>
                </div>

                <h2 className="font-serif text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[0.98] tracking-[-0.03em] mb-8">
                  {text("Transforming Challenge", "Transformer le défi")}
                  <br />
                  <span className="italic text-[#EDD99A]">
                    {text("into Opportunity", "en opportunité")}
                  </span>
                </h2>

                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#718078]">
                  {text("Prologue", "Prologue")} · {text("May 2026", "Mai 2026")}
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="max-w-2xl">
                  <p className="font-serif text-xl leading-9 text-[#C8C5B3] md:text-2xl md:leading-10">
                    {text(
                      "Across the developing world, cannabis is being legalised faster than it is being governed. Licences are issued before laboratories exist. Export frameworks are announced before certification systems are built.",
                      "Dans l’ensemble du monde en développement, le cannabis est légalisé plus rapidement qu’il n’est gouverné. Des licences sont délivrées avant que les laboratoires n’existent. Des cadres d’exportation sont annoncés avant la mise en place des systèmes de certification.",
                    )}
                  </p>

                  <p className="mt-6 text-sm font-light leading-7 text-[#718078]">
                    {text(
                      "The gap between legislative ambition and institutional reality is not a minor detail—it is the defining challenge of this transition, and the reason this book was written.",
                      "L’écart entre l’ambition législative et la réalité institutionnelle n’est pas un détail mineur : il constitue le défi déterminant de cette transition et la raison pour laquelle ce livre a été écrit.",
                    )}
                  </p>

                  <blockquote className="mt-8 border-l border-[#C8A96B] pl-6">
                    <p className="font-serif text-2xl italic leading-tight text-[#EDD99A] md:text-3xl">
                      {text(
                        "“Legalisation is the easy part. Readiness is the work.”",
                        "« La légalisation est la partie facile. Le véritable travail consiste à être prêt. »",
                      )}
                    </p>
                    <footer className="mt-5 text-[9px] font-bold uppercase leading-5 tracking-[0.18em] text-[#8A7A55]">
                      Soobaschand (Sunil) Sweenarain
                      <br />
                      Sunny Sweenarain
                    </footer>
                  </blockquote>

                  <Link
                    href="/book"
                    className="mt-8 inline-flex min-h-12 items-center justify-between border border-[#405246] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
                  >
                    {text("Discover the Book", "Découvrir le livre")}{" "}
                    <span aria-hidden="true" className="ml-6">→</span>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* PANEL 3: Central Thesis */}
          <section
            className="min-w-full snap-start overflow-y-auto border-r border-[#1A2E20] bg-[#080D09] bg-cover bg-center bg-no-repeat py-20 pb-32 lg:min-w-[85vw] md:flex md:h-full md:flex-col md:justify-center md:py-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6, 10, 7, 0.8), rgba(8, 13, 9, 0.94)), url("/images/home-central-thesis-background.jpg")',
            }}
          >
            <div className="container mx-auto grid items-start gap-10 px-6 lg:grid-cols-[0.3fr_1fr] lg:gap-20 lg:px-16">
              <FadeIn>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-xl text-[#9A7A3A]">02</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                    {text("Central Thesis", "Thèse centrale")}
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <blockquote className="max-w-5xl font-serif text-[clamp(2.4rem,4.8vw,4.8rem)] leading-[1.06] tracking-[-0.035em] text-[#F4F1EA]">
                  {text(
                    "Reform is not merely the removal of prohibition.",
                    "La réforme ne consiste pas simplement à supprimer la prohibition.",
                  )}
                  <span className="italic text-[#EDD99A]">
                    {" "}
                    {text(
                      "It is the construction of governance.",
                      "C'est la mise en place d'une gouvernance.",
                    )}
                  </span>
                </blockquote>
                <p className="mt-8 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                  {text(
                    "Twenty chapters. Five integrated parts. One central question: how can cannabis reform deliver credible, inclusive and sustainable public value? The central question is not simply whether cannabis policy should change, but how institutions can translate reform into credible public health, justice, economic and governance outcomes.",
                    "Vingt chapitres. Cinq parties intégrées. Une question centrale : comment la réforme du cannabis peut-elle produire une valeur publique crédible, inclusive et durable ? La question centrale n'est pas simplement de savoir si la politique en matière de cannabis doit changer, mais comment les institutions peuvent traduire la réforme en résultats crédibles en matière de santé publique, de justice, d'économie et de gouvernance.",
                  )}
                </p>
              </FadeIn>
            </div>
          </section>

          {/* PANEL 4: Global Handbook Series */}
          <section
            className="relative isolate h-full min-w-full snap-start overflow-hidden border-r border-[#1A2E20] bg-[#07100A] bg-cover bg-center bg-no-repeat p-3 pb-24 md:p-6 md:pb-20 lg:min-w-[85vw]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6, 10, 7, 0.68), rgba(7, 16, 10, 0.9)), url("/images/home-handbook-series-background.jpg")',
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/rgg-global-handbook-series.jpeg`}
              alt={text(
                "Reclaiming the Green Gold global handbook series in English and French, available in standard, comic, Kindle and licensed PDF formats",
                "Série mondiale Reclaiming the Green Gold en anglais et en français, disponible en éditions standard, bande dessinée, Kindle et PDF sous licence",
              )}
              width={1254}
              height={1254}
              loading="lazy"
              decoding="async"
              className="mx-auto aspect-square h-auto max-h-full w-auto max-w-full object-contain"
            />
          </section>

          {/* PANEL 5: Explore the Platform */}
          <section
            className="min-w-full snap-start overflow-y-auto bg-[#080D09] bg-cover bg-center bg-no-repeat py-20 pb-32 lg:min-w-[85vw] md:flex md:h-full md:flex-col md:justify-center md:py-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6, 10, 7, 0.8), rgba(8, 13, 9, 0.94)), url("/images/home-platform-background.jpeg")',
            }}
          >
            <div className="container relative z-10 mx-auto grid gap-12 px-6 lg:grid-cols-3 lg:gap-12 lg:px-16">
              {[
                {
                  eyebrow: text("The Authors", "Les auteurs"),
                  title: text("The people behind the work.", "Les personnes derrière l'ouvrage."),
                  description: text(
                    "Explore the authors, their perspectives and the experience informing Reclaiming the Green Gold.",
                    "Découvrez les auteurs, leurs perspectives et l'expérience qui nourrissent Reconquérir l'or vert.",
                  ),
                  href: "/authors",
                  cta: text("Meet the Authors", "Rencontrer les auteurs"),
                },
                {
                  eyebrow: text("Global Economy", "Économie mondiale"),
                  title: text("Market dynamics & value chains.", "Dynamique des marchés et chaînes de valeur."),
                  description: text(
                    "Data and comparative analysis of cannabis markets, regulatory regimes, and trade dynamics worldwide.",
                    "Données et analyse comparative des marchés du cannabis, des régimes réglementaires et de la dynamique commerciale à l'échelle mondiale.",
                  ),
                  href: "/economy",
                  cta: text("Explore Economy", "Explorer l'économie"),
                },
                {
                  eyebrow: text("Beyond the Publication", "Au-delà de la publication"),
                  title: text("The conversation continues.", "La conversation continue."),
                  description: text(
                    "Research & Insights extends the ideas of the book through new papers, analysis, commentary and policy work.",
                    "La section Recherche et perspectives prolonge les idées du livre à travers de nouveaux articles, analyses, commentaires et travaux d'action publique.",
                  ),
                  href: "/research",
                  cta: text("Explore Research", "Explorer la recherche"),
                },
              ].map((item, index) => (
                <FadeIn
                  key={item.href}
                  delay={index * 0.12}
                  className={index > 0 ? "border-t border-[#1A2E20] pt-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" : ""}
                >
                  <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                    {item.eyebrow}
                  </p>
                  <h2 className="max-w-xl font-serif text-3xl leading-tight tracking-[-0.03em] md:text-4xl">
                    {item.title}
                  </h2>
                  <p className="mt-6 max-w-lg text-sm font-light leading-7 text-[#718078]">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-8 inline-flex items-center border-b border-[#C8A96B]/60 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
                  >
                    {item.cta}
                    <span aria-hidden="true" className="ml-3">→</span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-t from-[#050805] to-transparent pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#56685D] pointer-events-auto flex items-center gap-4">
          <span className="hidden md:inline">{text("Scroll or drag horizontally", "Faites défiler horizontalement")}</span>
        </div>

        <div
          className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 gap-2"
          aria-label={text("Section progress", "Progression des sections")}
        >
          {Array.from({ length: panelCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToPanel(index)}
              aria-label={text(
                `Go to section ${index + 1}`,
                `Aller à la section ${index + 1}`,
              )}
              aria-current={activePanel === index ? "step" : undefined}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                activePanel === index
                  ? "border-[#EDD99A] bg-[#C8A96B]"
                  : "border-[#56685D] bg-[#0B0B0B]"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => goToPanel(activePanel - 1)}
            aria-label={text("Previous section", "Section précédente")}
            className="flex h-12 w-12 items-center justify-center border border-[#1A2E20] bg-[#0B0B0B] text-[#A98C50] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
          >
            ←
          </button>
          <button
            onClick={() => goToPanel(activePanel + 1)}
            aria-label={text("Next section", "Section suivante")}
            className="flex h-12 w-12 items-center justify-center border border-[#1A2E20] bg-[#0B0B0B] text-[#A98C50] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
          >
            →
          </button>
        </div>
        </div>
      </div>

      <section
        id="book-contents"
        className="scroll-mt-24 border-t border-[#1A2E20] bg-[#080D09]"
      >
        <div className="container mx-auto grid gap-12 px-6 py-24 md:py-32 lg:grid-cols-[0.34fr_1fr] lg:gap-20">
          <FadeIn>
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("The Five-Part Structure", "La structure en cinq parties")}
            </p>
            <h2 className="max-w-sm font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
              {text("A progressive journey.", "Un parcours progressif.")}
            </h2>
            <p className="mt-6 max-w-sm text-sm font-light leading-7 text-[#718078]">
              {text(
                "From the historical and cultural foundations of cannabis to the governance systems required for future-ready reform.",
                "Des fondements historiques et culturels du cannabis aux systèmes de gouvernance requis pour une réforme tournée vers l'avenir.",
              )}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="border-t border-[#26382C]">
              {BOOK_PARTS.map((part, index) => {
                const isOpen = openBookPart === index;
                return (
                  <article
                    key={`${part.title}-${index}`}
                    className="border-b border-[#26382C]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenBookPart(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-start gap-6 py-7 text-left md:gap-10 md:py-9"
                    >
                      <span className="mt-1 shrink-0 font-serif text-sm text-[#8A713E]">
                        {text("Part", "Partie")}{" "}
                        {part.number ?? String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-2xl tracking-[-0.02em] text-[#F4F1EA] transition-colors group-hover:text-[#EDD99A] md:text-3xl">
                          {part.title}
                        </span>
                        {part.subtitle && (
                          <span className="mt-2 block text-xs uppercase tracking-[0.15em] text-[#65736B]">
                            {part.subtitle}
                          </span>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-1 shrink-0 text-xl text-[#A98C50] transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-10 pl-10 md:pl-[4.6rem]">
                            {part.description && (
                              <p className="max-w-2xl text-sm font-light leading-7 text-[#718078]">
                                {part.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
