
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, ShoppingCart, User, Brush, ChevronDown, LogOut, UserPlus, LogIn } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();
  
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHomePage);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Check initial scroll position
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setIsScrolled(true); // Always scrolled on other pages
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
        if (isSearchOpen) setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
    if (isMenuOpen) setMenuOpen(false);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "Você saiu!", description: "Sessão encerrada com sucesso." });
    router.push('/');
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const headerClasses = cn(
    "w-full top-0 z-50 transition-all duration-300",
    isHomePage ? 'absolute' : 'relative',
    isScrolled ? "bg-white text-primary shadow-md" : "bg-transparent text-white"
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
                <PopoverContent 
                  className="w-[400px] p-4 text-primary border-border shadow-lg"
                  style={{
                    backgroundColor: isScrolled ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: isScrolled ? 'none' : 'blur(12px)',
                    WebkitBackdropFilter: isScrolled ? 'none' : 'blur(12px)'
                  }}
                  align="start"
                >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {collections.map((collection) => (
                        <Link
                            key={collection.name}
                            href={`/collection/${collection.slug}`}
                            className="block p-2 rounded-md text-sm hover:bg-black/5"
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

          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className={cn(iconButtonClasses, 'hidden md:inline-flex')} onClick={() => setIsSearchOpen(prev => !prev)}><Search className="h-5 w-5" /></Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className={iconButtonClasses}><User className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {user ? (
                    <>
                      <DropdownMenuLabel>
                        <p className="font-semibold">Minha Conta</p>
                        <p className="font-normal text-xs text-muted-foreground truncate">{user.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                         <Link href="/dashboard"><User className="mr-2"/> Painel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2"/> Sair
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel>Acesse sua conta</DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem asChild>
                         <Link href="/login"><LogIn className="mr-2"/> Entrar</Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                         <Link href="/register"><UserPlus className="mr-2"/> Registrar-se</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

             <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className={iconButtonClasses}>
                    <ShoppingCart className="h-5 w-5" />
                    {isClient && totalItems > 0 && (
                        <span className={cn("absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold", isScrolled ? "bg-primary text-white" : "bg-primary text-white")}>
                          {totalItems}
                        </span>
                    )}
                </Button>
             </Link>

              <div className="lg:hidden">
                 <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className={iconButtonClasses}><Menu className="h-6 w-6"/></Button>
                    </SheetTrigger>
                    <SheetContent side="right" className={cn("bg-white text-primary", "w-[300px] sm:w-[350px]")}>
                       {/* Mobile Menu Content */}
                    </SheetContent>
                </Sheet>
              </div>

          </div>
        </div>
        {isSearchOpen && (
            <div className={cn("w-full px-4 py-3 shadow-md", isScrolled ? 'bg-white' : 'bg-black/20 backdrop-blur-sm')}>
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
