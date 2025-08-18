import Header from "@/components/layout/header";
import FeaturedCollections from "@/components/home/featured-collections";
import Footer from "@/components/layout/footer";
import EnvironmentsSection from "@/components/home/environments-section";
import BestSellers from "@/components/home/best-sellers";
import RandomProducts from "@/components/home/random-products";
import Link from "next/link";
import Image from "next/image";
import MinimalistSection from "@/components/home/minimalist-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative bg-[#efe7da] text-primary pt-4">
         {/* Top Announcement Bar */}
        <div className="text-center bg-[#f6f3ef] text-xs p-2 text-gray-600">
          Winter Sale - Ganhe 20%OFF + Frete Grátis. <Link href="#" className="underline">Saiba mais</Link>
        </div>

        {/* Hero Content */}
        <Header />
        <div className="relative w-full h-[800px]">
           <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Sala de estar com quadros na parede"
              data-ai-hint="modern living room"
              fill
              className="object-cover"
              priority
           />
           <div className="absolute inset-0 bg-black/10" />
           <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-white p-8">
              <p className="font-light tracking-widest">WINTER SALE</p>
              <h2 className="text-8xl font-bold">20% off</h2>
           </div>
        </div>
      </div>
      
      <main className="flex-grow">
        <FeaturedCollections />
        <MinimalistSection />
        <EnvironmentsSection />
        <RandomProducts />
        <BestSellers />
      </main>
      <Footer />
    </div>
  );
}
