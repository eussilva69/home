"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Truck, CreditCard, BadgePercent, Clock } from 'lucide-react';
import { Button } from '../ui/button';

const features = [
    {
        icon: <BadgePercent className="h-6 w-6" />,
        title: 'DESCONTO NO PIX',
        description: '10% Desconto na sua compra'
    },
    {
        icon: <Truck className="h-6 w-6" />,
        title: 'FRETE GRÁTIS',
        description: 'Regiões Sul e Sudeste'
    },
    {
        icon: <CreditCard className="h-6 w-6" />,
        title: 'PARCELAMENTO',
        description: 'Em até 10x sem juros no cartão'
    },
    {
        icon: <Clock className="h-6 w-6" />,
        title: 'ATENDIMENTO',
        description: 'Segunda à sexta das 8h00 ás 18h00'
    }
];

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="relative w-full h-[550px] md:h-[650px] bg-black group">
        <Link href="/collection/animais" className="block w-full h-full">
            <Image
              src="/banner leao.png"
              alt="Coleção Leões"
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              priority
            />
        </Link>
        <div className="absolute inset-x-0 bottom-0 pb-10 pt-32 bg-gradient-to-t from-black via-black/80 to-transparent">
             <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-white">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-gray-300">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
