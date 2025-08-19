
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useClientOnly();
  
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);

  useEffect(() => {
    const handleScroll = () => {
        if(isHomePage) {
            setIsScrolled(window.scrollY > 10);
        }
    };
    if (isHomePage) {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    } else {
        setIsScrolled(true);
    }
    return () => {
        if(isHomePage) {
            window.removeEventListener('scroll', handleScroll);
        }
    };
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

  const headerClasses = cn(
    "w-full top-0 z-50 transition-all duration-300",
    isHomePage ? 'absolute' : 'relative',
    isScrolled
      ? "bg-[#efe7da] text-primary shadow-md"
      : "bg-transparent text-white"
  );
  
  const iconButtonClasses = cn(
    "hover:bg-black/10",
     isScrolled ? "text-primary" : "text-white"
  );
  
  const linkClasses = cn(
    "font-medium",
    isScrolled ? "text-primary" : "text-white"
  );


  return (
    <header className={headerClasses}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Brush className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-bold whitespace-nowrap">Home Designer</h1>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
             <Link href="/loja" className={linkClasses}>Loja</Link>
             <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(linkClasses, "flex items-center gap-1", iconButtonClasses)}
                    >
                      Coleções <ChevronDown className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 bg-white text-primary border-border shadow-lg" align="start">
                    <div className="flex flex-col gap-1">
                        {collections.map((collection) => (
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
                </PopoverContent>
              </Popover>
             <Link href="/monte-seu-quadro" className={linkClasses}>Personalize</Link>
             <Link href="/orcamento" className={linkClasses}>Orcamento</Link>
          </nav>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className={iconButtonClasses} onClick={() => setIsSearchOpen(prev => !prev)}><Search className="h-5 w-5" /></Button>
             <Link href={user ? '/dashboard' : '/login'}><Button variant="ghost" size="icon" className={iconButtonClasses}><User className="h-5 w-5" /></Button></Link>
             <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className={iconButtonClasses}>
                    <ShoppingCart className="h-5 w-5" />
                    {isClient && totalItems > 0 && (
                        <span className={cn("absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold", isScrolled ? "bg-white text-primary" : "bg-primary text-white")}>
                          {totalItems}
                        </span>
                    )}
                </Button>
             </Link>
          </div>
        </div>
        {isSearchOpen && (
            <div className={cn("w-full px-4 py-3 shadow-md", isScrolled ? 'bg-[#efe7da]' : 'bg-black/20 backdrop-blur-sm')}>
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
