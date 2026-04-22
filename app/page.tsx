// app/page.tsx
import LandingNavbar from "@/components/marketing/landing-navbar";
import HeroSection from "@/components/marketing/hero-section";
import FeaturesSection from "@/components/marketing/features-section";
import PersonasSection from "@/components/marketing/personas-section";
import CtaSection from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#111111]">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <PersonasSection />
      <CtaSection />
    </main>
  );
}