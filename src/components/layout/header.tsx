
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useClientOnly();
  
  const isHomePage = pathname === '/';
  const isLojaPage = pathname === '/loja';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


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
        if (isSearchOpen) setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
    if (isMenuOpen) setMenuOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
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
    "fixed z-50 w-full transition-all duration-300",
    isHomePage && !isScrolled ? 'bg-transparent' : (isLojaPage ? 'bg-background text-primary shadow-md' : 'bg-[#efe7da] text-primary shadow-md')
  );
  
  const textColorClass = isHomePage && !isScrolled ? "text-white" : "text-primary";


  return (
    <header className={cn(headerClasses)}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Brush className={cn("h-8 w-8", textColorClass)} />
            <h1 className={cn("text-2xl font-headline font-bold whitespace-nowrap", textColorClass)}>Home Designer</h1>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
             <Link href="/loja" className={cn("font-medium", textColorClass)}>Loja</Link>
             <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn("font-medium flex items-center gap-1", textColorClass, "hover:bg-black/10")}
                    >
                      Coleções <ChevronDown className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[48rem] p-6 bg-white text-primary border-border shadow-lg" align="start">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                      {collectionColumns.map((column, colIndex) => (
                        <div key={colIndex} className="flex flex-col gap-2">
                          {column.map((collection) => (
                            <Link
                              key={collection.name}
                              href={`/collection/${collection.slug}`}
                              className="block p-2 rounded-md text-sm hover:bg-accent"
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
             <Link href="/monte-seu-quadro" className={cn("font-medium", textColorClass)}>Personalize</Link>
             <Link href="/orcamento" className={cn("font-medium", textColorClass)}>Orcamento</Link>
          </nav>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className={textColorClass} onClick={() => setIsSearchOpen(prev => !prev)}><Search className="h-5 w-5" /></Button>
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
        {isSearchOpen && (
            <div className={cn("w-full px-4 py-3 shadow-md", isLojaPage ? 'bg-background' : 'bg-[#efe7da]')}>
                <form onSubmit={handleSearchSubmit} className="relative container mx-auto">
                    <Input 
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white text-primary"
                    />
                    <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary">
                        <Search className="h-5 w-5" />
                    </Button>
                    {suggestions.length > 0 && (
                        <SearchSuggestions suggestions={suggestions} isLoading={isLoading} onSuggestionClick={handleSuggestionClick} />
                    )}
                </form>
            </div>
        )}
    </header>
  );
}
