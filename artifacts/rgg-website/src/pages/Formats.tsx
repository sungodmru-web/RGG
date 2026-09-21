import { Link } from "wouter";
import { PublicationStatus } from "@/components/content/PublicationStatus";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Formats() {
  const { text } = useLanguage();

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/formats-trichomes-background.jpg`}
          alt=""
          aria-hidden="true"
          width={800}
          height={400}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,5,0.96)_0%,rgba(4,8,5,0.85)_42%,rgba(4,8,5,0.58)_70%,rgba(4,8,5,0.72)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050805]/70 via-transparent to-[#050805]/90"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-25"
        />
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pt-40">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 items-center">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                  {text("Formats & Licensing", "Formats et licences")}
                </span>
              </div>
              <h1 className="font-serif text-[clamp(3rem,6vw,5.5rem)] leading-[0.94] tracking-[-0.04em]">
                {text("Access options for readers, institutions and ", "Options d'accès pour les lecteurs, les institutions et ")}<span className="italic text-[#EDD99A]">{text("policy leaders.", "les responsables publics.")}</span>
              </h1>
              <p className="mt-8 text-lg font-medium text-[#C8A96B]">
                {text(
                  "The handbook is designed for individual learning, institutional use, policy dialogue and capacity-building.",
                  "Le manuel est conçu pour l'apprentissage individuel, l'utilisation institutionnelle, le dialogue politique et le renforcement des capacités."
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm font-light leading-7 text-[#B8B39F]">
                {text("This page outlines how ", "Cette page explique comment ")}<span className="italic">Reclaiming the Green Gold</span>{text(
                  " can be accessed in different formats and how digital, print, and institutional options may be structured.",
                  " peut être accessible sous différents formats et comment les options numériques, imprimées et institutionnelles peuvent être structurées."
                )}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#formats"
                  className="inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A] sm:min-w-[190px]"
                >
                  {text("Explore Formats ↓", "Explorer les formats ↓")}
                </a>
                <a
                  href="#licensing"
                  className="inline-flex min-h-12 items-center justify-between border border-[#405246] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A] sm:min-w-[190px]"
                >
                  {text("View Licensing ↓", "Voir les licences ↓")}
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[400px]">
               <div className="border border-[#24382A] bg-[#09110C]/80 p-5 shadow-[0_50px_100px_rgba(0,0,0,0.48)] sm:p-7">
                <img
                  src={`${import.meta.env.BASE_URL}images/cover-front.png`}
                  alt={text("Cover of Reclaiming the Green Gold", "Couverture de Reclaiming the Green Gold")}
                  width={900}
                  height={1350}
                  loading="eager"
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicationStatus />

      {/* Formats Section */}
      <section id="formats" className="scroll-mt-24 border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Proposed Formats", "Formats proposés")}</SectionEyebrow>
          <h2 className="mb-6 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("Formats Under Review", "Formats en cours d'examen")}
          </h2>
          <p className="mb-16 max-w-2xl text-sm font-light leading-7 text-[#718078]">
            {text(
              "Information on edition availability and formats will be provided closer to publication. No purchase destination or pricing structure has been finalised.",
              "Les informations sur la disponibilité et les formats des éditions seront communiquées à l’approche de la publication. Aucun point de vente n’a été défini et aucune grille tarifaire n’a été arrêtée."
            )}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: text("Proposed: Licensed PDF", "Proposé : PDF sous licence"),
                desc: text(
                  "Secure digital copy for individual use. Fully searchable text and diagrams optimized for on-screen reading and professional reference.",
                  "Exemplaire numérique sécurisé pour usage individuel. Texte et diagrammes entièrement consultables, optimisés pour la lecture à l'écran et la référence professionnelle."
                ),
                features: [
                  text("Searchable full text", "Texte intégral consultable"),
                  text("Optimized graphics", "Illustrations optimisées"),
                  text("Compatible across devices", "Compatible avec plusieurs appareils")
                ]
              },
              { 
                title: text("Proposed: Hard Copy Edition", "Proposé : Édition imprimée"),
                desc: text(
                  "Premium case-bound edition for libraries, offices and institutional archives. High-quality paper stock for durability.",
                  "Édition reliée premium pour les bibliothèques, les bureaux et les archives institutionnelles. Papier de haute qualité conçu pour durer."
                ),
                features: [
                  text("Library-grade binding", "Reliure adaptée aux bibliothèques"),
                  text("High-contrast diagrams", "Diagrammes à contraste élevé"),
                  text("Archival quality", "Qualité d'archivage")
                ]
              },
              { 
                title: text("Proposed: eBook / Kindle", "Proposé : Livre électronique / Kindle"),
                desc: text(
                  "Reflowable text format optimized for e-readers and mobile devices. Supports highlights, notes and accessibility features.",
                  "Format de texte à mise en page adaptative optimisé pour les liseuses et les appareils mobiles. Prend en charge les surlignages, les notes et les fonctionnalités d'accessibilité."
                ),
                features: [
                  text("Reflowable text", "Texte redistribuable"),
                  text("Adjustable typography", "Typographie ajustable"),
                  text("Highlighting support", "Prise en charge du surlignage")
                ]
              },
              { 
                title: text("Proposed: Executive Summary", "Proposé : Résumé exécutif"),
                desc: text(
                  "Condensed edition focusing purely on actionable frameworks, matrices and policy recommendations for busy leaders.",
                  "Édition condensée se concentrant uniquement sur des cadres exploitables, des matrices et des recommandations d'action publique pour les responsables aux agendas chargés."
                ),
                features: [
                  text("Core frameworks", "Cadres de base"),
                  text("Actionable matrices", "Matrices exploitables"),
                  text("Briefing format", "Format de note de synthèse")
                ]
              }
            ].map((format, i) => (
              <div key={i} className="border border-[#1A2E20] bg-[#07100A] p-8 flex flex-col">
                <h3 className="mb-4 font-serif text-2xl text-[#C8A96B]">{format.title}</h3>
                <p className="mb-8 text-sm font-light leading-7 text-[#B8B39F] flex-grow">
                  {format.desc}
                </p>
                <ul className="space-y-3 border-t border-[#1A2E20] pt-6 text-xs font-light text-[#718078]">
                  {format.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-[#C8A96B]" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Licensing Section */}
      <section id="licensing" className="scroll-mt-24 border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Access Models", "Modèles d'accès")}</SectionEyebrow>
          <h2 className="mb-6 font-serif text-4xl tracking-[-0.03em] md:text-5xl">
            {text("Institutional & Policy Licensing", "Licences institutionnelles et politiques")}
          </h2>
          <p className="mb-16 max-w-2xl text-sm font-light leading-7 text-[#718078]">
            {text(
              "These are prospective access models for discussion only. No licence, distribution right, price, product, or service commitment is currently offered.",
              "Il s’agit de modèles d’accès envisagés, proposés uniquement à la discussion. Aucune licence, aucun droit de distribution, aucun prix, aucun produit ni aucun engagement de service n’est actuellement proposé."
            )}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: text("Academic & Research", "Universités et recherche"),
                desc: text(
                  "For universities, think tanks and research institutes requiring access across faculties and student bodies.",
                  "Pour les universités, les groupes de réflexion et les instituts de recherche ayant besoin d'un accès dans plusieurs facultés et pour les étudiants."
                )
              },
              {
                title: text("Policy & Institutional", "Politiques publiques et institutions"),
                desc: text(
                  "For government ministries, regulatory bodies and multilateral agencies needing internal distribution and policy reference.",
                  "Pour les ministères gouvernementaux, les organismes de réglementation et les agences multilatérales ayant besoin d'une diffusion interne et d'une référence pour l'élaboration des politiques."
                )
              },
              {
                title: text("Enterprise & Commercial", "Entreprises et commerce"),
                desc: text(
                  "For legal, financial and strategic advisory firms serving clients in the cannabis sector.",
                  "Pour les cabinets de conseil juridique, financier et stratégique au service de clients dans le secteur du cannabis."
                )
              }
            ].map((license, i) => (
              <div key={i} className="border border-[#26382C] bg-[#102219] p-8">
                <h3 className="mb-4 font-serif text-2xl text-[#EDD99A]">{license.title}</h3>
                <p className="text-sm font-light leading-7 text-[#8B978F]">
                  {license.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-[#1A2E20] bg-[#07100A] p-8 md:p-12 text-center">
            <h3 className="mb-4 font-serif text-3xl text-[#F4F1EA]">{text("Institutional Enquiries", "Demandes institutionnelles")}</h3>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-light leading-7 text-[#718078]">
              {text(
                "To register interest in possible future institutional access or discuss requirements, please contact the authors. An enquiry is not an order, reservation, licence, or commitment to supply.",
                "Pour manifester votre intérêt pour un éventuel accès institutionnel futur ou discuter des exigences, veuillez contacter les auteurs. Une demande n'est pas une commande, une réservation, une licence ou un engagement de fourniture."
              )}
            </p>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
            >
              {text("Contact the Authors", "Contacter les auteurs")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
