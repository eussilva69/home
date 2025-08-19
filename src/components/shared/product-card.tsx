
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/schemas';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  // A imagem do card será a própria arte. O mockup será mostrado na página do produto.
  const imageUrl = product.artwork_image || product.image || "https://placehold.co/400x500.png";

  return (
    <Link href={`/product/${product.id}`} className="group block">
        <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                <div className="relative aspect-[4/5] bg-muted/50 transition-all duration-300 group-hover:bg-muted">
                     <Image
                        src={imageUrl}
                        alt={product.name}
                        data-ai-hint={product.hint}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
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
