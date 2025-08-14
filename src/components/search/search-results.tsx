
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/app/actions';
import ProductCard from '@/components/shared/product-card';
import { Loader2, SearchX } from 'lucide-react';
import type { Product } from '@/lib/schemas';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const performSearch = useCallback(async (searchTerm: string) => {
    setLoading(true);
    const allProducts = await getProducts();
    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredProducts);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, performSearch]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Buscando resultados...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        Resultados da Busca por: <span className="text-primary">&quot;{query}&quot;</span>
      </h1>
      <p className="text-muted-foreground mb-8">
        {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}.
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <SearchX className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold">Nenhum resultado encontrado</h2>
          <p className="text-gray-500 mt-2">Tente buscar por um termo diferente ou verifique a ortografia.</p>
        </div>
      )}
    </div>
  );
}
