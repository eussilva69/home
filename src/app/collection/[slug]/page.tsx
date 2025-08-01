
'use client';

import { notFound } from 'next/navigation';
import { collections, products } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Separator } from '@/components/ui/separator';

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = collections.find((c) => c.slug === params.slug);
  
  if (!collection) {
    notFound();
  }

  const collectionProducts = products.filter((p) => p.category === collection.name);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-headline text-primary">Coleção {collection.name}</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossa seleção de arte {collection.name.toLowerCase()}.</p>
        </div>
        <Separator className="my-8" />

        {collectionProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {collectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
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
