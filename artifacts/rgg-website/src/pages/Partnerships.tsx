import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Partnerships() {
  const { text } = useLanguage();

  const PARTNERSHIPS = [
    {
      title: text("African Union & RECs", "Union africaine et CER"),
      description: text(
        "Engagement with the African Union and its recognised Regional Economic Communities.",
        "Coopération avec l'Union africaine et ses Communautés économiques régionales reconnues."
      )
    },
    {
      title: text("CARICOM, ASEAN & MERCOSUR", "CARICOM, ASEAN et MERCOSUR"),
      description: text(
        "Regional learning across small states, emerging markets and reforming jurisdictions.",
        "Mise en commun des expériences régionales entre petits États, marchés émergents et juridictions en cours de réforme."
      )
    },
    {
      title: text("Commonwealth & Francophonie", "Commonwealth et Francophonie"),
      description: text(
        "Knowledge-sharing across legal traditions, languages and development contexts.",
        "Partage des connaissances entre les traditions juridiques, les langues et les contextes de développement."
      )
    },
    {
      title: text("Universities & Research Institutions", "Universités et instituts de recherche"),
      description: text(
        "Collaboration on research, teaching, policy dialogue and capacity-building.",
        "Collaboration en matière de recherche, d'enseignement, de dialogue politique et de renforcement des capacités."
      )
    },
    {
      title: text("Development Partners", "Partenaires de développement"),
      description: text(
        "Engagement with institutions supporting governance, health, justice and sustainable development.",
        "Coopération avec les institutions qui soutiennent la gouvernance, la santé, la justice et le développement durable."
      )
    },
    {
      title: text("Professional Networks", "Réseaux professionnels"),
      description: text(
        "Responsible collaboration with policy, health, legal and development experts.",
        "Collaboration responsable avec des experts en politiques publiques, en santé, en droit et en développement."
      )
    }
  ];

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#07100A]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[8%] top-[8%] h-[520px] w-[520px] rounded-full border border-[#284631]/30"
        />

        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 md:pb-28 md:pt-40">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
                {text("Cooperation & Dialogue", "Coopération et dialogue")}
              </span>
            </div>

            <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em]">
              {text("Global & Regional", "Partenariats mondiaux et")}
              <br />
              <span className="italic text-[#EDD99A]">{text("Partnerships.", "régionaux.")}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "Knowledge-sharing, capacity-building and institutional cooperation for responsible cannabis governance.",
                "Partage des connaissances, renforcement des capacités et coopération institutionnelle pour une gouvernance responsable du cannabis."
              )}
            </p>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-[#718078]">
              {text(
                "The platform is designed to work with institutions, governments and regional bodies to support evidence-based reform pathways and comparative learning.",
              "La plateforme est conçue pour travailler avec des institutions, des gouvernements et des organismes régionaux afin de soutenir des parcours de réforme fondés sur des données probantes et l'apprentissage comparatif."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Partnership Landscape", "Paysage des partenariats")}</SectionEyebrow>
          <p className="max-w-3xl text-sm font-light leading-7 text-[#8D988F]">
            {text(
              "The categories below describe prospective engagement pathways. They do not represent confirmed partnerships, endorsements, memberships, or formal affiliations.",
              "Les catégories ci-dessous décrivent des modalités de collaboration envisagées. Elles ne constituent ni des partenariats confirmés, ni des soutiens, ni des adhésions, ni des affiliations formelles."
            )}
          </p>
          <div className="mt-12 grid border-l border-t border-[#1A2E20] md:grid-cols-2 lg:grid-cols-3">
            {PARTNERSHIPS.map((partner, index) => (
              <article
                key={partner.title}
                className="min-h-[220px] border-b border-r border-[#1A2E20] p-7 md:p-9"
              >
                <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#C8C5B3]">
                  {partner.title}
                </h3>
                <p className="mt-5 text-sm font-light leading-7 text-[#718078]">
                  {partner.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center max-w-3xl">
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl text-[#F4F1EA]">
            {text(
              "Build partnerships grounded in evidence, readiness and public value.",
              "Construire des partenariats fondés sur des données probantes, l’état de préparation et la valeur publique."
            )}
          </h2>
          <p className="mt-8 text-sm font-light leading-7 text-[#718078]">
            {text(
              "To discuss prospective cooperation priorities, institutional engagement pathways, and technical assistance, please reach out directly.",
              "Pour discuter des priorités de coopération envisagées, des possibilités de collaboration institutionnelle et de l'assistance technique, veuillez nous contacter directement."
            )}
          </p>
          <div className="mt-12 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
            >
              {text("Start a Dialogue", "Démarrer un dialogue")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
