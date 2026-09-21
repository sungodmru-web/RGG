import type { ReactNode } from "react";

import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { useLanguage } from "@/i18n/LanguageContext";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const { text } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F1EA] selection:bg-[#C8A96B] selection:text-[#0B0B0B]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-[#EDD99A] px-4 py-3 text-sm font-bold text-[#07100A] transition-transform focus:translate-y-0"
      >
        {text("Skip to main content", "Passer au contenu principal")}
      </a>
      <SiteHeader />

      <div id="main-content" tabIndex={-1}>{children}</div>

      <SiteFooter />
    </div>
  );
}