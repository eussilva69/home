
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProducts } from '@/app/actions';
import { collections } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ListFilter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const PRODUCTS_PER_PAGE = 24;

const SidebarContent = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  furnitureSubCategories,
  selectedFurnitureSubCategory,
  onSelectFurnitureSubCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
  furnitureSubCategories: string[];
  selectedFurnitureSubCategory: string;
  onSelectFurnitureSubCategory: (subCategory: string) => void;
}) => (
  <aside className="w-full lg:w-64 lg:pr-8 space-y-4">
    <h2 className="text-xl font-semibold text-primary mb-4">Categorias</h2>
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectFurnitureSubCategory('');
          }}
          className={cn(
            'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
            selectedCategory === 'all' && !selectedFurnitureSubCategory ? 'text-primary font-semibold' : ''
          )}
        >
          Todas
        </button>
      </li>
      {collections.map((cat) => {
        const count = categoryCounts[cat.name] || 0;
        if (count === 0 && cat.name !== 'Mobílias') return null;

        const isFurnitureCategory = cat.name === 'Mobílias';
        const isSelected = selectedCategory === cat.name || (isFurnitureCategory && !!selectedFurnitureSubCategory);
        
        if (isFurnitureCategory) {
            return (
                <li key={cat.slug}>
                    <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="w-full">
                           <div
                              className={cn(
                                'w-full flex justify-between items-center text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
                                isSelected ? 'text-primary font-semibold' : ''
                              )}
                            >
                              {cat.name} ({count})
                              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 pt-2">
                            <ul className="space-y-2">
                               {furnitureSubCategories.map(subCat => {
                                 const subCatCount = categoryCounts[subCat] || 0;
                                 if (subCatCount === 0) return null;
                                 return (
                                     <li key={subCat}>
                                         <button
                                             onClick={() => onSelectFurnitureSubCategory(subCat)}
                                             className={cn(
                                                'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary text-sm',
                                                selectedFurnitureSubCategory === subCat ? 'text-primary font-semibold' : ''
                                             )}
                                         >
                                             {subCat} ({subCatCount})
                                         </button>
                                     </li>
                                 )
                               })}
                            </ul>
                        </CollapsibleContent>
                    </Collapsible>
                </li>
            )
        }

        return (
          <li key={cat.slug}>
            <button
              onClick={() => {
                onSelectCategory(cat.name);
                onSelectFurnitureSubCategory('');
              }}
              className={cn(
                'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
                isSelected ? 'text-primary font-semibold' : ''
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
  const [selectedFurnitureSubCategory, setSelectedFurnitureSubCategory] = useState('');

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      const products = await getProducts();
      setAllProducts(products);
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  const { categoryCounts, furnitureSubCategories } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const subCats = new Set<string>();

    for (const product of allProducts) {
      if (product.category) {
        counts[product.category] = (counts[product.category] || 0) + 1;
        if (product.category === 'Mobílias' && product.arrangement) {
          subCats.add(product.arrangement);
          counts[product.arrangement] = (counts[product.arrangement] || 0) + 1;
        }
      }
    }
    return { categoryCounts: counts, furnitureSubCategories: Array.from(subCats).sort() };
  }, [allProducts]);

  const handleSelectCategory = (category: string) => {
      setSelectedCategory(category);
      setSelectedFurnitureSubCategory('');
  };

  const handleSelectFurnitureSubCategory = (subCategory: string) => {
      setSelectedCategory('Mobílias');
      setSelectedFurnitureSubCategory(subCategory);
  };

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by search term
    if (searchTerm) {
      products = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedFurnitureSubCategory) {
      products = products.filter(p => p.category === 'Mobílias' && p.arrangement === selectedFurnitureSubCategory);
    } else if (selectedCategory !== 'all') {
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
  }, [allProducts, searchTerm, selectedCategory, selectedFurnitureSubCategory, sortBy]);
  
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
      <main className="flex-grow container mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar for Desktop */}
          <div className="hidden lg:block">
            <SidebarContent 
              selectedCategory={selectedCategory} 
              onSelectCategory={handleSelectCategory} 
              categoryCounts={categoryCounts}
              furnitureSubCategories={furnitureSubCategories}
              selectedFurnitureSubCategory={selectedFurnitureSubCategory}
              onSelectFurnitureSubCategory={handleSelectFurnitureSubCategory}
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
                       onSelectCategory={handleSelectCategory} 
                       categoryCounts={categoryCounts}
                       furnitureSubCategories={furnitureSubCategories}
                       selectedFurnitureSubCategory={selectedFurnitureSubCategory}
                       onSelectFurnitureSubCategory={handleSelectFurnitureSubCategory}
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
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}
