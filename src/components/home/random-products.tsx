'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/shared/product-card';
import type { Product } from '@/lib/schemas';
import { getProducts } from '@/app/actions';
import { Loader2 } from 'lucide-react';

// Função para embaralhar um array
function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function RandomProducts() {
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetProducts = async () => {
      if (!loading) return; // Evita re-buscas desnecessárias
      try {
        const allProducts = await getProducts();
        const shuffled = shuffleArray(allProducts);
        setRandomProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch random products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndSetProducts();
  }, [loading]); // Dependência em 'loading' para re-executar se necessário
  
  if (loading) {
    return (
        <section id="random-products" className="py-12 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4 text-center">
                 <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
        </section>
    );
  }

  if (randomProducts.length === 0) return null;

  return (
    <section id="random-products" className="py-12 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">LANÇAMENTOS DESTE MÊS</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Uma seleção de artes para todos os gostos.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {randomProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}