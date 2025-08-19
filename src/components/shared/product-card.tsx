
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    image_alt: string;
    artwork_image: string;
    hint: string;
    hint_alt: string;
    arrangement: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
        <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
                <div className="relative aspect-[4/5] bg-muted/50 transition-all duration-300 group-hover:bg-muted">
                     <Image
                        src={product.image}
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
