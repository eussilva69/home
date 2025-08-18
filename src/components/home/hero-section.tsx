
"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="w-full">
      <Link href="/collection/animais" className="block relative w-full h-[350px] md:h-[500px] bg-black group">
        <Image
          src="https://images.tcdn.com.br/img/img_prod/1109053/1680525992_leaocolorido.png"
          alt="Coleção Leões"
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          priority
        />
      </Link>
    </section>
  );
}
