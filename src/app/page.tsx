
'use client';

import Header from "@/components/layout/header";
import FeaturedCollections from "@/components/home/featured-collections";
import Footer from "@/components/layout/footer";
import EnvironmentsSection from "@/components/home/environments-section";
import BestSellers from "@/components/home/best-sellers";
import RandomProducts from "@/components/home/random-products";
import Link from "next/link";
import Image from "next/image";
import MinimalistSection from "@/components/home/minimalist-section";
import FeatureBar from "@/components/home/feature-bar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="relative text-primary">
        
        {/* Hero Content */}
        <div className="relative w-full h-screen">
           <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Sala de estar com quadros na parede"
              data-ai-hint="modern living room"
              fill
              className="object-cover"
              priority
              onDragStart={(e) => e.preventDefault()}
           />
           <div className="absolute inset-0 bg-black/10" />
           <div className="absolute top-1/2 left-1/2 md:left-1/4 -translate-x-1/2 -translate-y-1/2 text-white p-8">
              <p className="font-light tracking-widest text-sm md:text-base">WINTER SALE</p>
              <h2 className="text-6xl md:text-8xl font-bold">20% off</h2>
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
      <FeatureBar />
      <Footer />
    </div>
  );
}
