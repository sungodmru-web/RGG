import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#A98C50]">
      {children}
    </p>
  );
}

export default function Cookies() {
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
              {text("Cookie Policy", "Politique relative aux cookies")}
            </h1>

            <div className="space-y-8 text-sm font-light leading-8 text-[#B8B39F] md:text-base md:leading-9">
              <p>
                {text(
                  "This website may use essential session technology for administrative access. The public website also includes an optional analytics hook that sends events only when an Umami service has been configured.",
                  "Ce site peut utiliser des technologies essentielles de gestion des sessions pour l’accès administratif. Le site public comprend également un module facultatif d’analyse qui n’envoie des événements que lorsqu’un service Umami a été configuré."
                )}
              </p>
              
              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("What Are Cookies?", "Que sont les cookies ?")}
              </h2>
              <p>
                {text(
                  "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you interact with the content. We keep our use of such technologies to an absolute minimum.",
                  "Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils aident le site à mémoriser vos préférences et à comprendre comment vous interagissez avec le contenu. Nous limitons l'utilisation de ces technologies au strict minimum."
                )}
              </p>

              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("Technologies We Use", "Technologies que nous utilisons")}
              </h2>
              
              <div className="overflow-x-auto border border-[#1A2E20] bg-[#07100A] mt-6">
                <table className="w-full text-left text-sm font-light text-[#B8B39F]">
                  <thead className="border-b border-[#1A2E20] bg-[#0B0B0B] text-[#718078]">
                    <tr>
                      <th className="p-4 font-medium uppercase tracking-wider text-[10px]">{text("Technology", "Technologie")}</th>
                      <th className="p-4 font-medium uppercase tracking-wider text-[10px]">{text("Purpose", "Objectif")}</th>
                      <th className="p-4 font-medium uppercase tracking-wider text-[10px]">{text("Duration", "Durée")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2E20]">
                    <tr>
                      <td className="p-4 text-[#F4F1EA] font-medium">{text("Clerk (Essential)", "Clerk (Essentiel)")}</td>
                      <td className="p-4">{text("Session management and security for authorized administrators only. Not used for public visitors.", "Gestion des sessions et sécurité réservées aux seuls administrateurs autorisés. Non utilisé par les visiteurs du site public.")}</td>
                      <td className="p-4">{text("Browser session", "Session du navigateur")}</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#F4F1EA] font-medium">{text("Optional Umami integration", "Intégration optionnelle d'Umami")}</td>
                      <td className="p-4">{text("The frontend can send named page-interaction events when an Umami service is configured. If no service is configured, the analytics hook sends nothing.", "La partie cliente du site peut envoyer des événements nommés d’interaction avec les pages lorsqu’un service Umami est configuré. Si aucun service n’est configuré, le module d’analyse n’envoie rien.")}</td>
                      <td className="p-4">{text("No cookie is set by the website’s analytics wrapper", "Le site ne dépose aucun cookie par l’intermédiaire de son module d’analyse")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("Managing Cookies", "Gestion des cookies")}
              </h2>
              <p>
                {text(
                  "You can control cookies and local storage through your browser settings. Most browsers allow you to view, block, or delete cookies. Please note that blocking essential cookies may prevent you from accessing administrative areas of the site, though public content will remain fully accessible.",
                  "Vous pouvez contrôler les cookies et le stockage local via les paramètres de votre navigateur. La plupart des navigateurs vous permettent de voir, bloquer ou supprimer les cookies. Veuillez noter que le blocage des cookies essentiels peut vous empêcher d’accéder aux espaces administratifs du site, tandis que le contenu public reste pleinement accessible."
                )}
              </p>

              <h2 className="mt-12 font-serif text-2xl text-[#EDD99A] border-t border-[#1A2E20] pt-12">
                {text("Contact", "Contact")}
              </h2>
              <p>
                {text("Questions regarding our privacy practices? Email us at ", "Des questions concernant nos pratiques en matière de protection de la vie privée ? Écrivez-nous à ")}<strong className="text-[#F4F1EA]">contact@reclaimingthegreengold.com</strong>.
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
