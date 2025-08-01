"use client";

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import Autoplay from "embla-carousel-autoplay";

const slides = [
  {
    image: "https://placehold.co/1600x800.png",
    hint: "abstract art",
    title: "Vibrant New Collections",
    description: "Discover unique pieces that bring your walls to life.",
  },
  {
    image: "https://placehold.co/1600x800.png",
    hint: "modern living room",
    title: "Summer Sale: Up to 40% Off",
    description: "Don't miss out on our seasonal promotions. Redecorate for less.",
  },
  {
    image: "https://placehold.co/1600x800.png",
    hint: "minimalist decor",
    title: "The Minimalist Edit",
    description: "Explore curated art for a clean and modern aesthetic.",
  },
];

export default function HeroSection() {
  return (
    <section className="w-full py-6 md:py-12">
      <div className="container mx-auto px-4">
        <Carousel 
          className="w-full"
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <Card className="border-none shadow-none">
                  <CardContent className="relative flex items-center justify-center p-0 h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      data-ai-hint={slide.hint}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="brightness-50"
                    />
                    <div className="relative z-10 text-center text-primary-foreground p-4">
                      <h2 className="text-3xl md:text-5xl font-headline font-bold drop-shadow-lg">
                        {slide.title}
                      </h2>
                      <p className="mt-2 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                        {slide.description}
                      </p>
                      <Button size="lg" className="mt-6 bg-primary hover:bg-accent hover:text-accent-foreground text-primary-foreground">
                        Shop Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
