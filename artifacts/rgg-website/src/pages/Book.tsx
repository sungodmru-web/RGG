import { lazy, Suspense, useState } from "react";
import { Link } from "wouter";

import { useBookContent } from "@/content/bookContent";
import bookEditions from "@/content/bookEditions.json";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/i18n/LanguageContext";

const RGGBook3D = lazy(() => import("@/components/book/RGGBook3D"));

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

function SectionNumber({ children }: { children: React.ReactNode }) {
  return <span className="font-serif text-lg text-[#8A713E]">{children}</span>;
}

export default function Book() {
  const { text } = useLanguage();
  const [expandedAnnex, setExpandedAnnex] = useState<string | null>(null);
  const requestedVisualTestView = new URLSearchParams(window.location.search).get(
    "book-visual-test",
  );
  const visualTestView =
    import.meta.env.DEV &&
    (requestedVisualTestView === "front" ||
    requestedVisualTestView === "spine" ||
    requestedVisualTestView === "back")
      ? requestedVisualTestView
      : undefined;
  const interactionTestMode =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("book-interaction-test");
  const {
    BOOK_META,
    PRACTICAL_TOOLKIT,
  } = useBookContent();
  const purchaseOptions = [
    ...bookEditions.map((edition) => ({
      title:
        edition.language === "English"
          ? text("English Edition", "Édition anglaise")
          : text("French Edition", "Édition française"),
      format:
        edition.format === "Hardcover"
          ? text("Hardcover", "Relié")
          : text("Paperback", "Broché"),
      edition: edition.id,
      cover:
        edition.id === "english-paperback"
          ? `${import.meta.env.BASE_URL}images/cover-front.png`
          : `${import.meta.env.BASE_URL}images/cover-${edition.id}.png`,
      href: edition.href,
    })),
    {
      title: text("English Comic Edition", "Édition bande dessinée anglaise"),
      format: text("Comic Edition", "Bande dessinée"),
      edition: "english-comic",
      cover: `${import.meta.env.BASE_URL}images/cover-english-comic.png`,
      href: null,
    },
  ];

  if (visualTestView) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080D09] p-8">
        <div className="w-[430px]">
          <Suspense fallback={null}>
            <RGGBook3D visualTestView={visualTestView} />
          </Suspense>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/book-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1440}
          height={1080}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.96)_0%,rgba(4,8,5,0.83)_42%,rgba(4,8,5,0.62)_68%,rgba(4,8,5,0.78)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050805]/75 via-transparent to-[#050805]/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-30"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-15%] top-[5%] h-[700px] w-[700px] rounded-full bg-[#0D3B2E]/20 blur-[110px]"
        />

        <div className="container relative z-10 mx-auto grid items-center gap-14 px-6 pb-24 pt-36 md:pt-40 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:pb-28">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Flagship Publication", "Publication phare")}
              </span>
            </div>

            <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em]">
              {text("Reclaiming", "Reconquérir")}
              <br />
              {text("the", "l'")}
              <span className="italic text-[#EDD99A]">
                {text("Green Gold", "or vert")}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {BOOK_META.subtitle}
            </p>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-[15px]">
              {text(
                "Reclaiming the Green Gold moves from history, science and public health to markets, governance, development pathways and future scenarios. It is designed for readers who need both strategic clarity and practical policy orientation.",
                "Reconquérir l'or vert passe de l'histoire, de la science et de la santé publique aux marchés, à la gouvernance, aux voies de développement et aux scénarios futurs. Il est conçu pour les lecteurs qui ont besoin à la fois de clarté stratégique et d'orientation politique pratique."
              )}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#editions"
                className="edition-cta-shine relative inline-flex min-h-12 items-center justify-between overflow-hidden border border-[#EDD99A] bg-[#C8A96B] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] sm:min-w-[190px]"
              >
                <span className="relative z-10">{text("View Editions", "Voir les éditions")}</span>
                <span aria-hidden="true" className="relative z-10 ml-6">
                  ↓
                </span>
              </a>
              <Link
                href="/formats"
                className="inline-flex min-h-12 items-center justify-between border border-[#405246] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A] sm:min-w-[190px]"
              >
                {text("View Formats & Licensing", "Voir les formats et licences")}{" "}
                <span aria-hidden="true" className="ml-6">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] lg:ml-auto lg:mr-0">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D3B2E]/35 blur-[90px]"
              />
              <div className="relative shadow-[0_50px_100px_rgba(0,0,0,0.48)]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-px -top-px z-10 h-12 w-12 border-l border-t border-[#C8A96B]/70"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-px -right-px z-10 h-12 w-12 border-b border-r border-[#C8A96B]/70"
                />
                <Suspense
                  fallback={
                    <div className="flex h-[430px] items-center justify-center border border-[#24382A] bg-[#09110C]/80 p-7 lg:h-[610px]">
                      <img
                        src={`${import.meta.env.BASE_URL}images/cover-front.png`}
                        alt={text("Cover of Reclaiming the Green Gold", "Couverture de Reconquérir l'or vert")}
                        width={900}
                        height={1350}
                        loading="eager"
                        fetchPriority="high"
                        className="max-h-full w-auto"
                      />
                    </div>
                  }
                >
                  <RGGBook3D
                    interactionTestMode={interactionTestMode}
                    cameraDistance={2.2}
                  />
                </Suspense>
              </div>
          </div>
        </div>
      </section>

      <section
        id="editions"
        aria-labelledby="purchase-editions-title"
        className="scroll-mt-24 border-b border-[#1A2E20] bg-[#080D09]"
      >
        <div className="container mx-auto px-6 py-20 md:py-28">
          <div className="mb-10 md:mb-14">
            <SectionEyebrow>
              {text("Choose Your Edition", "Choisissez votre édition")}
            </SectionEyebrow>
            <h2
              id="purchase-editions-title"
              className="font-serif text-[clamp(2.5rem,5vw,5rem)] leading-none tracking-[-0.035em] text-[#F4F1EA]"
            >
              {text("Available from", "Disponible sur")}{" "}
              <span className="italic text-[#EDD99A]">BookVault</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
                {purchaseOptions.map((option) => (
                  <article
                    key={option.edition}
                    data-edition={option.edition}
                    className="flex min-w-0 flex-col border border-[#24382A] bg-[#07100A] p-3 md:p-5"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-[#0B0B0B]">
                      <img
                        src={option.cover}
                        alt={`${option.title} — ${option.format}`}
                        width={900}
                        height={1350}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain object-top"
                      />
                    </div>
                    <div className="flex flex-1 flex-col pt-4">
                      <h3 className="font-serif text-base leading-tight text-[#F4F1EA] md:text-2xl">
                        {option.title}
                      </h3>
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8A7A55]">
                        {option.format}
                      </p>
                      {option.href ? (
                        <a
                          href={option.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() =>
                            trackEvent("book_purchase_link_clicked", {
                              edition: option.edition,
                              retailer: "bookvault",
                            })
                          }
                          className="mt-4 inline-flex min-h-11 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] md:mt-6 md:px-4 md:text-[10px]"
                        >
                          {text("Buy Now", "Acheter maintenant")}
                          <span aria-hidden="true" className="ml-2">↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title={text("Purchase link coming soon", "Lien d'achat bientôt disponible")}
                          className="mt-4 inline-flex min-h-11 cursor-not-allowed items-center justify-between border border-[#C8A96B]/50 bg-[#C8A96B]/55 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0B0B0B]/70 md:mt-6 md:px-4 md:text-[10px]"
                        >
                          {text("Buy Now", "Acheter maintenant")}
                          <span aria-hidden="true" className="ml-2">↗</span>
                        </button>
                      )}
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#07100A]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-8%] top-1/2 h-[580px] w-[580px] -translate-y-1/2 rounded-full border border-[#284631]/30"
        />
        <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl mb-16">
            <SectionEyebrow>{text("Inside the Book", "À l'intérieur du livre")}</SectionEyebrow>
            <h2 className="font-serif text-[clamp(2.6rem,5vw,5.2rem)] leading-[1.02] tracking-[-0.035em]">
              {text("From analysis to", "De l'analyse aux")}
              <br />
              <span className="italic text-[#EDD99A]">
                {text("practical application.", "applications pratiques.")}
              </span>
            </h2>
            <p className="mt-7 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
              {text(
                "The book concludes with practical annexes that help readers compare regulatory systems, understand market dynamics and assess national readiness for reform.",
                "Le livre se termine par des annexes pratiques qui aident les lecteurs à comparer les systèmes réglementaires, à comprendre la dynamique des marchés et à évaluer la préparation nationale à la réforme."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PRACTICAL_TOOLKIT.map((item, index) => {
              const isExpanded = expandedAnnex === item.number;
              const detailsId = `annex-details-${index + 1}`;

              return (
              <article
                key={item.number}
                className="flex h-full flex-col border border-[#1A2E20] bg-[#0B0B0B] p-7 md:p-8"
              >
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#C8A96B]">
                  {item.number}
                </span>
                <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#F4F1EA]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm font-light leading-7 text-[#718078]">
                  {item.description}
                </p>

                <button
                  type="button"
                  aria-controls={detailsId}
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedAnnex(isExpanded ? null : item.number)
                  }
                  className="mt-auto inline-flex min-h-11 items-center justify-between border-t border-[#1A2E20] pt-6 text-left text-[9px] font-bold uppercase tracking-[0.18em] text-[#EDD99A] transition-colors hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0B]"
                >
                  {isExpanded
                    ? text("Show less", "Réduire")
                    : text("Read more", "Lire la suite")}
                  <span
                    aria-hidden="true"
                    className={`ml-4 text-base transition-transform ${
                      isExpanded ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  id={detailsId}
                  hidden={!isExpanded}
                  className="border-t border-[#1A2E20] pt-5"
                >
                  {item.details.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-sm font-light leading-7 text-[#9AA79F] first:mt-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
