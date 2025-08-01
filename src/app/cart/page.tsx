
'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MercadoPagoCheckout from '@/components/checkout/mercado-pago-checkout';
import { calculateShipping } from '@/app/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';

type ShippingOption = {
  id: number;
  name: string;
  price: string;
  custom_delivery_time: number;
  company: {
      id: number;
      name: string;
      picture: string;
  };
};

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
    setSelectedShipping(null);
    setShippingOptions([]);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    setSelectedShipping(null);
    setShippingOptions([]);
  };
  
  const handleCalculateShipping = async () => {
    if (!cep || cartItems.length === 0) return;
    setIsCalculating(true);
    setShippingError(null);
    setSelectedShipping(null);
    setShippingOptions([]);

    const shippingItems = cartItems.map(item => ({
        id: item.id,
        width: item.width,
        height: item.height,
        length: item.length,
        weight: item.weight,
        quantity: item.quantity,
    }));

    const result = await calculateShipping(cep, shippingItems);
    
    if (result.error) {
        setShippingError(result.error);
    } else if (result.shippingOptions) {
        setShippingOptions(result.shippingOptions);
    }
    setIsCalculating(false);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = selectedShipping ? parseFloat(selectedShipping.price) : 0;
  const total = subtotal + shippingCost;


  if (isCheckingOut) {
    const checkoutItems = cartItems.map(item => ({
      id: item.id,
      title: `${item.name} (${item.options})`,
      quantity: item.quantity,
      unit_price: item.price,
      picture_url: item.image,
    }));
    return <MercadoPagoCheckout items={checkoutItems} shippingCost={shippingCost} />;
  }

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
              
               <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Truck className="h-6 w-6"/> Calcular Frete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
                            <Input
                                type="text"
                                placeholder="Digite seu CEP"
                                value={cep}
                                onChange={(e) => setCep(e.target.value)}
                                maxLength={9}
                            />
                            <Button onClick={handleCalculateShipping} disabled={isCalculating || !cep}>
                                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Calcular'}
                            </Button>
                        </div>
                        {shippingError && <p className="text-red-500 text-sm mt-2">{shippingError}</p>}
                        
                        {isCalculating && (
                             <div className="mt-4 p-4 text-center bg-secondary/50 rounded-md">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                             </div>
                        )}

                        {shippingOptions.length > 0 && !isCalculating && (
                            <div className="mt-4">
                                <RadioGroup onValueChange={(id) => setSelectedShipping(shippingOptions.find(opt => opt.id.toString() === id) || null)}>
                                    <div className="space-y-2">
                                        {shippingOptions.map((option) => (
                                            <Label key={option.id} htmlFor={String(option.id)} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                                <RadioGroupItem value={String(option.id)} id={String(option.id)} className="mr-3" />
                                                <div className="flex-grow grid grid-cols-3 items-center gap-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {option.company.picture && <Image src={option.company.picture} alt={option.company.name} width={20} height={20} />}
                                                        <span>{option.name}</span>
                                                    </div>
                                                    <span className="font-semibold text-center">
                                                        R$ {parseFloat(option.price).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    <span className="text-muted-foreground text-right">
                                                        {option.custom_delivery_time} dias úteis
                                                    </span>
                                                </div>
                                            </Label>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
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
                    <span className="font-semibold">
                      {selectedShipping ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'A calcular'}
                    </span>
                  </div>
                  <Separator />
                   <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                   <Button 
                     size="lg" 
                     className="w-full text-lg" 
                     onClick={() => setIsCheckingOut(true)}
                     disabled={!selectedShipping}
                    >
                     Finalizar Compra
                   </Button>
                   {!selectedShipping && (
                       <p className="text-xs text-muted-foreground text-center">Calcule o frete para continuar</p>
                   )}
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
