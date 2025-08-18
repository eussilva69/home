
'use client';

import React, { useState, useEffect } from 'react';
import { getProducts } from '@/app/actions';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ListFilter, SlidersHorizontal, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/schemas';


const PRODUCTS_PER_PAGE = 20;

export default function FurnituresPage() {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [allFurnitureProducts, setAllFurnitureProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [subCategory, setSubCategory] = useState('todos');

  useEffect(() => {
    const fetchAndSetProducts = async () => {
        setLoading(true);
        const allProducts = await getProducts();
        const furnitureProducts = allProducts.filter((p) => p.category === 'Mobílias');
        setAllFurnitureProducts(furnitureProducts);
        setLoading(false);
    };
    fetchAndSetProducts();
  }, []);

  
  useEffect(() => {
    if (allFurnitureProducts.length > 0) {
      let tempProducts = allFurnitureProducts;

      // Filter by sub-category (arrangement)
      if (subCategory !== 'todos') {
        tempProducts = tempProducts.filter(p => p.arrangement === subCategory);
      } 
      
      setFilteredProducts(tempProducts);
      setDisplayedProducts(tempProducts.slice(0, PRODUCTS_PER_PAGE));
      setCurrentPage(1);
    }
  }, [subCategory, allFurnitureProducts]);


  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const nextProducts = filteredProducts.slice(0, nextPage * PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 500);
  };
  
  const hasMoreProducts = displayedProducts.length < filteredProducts.length;

  const subCategoryOptions = ['Mesas', 'Nichos', 'Cabeceiras'];


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Mobílias</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossa seleção de móveis para complementar seu espaço.</p>
        </div>
        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
             <Card>
                <CardContent className="p-4 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><ListFilter /> Filtros</h3>
                     <div>
                        <Label className="flex items-center gap-2 font-semibold mb-2"><Tag /> Tipo</Label>
                        <Select onValueChange={setSubCategory} defaultValue="todos">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                {subCategoryOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
             </Card>
          </aside>
          
          <div className="lg:col-span-3">
             <div className="lg:hidden mb-4">
                 <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <ListFilter className="mr-2"/> Mostrar Filtros
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <Card className="mt-2">
                           <CardContent className="p-4 space-y-4">
                                <div>
                                    <Label className="flex items-center gap-2 font-semibold mb-2"><Tag /> Tipo</Label>
                                    <Select onValueChange={setSubCategory} defaultValue="todos">
                                        <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            {subCategoryOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                           </CardContent>
                       </Card>
                    </CollapsibleContent>
                 </Collapsible>
            </div>
            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                </div>
            ) : displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {displayedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {hasMoreProducts && (
                    <div className="text-center mt-12">
                        <Button onClick={handleLoadMore} disabled={loadingMore} size="lg">
                            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
                        </Button>
                    </div>
                )}
              </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
                </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
