import Header from "@/components/layout/header";
import HeroSection from "@/components/home/hero-section";
import FeaturedCollections from "@/components/home/featured-collections";
import Footer from "@/components/layout/footer";
import FeatureBar from "@/components/home/feature-bar";
import EnvironmentsSection from "@/components/home/environments-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeatureBar />
        <FeaturedCollections />
        <EnvironmentsSection />
      </main>
      <Footer />
    </div>
  );
}
