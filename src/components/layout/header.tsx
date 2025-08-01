"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Heart, ShoppingCart, User, Brush } from 'lucide-react';

const navLinks = [
  { href: '#collections', label: 'Collections' },
  { href: '#bestsellers', label: 'Best Sellers' },
  { href: '#compositions', label: 'Compositions' },
  { href: '#ai-features', label: 'AI Tools' },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Brush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">ToquePop AI</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <Brush className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-primary">ToquePop AI</h1>
                  </Link>
                </div>
                <nav className="flex flex-col p-6 gap-4 text-lg">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="transition-colors hover:text-primary" onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-6 flex items-center justify-around">
                  <Button variant="ghost" size="icon">
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Search</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-6 w-6" />
                    <span className="sr-only">Wishlist</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="sr-only">Cart</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6" />
                    <span className="sr-only">Account</span>
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
