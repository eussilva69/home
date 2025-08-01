
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Heart, ShoppingCart, User, Brush, ChevronDown, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import { logoutAction } from '@/app/actions';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: '/monte-seu-quadro', label: 'Monte seu quadro' },
  { href: '#bestsellers', label: 'Mais Vendidos' },
  { href: '#compositions', label: 'Composições' },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await logoutAction();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Brush className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary whitespace-nowrap">Home Designer</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
           <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
            <div 
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
              className="flex items-center"
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 transition-colors hover:text-primary">
                  Coleções <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[30rem] p-0" align="start">
                <div className="p-4">
                   <p className="font-medium text-lg mb-4">Temas</p>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {collections.map((collection) => (
                      <Link
                        key={collection.name}
                        href={`/collection/${collection.slug}`}
                        className="flex items-center gap-3 p-2 -m-2 rounded-md hover:bg-accent"
                        onClick={() => setCollectionsOpen(false)}
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
                </div>
              </PopoverContent>
            </div>
          </Popover>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Pesquisar</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Lista de Desejos</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Carrinho</span>
          </Button>
          <Link href={user ? "/dashboard" : "/login"}>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <User className="h-5 w-5" />
              <span className="sr-only">Conta</span>
            </Button>
          </Link>
          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:inline-flex">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sair</span>
            </Button>
          )}
        </div>
        <div className="md:hidden flex items-center gap-2">
          {user && (
             <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-6 w-6" />
              <span className="sr-only">Sair</span>
            </Button>
          )}
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
                <div className="p-6 pb-2 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Brush className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-primary">Home Designer</h1>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="flex flex-col p-6 gap-1 text-lg">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="collections" className="border-b-0">
                        <AccordionTrigger className="hover:no-underline py-3 text-base font-medium">Coleções</AccordionTrigger>
                        <AccordionContent className="pl-4 pt-2">
                            <div className="flex flex-col gap-3">
                            {collections.map((collection) => (
                                <Link
                                key={collection.name}
                                href={`/collection/${collection.slug}`}
                                className="flex items-center gap-4 text-sm transition-colors hover:text-primary"
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
                                <span>{collection.name}</span>
                                </Link>
                            ))}
                            </div>
                        </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="transition-colors hover:text-primary py-3 text-base font-medium" onClick={() => setMenuOpen(false)}>
                        {link.label}
                        </Link>
                    ))}
                    </nav>
                </div>
                <div className="p-4 flex items-center justify-around border-t">
                  <Button variant="ghost" size="icon">
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Pesquisar</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-6 w-6" />
                    <span className="sr-only">Lista de Desejos</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="sr-only">Carrinho</span>
                  </Button>
                  <Link href={user ? "/dashboard" : "/login"} onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="icon">
                      <User className="h-6 w-6" />
                      <span className="sr-only">Conta</span>
                    </Button>
                  </Link>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
