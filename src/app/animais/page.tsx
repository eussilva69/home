
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const animalCollections = collections.filter(c => 
    ['Leão', 'Árvore da Vida', 'Cavalos', 'Borboletas', 'Família de Leões'].includes(c.name)
);

export default function AnimaisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">Quadros de Animais</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            Explore nossas coleções e encontre a arte que mais combina com você.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {animalCollections.map((collection) => (
            <Link href={`/collection/${collection.slug}`} key={collection.slug} className="group">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                   <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white font-bold text-lg">{collection.name}</h3>
                    <div className="flex items-center text-sm text-white/80 group-hover:text-white mt-1">
                      Ver coleção <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
