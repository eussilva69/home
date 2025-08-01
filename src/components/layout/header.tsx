"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Heart, ShoppingCart, User, Brush, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collections } from '@/lib/mock-data';

const navLinks = [
  { href: '#bestsellers', label: 'Mais Vendidos' },
  { href: '#compositions', label: 'Composições' },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Brush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">Home Designer</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 transition-colors hover:text-primary">
                Coleções <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-4">
                <p className="font-medium">Nossas Coleções</p>
                <div className="grid gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.name}
                    href="#"
                    className="block p-2 -m-2 rounded-md hover:bg-accent"
                  >
                    {collection.name}
                  </Link>
                ))}
                </div>
              </div>
            </PopoverContent>
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
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Conta</span>
          </Button>
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
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6" />
                    <span className="sr-only">Conta</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
