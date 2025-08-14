import Header from "@/components/layout/header";
import HeroSection from "@/components/home/hero-section";
import FeaturedCollections from "@/components/home/featured-collections";
import BestSellers from "@/components/home/best-sellers";
import CustomArtCta from "@/components/home/custom-art-cta";
import Testimonials from "@/components/home/testimonials";
import FrameArrangements from "@/components/home/frame-arrangements";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCollections />
        <BestSellers />
        <CustomArtCta />
        <FrameArrangements />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
