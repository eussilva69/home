
import Image from 'next/image';
import Link from 'next/link';
import { collections } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';

export default function FeaturedCollections() {
  const featuredCollections = collections.slice(0, 4);
  return (
    <section id="collections" className="py-12 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">Coleções em Destaque</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Explore nossas coleções selecionadas para todos os estilos.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredCollections.map((collection) => (
            <Link href={`/collection/${collection.slug}`} key={collection.name}>
                <Card className="overflow-hidden group relative rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-0 aspect-[4/3]">
                        <Image
                            src={collection.image}
                            alt={collection.name}
                            data-ai-hint={collection.hint}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                            <h3 className="text-xl md:text-2xl text-center font-headline text-white font-bold drop-shadow-md">{collection.name}</h3>
                        </div>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
