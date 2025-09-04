
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import type { Product } from '@/lib/schemas';

const MinimalistProductCard = ({ product }: { product: Product }) => {
    return (
        <Link href={`/product/${product.id}`} className="block group">
            <Card className="overflow-hidden border-none shadow-none rounded-none bg-transparent">
                <CardContent className="p-0">
                    <div className="relative aspect-[4/5] bg-[#F7F7F7] flex items-center justify-center p-4">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={300}
                            height={400}
                            quality={100}
                            className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className="pt-4 text-center">
                        <h3 className="font-medium text-base">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">a partir de R$ {product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

type MinimalistSectionProps = {
    products: Product[];
};

export default function MinimalistSection({ products }: MinimalistSectionProps) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <p className="text-sm tracking-widest text-muted-foreground">QUADROS</p>
                    <h2 className="text-4xl md:text-5xl font-headline text-primary">Minimalistas</h2>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4 pl-4">
                                <MinimalistProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-14" />
                    <CarouselNext className="mr-14" />
                </Carousel>
                <div className="text-center mt-10">
                    <Button variant="link" asChild>
                        <Link href="/collection/minimalista" className="text-primary tracking-widest font-semibold">
                            EXPLORE
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
