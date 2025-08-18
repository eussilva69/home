
import Image from 'next/image';
import Link from 'next/link';

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
    <Link href={`/product/${product.id}`} className="group block relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <Image
          src={product.image}
          alt={product.name}
          data-ai-hint={product.hint}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Ver mais</span>
            <span className="text-lg font-semibold">R$ {product.price.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
    </Link>
  );
}
