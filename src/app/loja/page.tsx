
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts } from '@/app/actions';
import { collections } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ListFilter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/lib/schemas';

const PRODUCTS_PER_PAGE = 24;

const SidebarContent = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
}) => (
  <aside className="w-full lg:w-64 lg:pr-8 space-y-4">
    <h2 className="text-xl font-semibold text-primary mb-4">Categorias</h2>
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => onSelectCategory('all')}
          className={cn(
            'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
            selectedCategory === 'all' ? 'text-primary font-semibold' : ''
          )}
        >
          Todas
        </button>
      </li>
      {collections.map((cat) => {
        const count = categoryCounts[cat.name] || 0;
        if (count === 0) return null; // Não mostra categorias vazias
        return (
          <li key={cat.slug}>
            <button
              onClick={() => onSelectCategory(cat.name)}
              className={cn(
                'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
                selectedCategory === cat.name ? 'text-primary font-semibold' : ''
              )}
            >
              {cat.name} ({count})
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default function LojaPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      const products = await getProducts();
      setAllProducts(products);
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const product of allProducts) {
        if (product.category) {
            counts[product.category] = (counts[product.category] || 0) + 1;
        }
    }
    return counts;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by search term
    if (searchTerm) {
      products = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return products;
  }, [allProducts, searchTerm, selectedCategory, sortBy]);
  
  const hasMoreProducts = useMemo(() => displayedProducts.length < filteredProducts.length, [displayedProducts, filteredProducts]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreProducts) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const nextProducts = filteredProducts.slice(0, nextPage * PRODUCTS_PER_PAGE);
    
    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 500);
  }, [currentPage, filteredProducts, hasMoreProducts, loadingMore]);


  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, PRODUCTS_PER_PAGE));
    setCurrentPage(1);
  }, [filteredProducts]);

  useEffect(() => {
    const handleScroll = () => {
      // Load more when user is 500px from the bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Nossa Loja</h1>
          <p className="text-base text-muted-foreground mt-2">Explore um universo de arte e encontre a peça perfeita.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar for Desktop */}
          <div className="hidden lg:block">
            <SidebarContent 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 border rounded-lg bg-muted/40">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="O que você procura?"
                  className="pl-10 h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden flex-1 h-11">
                      <ListFilter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-6">
                    <SidebarContent 
                      selectedCategory={selectedCategory} 
                      onSelectCategory={setSelectedCategory}
                      categoryCounts={categoryCounts}
                    />
                  </SheetContent>
                </Sheet>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 h-11">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Mais Relevantes</SelectItem>
                    <SelectItem value="price-asc">Menor Preço</SelectItem>
                    <SelectItem value="price-desc">Maior Preço</SelectItem>
                    <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                 {loadingMore && (
                  <div className="text-center mt-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                 <X className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">Nenhum produto encontrado</h3>
                <p>Tente ajustar sua busca ou filtros.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
