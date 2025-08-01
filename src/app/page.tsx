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

        <section id="ai-features" className="py-12 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline text-primary">AI-Powered Tools</h2>
              <p className="text-lg text-muted-foreground mt-2">Explore our intelligent features to enhance your creative process.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline">Generate Product Descriptions</CardTitle>
                  <CardDescription>Employ AI to generate optimized product descriptions for improved SEO and customer engagement.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductDescriptionGenerator />
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline">Suggest Art Compositions</CardTitle>
                  <CardDescription>Use AI to get suggestions for complementary frame compositions to boost your sales.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CompositionSuggester />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
