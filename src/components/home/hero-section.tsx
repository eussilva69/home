
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[350px] md:h-[500px] bg-black">
      <Image
        src="https://images.tcdn.com.br/img/img_prod/1109053/1680525992_leaocolorido.png"
        alt="Coleção Leões"
        fill
        className="object-cover opacity-50"
        priority
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h1 className="text-sm md:text-xl font-light uppercase tracking-widest">Coleção</h1>
        <h2 className="text-5xl md:text-8xl font-headline font-extrabold italic text-amber-300 drop-shadow-lg" style={{ fontFamily: 'serif' }}>
          Leões
        </h2>
        <Button asChild size="lg" className="mt-6 bg-white text-black hover:bg-gray-200 font-bold">
          <Link href="/collection/animais">Conheça nossos quadros de leões</Link>
        </Button>
      </div>
    </section>
  );
}
