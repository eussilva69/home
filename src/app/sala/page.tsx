
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { getProducts } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Função para embaralhar um array
function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const PRODUCTS_PER_PAGE = 12;

export default function SalaPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      const products = await getProducts();
      // Idealmente, você filtraria por produtos específicos de "Sala"
      const shuffled = shuffleArray(products);
      setAllProducts(shuffled);
      setDisplayedProducts(shuffled.slice(0, PRODUCTS_PER_PAGE));
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const nextProducts = allProducts.slice(0, nextPage * PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 500);
  };
  
  const hasMoreProducts = displayedProducts.length < allProducts.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Quadros para Sala</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Encontre a arte perfeita para o coração da sua casa.</p>
        </div>
        
        {loading ? (
            <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {hasMoreProducts && (
                <div className="text-center mt-12">
                    <Button onClick={handleLoadMore} disabled={loadingMore} size="lg">
                        {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                    </Button>
                </div>
            )}
          </>
        ) : (
            <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">Nenhum produto encontrado.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
