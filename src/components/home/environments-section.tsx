
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoIntro from './video-intro';

const environments = [
  {
    name: 'Sala',
    href: '/sala',
    video: '/sala.mp4',
    image: 'https://39124.cdn.simplo7.net/static/39124/sku/mosaico-conjunto-de-quadros-para-sala-por-do-sol-nas-montanhas--p-1588084392529.jpg',
    hint: 'modern living room'
  },
  {
    name: 'Quarto',
    href: '/quarto',
    video: '/quarto.mp4',
    image: 'https://cdn.iset.io/assets/58966/produtos/59176/ac980946d21b23807c9b4681f978cfeb6848746b4ddb4.png',
    hint: 'cozy bedroom'
  },
  {
    name: 'Animais',
    href: '/animais',
    video: '/animais.mp4',
    image: 'https://cdn.dooca.store/152646/products/01-502_640x640+fill_ffffff.jpg?v=1723473487&webp=0',
    hint: 'wild animals'
  }
];

export default function EnvironmentsSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('');

  const handleVideoEnd = () => {
    setActiveVideo(null);
    setRedirectUrl('');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>, env: typeof environments[0]) => {
    if (env.video) {
      e.preventDefault();
      e.stopPropagation();
      setRedirectUrl(env.href);
      setActiveVideo(env.video);
    }
  };

  return (
    <>
      <VideoIntro activeVideo={activeVideo} onVideoEnd={handleVideoEnd} redirectUrl={redirectUrl} />
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
              <Link 
                href={env.href} 
                key={env.name} 
                className="group block relative aspect-square overflow-hidden rounded-lg shadow-lg"
                onClick={(e) => handleLinkClick(e, env)}
              >
                <Image
                  src={env.image}
                  alt={`Quadros para ${env.name}`}
                  data-ai-hint={env.hint}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="brightness-50 group-hover:brightness-60 transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                  <p className="text-lg font-light">QUADROS DE</p>
                  <h3 className="text-5xl font-extrabold uppercase">{env.name}</h3>
                   <div 
                      className="mt-4 bg-transparent text-white border-2 border-white rounded-none w-32 hover:bg-white hover:text-black transition-colors duration-300 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium"
                    >
                      VER AGORA
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
