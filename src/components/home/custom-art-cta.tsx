
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CustomArtCta() {
  return (
    <section className="py-12 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="relative rounded-lg overflow-hidden bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-center md:text-left z-10">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Crie Sua Própria Arte</h2>
            <p className="text-base md:text-lg mb-6 max-w-lg">
              Transforme suas fotos e momentos especiais em quadros únicos. Com nossa ferramenta, você personaliza o tamanho, a moldura e o acabamento do seu jeito.
            </p>
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link href="/monte-seu-quadro">
                Comece a Criar Agora <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2 h-64 md:h-full md:absolute md:right-0 md:top-0 md:opacity-30">
            <Image
              src="https://img.elo7.com.br/product/original/46B4319/quadro-personalizado-com-sua-foto-e-moldura-presente-de-namorados.jpg"
              alt="Mão segurando um quadro personalizado"
              data-ai-hint="custom frame"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
