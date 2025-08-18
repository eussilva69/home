
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, Brush, ChevronDown, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { logoutAction, getProducts } from '@/app/actions';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useClientOnly } from '@/hooks/use-client-only';
import { Input } from '../ui/input';
import SearchSuggestions from '../search/search-suggestions';
import type { Product } from '@/lib/schemas';


export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const isClient = useClientOnly();

  const handleLogout = async () => {
    await signOut(auth);
    await logoutAction();
    router.push('/');
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        setIsLoading(true);
        const allProducts = await getProducts();
        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setSuggestions(filtered);
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    };
    
    const debounceFetch = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
        setSuggestions([]);
        if (isMenuOpen) setMenuOpen(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
    if (isMenuOpen) setMenuOpen(false);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const categoriesInColumns = () => {
    const total = collections.length;
    const itemsPerColumn = Math.ceil(total / 3);
    const columns = [];
    for (let i = 0; i < 3; i++) {
        columns.push(collections.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }
    return columns;
  };
  const collectionColumns = categoriesInColumns();


  return (
    <header className="sticky top-0 z-50 w-full bg-primary border-b shadow-md">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
             <Image src="https://i.ibb.co/hK5yF01/logo-sem-fundo.png" alt="Home Designer Logo" width={80} height={80} />
            <h1 className="text-2xl font-headline font-bold text-white whitespace-nowrap">Home Designer</h1>
          </Link>
          
          <div className="hidden lg:flex w-full max-w-md mx-4 relative">
             <form onSubmit={handleSearchSubmit} className="w-full">
               <Input 
                  placeholder="Buscar..." 
                  className="pr-10 h-11 bg-white text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.length > 1) setSuggestions(suggestions); }}
               />
               <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-black">
                  <Search className="h-5 w-5"/>
               </Button>
             </form>
             {suggestions.length > 0 && searchTerm.length > 1 && (
               <SearchSuggestions 
                 suggestions={suggestions}
                 isLoading={isLoading}
                 onSuggestionClick={handleSuggestionClick}
               />
             )}
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
             <Link href={user ? '/dashboard' : '/login'} className="flex items-center gap-2 text-white hover:text-gray-300">
                  <User className="h-7 w-7"/>
                   <div>
                      <p className="text-xs">{user ? `${user.displayName?.split(' ')[0]}`: 'Minha Conta'}</p>
                      <span className="text-sm font-semibold">{user ? 'Ver Perfil' : 'Entrar'}</span>
                  </div>
             </Link>
             <Link href="/cart" className="relative flex items-center gap-2 text-white hover:text-gray-300">
                <ShoppingCart className="h-7 w-7" />
                 {isClient && totalItems > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                  <div>
                      <p className="text-xs">Carrinho</p>
                      <span className="text-sm font-semibold">Ver Itens</span>
                  </div>
             </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
              <Link href="/cart" className="relative">
               <Button variant="ghost" size="icon" className="text-white">
                  <ShoppingCart className="h-6 w-6" />
                   {isClient && totalItems > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold">
                        {totalItems}
                      </span>
                    )}
                </Button>
             </Link>
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm flex flex-col p-0 bg-primary text-primary-foreground">
                  <SheetHeader className="p-4 border-b border-gray-700">
                     <SheetTitle className="text-left text-white">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex-grow overflow-y-auto">
                      <div className="p-4">
                          <form onSubmit={handleSearchSubmit}>
                              <div className="relative">
                                  <Input 
                                      placeholder="Buscar..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="bg-gray-800 border-gray-600 text-white"
                                  />
                                  <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full text-white">
                                      <Search className="h-5 w-5" />
                                  </Button>
                              </div>
                          </form>
                      </div>

                      <nav className="flex flex-col gap-1 p-4">
                          <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="collections" className="border-b-0">
                                  <AccordionTrigger className="text-base font-semibold py-3 hover:no-underline">Coleções</AccordionTrigger>
                                  <AccordionContent className="pl-4">
                                       <div className="grid grid-cols-1 gap-2">
                                          {collections.map((collection) => (
                                            <Link
                                              key={collection.name}
                                              href={`/collection/${collection.slug}`}
                                              className="flex items-center gap-3 p-2 -m-2 rounded-md hover:bg-gray-700"
                                              onClick={() => setMenuOpen(false)}
                                            >
                                              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 relative">
                                                  <Image
                                                    src={collection.image}
                                                    alt={collection.name}
                                                    data-ai-hint={collection.hint}
                                                    fill
                                                    sizes="40px"
                                                    className="w-full h-full object-cover"
                                                  />
                                               </div>
                                              <span className="text-sm">{collection.name}</span>
                                            </Link>
                                          ))}
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                          <Link href="/monte-seu-quadro" className="text-base font-semibold p-3 -m-3 rounded-md hover:bg-gray-700 block" onClick={() => setMenuOpen(false)}>Personalize sua Foto</Link>
                          <Link href="/contato" className="text-base font-semibold p-3 -m-3 rounded-md hover:bg-gray-700 block" onClick={() => setMenuOpen(false)}>Atendimento</Link>
                      </nav>
                  </div>

                  <div className="mt-auto p-4 border-t border-gray-700">
                      {user ? (
                          <div className="space-y-2">
                               <Link href="/dashboard" className="w-full" onClick={() => setMenuOpen(false)}>
                                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent text-white hover:bg-gray-700">
                                      <User className="h-5 w-5" /> Minha Conta
                                  </Button>
                              </Link>
                               <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:text-red-400 hover:bg-red-400/10" onClick={handleLogout}>
                                  <LogOut className="h-5 w-5" /> Sair
                              </Button>
                          </div>
                      ) : (
                           <Link href="/login" className="w-full" onClick={() => setMenuOpen(false)}>
                              <Button className="w-full bg-white text-black hover:bg-gray-200">
                                  <User className="mr-2"/> Entrar ou Cadastrar
                              </Button>
                          </Link>
                      )}
                  </div>
              </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar (Desktop Only) */}
      <nav className="hidden lg:flex container mx-auto h-12 items-center justify-center px-4">
        <div className="flex items-center gap-6 text-sm font-medium text-primary-foreground">
           <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
            <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="font-bold flex items-center gap-1 transition-colors hover:bg-primary/80"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                >
                  Coleções <ChevronDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[48rem] p-6 bg-primary text-primary-foreground" 
                align="start"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
            >
                <p className="font-bold text-lg mb-4 uppercase tracking-wider text-center">Categorias</p>
                <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                  {collectionColumns.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-2">
                      {column.map((collection) => (
                        <Link
                          key={collection.name}
                          href={`/collection/${collection.slug}`}
                          className="block p-1 rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => setCollectionsOpen(false)}
                        >
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
            </PopoverContent>
          </Popover>

          <Link href="/furnitures" className="transition-colors hover:text-primary-foreground/80">Mobílias</Link>
          <Link href="/monte-seu-quadro" className="transition-colors hover:text-red-400 font-bold text-red-500">Personalize sua Foto</Link>
          <Link href="/contato" className="transition-colors hover:text-primary-foreground/80">Atendimento</Link>
        </div>
      </nav>

    </header>
  );
}
