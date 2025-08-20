
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts } from '@/app/actions';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ListFilter, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/schemas';
import Image from 'next/image';
import { cn } from '@/lib/utils';


const PRODUCTS_PER_PAGE = 20;

const furnitureCategories = [
    { name: 'Nichos', image: 'https://cdn.awsli.com.br/600x450/704/704022/produto/2495701475f4fcbb9fa.jpg', hint: 'niche shelf' },
    { name: 'Prateleiras', image: 'https://placehold.co/150x150.png', hint: 'shelf' },
    { name: 'Mesas', image: 'https://placehold.co/150x150.png', hint: 'table' },
    { name: 'Móveis com Metal', image: 'https://i.pinimg.com/236x/08/9b/8d/089b8dab52d1920a0b00efe761159f0e.jpg', hint: 'metal furniture' },
    { name: 'Espaço Kids', image: 'https://dicasmaonamassa.com.br/wp-content/uploads/2021/10/dia-das-criancas-espaco-de-brincar-9.png', hint: 'kids space' },
    { name: 'Aparadores', image: 'https://images.tcdn.com.br/img/img_prod/1248747/aparador_bless_off_white_hb_moveis_113_1_3580115be2f127da57ecd71f3b4fbbfe.jpeg', hint: 'sideboard' },
    { name: 'Cabeceiras', image: 'https://lutzhomedecor.cdn.magazord.com.br/img/2023/12/produto/740/2.jpg?ims=600x600', hint: 'headboard' }
];

const subCategoryOptions = furnitureCategories.map(c => c.name);

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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Mobílias</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossa seleção de móveis para complementar seu espaço.</p>
        </div>

        <div className="py-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Compre por Categoria</h2>
            <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto pb-4">
                {furnitureCategories.map((cat) => (
                    <button key={cat.name} onClick={() => setSubCategory(cat.name)} className="flex flex-col items-center gap-2 group flex-shrink-0">
                        <div className={cn(
                            "relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md transition-all duration-300 group-hover:scale-105",
                            subCategory === cat.name && "ring-2 ring-primary ring-offset-4"
                        )}>
                            <Image src={cat.image} alt={cat.name} data-ai-hint={cat.hint} fill className="object-cover" />
                        </div>
                        <h3 className="font-semibold text-center text-sm md:text-base group-hover:text-primary w-24 md:w-32 break-words">{cat.name}</h3>
                    </button>
                ))}
            </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
             <Card>
                <CardContent className="p-4 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><ListFilter /> Filtros</h3>
                     <div>
                        <Label className="flex items-center gap-2 font-semibold mb-2"><Tag /> Tipo</Label>
                        <Select onValueChange={setSubCategory} value={subCategory}>
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
                                    <Select onValueChange={setSubCategory} value={subCategory}>
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
            ) : filteredProducts.length > 0 ? (
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
