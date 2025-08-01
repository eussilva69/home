
'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Droplet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0;
  const total = subtotal + shippingCost;
  const totalWithCardFee = total * 1.05; // 5% de taxa do cartão
  const pixDiscount = totalWithCardFee - total;

  const handleCheckout = (method: 'card' | 'pix') => {
      const checkoutUrl = method === 'card' ? '/checkout/card' : '/checkout/pix';
      router.push(checkoutUrl);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-headline text-primary">Seu Carrinho de Compras</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Itens</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {cartItems.map(item => (
                      <li key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4">
                        <div className="w-24 h-32 flex-shrink-0 relative rounded-md overflow-hidden">
                           <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.options}</p>
                          <p className="sm:hidden text-lg font-bold text-primary mt-2">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                           </div>
                           <p className="hidden sm:block w-24 text-center text-lg font-bold text-primary">
                             R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                           </p>
                           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-5 w-5" />
                           </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <aside className="lg:col-span-1">
              <Card className="shadow-md sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold">R$ 0,00</span>
                  </div>
                  <Separator />
                   <div className="flex justify-between text-lg font-bold">
                    <span>Total (sem taxas)</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Card className="bg-primary/5 border-primary/20 p-3 text-sm">
                      <p>
                          Pague com <span className="font-bold">Cartão de Crédito</span> por <span className="font-bold">R$ {totalWithCardFee.toFixed(2).replace('.', ',')}</span> (incluso 5% de taxa).
                      </p>
                      <Separator className="my-2" />
                      <p className="text-green-600 font-semibold">
                          Ou pague com <span className="font-bold">Pix</span> e ganhe <span className="font-bold">R$ {pixDiscount.toFixed(2).replace('.', ',')} de desconto</span>, pagando apenas <span className="font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>!
                      </p>
                  </Card>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                   <Button 
                     size="lg" 
                     className="w-full text-lg bg-green-600 hover:bg-green-700 text-white" 
                     onClick={() => handleCheckout('pix')}
                     disabled={cartItems.length === 0}
                    >
                     <Droplet className="mr-2" /> Pagar com Pix
                   </Button>
                   <Button 
                     size="lg" 
                     className="w-full text-lg" 
                     onClick={() => handleCheckout('card')}
                     disabled={cartItems.length === 0}
                    >
                     <CreditCard className="mr-2" /> Pagar com Cartão
                   </Button>
                   <Button variant="link" asChild>
                     <Link href="/">Continuar comprando</Link>
                   </Button>
                </CardFooter>
              </Card>
            </aside>
          </div>
        ) : (
           <Card className="shadow-md">
             <CardContent className="p-12 text-center">
                 <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Seu carrinho está vazio</h2>
                <p className="text-muted-foreground mb-6">Parece que você ainda não adicionou nenhum produto. Que tal explorar nossas coleções?</p>
                <Button asChild size="lg">
                    <Link href="/">Ir para a loja</Link>
                </Button>
             </CardContent>
           </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
