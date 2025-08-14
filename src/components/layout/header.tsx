
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search, Heart, ShoppingCart, User, Brush, ChevronDown, LogOut, MessageSquareText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { collections } from '@/lib/mock-data';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { logoutAction } from '@/app/actions';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useClientOnly } from '@/hooks/use-client-only';
import { Input } from '../ui/input';

const navLinks = [
  { href: '/collection/todos-os-quadros', label: 'Todos os Quadros' },
  { href: '/monte-seu-quadro', label: 'Monte seu Quadro' },
  { href: '/architects', label: 'Arquitetos' },
  { href: '/blog', label: 'Blog' },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCollectionsOpen, setCollectionsOpen] = useState(false);
  const { user } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const isClient = useClientOnly();

  const handleLogout = async () => {
    await signOut(auth);
    await logoutAction();
    router.push('/');
  }
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      {/* Top Bar */}
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Brush className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary whitespace-nowrap">Home Designer</h1>
        </Link>
        
        <div className="hidden lg:flex w-full max-w-md mx-4">
           <div className="relative w-full">
             <Input placeholder="Digite o que você procura" className="pr-10 h-11"/>
             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                <Search className="h-5 w-5 text-muted-foreground"/>
             </Button>
           </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4">
           <div className="flex items-center gap-2">
                <MessageSquareText className="h-7 w-7 text-primary"/>
                <div>
                    <p className="text-xs">Central de</p>
                    <p className="text-sm font-semibold">Atendimento</p>
                </div>
           </div>
           <div className="flex items-center gap-2">
                <User className="h-7 w-7 text-primary"/>
                 <div>
                    <p className="text-xs">{user ? `Olá, ${user.displayName?.split(' ')[0] || ''}`: 'Olá, bem vindo(a)'}</p>
                    <Link href={user ? '/dashboard' : '/login'} className="text-sm font-semibold hover:underline">
                        {user ? 'Minha Conta' : 'Entrar ou Cadastrar'}
                    </Link>
                </div>
           </div>
           <Link href="/cart" className="relative">
             <Button variant="ghost" size="icon">
                <ShoppingCart className="h-7 w-7" />
                 {isClient && totalItems > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
              </Button>
           </Link>
        </div>

        <div className="lg:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                   <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                {/* Mobile Menu Content Here */}
            </SheetContent>
            </Sheet>
        </div>

      </div>
      
      <Separator/>

      {/* Bottom Bar (Desktop Only) */}
      <div className="hidden lg:flex container mx-auto h-12 items-center justify-between px-4">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Button variant="ghost" className="font-bold gap-2">
            <Menu className="h-5 w-5"/> Todos os Quadros
          </Button>

           <Popover open={isCollectionsOpen} onOpenChange={setCollectionsOpen}>
            <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 transition-colors hover:text-primary"
                  onMouseEnter={() => setCollectionsOpen(true)}
                  onMouseLeave={() => setCollectionsOpen(false)}
                >
                  Coleções <ChevronDown className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[30rem] p-0" 
                align="start"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
            >
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
          </Popover>

          <Link href="/monte-seu-quadro" className="transition-colors hover:text-primary">Monte seu Quadro</Link>
          <Link href="/architects" className="transition-colors hover:text-primary">Arquitetos</Link>
        </nav>
        <Button className="bg-black text-white hover:bg-black/80 rounded-md">OUTLET até 50% OFF</Button>
      </div>

    </header>
  );
}

