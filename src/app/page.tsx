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
import { getProducts } from "@/app/actions";
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '@/lib/schemas';

// Helper to extract the base ID from a cart item ID
const getBaseProductId = (cartItemId: string): string => {
    const match = cartItemId.match(/^[A-Z]{2}-[A-Z0-9]{1,2}/);
    if (match) {
        return match[0];
    }
    return cartItemId.split('-')[0];
};

// Helper function to shuffle an array and get the first N items
function getFirstNRandomItems<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function getBestSellers() {
  let bestSellers: Product[] = [];
  const allProducts = await getProducts();
  
  try {
    const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
    
    if (ordersSnapshot.empty) {
      return getFirstNRandomItems(allProducts, 4);
    }

    const productCounts = new Map<string, number>();
    ordersSnapshot.forEach(doc => {
      const orderItems = doc.data().items || [];
      orderItems.forEach((item: { id: string, quantity: number }) => {
        const baseId = getBaseProductId(item.id);
        productCounts.set(baseId, (productCounts.get(baseId) || 0) + item.quantity);
      });
    });

    const sortedProducts = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]);
    const top4Ids = sortedProducts.slice(0, 4).map(entry => entry[0]);
    
    if (top4Ids.length > 0) {
      bestSellers = top4Ids.map(id => allProducts.find(p => p.id === id)).filter((p): p is Product => p !== undefined);
    }
    
    if (bestSellers.length < 4) {
      const remainingNeeded = 4 - bestSellers.length;
      const existingIds = new Set(bestSellers.map(p => p.id));
      const potentialFallbacks = allProducts.filter(p => !existingIds.has(p.id));
      const randomFallback = getFirstNRandomItems(potentialFallbacks, remainingNeeded);
      bestSellers.push(...randomFallback);
    }
  } catch (error) {
    console.error("Erro ao buscar os mais vendidos, usando fallback aleatório:", error);
    return getFirstNRandomItems(allProducts, 4);
  }
  
  return bestSellers;
}

export default async function Home() {
  const bestSellersData = await getBestSellers();
  const allProducts = await getProducts();
  const randomProductsData = getFirstNRandomItems(allProducts, 4);
  const minimalistProductsData = allProducts.filter(p => p.category === 'Minimalista');

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
        <MinimalistSection products={minimalistProductsData} />
        <EnvironmentsSection />
        <RandomProducts products={randomProductsData} />
        <BestSellers products={bestSellersData} />
      </main>
      <FeatureBar />
      <Footer />
    </div>
  );
}
