'use client';

import ProductCard from '@/components/shared/product-card';
import type { Product } from '@/lib/schemas';

type RandomProductsProps = {
  products: Product[];
};

export default function RandomProducts({ products }: RandomProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id="random-products" className="py-12 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">LANÇAMENTOS DESTE MÊS</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Uma seleção de artes para todos os gostos.</p>
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
