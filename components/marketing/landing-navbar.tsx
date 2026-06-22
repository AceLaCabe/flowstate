// components/marketing/landing-navbar.tsx
import Link from "next/link";
import LogoLink from "@/components/branding/logo-link";

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f8f8f5]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <LogoLink href="/" size={40} showText />

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Landing navigation"
        >
          <a
            href="#features"
            className="rounded-md text-sm font-medium text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Features
          </a>

          <a
            href="#who-its-for"
            className="rounded-md text-sm font-medium text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Use cases
          </a>

          <a
            href="#preview"
            className="rounded-md text-sm font-medium text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Preview
          </a>

          <Link
            href="/auth/login"
            className="rounded-md text-sm font-medium text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Log in
          </Link>

          <Link
            href="/auth/sign-up"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Start free
          </Link>
        </nav>

        <Link
          href="/auth/sign-up"
          className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:hidden"
        >
          Start
        </Link>
      </div>
    </header>
  );
}