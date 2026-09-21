import { motion } from "framer-motion";
import { useListEndorsements } from "@workspace/api-client-react";

import { useLanguage } from "@/i18n/LanguageContext";

export default function Endorsements() {
  const { text } = useLanguage();
  const { data: endorsements = [], isLoading } = useListEndorsements();

  return (
    <main
      className="min-h-[calc(100vh-68px)] overflow-x-hidden bg-[#0B0B0B] bg-cover bg-fixed bg-center bg-no-repeat pb-16 pt-24 text-[#F4F1EA]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6, 10, 7, 0.76), rgba(11, 11, 11, 0.94)), url("/images/endorsements-trichomes-background.jpg")',
      }}
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl border border-[#1A2E20] bg-[#07100A] p-12 text-center md:p-20"
        >
          <div className="mb-8 flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
              {text("Endorsements", "Soutiens")}
            </span>
            <span aria-hidden="true" className="h-px w-9 bg-[#9A7A3A]" />
          </div>
          
          <h1 className="mb-8 font-serif text-3xl md:text-4xl lg:text-5xl leading-tight tracking-[-0.03em] text-[#F4F1EA]">
            {text("Independent commentary", "Commentaires indépendants")}
            <br />
            <span className="italic text-[#EDD99A]">
              {text("and institutional reviews.", "et revues institutionnelles.")}
            </span>
          </h1>
          
          {isLoading ? (
            <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-[#718078] md:text-base">
              {text(
                "Loading verified commentary…",
                "Chargement des commentaires vérifiés…",
              )}
            </p>
          ) : endorsements.length === 0 ? (
            <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-[#718078] md:text-base">
              {text(
                "Endorsements and independent commentary will be added following verification and authorization.",
                "Les soutiens et commentaires indépendants seront ajoutés après vérification et autorisation.",
              )}
            </p>
          ) : (
            <div className="mt-12 grid gap-px bg-[#1A2E20] text-left">
              {endorsements.map((endorsement) => (
                <article
                  key={endorsement.id}
                  className="bg-[#0B0B0B] p-8 md:p-10"
                >
                  {endorsement.photoMediaId && (
                    <img
                      src={`/api/media/${endorsement.photoMediaId}`}
                      alt={endorsement.name}
                      className="mb-7 h-24 w-24 rounded-full border border-[#2E4738] object-cover"
                    />
                  )}
                  <blockquote className="font-serif text-2xl leading-relaxed text-[#F4F1EA]">
                    “{endorsement.quote}”
                  </blockquote>
                  <footer className="mt-7 border-t border-[#1A2E20] pt-5">
                    <p className="text-sm font-medium text-[#EDD99A]">
                      {endorsement.name}
                    </p>
                    {(endorsement.title || endorsement.organization) && (
                      <p className="mt-1 text-xs leading-5 text-[#718078]">
                        {[endorsement.title, endorsement.organization]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {endorsement.sourceUrl && (
                      <a
                        href={endorsement.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-[9px] font-bold uppercase tracking-[0.18em] text-[#C8A96B] underline-offset-4 hover:underline"
                      >
                        {text("Verified source", "Source vérifiée")}
                      </a>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
