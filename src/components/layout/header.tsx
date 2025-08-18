
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, Brush, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useClientOnly } from '@/hooks/use-client-only';
import { Input } from '../ui/input';
import SearchSuggestions from '../search/search-suggestions';
import type { Product } from '@/lib/schemas';
import { getProducts } from '@/app/actions';
import { cn } from '@/lib/utils';


export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useClientOnly();
  
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isHomePage]);


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
  
  const headerClasses = cn(
    "absolute top-10 z-50 w-full transition-all duration-300",
    isHomePage && isScrolled && "fixed top-0 bg-white text-primary shadow-md",
  );
  
  const textColorClass = isHomePage && !isScrolled ? "text-white" : "text-primary";

  if (!isHomePage) {
    return (
        <header className="sticky top-0 z-50 w-full bg-primary border-b shadow-md">
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
                </div>
            </div>
             <nav className="hidden lg:flex container mx-auto h-12 items-center justify-center px-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-6 text-sm font-medium">
                   <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="font-bold flex items-center gap-1 transition-colors hover:bg-primary/80"
                        >
                          Coleções <ChevronDown className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[48rem] p-6 bg-primary text-primary-foreground border-white/20 shadow-lg" align="start">
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
    )
  }

  return (
    <header className={headerClasses}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Brush className={cn("h-8 w-8", textColorClass)} />
            <h1 className={cn("text-2xl font-headline font-bold whitespace-nowrap", textColorClass)}>Home Designer</h1>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
             <Link href="/collection/animais" className={cn("font-medium", textColorClass)}>Loja</Link>
             <Link href="/collection/abstrato" className={cn("font-medium", textColorClass)}>Estilos</Link>
             <Link href="/collection/floral" className={cn("font-medium", textColorClass)}>Mais Vendidos</Link>
             <Link href="/collection/botanico" className={cn("font-medium", textColorClass)}>Novidades</Link>
             <Link href="/monte-seu-quadro" className={cn("font-medium", textColorClass)}>Composições</Link>
             <Link href="/orcamento" className={cn("font-medium", textColorClass)}>Promoções</Link>
          </nav>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className={textColorClass}><Search className="h-5 w-5" /></Button>
             <Link href={user ? '/dashboard' : '/login'}><Button variant="ghost" size="icon" className={textColorClass}><User className="h-5 w-5" /></Button></Link>
             <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className={textColorClass}>
                    <ShoppingCart className="h-5 w-5" />
                    {isClient && totalItems > 0 && (
                        <span className={cn("absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold", isHomePage && !isScrolled ? "bg-white text-black" : "bg-primary text-white")}>
                          {totalItems}
                        </span>
                    )}
                </Button>
             </Link>
          </div>
        </div>
    </header>
  );
}
