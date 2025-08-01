import Header from "@/components/layout/header";
import HeroSection from "@/components/home/hero-section";
import FeaturedCollections from "@/components/home/featured-collections";
import BestSellers from "@/components/home/best-sellers";
import ReadyCompositions from "@/components/home/ready-compositions";
import Testimonials from "@/components/home/testimonials";
import ProductDescriptionGenerator from "@/components/features/product-description-generator";
import CompositionSuggester from "@/components/features/composition-suggester";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCollections />
        <BestSellers />
        <ReadyCompositions />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
