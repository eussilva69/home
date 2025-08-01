"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brush, Instagram, Facebook, Pinterest, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Brush className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-headline font-bold text-primary">ToquePop AI</h1>
            </Link>
            <p className="text-sm">Modern and vibrant art for your space. Handcrafted with passion.</p>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="hover:text-primary">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Get a 10% discount on your first order. Subscribe now!</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your email" className="bg-background" />
              <Button type="submit" className="bg-primary hover:bg-primary/90">Subscribe</Button>
            </form>
            <div className="flex space-x-4 mt-6">
              <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6 hover:text-primary" /></Link>
              <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6 hover:text-primary" /></Link>
              <Link href="#" aria-label="Pinterest"><Pinterest className="h-6 w-6 hover:text-primary" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 hover:text-primary" /></Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ToquePop AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
