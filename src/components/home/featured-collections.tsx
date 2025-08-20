
import { collections } from '@/lib/mock-data';
import CollectionLink from './collection-link';

export default function FeaturedCollections() {
  const featuredCollections = collections.slice(0, 8); 
  return (
    <section id="collections" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase tracking-wider">Categorias Mais Vendidas</h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-2"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
          {featuredCollections.map((collection) => (
            <CollectionLink key={collection.name} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
