
import Image from 'next/image';
import Link from 'next/link';
import { collections } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';

export default function FeaturedCollections() {
  // Exibindo mais coleções, como no exemplo.
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
            <Link href={`/collection/${collection.slug}`} key={collection.name} className="flex flex-col items-center gap-2 group">
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                    <Image
                        src={collection.image}
                        alt={collection.name}
                        data-ai-hint={collection.hint}
                        fill
                        className="object-cover"
                    />
                </div>
                <h3 className="font-semibold text-center text-sm md:text-base group-hover:text-primary">{collection.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
