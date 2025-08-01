

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Heart, ShoppingCart, User, Brush, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import { Separator } from '../ui/separator';

const navLinks = [
  { href: '/monte-seu-quadro', label: 'Monte seu quadro' },
  { href: '#bestsellers', label: 'Mais Vendidos' },
  { href: '#compositions', label: 'Composições' },
];

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.017 1.5c-5.96 0-9.45 4.01-9.45 8.71 0 3.19 1.71 6.32 4.63 7.5a.6.6 0 0 0 .8-.53l.36-1.54s.22-.92.2-1.07c-.07-.5-.45-1.3-.45-2.82 0-2.52 1.83-4.44 4.13-4.44 2.22 0 3.32 1.58 3.32 3.46 0 2.1-1.2 5.23-2.78 5.23-.9 0-1.84-.96-1.59-2.1.3-.98.9-2.03.9-2.73 0-.74-.4-1.34-.96-1.34-.78 0-1.42.78-1.42 1.8 0 .62.18 1.13.18 1.13s-1.2 5.08-1.44 6c-.3.92.03 1.95.89 1.95 1.07 0 1.9-1.37 1.9-2.52 0-1.2-.6-2.27-.6-2.27s.6-2.32.73-2.88c.24-1.07.9-1.93 2.02-1.93 2.2 0 3.93 2.05 3.93 4.9 0 2.7-1.5 5.02-4.18 5.02-3.3 0-5.4-2.57-5.4-5.63 0-2.3 1.2-4.14 2.73-4.14.83 0 1.5.48 1.5.48s-1.15 4.8-1.15 4.8c0 .28.02.5.15.65.13.15.35.2.5.1.4-.3.6-.6.8-.95.1-.18.25-1.07.25-1.07l.38-1.56s.3-1.25.5-2.3c.42-2.12 2.6-4.08 4.9-4.08 3.55 0 5.92 2.7 5.92 6.13 0 4.2-2.3 7.37-6.23 7.37C16.2 22.5 12.8 20.2 12.8 16c0-1.2.4-2.4 1-3.33" />
    </svg>
  );

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Brush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">Home Designer</h1>
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
                        href="#"
                        className="flex items-center gap-3 p-2 -m-2 rounded-md hover:bg-accent"
                      >
                         <Image
                          src={collection.image}
                          alt={collection.name}
                          data-ai-hint={collection.hint}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
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
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Pesquisar</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Lista de Desejos</span>
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Carrinho</span>
          </Button>
          <Link href="/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Conta</span>
            </Button>
          </Link>
        </div>
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Brush className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-primary">Home Designer</h1>
                  </Link>
                </div>
                <nav className="flex flex-col p-6 gap-4 text-lg">
                  <Link href="#collections" className="transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                    Coleções
                  </Link>
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-6 flex items-center justify-around">
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
                  <Link href="/login">
                    <Button variant="ghost" size="icon">
                      <User className="h-6 w-6" />
                      <span className="sr-only">Conta</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
