import { products } from '@/lib/mock-data';
import ProductCard from '@/components/shared/product-card';

export default function BestSellers() {
  const bestSellers = products.slice(0, 4);

  return (
    <section id="bestsellers" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">Nossos Mais Vendidos</h2>
          <p className="text-lg text-muted-foreground mt-2">Amados por nossos clientes, perfeitos para o seu espaço.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
