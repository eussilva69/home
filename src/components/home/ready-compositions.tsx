
import Image from 'next/image';
import Link from 'next/link';
import { compositions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ReadyCompositions() {
  return (
    <section id="compositions" className="py-12 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">Composições Prontas</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Paredes de galeria selecionadas por profissionais para elevar sua casa instantaneamente.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
          {compositions.map((composition) => (
            <Link href="#" key={composition.id}>
              <Card className="overflow-hidden group relative rounded-lg shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0 aspect-video">
                  <Image
                      src={composition.image}
                      alt={composition.name}
                      data-ai-hint={composition.hint}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                  />
                   <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center p-4">
                      <h3 className="text-xl md:text-2xl text-center font-headline text-white font-bold drop-shadow-md">{composition.name}</h3>
                      <Button variant="secondary" className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Ver Composição</Button>
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
