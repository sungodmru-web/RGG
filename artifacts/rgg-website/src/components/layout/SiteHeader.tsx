import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "wouter";

import { useLanguage } from "@/i18n/LanguageContext";
import { trackEvent } from "@/lib/analytics";

const NAV_ITEMS = [
  { label: "The Book", frLabel: "Le livre", href: "/book" },
  { label: "Articles & Publications", frLabel: "Articles et publications", href: "/publications" },
  { label: "Technical Assistance", frLabel: "Assistance technique", href: "/technical-assistance" },
  { label: "Authors", frLabel: "Auteurs", href: "/authors" },
  { label: "Endorsements", frLabel: "Soutiens", href: "/endorsements" },
];

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function isRouteActive(currentPath: string, href: string) {
  const current = normalizePath(currentPath);
  const target = normalizePath(href);

  if (target === "/") {
    return current === "/";
  }

  return current === target || current.startsWith(`${target}/`);
}

export default function SiteHeader() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, text } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    const background = [
      document.querySelector("header"),
      document.getElementById("main-content"),
      document.querySelector("footer"),
    ].filter((element): element is HTMLElement => element instanceof HTMLElement);
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    requestAnimationFrame(() =>
      dialogRef.current?.querySelector<HTMLElement>("a[href]")?.focus(),
    );

    return () => {
      document.removeEventListener("keydown", handleEscape);
      background.forEach((element) => {
        element.inert = false;
        element.removeAttribute("aria-hidden");
      });
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  const handleNavigation = (
    destination: string,
    locationName: "desktop_header" | "mobile_menu",
  ) => {
    trackEvent("navigation_clicked", { destination, location: locationName });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "border-b border-[#1A2E20] bg-[#080D09]/95 backdrop-blur-xl"
            : "border-b border-[#1A2E20]/20 bg-transparent"
        }`}
      >
        <div
          className={`container mx-auto flex items-center justify-between px-6 transition-all duration-500 ${
            scrolled ? "h-[82px]" : "h-[104px]"
          }`}
        >
          <Link
            href="/"
            aria-label={text("Reclaiming the Green Gold home", "Accueil Reclaiming the Green Gold")}
            className="group relative z-50 shrink-0"
            onClick={() => handleNavigation("home", "desktop_header")}
          >
            <img
              src={`${import.meta.env.BASE_URL}images/${
                language === "fr" ? "rgg-official-logo-fr.png" : "rgg-official-logo.png"
              }`}
              alt={text("Reclaiming the Green Gold", "Reconquérir l'or vert")}
              className={`rounded-full object-contain drop-shadow-[0_4px_14px_rgba(200,169,107,0.22)] transition-all duration-500 group-hover:drop-shadow-[0_4px_18px_rgba(237,217,154,0.4)] ${
                scrolled ? "h-24 w-24 translate-y-[8px]" : "h-32 w-32 translate-y-[14px]"
              }`}
            />
          </Link>

          <nav
            aria-label={text("Primary navigation", "Navigation principale")}
            className="hidden items-center gap-3 lg:flex xl:gap-7 2xl:gap-9"
          >
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(location, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleNavigation(item.label.toLowerCase(), "desktop_header")}
                  className={`relative py-3 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 xl:text-[14px] xl:tracking-[0.11em] 2xl:text-[15px] ${
                    active ? "text-[#EDD99A]" : "text-[#C8A96B] hover:text-[#EDD99A]"
                  }`}
                >
                  {text(item.label, item.frLabel)}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-px bg-[#C8A96B] transition-all duration-300 ${
                      active ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="z-50 flex items-center gap-4 xl:gap-5">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "fr" : "en")}
              aria-label={text("Switch language to French", "Passer à l'anglais")}
              className="flex h-12 min-w-12 items-center justify-center px-2 text-[14px] font-bold uppercase tracking-[0.12em] text-[#C8A96B] transition-colors duration-300 hover:text-[#EDD99A]"
            >
              {language === "en" ? "FR" : "EN"}
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={mobileOpen ? text("Close navigation menu", "Fermer le menu de navigation") : text("Open navigation menu", "Ouvrir le menu de navigation")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((open) => !open)}
              className="relative flex h-12 w-12 items-center justify-center lg:hidden"
            >
              <span className="sr-only">
                {mobileOpen ? text("Close menu", "Fermer le menu") : text("Open menu", "Ouvrir le menu")}
              </span>
              <span className="relative block h-4 w-6">
                <span className={`absolute left-0 top-0 block h-px w-6 bg-[#C8A96B] transition-all duration-300 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-[7px] block h-px w-6 bg-[#C8A96B] transition-all duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 top-[14px] block h-px w-6 bg-[#C8A96B] transition-all duration-300 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={dialogRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={text("Mobile navigation", "Navigation mobile")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] overflow-x-hidden overflow-y-auto bg-[#060D08] lg:hidden"
          >
            <button
              type="button"
              aria-label={text("Close navigation menu", "Fermer le menu de navigation")}
              onClick={() => setMobileOpen(false)}
              className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center border border-[#405246] text-2xl text-[#EDD99A]"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-[15%] h-[60vw] w-[60vw] rounded-full bg-[#0D3B2E]/20 blur-[100px]" />

            <div className="container relative z-10 mx-auto flex min-h-full flex-col px-6 pb-10 pt-32">
              <p className="mb-10 text-[9px] uppercase tracking-[0.28em] text-[#56685D]">
                {text("Explore RGG", "Explorer RGG")}
              </p>

              <nav aria-label={text("Mobile primary navigation", "Navigation principale mobile")} className="flex flex-col">
                {NAV_ITEMS.map((item, index) => {
                  const active = isRouteActive(location, item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + index * 0.045, duration: 0.35 }}
                      className="border-b border-[#1A2E20]"
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => handleNavigation(item.label.toLowerCase(), "mobile_menu")}
                        className="group flex items-center justify-between py-5"
                      >
                        <span className={`font-serif text-[clamp(1.5rem,7vw,2.5rem)] leading-none tracking-[-0.025em] transition-colors duration-300 ${active ? "text-[#EDD99A]" : "text-[#F4F1EA] group-hover:text-[#C8A96B]"}`}>
                          {text(item.label, item.frLabel)}
                        </span>
                        <span aria-hidden="true" className={`text-lg transition-all duration-300 ${active ? "translate-x-0 text-[#C8A96B]" : "text-[#4A6055] group-hover:translate-x-1 group-hover:text-[#C8A96B]"}`}>
                          →
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-auto pt-12">
                <p className="max-w-xs text-xs font-light leading-6 text-[#56685D]">
                  {text("Cannabis governance, institutional readiness and sustainable development.", "Gouvernance du cannabis, préparation institutionnelle et développement durable.")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
