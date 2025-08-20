'use client';

import ProductCard from '@/components/shared/product-card';
import type { Product } from '@/lib/schemas';

type BestSellersProps = {
  products: Product[];
};

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) {
    return null; // Don't render a section if there are no products to show
  }

  return (
    <section id="bestsellers" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">OS MAIS VENDIDOS DO BRASIL</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Amados por nossos clientes, perfeitos para o seu espaço.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
