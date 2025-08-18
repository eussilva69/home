"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Truck, CreditCard, BadgePercent, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: <Truck className="h-6 w-6" />,
        title: 'Entregamos em todo BR',
        description: 'Consulte os prazos'
    },
    {
        icon: <CreditCard className="h-6 w-6" />,
        title: 'Parcele Sem Juros',
        description: 'Em até 12x no cartão'
    },
    {
        icon: <BadgePercent className="h-6 w-6" />,
        title: '10% de Desconto',
        description: 'Pix ou boleto bancário'
    },
    {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: 'Compra Segura',
        description: 'Seus dados protegidos'
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
        <div className="absolute inset-x-0 bottom-0 pb-6 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent">
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
