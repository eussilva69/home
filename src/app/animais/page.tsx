

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const PRODUCTS_PER_PAGE = 24;

const animalSubCategories = [
    { name: 'Leão', image: 'https://i.pinimg.com/originals/2b/cc/e0/2bcce0b382a8b6e6ed22fddac8cf64ac.jpg', hint: 'lion' },
    { name: 'Cavalos', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6yog4vJkFRN-39qZb3ljGvSH9BZX0WnyB2UTQla_IigS4fnE3KjcV9IK3XqFqNMTQ5EA&usqp=CAU', hint: 'horses' },
    { name: 'Cachorro', image: 'https://img.freepik.com/fotos-gratis/fotografia-vertical-de-foco-superficial-de-um-bonito-cachorro-de-golden-retriever-sentado-em-um-chao-de-grama_181624-27259.jpg?semt=ais_hybrid&w=740&q=80', hint: 'dog' },
    { name: 'Tigre', image: 'https://images.unsplash.com/photo-1430876988766-1be68caef0e4?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFwZWwlMjBkZSUyMHBhcmVkZSUyMHRpZ3JlfGVufDB8fDB8fHww', hint: 'tiger' },
    { name: 'Lobo', image: 'https://png.pngtree.com/thumb_back/fh260/background/20230529/pngtree-large-wolf-wallpapers-3d-download-wallpaper-3d-image_2672886.jpg', hint: 'wolf' },
    { name: 'Onça', image: 'https://t3.ftcdn.net/jpg/06/23/20/12/360_F_623201235_xm5za760r7k60FpPQTFacPexFsrPUiTr.jpg', hint: 'jaguar' },
    { name: 'Pássaro', image: 'https://wallpapers.com/images/featured/passaros-do-amor-oc5210ad7jb4blev.jpg', hint: 'bird' },
    { name: 'Borboletas', image: 'https://marketplace.canva.com/EAFXV-I6d8o/2/0/900w/canva-wallpaper-celular-borboleta-moderno-azul-e-preto-KT_Kikl5ahQ.jpg', hint: 'butterflies' },
];

const SidebarContent = ({
  selectedSubCategory,
  onSelectSubCategory,
  categoryCounts,
}: {
  selectedSubCategory: string;
  onSelectSubCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
}) => (
  <aside className="w-full lg:w-64 lg:pr-8 space-y-4">
    <h2 className="text-xl font-semibold text-primary mb-4">Categorias de Animais</h2>
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => onSelectSubCategory('all')}
          className={cn(
            'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
            selectedSubCategory === 'all' ? 'text-primary font-semibold' : ''
          )}
        >
          Todas
        </button>
      </li>
      {animalSubCategories.map((cat) => {
        const count = categoryCounts[cat.name] || 0;
        if (count === 0) return null;
        return (
          <li key={cat.name}>
            <button
              onClick={() => onSelectSubCategory(cat.name)}
              className={cn(
                'w-full text-left p-1 rounded-md transition-colors text-muted-foreground hover:text-primary',
                selectedSubCategory === cat.name ? 'text-primary font-semibold' : ''
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

export default function AnimaisPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      const products = await getProducts();
      // Filtra apenas produtos da categoria principal "Animais"
      const animalProducts = products.filter(p => animalSubCategories.some(ac => ac.name === p.category));
      setAllProducts(animalProducts);
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

    if (searchTerm) {
      products = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedSubCategory !== 'all') {
      products = products.filter((p) => p.category === selectedSubCategory);
    }

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
  }, [allProducts, searchTerm, selectedSubCategory, sortBy]);
  
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
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">

        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Quadros de Animais</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Explore nossas coleções e encontre a arte que mais combina com você.</p>
        </div>

        <div className="py-8">
            <h2 className="text-2xl font-semibold text-center mb-6">Compre por Categoria</h2>
            <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto pb-4">
                {animalSubCategories.map((cat) => (
                    <button key={cat.name} onClick={() => setSelectedSubCategory(cat.name)} className="flex flex-col items-center gap-2 group flex-shrink-0">
                        <div className={cn(
                            "relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md transition-all duration-300 group-hover:scale-105",
                            selectedSubCategory === cat.name && "ring-2 ring-primary ring-offset-4"
                        )}>
                            <Image src={cat.image} alt={cat.name} data-ai-hint={cat.hint} fill className="object-cover" />
                        </div>
                        <h3 className="font-semibold text-center text-sm md:text-base group-hover:text-primary w-24 md:w-32 break-words">{cat.name}</h3>
                    </button>
                ))}
            </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar for Desktop */}
          <div className="hidden lg:block">
            <SidebarContent 
              selectedSubCategory={selectedSubCategory} 
              onSelectSubCategory={setSelectedSubCategory} 
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 border rounded-lg bg-muted/40">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar em animais..."
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
                      selectedSubCategory={selectedSubCategory} 
                      onSelectSubCategory={setSelectedSubCategory}
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
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}
