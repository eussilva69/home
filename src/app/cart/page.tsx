
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { calculateShipping } from '../actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, updateShipping, shipping } = useCart();
  const router = useRouter();
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(shipping);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [errorShipping, setErrorShipping] = useState<string | null>(null);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
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
        if (result.options.length === 0) {
            setErrorShipping('Nenhuma opção de frete encontrada para este CEP.');
        } else {
            setShippingOptions(result.options);
        }
      } else {
        setErrorShipping(result.message || 'Não foi possível calcular o frete.');
      }
    } catch (error) {
      setErrorShipping('Ocorreu um erro inesperado ao calcular o frete.');
    } finally {
      setIsLoadingShipping(false);
    }
  };
  
  // Recalculate shipping if cart changes and a CEP is entered
  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8 && cartItems.length > 0) {
        handleCalculateShipping();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

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
          setErrorShipping(null); // Clear error on selection
      }
  };

  const handleCheckout = () => {
      if (shippingOptions.length > 0 && !selectedShipping) {
        setErrorShipping("Por favor, selecione uma opção de frete para continuar.");
        const shippingSection = document.getElementById('shipping-section');
        shippingSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      router.push('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-headline text-black font-bold tracking-wide">Seu Carrinho</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Itens no Carrinho</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {cartItems.map(item => (
                      <li key={item.id} className="flex flex-col sm:flex-row items-center p-6 gap-4">
                        <div className="w-24 h-32 flex-shrink-0 relative rounded-md overflow-hidden bg-gray-100">
                           <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.options}</p>
                          <p className="sm:hidden text-lg font-bold text-black mt-2">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                           </div>
                           <p className="hidden sm:block w-24 text-center text-lg font-bold text-black">
                             R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                           </p>
                           <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-5 w-5" />
                           </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm" id="shipping-section">
                  <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2"><Truck className="h-5 w-5 text-gray-600"/> Calcular Frete</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-start gap-2">
                          <Input 
                              placeholder="Digite seu CEP" 
                              value={cep} 
                              onChange={(e) => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9))} 
                              maxLength={9}
                              className="max-w-xs border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <Button onClick={handleCalculateShipping} disabled={isLoadingShipping} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                            {isLoadingShipping ? <Loader2 className="animate-spin" /> : 'Calcular'}
                          </Button>
                      </div>
                      {errorShipping && <p className="text-sm text-red-600 mt-2">{errorShipping}</p>}
                      
                      {!isLoadingShipping && shippingOptions.length > 0 && (
                          <div className="mt-6">
                              <h3 className="text-md font-medium mb-3">Opções de entrega:</h3>
                              <RadioGroup value={selectedShipping?.id.toString()} onValueChange={handleSelectShipping}>
                                  <div className="space-y-3">
                                      {shippingOptions.map((option) => (
                                          <Label key={option.id} htmlFor={option.id.toString()} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100 has-[:checked]:bg-black/5 has-[:checked]:border-black transition-all">
                                              <div className="flex items-center gap-3">
                                                  <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                                                  <div className="flex items-center gap-2">
                                                      <Image src={option.company.picture} alt={option.company.name} width={20} height={20} className="rounded-full"/>
                                                      <span className="font-semibold text-gray-800">{option.name}</span>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <span className="font-bold text-gray-900">R$ {parseFloat(option.price).toFixed(2).replace('.', ',')}</span>
                                                  <p className="text-xs text-gray-500">Prazo: {option.delivery_time} dias úteis</p>
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
              <Card className="shadow-sm sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-semibold">{shippingCost > 0 ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'A calcular'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between font-medium text-green-600">
                        <span>Total no PIX (com 10% OFF)</span>
                        <span>R$ {(subtotal * 0.9 + shippingCost).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Total no Cartão</span>
                        <span>R$ {totalCard.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">(Inclui taxa de serviço de {(cardFee * 100).toFixed(2)}%)</p>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3 p-6 pt-0">
                   <Button 
                     size="lg" 
                     className="w-full h-12 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 text-base"
                     onClick={handleCheckout}
                     disabled={cartItems.length === 0}
                    >
                     <ShoppingCart className="h-5 w-5" /> Ir para o Pagamento
                   </Button>
                   <Button variant="link" asChild>
                     <Link href="/" className="text-black hover:underline">Continuar comprando</Link>
                   </Button>
                </CardFooter>
              </Card>
            </aside>
          </div>
        ) : (
           <Card className="shadow-sm">
             <CardContent className="p-12 text-center">
                 <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Seu carrinho está vazio</h2>
                <p className="text-gray-500 mb-6">Parece que você ainda não adicionou nenhum produto. Que tal explorar nossas coleções?</p>
                <Button asChild size="lg" className="bg-black text-white hover:bg-gray-800">
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
