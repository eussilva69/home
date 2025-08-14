
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/schemas';

type SearchSuggestionsProps = {
  suggestions: Product[];
  isLoading: boolean;
  onSuggestionClick: () => void;
};

export default function SearchSuggestions({ suggestions, isLoading, onSuggestionClick }: SearchSuggestionsProps) {
  return (
    <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
      {isLoading ? (
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <ul>
          {suggestions.map((product, index) => (
            <li key={product.id} onClick={onSuggestionClick}>
              <Link href={`/product/${product.id}`} className="block hover:bg-accent">
                <div className="flex items-center gap-4 p-3">
                  <div className="relative w-12 h-16 rounded-md overflow-hidden bg-muted">
                     <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-sm text-primary">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </Link>
              {index < suggestions.length - 1 && <Separator />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
