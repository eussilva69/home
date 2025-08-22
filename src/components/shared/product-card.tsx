
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const isFurniture = product.category === 'Mobílias';
  
  const mainImageUrl = product.image || "https://placehold.co/400x500.png";
  const hoverImageUrl = isFurniture 
    ? (product.image_alt || mainImageUrl) 
    : (product.environment_images && product.environment_images.length > 0 ? product.environment_images[0] : (product.image_alt || mainImageUrl));


  return (
    <Link href={`/product/${product.id}`} className="group block">
        <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                <div className="relative aspect-[4/5] bg-muted/50 transition-all duration-300">
                     <Image
                        src={hoverImageUrl}
                        alt={`${product.name} em um ambiente`}
                        data-ai-hint={product.hint_alt}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={cn(
                            'object-cover transition-opacity duration-300',
                            'opacity-100 group-hover:opacity-0'
                        )}
                     />
                      <Image
                        src={mainImageUrl}
                        alt={product.name}
                        data-ai-hint={product.hint}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={cn(
                           'object-contain p-4 transition-opacity duration-300',
                           'opacity-0 group-hover:opacity-100'
                        )}
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
