// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLink from "./brand-link";
import LogoutButton from "@/components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/assets", label: "Assets" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
  firstName?: string;
  lastName?: string;
};

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim().charAt(0).toUpperCase() || "";
  const last = lastName?.trim().charAt(0).toUpperCase() || "";
  return (first + last) || "U";
}

export default function Sidebar({
  mobileOpen = false,
  onNavigate,
  firstName,
  lastName,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        aria-label="Primary"
        className="hidden w-72 border-r border-black/10 bg-white/80 p-6 backdrop-blur md:block"
      >
        <div className="mb-10">
          <BrandLink href="/dashboard" />
        </div>

        <nav aria-label="Main navigation" className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "block rounded-xl px-4 py-3 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-black/80 hover:bg-black/5 hover:text-black",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" aria-hidden={!mobileOpen}>
          <div className="absolute inset-0 bg-black/30" onClick={onNavigate} />

          <aside
            aria-label="Mobile navigation"
            className="absolute left-0 top-0 flex h-full w-[84%] max-w-[320px] flex-col border-r border-black/10 bg-white p-6 shadow-xl"
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <BrandLink href="/dashboard" />
              <button
                type="button"
                onClick={onNavigate}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#fafaf7] p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                {getInitials(firstName, lastName)}
              </div>

              <div className="min-w-0">
                <p className="text-xs text-black/55">Signed in as</p>
                <p className="truncate text-sm font-medium text-black">
                  {firstName || "User"}
                </p>
              </div>
            </div>

            <nav aria-label="Main navigation" className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "block rounded-xl px-4 py-3 text-sm font-medium transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "text-black/80 hover:bg-black/5 hover:text-black",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}