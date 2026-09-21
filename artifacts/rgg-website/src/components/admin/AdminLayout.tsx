import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import {
  clearAdminSecurityState,
  logoutAdministrator,
} from "@/lib/adminApi";

interface AdminLayoutProps {
  children: ReactNode;
}

const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Themes",
    href: "/admin/themes",
  },
  {
    label: "Media",
    href: "/admin/media",
  },
  {
    label: "Publications",
    href: "/admin/publications",
  },
  {
    label: "New Publication",
    href: "/admin/publications/new",
  },
  {
    label: "Endorsements",
    href: "/admin/endorsements",
  },
  {
    label: "Administrators",
    href: "/admin/administrators",
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    try {
      await logoutAdministrator();
    } finally {
      clearAdminSecurityState();
      await queryClient.removeQueries({ queryKey: ["admin"] });
      await signOut({ redirectUrl: "/sign-in" });
    }
  }

  return (
    <div className="min-h-screen bg-[#080D09] text-[#F4F1EA]">
      <header className="sticky top-0 z-40 border-b border-[#1A2E20] bg-[#080D09]/95 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-[72px] items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="font-serif text-lg text-[#EDD99A]"
            >
              RGG Publishing
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {ADMIN_NAV.map((item) => {
                const active =
                  location === item.href ||
                  location.startsWith(`${item.href}/`) || (item.href === "/admin" && location === "/admin");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
                      active
                        ? "text-[#EDD99A]"
                        : "text-[#718078] hover:text-[#C8A96B]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/research"
              className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078] hover:text-[#C8A96B] sm:block"
            >
              View Public Site ↗
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#718078] hover:text-[#C8A96B]"
            >
              Sign out
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-[#1A2E20] text-[#EDD99A] md:hidden"
              aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav
            id="admin-mobile-navigation"
            aria-label="Admin navigation"
            className="border-t border-[#1A2E20] px-6 py-4 md:hidden"
          >
            <div className="container mx-auto grid gap-1">
              {ADMIN_NAV.map((item) => {
                const active =
                  location === item.href ||
                  location.startsWith(`${item.href}/`) || (item.href === "/admin" && location === "/admin");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center rounded px-3 text-xs font-bold uppercase tracking-[0.16em] ${
                      active ? "bg-[#122018] text-[#EDD99A]" : "text-[#9AA79F] hover:bg-[#0D1710] hover:text-[#C8A96B]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/research"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center rounded px-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9AA79F] hover:bg-[#0D1710] hover:text-[#C8A96B] sm:hidden"
              >
                View Public Site ↗
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}