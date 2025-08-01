
'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, Truck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { calculateShipping } from '../actions'; // Importando a nova action
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, updateShipping } = useCart();
  const router = useRouter();
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [errorShipping, setErrorShipping] = useState<string | null>(null);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
    // Recalculate shipping if an option is selected
    if (selectedShipping) {
      handleCalculateShipping();
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
     if (selectedShipping) {
      handleCalculateShipping();
    }
  };
  
  const handleCalculateShipping = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrorShipping('CEP inválido. Por favor, digite 8 números.');
      return;
    }
    setIsLoadingShipping(true);
    setErrorShipping(null);
    setShippingOptions([]);
    setSelectedShipping(null);
    updateShipping(null);

    try {
      const result = await calculateShipping(cep, cartItems);
      if (result.success && result.options) {
        setShippingOptions(result.options);
      } else {
        setErrorShipping(result.message || 'Não foi possível calcular o frete.');
      }
    } catch (error) {
      setErrorShipping('Ocorreu um erro inesperado ao calcular o frete.');
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const cardFee = 0.0499; // 4.99%
  const shippingCost = useMemo(() => selectedShipping ? parseFloat(selectedShipping.price) : 0, [selectedShipping]);
  
  const totalWithShipping = subtotal + shippingCost;
  const totalCard = totalWithShipping * (1 + cardFee);
  
  const handleSelectShipping = (optionId: string) => {
      const option = shippingOptions.find(opt => opt.id.toString() === optionId);
      if (option) {
          const shippingInfo = {
            id: option.id,
            name: option.name,
            price: parseFloat(option.price),
            company: option.company.name,
          };
          setSelectedShipping(shippingInfo);
          updateShipping(shippingInfo);
      }
  };

  const handleCheckout = () => {
      if (shippingOptions.length > 0 && !selectedShipping) {
        setErrorShipping("Por favor, selecione uma opção de frete.");
        return;
      }
      router.push('/checkout');
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

              {/* Shipping Calculation */}
              <Card className="shadow-md">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Truck/> Calcular Frete</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex flex-col sm:flex-row gap-2">
                          <Input 
                              placeholder="Digite seu CEP" 
                              value={cep} 
                              onChange={(e) => setCep(e.target.value)} 
                              maxLength={9}
                          />
                          <Button onClick={handleCalculateShipping} disabled={isLoadingShipping} className="w-full sm:w-auto">
                              {isLoadingShipping ? <Loader2 className="animate-spin" /> : 'Calcular'}
                          </Button>
                      </div>
                      {errorShipping && <p className="text-sm text-destructive mt-2">{errorShipping}</p>}
                      {shippingOptions.length > 0 && (
                          <div className="mt-4">
                              <RadioGroup value={selectedShipping?.id.toString()} onValueChange={handleSelectShipping}>
                                  <div className="space-y-2">
                                      {shippingOptions.map((option) => (
                                          <Label key={option.id} htmlFor={option.id.toString()} className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                              <div className="flex items-center gap-3">
                                                  <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                                                  <div className="flex items-center gap-2">
                                                      <Image src={option.company.picture} alt={option.company.name} width={20} height={20} />
                                                      <span className="font-semibold">{option.name}</span>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <span className="font-bold">R$ {option.price}</span>
                                                  <p className="text-xs text-muted-foreground">Prazo: {option.delivery_time} dias</p>
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
                    <span className="font-semibold">{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'A calcular'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                      <p className="text-green-600 font-semibold">Pagando com PIX você economiza!</p>
                      <div className="flex justify-between items-center">
                          <span>Total no Pix (10% OFF s/ frete):</span>
                          <span className="font-bold text-lg text-primary">R$ {(subtotal * 0.9 + shippingCost).toFixed(2).replace('.', ',')}</span>
                      </div>
                  </div>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                          <span>Total no Cartão:</span>
                          <span className="font-bold text-lg text-primary">R$ {totalCard.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">(Inclui taxa de serviço de {(cardFee * 100).toFixed(2)}%)</p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                   <Button 
                     size="lg" 
                     className="w-full text-lg" 
                     onClick={handleCheckout}
                     disabled={cartItems.length === 0}
                    >
                     <ShoppingCart className="mr-2" /> Ir para o Pagamento
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
