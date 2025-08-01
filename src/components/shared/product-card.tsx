
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    image_alt: string;
    hint: string;
    hint_alt: string;
    arrangement: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const isSolo = product.arrangement === 'Solo';

  return (
    <Card className="group overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <Link href={`/product/${product.id}`} className="block relative aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint={product.hint}
            fill
            style={{ objectFit: 'cover' }}
            className={cn(
                "transition-opacity duration-300",
                isSolo && "group-hover:opacity-0"
            )}
          />
          {isSolo && (
            <Image
              src={product.image_alt}
              alt={`'${product.name}' in a room`}
              data-ai-hint={product.hint_alt}
              fill
              style={{ objectFit: 'cover' }}
              className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
          <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Produto
            </Button>
          </div>
        </Link>
        <div className="p-4 bg-background">
          <h3 className="font-headline text-lg truncate">{product.name}</h3>
          <p className="text-md font-semibold text-primary">
            R${product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
