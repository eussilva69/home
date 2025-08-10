
'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { collections, products } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/shared/product-card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2, ListFilter, SlidersHorizontal, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';

const PRODUCTS_PER_PAGE = 20;

type Product = typeof products[0];

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const { slug } = React.use(params);
  const collection = collections.find((c) => c.slug === slug);
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [allCollectionProducts, setAllCollectionProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 500]);
  const [arrangement, setArrangement] = useState('todos');

  useEffect(() => {
    if (collection) {
      const collectionProducts = products.filter((p) => p.category === collection.name);
      setAllCollectionProducts(collectionProducts);
      
      const solos = collectionProducts.filter(p => p.arrangement === 'Solo').slice(0, 4);
      const duplas = collectionProducts.filter(p => p.arrangement === 'Dupla').slice(0, 3);
      const trios = collectionProducts.filter(p => p.arrangement === 'Trio').slice(0, 2);
      
      const initialProducts = [...solos, ...duplas, ...trios];
      setFilteredProducts(initialProducts);
      setDisplayedProducts(initialProducts);
    }
  }, [collection]);
  
  useEffect(() => {
    if (collection) {
      let tempProducts = allCollectionProducts;

      // Filter by price
      tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

      // Filter by arrangement
      if (arrangement !== 'todos') {
        tempProducts = tempProducts.filter(p => p.arrangement === arrangement);
      } else {
        // If 'todos', show the curated list first, then allow loading more
        const solos = allCollectionProducts.filter(p => p.arrangement === 'Solo').slice(0, 4);
        const duplas = allCollectionProducts.filter(p => p.arrangement === 'Dupla').slice(0, 3);
        const trios = allCollectionProducts.filter(p => p.arrangement === 'Trio').slice(0, 2);
        tempProducts = [...solos, ...duplas, ...trios];
      }
      
      setFilteredProducts(tempProducts);
      setDisplayedProducts(tempProducts.slice(0, PRODUCTS_PER_PAGE));
      setCurrentPage(1);
    }
  }, [collection, priceRange, arrangement, allCollectionProducts]);


  if (!collection) {
    notFound();
  }

  const handleLoadMore = () => {
    setLoading(true);
    const nextPage = currentPage + 1;
    // When loading more, we use all products, not just the initial curated list
    const nextProducts = allCollectionProducts
        .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
        .slice(0, nextPage * PRODUCTS_PER_PAGE);

    setTimeout(() => {
      setDisplayedProducts(nextProducts);
      setCurrentPage(nextPage);
      setLoading(false);
    }, 500);
  };
  
  const hasMoreProducts = displayedProducts.length < allCollectionProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]).length;

  const arrangementOptions = ['Solo', 'Dupla', 'Trio'];


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Coleção {collection.name}</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossa seleção de arte {collection.name.toLowerCase()}.</p>
        </div>
        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
             <Card>
                <CardContent className="p-4 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><ListFilter /> Filtros</h3>
                    <div>
                        <Label className="flex items-center gap-2 font-semibold mb-2"><SlidersHorizontal /> Preço</Label>
                        <Slider
                            defaultValue={[0, 500]}
                            max={500}
                            step={10}
                            minStepsBetweenThumbs={1}
                            onValueChange={setPriceRange}
                            thumbs={2}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>R$ {priceRange[0]}</span>
                            <span>R$ {priceRange[1]}</span>
                        </div>
                    </div>
                     <div>
                        <Label className="flex items-center gap-2 font-semibold mb-2"><Palette /> Arranjo</Label>
                        <Select onValueChange={setArrangement} defaultValue="todos">
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o arranjo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                {arrangementOptions.map(opt => (
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
                                    <Label className="flex items-center gap-2 font-semibold mb-2"><SlidersHorizontal /> Preço</Label>
                                    <Slider defaultValue={[0, 500]} max={500} step={10} onValueChange={setPriceRange} thumbs={2} />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                        <span>R$ {priceRange[0]}</span>
                                        <span>R$ {priceRange[1]}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2 font-semibold mb-2"><Palette /> Arranjo</Label>
                                    <Select onValueChange={setArrangement} defaultValue="todos">
                                        <SelectTrigger><SelectValue placeholder="Selecione o arranjo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            {arrangementOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                           </CardContent>
                       </Card>
                    </CollapsibleContent>
                 </Collapsible>
            </div>
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {displayedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {hasMoreProducts && (
                    <div className="text-center mt-12">
                        <Button onClick={handleLoadMore} disabled={loading} size="lg">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Carregar Mais'}
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
