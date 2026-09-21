import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Disclaimer() {
  const { text } = useLanguage();

  return (
    <main className="overflow-x-hidden bg-[#0B0B0B] text-[#F4F1EA]">
      <section className="relative overflow-hidden border-b border-[#1A2E20] bg-[#080D09]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:84px_84px] opacity-40"
        />
        <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <SectionEyebrow>{text("Legal", "Mentions légales")}</SectionEyebrow>
            <h1 className="mb-12 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-tight tracking-[-0.03em]">
              {text("Disclaimer", "Clause de non-responsabilité")}
            </h1>

            <div className="space-y-8 text-sm font-light leading-8 text-[#B8B39F] md:text-base md:leading-9">
              <p>
                {text(
                  "This publication and the accompanying website are intended solely for educational, research, and informational purposes. They do not constitute legal, medical, regulatory, or professional advice. Readers are encouraged to seek qualified professional guidance and consult the relevant authorities in their jurisdictions before acting on any content presented herein.",
                  "Cette publication et le site qui l’accompagne sont exclusivement destinés à des fins éducatives, de recherche et d’information. Ils ne constituent ni un conseil juridique, médical, réglementaire ou professionnel, ni un avis de cette nature. Les lecteurs sont invités à solliciter les conseils de professionnels qualifiés et à consulter les autorités compétentes de leur juridiction avant de prendre toute mesure sur la base de l’un quelconque des contenus présentés ici."
                )}
              </p>
              
              <p>
                {text(
                  "The authors make no representations or warranties regarding the completeness, accuracy, or currency of the information contained in this work. No liability is accepted for any errors, omissions, or consequences arising from its use. The views and interpretations expressed are those of the authors alone and do not necessarily reflect those of any institution, organisation, or government with which they are or have been affiliated.",
                  "Les auteurs ne font aucune déclaration et ne garantissent pas l’exhaustivité, l’exactitude ou l’actualité des informations contenues dans cet ouvrage. Les auteurs déclinent toute responsabilité à l’égard des erreurs, omissions ou conséquences découlant de son utilisation. Les points de vue et interprétations exprimés n’engagent que leurs auteurs et ne reflètent pas nécessairement ceux d’une institution, d’une organisation ou d’un gouvernement auxquels ils sont ou ont été affiliés."
                )}
              </p>

              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("Intellectual Responsibility", "Responsabilité intellectuelle")}
              </h2>
              <p>
                {text(
                  "The authors assume full responsibility for the content, analysis, and interpretations presented in this publication. Any errors or shortcomings remain their own.",
                  "Les auteurs assument l’entière responsabilité du contenu, de l’analyse et des interprétations présentés dans cette publication. Toute erreur ou lacune relève de leur seule responsabilité."
                )}
              </p>

              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("Copyright", "Droit d'auteur")}
              </h2>
              <p>
                {text(
                  `\u00A9 ${new Date().getFullYear()} Soobaschand & Sunny Sweenarain. All rights reserved. No part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form or by any means without prior written permission, except for brief quotations embodied in critical reviews, academic citation, or scholarly commentary with full acknowledgement of the source.`,
                  `\u00A9 ${new Date().getFullYear()} Soobaschand & Sunny Sweenarain. Tous droits réservés. Aucune partie de cette publication ne peut être reproduite, stockée dans un système de récupération ou transmise sous quelque forme ou par quelque moyen que ce soit sans autorisation écrite préalable, à l’exception de brèves citations reproduites dans des comptes rendus critiques, des travaux universitaires ou des commentaires savants, avec mention complète de la source.`
                )}
              </p>
            </div>
            
            <div className="mt-16 border-t border-[#1A2E20] pt-8">
              <Link href="/" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] hover:text-[#EDD99A]">
                {text("← Back to Home", "← Retour à l'accueil")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
