import { FaqSection } from "@/components/sections/faq-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowToStartSection } from "@/components/sections/how-to-start-section";

export default function HomePage() {
  return (
    <div className="bg-midnight">
      <HeroSection />
      <FeaturesSection />
      <HowToStartSection />
      <FaqSection />
    </div>
  );
}
