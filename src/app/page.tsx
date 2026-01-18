import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import PreviewFeatures from "@/components/home/PreviewFeatures";
import QuoteBlock from "@/components/home/QuoteBlock";
import Reviews from "@/components/home/Reviews";
import SecondHero from "@/components/home/SecondHero";
import WhyHard from "@/components/home/WhyHard";
import posthog from "posthog-js";

export default function Home() {
  posthog.capture("home_page_viewed");
  return (
    <div>
      <Hero />
      <Reviews/>
      <WhyHard/>
      <QuoteBlock/>
      <SecondHero/>
      <PreviewFeatures/>
      <HowItWorks/>
      <FinalCTA/>
    </div>
  );
}
