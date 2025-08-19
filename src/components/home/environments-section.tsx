import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const environments = [
  {
    name: 'Sala',
    href: '/collection/abstrato', 
    image: 'https://39124.cdn.simplo7.net/static/39124/sku/mosaico-conjunto-de-quadros-para-sala-por-do-sol-nas-montanhas--p-1588084392529.jpg',
    hint: 'modern living room'
  },
  {
    name: 'Quarto',
    href: '/collection/floral',
    image: 'https://cdn.iset.io/assets/58966/produtos/59176/ac980946d21b23807c9b4681f978cfeb6848746b4ddb4.png',
    hint: 'cozy bedroom'
  },
  {
    name: 'Escritório',
    href: '/collection/frases-tipografia',
    image: 'https://casalinda.cdn.magazord.com.br/img/2023/07/produto/6518/casa-linda-modern-office-with-23-vertical-frame-with-mirror-in-e9432cbd-4f96-4f3f-8c42-c57271298816.jpg?ims=fit-in/690x690/filters:fill(white)',
    hint: 'modern office'
  }
];

export default function EnvironmentsSection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <h2 className="text-xl md:text-2xl font-headline font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
            Navegue pelos Ambientes
          </h2>
          <div className="flex-grow border-t border-gray-300 ml-4"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {environments.map((env) => (
            <Link href={env.href} key={env.name} className="group block relative aspect-square overflow-hidden rounded-lg shadow-lg">
              <Image
                src={env.image}
                alt={`Quadros para ${env.name}`}
                data-ai-hint={env.hint}
                fill
                style={{ objectFit: 'cover' }}
                className="brightness-50 group-hover:brightness-60 transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                <p className="text-lg font-light">QUADROS PARA</p>
                <h3 className="text-5xl font-extrabold uppercase">{env.name}</h3>
                 <Button variant="outline" className="mt-4 bg-transparent text-white border-2 border-white rounded-none w-32 hover:bg-white hover:text-black transition-colors duration-300">
                    VER AGORA
                 </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
