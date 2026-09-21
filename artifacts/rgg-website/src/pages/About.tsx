import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function About() {
  const { text } = useLanguage();
  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <img
          src={`${import.meta.env.BASE_URL}images/about-cinematic-background.png`}
          alt=""
          aria-hidden="true"
          width={1448}
          height={1086}
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center opacity-65"
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

        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pt-40 lg:pb-28">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("About the Handbook", "À propos du manuel")}
            </span>
          </div>

          <h1 className="max-w-4xl font-serif text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.94] tracking-[-0.045em]">
            {text("Navigating reform ", "S'orienter dans la réforme ")}
            <span className="italic text-[#EDD99A]">{text("with readiness.", "avec préparation.")}</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
            {text(
              "Reclaiming the Green Gold is a global handbook for navigating cannabis reform through governance, institutional readiness and sustainable development.",
              "Reclaiming the Green Gold est un manuel mondial pour naviguer dans la réforme du cannabis par la gouvernance, la préparation institutionnelle et le développement durable."
            )}
          </p>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[0.32fr_1fr] lg:gap-20">
            <SectionEyebrow>{text("Why it was written", "Pourquoi ce manuel a-t-il été écrit ?")}</SectionEyebrow>
            <div className="max-w-4xl">
              <p className="text-xl font-light leading-9 text-[#C8C5B3] md:text-2xl md:leading-10">
                {text(
                  "Cannabis reform is unfolding globally at an unprecedented pace. Governments are moving to legalise, regulate or decriminalise cannabis in response to shifting social attitudes, economic opportunities and public health considerations.",
                  "La réforme du cannabis se déploie à l'échelle mondiale à un rythme sans précédent. Les gouvernements s'orientent vers la légalisation, la réglementation ou la dépénalisation du cannabis en réponse à l'évolution des attitudes sociales, aux opportunités économiques et aux considérations de santé publique."
                )}
              </p>
              <p className="mt-6 text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {text(
                  "Yet in many contexts, legal change is advancing faster than institutional capacity. Regulatory frameworks are introduced without adequate laboratories, licensing systems without enforcement capacity, and market ambitions without value-chain readiness. This handbook was written to address that gap.",
                  "Pourtant, dans de nombreux contextes, le changement juridique progresse plus vite que la capacité institutionnelle. Les cadres réglementaires sont introduits sans laboratoires adéquats, les systèmes de licences sans capacité d'application, et les ambitions du marché sans préparation de la chaîne de valeur. Ce manuel a été écrit pour combler cette lacune."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#07100A]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[0.32fr_1fr] lg:gap-20">
            <SectionEyebrow>{text("The Core Argument", "L'argument principal")}</SectionEyebrow>
            <div className="max-w-4xl">
              <blockquote className="font-serif text-[clamp(2.2rem,4.8vw,4.8rem)] leading-[1.06] tracking-[-0.035em] text-[#F4F1EA]">
                {text("Cannabis reform is not primarily a legal question.", "La réforme du cannabis n'est pas principalement une question juridique.")}
                <span className="italic text-[#EDD99A]">
                  {" "}{text("It is a governance transition.", "C'est une transition de gouvernance.")}
                </span>
              </blockquote>
              <p className="mt-8 max-w-2xl text-sm font-light leading-7 text-[#718078] md:text-base md:leading-8">
                {text(
                  "The success of reform depends on institutional capacity, policy coherence, regulatory sequencing, market structuring and social inclusion.",
                  "Le succès de la réforme dépend de la capacité institutionnelle, de la cohérence politique, du séquençage réglementaire, de la structuration du marché et de l'inclusion sociale."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionEyebrow>{text("Who this is for", "À qui s'adresse-t-il ?")}</SectionEyebrow>
              <h2 className="mt-6 font-serif text-3xl tracking-[-0.02em] md:text-4xl">
                {text("A strategic resource for decision makers.", "Une ressource stratégique pour les décideurs.")}
              </h2>
              <ul className="mt-10 space-y-6">
                {[
                  text("Policymakers and government officials", "Décideurs et représentants gouvernementaux"),
                  text("Regulatory authorities", "Autorités réglementaires"),
                  text("Regional organisations and development partners", "Organisations régionales et partenaires de développement"),
                  text("Universities and research institutions", "Universités et instituts de recherche"),
                  text("Policy advisors and reform leaders", "Conseillers en politiques publiques et responsables de la réforme")
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 border-t border-[#1A2E20] pt-6">
                    <span className="mt-1 shrink-0 text-[9px] font-bold text-[#A98C50]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-xl text-[#C8C5B3]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionEyebrow>{text("What makes it different", "Ce qui le distingue")}</SectionEyebrow>
              <h2 className="mt-6 font-serif text-3xl tracking-[-0.02em] md:text-4xl">
                {text("An integrated global approach.", "Une approche mondiale intégrée.")}
              </h2>
              <ul className="mt-10 space-y-6">
                {[
                  text("Integrated governance, economy, health and development approach", "Approche intégrée de la gouvernance, de l'économie, de la santé et du développement"),
                  text("Cannabis Governance Transition Model", "Modèle de transition de la gouvernance du cannabis"),
                  text("National Readiness Toolkit", "Boîte à outils de préparation nationale"),
                  text("Strong LMIC and SIDS perspective", "Forte perspective des PRFI (pays à revenu faible et intermédiaire) et des PEID (petits États insulaires en développement)"),
                  text("Focus on policy sequencing and institutional realism", "Accent mis sur le séquençage des politiques publiques et le réalisme institutionnel")
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 border-t border-[#1A2E20] pt-6">
                    <span className="mt-1 shrink-0 text-[9px] font-bold text-[#A98C50]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-xl text-[#C8C5B3]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 text-center md:py-32">
          <SectionEyebrow>{text("More than a book", "Plus qu'un livre")}</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl">
            {text("A framework for action.", "Un cadre d'action.")}
          </h2>
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/framework"
              className="inline-flex min-h-12 items-center justify-between border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
            >
              {text("Explore the Framework", "Explorer le cadre")} <span aria-hidden="true" className="ml-4">→</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-between border border-[#405246] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8B39F] transition-colors hover:border-[#C8A96B] hover:text-[#EDD99A]"
            >
              {text("View Book Status", "Voir le statut du livre")} <span aria-hidden="true" className="ml-4">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
