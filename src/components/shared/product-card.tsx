
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const isFurniture = product.category === 'Mobílias';
  
  const hoverImageUrl = product.imagesByColor?.black || product.image || "https://placehold.co/400x500.png";

  const mainImageUrl = (isFurniture 
    ? product.image_alt
    : (product.environment_images && product.environment_images.length > 0 ? product.environment_images[0] : product.image_alt))
    || product.image 
    || "https://placehold.co/400x500.png";


  return (
    <Link href={`/product/${product.id}`} className="group block">
        <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                <div className="relative aspect-[4/5] bg-[#F7F7F7]">
                     <Image
                        src={mainImageUrl}
                        alt={`${product.name} em um ambiente`}
                        data-ai-hint={product.hint_alt}
                        fill
                        className="object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300 p-4"
                        quality={100}
                     />
                      <Image
                        src={hoverImageUrl}
                        alt={product.name}
                        data-ai-hint={product.hint}
                        fill
                        className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4"
                        quality={100}
                     />
                </div>
                <div className="p-4 text-center border-t">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">A partir de R$ {product.price.toFixed(2).replace('.', ',')}</p>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}
