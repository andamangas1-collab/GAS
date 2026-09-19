import { GASHero } from "@/components/hero/GASHero"
import { ValueTicker } from "@/components/home/ValueTicker"
import { InteractiveV2VJourney } from "@/components/home/InteractiveV2VJourney"
import { LiveOffersPreview } from "@/components/home/LiveOffersPreview"
import { InteractiveCommissionCalculator } from "@/components/home/InteractiveCommissionCalculator"
import { DirectVsMlmMatrix } from "@/components/home/DirectVsMlmMatrix"
import { RecognitionTiersShowcase } from "@/components/home/RecognitionTiersShowcase"
import { InteractiveFAQ } from "@/components/home/InteractiveFAQ"
import { HomeCTA } from "@/components/home/HomeCTA"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. 3D V2V Hero Section */}
      <GASHero />

      {/* 2. Platform Proof & Value Ticker */}
      <ValueTicker />

      {/* 3. Interactive V2V 4-Step Lifecycle Journey */}
      <InteractiveV2VJourney />

      {/* 4. Live Marketplace Offers Preview */}
      <LiveOffersPreview />

      {/* 5. Interactive Commission & Standing Calculator */}
      <InteractiveCommissionCalculator />

      {/* 6. Ethical Transparency Matrix: Direct vs MLM */}
      <DirectVsMlmMatrix />

      {/* 7. 5-Tier Progressive Recognition Roadmap */}
      <RecognitionTiersShowcase />

      {/* 8. Interactive Searchable FAQ */}
      <InteractiveFAQ />

      {/* 9. Final Conversion Action Portal */}
      <HomeCTA />
    </main>
  )
}

