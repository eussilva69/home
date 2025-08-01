
'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { collections, products } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const PRODUCTS_PER_PAGE = 20;

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = collections.find((c) => c.slug === params.slug);
  
  const [displayedProducts, setDisplayedProducts] = useState<typeof products>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [allCollectionProducts, setAllCollectionProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      const filteredProducts = products.filter((p) => p.category === collection.name);
      setAllCollectionProducts(filteredProducts);
      setDisplayedProducts(filteredProducts.slice(0, PRODUCTS_PER_PAGE));
      setCurrentPage(1);
    }
  }, [collection]);

  if (!collection) {
    notFound();
  }

  const handleLoadMore = () => {
    setLoading(true);
    const nextPage = currentPage + 1;
    const nextProducts = allCollectionProducts.slice(
      0,
      nextPage * PRODUCTS_PER_PAGE
    );
    // Simulate network delay
    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setLoading(false);
    }, 500);
  };

  const hasMoreProducts = displayedProducts.length < allCollectionProducts.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-headline text-primary">Coleção {collection.name}</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossa seleção de arte {collection.name.toLowerCase()}.</p>
        </div>
        <Separator className="my-8" />

        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {hasMoreProducts && (
                <div className="text-center mt-12">
                    <Button onClick={handleLoadMore} disabled={loading} size="lg">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                    </Button>
                </div>
            )}
          </>
        ) : (
            <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">Nenhum produto encontrado nesta coleção ainda.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
