import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: 'CONSULTORIA E SIMULAÇÃO',
    description: 'Clique aqui para simular e escolher o quadro perfeito.',
    href: '/monte-seu-quadro',
    image: 'https://images.tcdn.com.br/img/img_prod/703418/papel_de_parede_adesivo_ariana_clean_756_1_20200217074948.jpg',
    hint: 'modern dining room',
  },
  {
    title: 'MÓVEIS PLANEJADOS',
    description: 'Tem uma ideia? Fale conosco e solicite um orçamento.',
    href: '/orcamento',
    image: 'https://dl7j1x8aohko6.cloudfront.net/2024/08/estilos-contemporaneo-industrial-retro-ape-despojado-180-m2-escala-arquitetura-credito-andre-nazareth-8.webp',
    hint: 'luxury living room',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Link href={service.href} key={service.title}>
              <Card className="group relative w-full overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105">
                <CardContent className="p-0 aspect-[16/10]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    data-ai-hint={service.hint}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="brightness-50 group-hover:brightness-75 transition-all duration-300"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="border-2 border-white p-4">
                      <h3 className="text-2xl lg:text-3xl font-headline font-semibold tracking-wider">
                        {service.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-lg italic">
                      {service.description}
                    </p>
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
