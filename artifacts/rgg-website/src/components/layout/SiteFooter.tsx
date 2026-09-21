import { Link } from "wouter";
import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

const LEGAL_LINKS = [
  { label: "Disclaimer", frLabel: "Clause de non-responsabilité", href: "/disclaimer" },
  { label: "Cookie Policy", frLabel: "Politique relative aux cookies", href: "/cookies" },
];

const PLATFORM_LINKS = [
  { label: "The Book", frLabel: "Le livre", href: "/book" },
  { label: "Articles & Publications", frLabel: "Articles et publications", href: "/publications" },
  { label: "Technical Assistance", frLabel: "Assistance technique", href: "/technical-assistance" },
  { label: "Authors", frLabel: "Auteurs", href: "/authors" },
  { label: "Endorsements", frLabel: "Soutiens", href: "/endorsements" },
];

export default function SiteFooter() {
  const { text } = useLanguage();

  return (
    <footer className="border-t border-[#1A2E20] bg-[#060D08]">
      <div className="container mx-auto px-6 pb-10 pt-20 md:pt-24">
        <div className="grid gap-14 border-b border-[#1A2E20] pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-block font-serif text-2xl font-bold leading-tight tracking-[-0.01em] text-[#C8A96B] transition-colors hover:text-[#EDD99A]"
            >
              Reclaiming the
              <br />
              <span className="italic">Green Gold</span>
            </Link>

            <p className="mt-6 max-w-md text-sm font-light leading-7 text-[#718078]">
              {text(
                "An independent knowledge platform exploring cannabis governance, institutional readiness, public health, justice and sustainable development.",
                "Une plateforme de connaissances indépendante explorant la gouvernance du cannabis, la préparation institutionnelle, la santé publique, la justice et le développement durable."
              )}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-6 text-[9px] font-bold uppercase tracking-[0.24em] text-[#EDD99A]">
              {text("Explore", "Explorer")}
            </h2>
            <ul className="space-y-3.5">
              {PLATFORM_LINKS.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="text-sm font-light text-[#8B978F] transition-colors hover:text-[#C8A96B]"
                  >
                    {text(item.label, item.frLabel)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-6 text-[9px] font-bold uppercase tracking-[0.24em] text-[#EDD99A]">
              {text("Legal & Enquiries", "Légal et demandes")}
            </h2>
            <ul className="space-y-3.5 mb-8">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-light text-[#8B978F] transition-colors hover:text-[#C8A96B]"
                  >
                    {text(item.label, item.frLabel)}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/technical-assistance#contact"
              onClick={() => trackEvent("contact_link_clicked", { location: "global_footer" })}
              className="inline-flex items-center border-b border-[#C8A96B]/60 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C8A96B] transition-colors hover:border-[#EDD99A] hover:text-[#EDD99A]"
            >
              {text("Contact the Authors", "Contacter les auteurs")}
              <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-8 text-[11px] font-light leading-5 text-[#4A6055] md:flex-row md:items-center md:justify-between">
          <p>
            {text(
              "© 2026 Soobaschand & Sunny Sweenarain. All rights reserved.",
              "© 2026 Soobaschand & Sunny Sweenarain. Tous droits réservés."
            )}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>reclaimingthegreengold.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
