import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Media() {
  const { text } = useLanguage();

  const RESOURCES = [
    {
      title: text("Press Kit", "Dossier de presse"),
      description: text(
        "A planned collection of approved book information and author biographies for media use.",
        "Une collection prévue d'informations approuvées sur le livre et de biographies d'auteurs à l'usage des médias."
      )
    },
    {
      title: text("Launch Materials", "Matériel de lancement"),
      description: text(
        "Approved slides, announcements and excerpts will be listed when publication plans are finalised.",
        "Les diapositives, les annonces et les extraits approuvés seront répertoriés lorsque les plans de publication seront finalisés."
      )
    },
    {
      title: text("Book Visuals", "Visuels du livre"),
      description: text(
        "Approved cover images and promotional graphics will be listed when available.",
        "Les images de couverture approuvées et les graphiques promotionnels seront répertoriés lorsqu'ils seront disponibles."
      )
    },
    {
      title: text("Policy Briefs", "Notes d'orientation"),
      description: text(
        "Verified analytical papers remain available through the Research & Insights library.",
        "Les documents d'analyse vérifiés restent disponibles dans la bibliothèque de recherche et de perspectives."
      )
    },
    {
      title: text("Interviews", "Entretiens"),
      description: text(
        "Verified interviews, podcasts and discussions will be listed after publication.",
        "Les entretiens, les podcasts et les discussions vérifiés seront répertoriés après la publication."
      )
    },
    {
      title: text("Downloads", "Téléchargements"),
      description: text(
        "Approved public resources will appear here when files are ready for distribution.",
        "Les ressources publiques approuvées apparaîtront ici lorsque les fichiers seront prêts à être distribués."
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
                {text("Communication & Outreach", "Communication et relations extérieures")}
              </span>
            </div>

            <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,7vw,7rem)] leading-[0.94] tracking-[-0.045em]">
              {text("Media &", "Médias et")}<br />
              <span className="italic text-[#EDD99A]">{text("Resources.", "Ressources.")}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base font-light leading-8 text-[#B8B39F] md:text-lg">
              {text(
                "Materials to support communication, outreach and professional engagement.",
                "Matériel pour soutenir la communication, la sensibilisation et l'engagement professionnel."
              )}
            </p>
            <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-[#718078]">
              {text(
                "This library outlines intended resource categories for journalists, reviewers, and event organizers. Approved downloadable materials and verified coverage will appear here when available.",
                "Cette bibliothèque décrit les catégories de ressources prévues pour les journalistes, les critiques et les organisateurs d'événements. Les documents téléchargeables approuvés et la couverture vérifiée apparaîtront ici lorsqu'ils seront disponibles."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#1A2E20] bg-[#080D09]">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <SectionEyebrow>{text("Resource Library", "Bibliothèque de ressources")}</SectionEyebrow>
          <div className="mt-12 grid border-l border-t border-[#1A2E20] md:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((resource) => (
              <article
                key={resource.title}
                className="min-h-[180px] border-b border-r border-[#1A2E20] p-7 md:p-9"
              >
                <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#C8C5B3]">
                  {resource.title}
                </h3>
                <p className="mt-5 text-sm font-light leading-7 text-[#718078]">
                  {resource.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0B]">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center max-w-3xl">
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.03em] md:text-5xl text-[#F4F1EA]">
             {text("Request information for responsible media engagement.", "Demander des informations pour un engagement responsable des médias.")}
          </h2>
          <p className="mt-8 text-sm font-light leading-7 text-[#718078]">
             {text(
               "For media enquiries, interview requests, or questions about future review materials, please contact the authors directly.",
               "Pour les demandes des médias, les demandes d'interview ou les questions sur les futurs supports destinés aux recensions, veuillez contacter directement les auteurs."
             )}
          </p>
          <div className="mt-12 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center border border-[#C8A96B] bg-[#C8A96B] px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B] transition-colors hover:bg-[#EDD99A]"
            >
              {text("Contact for Media Enquiries", "Contact pour les demandes des médias")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
