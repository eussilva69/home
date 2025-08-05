
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, QrCode, Copy, CreditCard, User, LogIn, PlusCircle } from 'lucide-react';
import { processPixPayment, processRedirectPayment, getPaymentStatus, calculateShipping, saveOrder, getUserAddresses, addOrUpdateAddress } from '../actions';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCode from 'qrcode.react';
import type { CreatePaymentOutput, Address } from '@/lib/schemas';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { checkoutSchema } from '@/lib/schemas';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import AddressFormDialog from '@/components/dashboard/addresses/address-form-dialog';


type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type PaymentMethod = 'pix' | 'card';


export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreatePaymentOutput | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string, paymentId: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [errorShipping, setErrorShipping] = useState<string | null>(null);
  
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const shippingCost = useMemo(() => selectedShipping ? parseFloat(selectedShipping.price) : 0, [selectedShipping]);
  
  const pixDiscount = 0.10; // 10%
  const cardFee = 0.0499; // 4.99%

  const totalPix = useMemo(() => (subtotal * (1 - pixDiscount)) + shippingCost, [subtotal, shippingCost, pixDiscount]);
  const totalCard = useMemo(() => (subtotal + shippingCost) * (1 + cardFee), [subtotal, shippingCost, cardFee]);
  const totalDisplay = paymentMethod === 'pix' ? totalPix : totalCard;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
        firstName: '', lastName: '', email: '', docType: 'CPF', docNumber: '',
        cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    }
  });

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);
  
  const fetchAddresses = useCallback(async () => {
    if (user) {
      const addresses = await getUserAddresses(user.uid);
      addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setUserAddresses(addresses);
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddress) {
        handleSelectAddress(defaultAddress);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
      form.setValue('email', user.email || '');
      const nameParts = user.displayName?.split(' ') || [];
      form.setValue('firstName', nameParts[0] || '');
      form.setValue('lastName', nameParts.slice(1).join(' ') || '');
    }
  }, [user, fetchAddresses, form]);


  const handleSuccessfulPayment = useCallback(async (paymentId?: number) => {
    stopPolling();
  
    const formData = form.getValues();
    const orderDetails = {
      customer: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        docType: formData.docType,
        docNumber: formData.docNumber,
      },
      shipping: {
        address: `${formData.street}, ${formData.number}`,
        city: formData.city,
        state: formData.state,
        cep: formData.cep,
        complement: formData.complement || "",
        details: selectedShipping,
      },
      items: cartItems,
      payment: {
        method: paymentMethod,
        total: totalDisplay,
        subtotal: subtotal,
        shippingCost: shippingCost,
        paymentId: paymentId,
      },
    };
  
    const result = await saveOrder(orderDetails);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro no Pedido', description: result.message });
    }

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinatario: formData.email, type: 'orderApproved' }),
    });
  
    setPaymentResult({ success: true, paymentId });
    clearCart();
  }, [form, selectedShipping, cartItems, paymentMethod, totalDisplay, subtotal, shippingCost, clearCart, toast, stopPolling]);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentId = urlParams.get('payment_id');

    if (status === 'approved' && paymentId) {
        handleSuccessfulPayment(Number(paymentId));
    } else if (status && status !== 'approved') {
         toast({ variant: 'destructive', title: 'Pagamento não aprovado', description: 'Por favor, tente novamente ou use outra forma de pagamento.' });
         router.replace('/checkout');
    }
  }, [router, toast, handleSuccessfulPayment]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (cartItems.length === 0 && !isProcessing && !paymentResult && !urlParams.has('status') && !pixData) {
        router.push('/');
    }
  }, [cartItems.length, isProcessing, paymentResult, pixData, router, toast]);

  const startPollingPaymentStatus = (paymentId: number) => {
    stopPolling();
    pollingIntervalRef.current = setInterval(async () => {
        try {
            const result = await getPaymentStatus(paymentId);
            if (result && result.status === 'approved') {
                handleSuccessfulPayment(paymentId);
            }
        } catch (error) {
            console.error("Erro ao verificar status do pagamento:", error);
            stopPolling();
        }
    }, 5000);
  }
  
  const handleCalculateShipping = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrorShipping('CEP inválido. Por favor, digite 8 números.');
      return;
    }
    setIsLoadingShipping(true);
    setErrorShipping(null);
    setShippingOptions([]);
    setSelectedShipping(null);

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
  
  const handleSelectShipping = (optionId: string) => {
      const option = shippingOptions.find(opt => opt.id.toString() === optionId);
      if (option) {
          const shippingInfo = {
            id: option.id,
            name: option.name,
            price: parseFloat(option.price),
            company: option.company.name,
            delivery_time: option.delivery_time,
          };
          setSelectedShipping(shippingInfo);
          setErrorShipping(null); 
      }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id!);
    form.setValue('cep', address.cep);
    form.setValue('street', address.street);
    form.setValue('number', address.number);
    form.setValue('complement', address.complement || '');
    form.setValue('neighborhood', address.neighborhood);
    form.setValue('city', address.city);
    form.setValue('state', address.state);
    form.trigger(['cep', 'street', 'number', 'neighborhood', 'city', 'state']);
    handleCalculateShipping(address.cep);
  };
  
  const handleOpenAddressForm = (address: Address | null) => {
      setAddressToEdit(address);
      setIsAddressFormOpen(true);
  }
  
  const handleSaveAddress = async (address: Address) => {
      if (!user) return;
      const result = await addOrUpdateAddress(user.uid, address);
      if (result.success) {
          toast({ title: "Sucesso!", description: "Endereço salvo." });
          const updatedAddresses = await getUserAddresses(user.uid);
          setUserAddresses(updatedAddresses);
          // Select the newly added/edited address
          const newOrUpdatedAddress = updatedAddresses.find(a => a.id === result.addressId);
          if (newOrUpdatedAddress) {
              handleSelectAddress(newOrUpdatedAddress);
          }
      } else {
          toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
  }


  const handleGeneratePix = async (formData: CheckoutFormValues) => {
     setIsProcessing(true);
     const result = await processPixPayment({
         transaction_amount: parseFloat(totalPix.toFixed(2)),
         description: `Compra na Home Designer - Pedido #${Date.now()}`,
         payer: {
             email: formData.email,
             first_name: formData.firstName,
             last_name: formData.lastName,
             identification: {
                 type: formData.docType,
                 number: formData.docNumber,
             }
         }
     });
     setIsProcessing(false);

     if (result.success && result.qrCode && result.qrCodeBase64 && result.paymentId) {
        setPixData({ qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64, paymentId: result.paymentId });
        startPollingPaymentStatus(result.paymentId);
     } else {
         toast({ variant: 'destructive', title: 'Erro no Pix', description: result.message || 'Não foi possível gerar o QR Code do Pix.' });
     }
  }

  const handleRedirectPayment = async (formData: CheckoutFormValues) => {
    setIsProcessing(true);

    const cartItemsForPref = cartItems.map(item => ({
      id: item.id,
      title: `${item.name} (${item.options})`,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'BRL',
    }));

    const serviceItems = [];
    if (shippingCost > 0) {
      serviceItems.push({
        id: 'shipping',
        title: `Frete (${selectedShipping?.name} - ${selectedShipping?.company})`,
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'BRL',
      });
    }

    const subtotalForFee = subtotal + shippingCost;
    const fee = subtotalForFee * cardFee;
     serviceItems.push({
        id: 'fee',
        title: 'Taxa de Serviço (Cartão)',
        quantity: 1,
        unit_price: parseFloat(fee.toFixed(2)),
        currency_id: 'BRL',
    });

    const result = await processRedirectPayment({
        items: [...cartItemsForPref, ...serviceItems],
        payer: {
            name: formData.firstName,
            surname: formData.lastName,
            email: formData.email,
            identification: {
                type: formData.docType,
                number: formData.docNumber,
            }
        },
    });
    
    if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
    } else {
      toast({ variant: 'destructive', title: 'Falha no Pagamento', description: result.message || 'Não foi possível iniciar o pagamento.' });
      setIsProcessing(false);
    }
  };

  const onFinalSubmit = () => {
    form.handleSubmit(paymentMethod === 'pix' ? handleGeneratePix : handleRedirectPayment)();
  }

  const copyToClipboard = () => {
      if (pixData) {
          navigator.clipboard.writeText(pixData.qrCode);
          toast({ title: 'Copiado!', description: 'Código Pix copiado para la área de transferência.' });
      }
  }
  
  if (authLoading) {
      return (
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <Footer />
          </div>
      )
  }
  
  if (paymentResult?.success) {
      return (
         <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
              <div className="text-center">
                  <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-4"/>
                  <h1 className="font-headline text-4xl font-bold mb-4">Pagamento Aprovado!</h1>
                  <p className="text-muted-foreground mb-2">Obrigado pela sua compra!</p>
                  {paymentResult.paymentId && <p className="text-sm text-muted-foreground mb-8">ID do Pedido: {paymentResult.paymentId}</p>}
                  <Button onClick={() => router.push('/dashboard/my-orders')} size="lg">
                      Ver Meus Pedidos
                  </Button>
              </div>
            </main>
             <Footer />
          </div>
      )
  }

  if (pixData) {
     return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <h1 className="font-headline text-4xl font-bold mb-4">Pague com Pix</h1>
                    <p className="text-muted-foreground mb-8">Escaneie o QR Code abaixo com o app do seu banco.</p>
                    <div className="flex justify-center mb-6 p-4 bg-white rounded-lg shadow-md">
                        <QRCode value={pixData.qrCode} size={256} />
                    </div>
                    <p className="text-muted-foreground mb-4">Ou copie o código:</p>
                    <div className="flex justify-center items-center gap-2 w-full mb-8">
                        <Input readOnly value={pixData.qrCode} className="text-center text-xs truncate"/>
                        <Button onClick={copyToClipboard} size="icon" variant="outline"><Copy className="h-4 w-4"/></Button>
                    </div>
                    <div className="flex justify-center items-center gap-2 text-primary">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                        <span className="font-semibold">Aguardando pagamento...</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">(ID do Pedido: {pixData.paymentId})</p>
                </div>
            </main>
             <Footer />
        </div>
     )
  }

  return (
    <>
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        {!user && (
            <Card className="max-w-3xl mx-auto mb-8 bg-blue-50 border-blue-200">
                <CardContent className="p-6 flex items-center gap-6">
                    <User className="h-10 w-10 text-blue-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Já tem uma conta?</h3>
                        <p className="text-sm text-muted-foreground">Faça login para uma experiência mais rápida e para usar seus endereços salvos.</p>
                    </div>
                    <Button asChild className="ml-auto">
                        <Link href={`/login?redirect=/checkout`}><LogIn className="mr-2 h-4 w-4"/> Fazer Login</Link>
                    </Button>
                </CardContent>
            </Card>
        )}
         <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* Coluna da Esquerda: Formulários */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>1. Informações do Cliente</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Como no documento" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Como no documento" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="docType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Documento</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="CPF">CPF</SelectItem><SelectItem value="CNPJ">CNPJ</SelectItem></SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="docNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número do Documento</FormLabel>
                                        <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>2. Endereço de Entrega</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           {user && userAddresses.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Selecione um endereço salvo</Label>
                                    {userAddresses.map(address => (
                                        <div key={address.id} onClick={() => handleSelectAddress(address)} className={cn("w-full text-left p-3 border rounded-lg cursor-pointer hover:bg-accent", selectedAddressId === address.id && 'bg-accent border-primary')}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{address.nickname}</span>
                                                {address.isDefault && <Badge>Padrão</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{address.street}, {address.number} - {address.city}, {address.state}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                             {user && (
                                 <Button variant="outline" size="sm" onClick={() => handleOpenAddressForm(null)}>
                                     <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar novo endereço
                                 </Button>
                             )}
                            <div className="space-y-4 pt-4 border-t-2 border-dashed first:border-t-0 first:pt-0">
                                <FormField control={form.control} name="cep" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>CEP</FormLabel>
                                        <FormControl><Input placeholder="00000-000" {...field} onChange={(e) => { field.onChange(e); handleCalculateShipping(e.target.value); }} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Rua</FormLabel><FormControl><Input placeholder="Sua rua" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Nº" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="complement" render={({ field }) => (<FormItem><FormLabel>Complemento (opcional)</FormLabel><FormControl><Input placeholder="Apto, bloco, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Seu bairro" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="Sua cidade" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input placeholder="UF" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>

                             {isLoadingShipping && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Calculando frete...</div>}
                             {errorShipping && <p className="text-sm text-red-600">{errorShipping}</p>}
                            
                            {!isLoadingShipping && shippingOptions.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Opções de Frete</h3>
                                    <RadioGroup value={selectedShipping?.id.toString()} onValueChange={handleSelectShipping} className="space-y-3">
                                        {shippingOptions.map((option) => (
                                            <Label key={option.id} htmlFor={option.id.toString()} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100 has-[:checked]:bg-black/5 has-[:checked]:border-black transition-all">
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                                                    <div className="flex items-center gap-2">
                                                        {option.company.picture && <Image src={option.company.picture} alt={option.company.name} width={20} height={20} className="rounded-full"/>}
                                                        <span className="font-semibold text-gray-800">{option.name}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">R$ {parseFloat(option.price).toFixed(2).replace('.', ',')}</span>
                                                    <p className="text-xs text-gray-500">Prazo: {option.delivery_time} dias úteis</p>
                                                </div>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Coluna da Direita: Resumo e Pagamento */}
                <aside className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader><CardTitle>3. Resumo do Pedido</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-100">
                                        <Image src={item.image} alt={item.name} layout="fill" objectFit="cover"/>
                                        <Badge variant="secondary" className="absolute top-1 right-1 rounded-full w-6 h-6 flex items-center justify-center bg-gray-600 text-white">{item.quantity}</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.options}</p>
                                    </div>
                                    <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace('.',',')}</p>
                                </div>
                            ))}
                            <Separator />
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
                                <div className="flex justify-between"><span>Frete</span><span className="font-medium">R$ {shippingCost.toFixed(2).replace('.', ',')}</span></div>
                                {paymentMethod === 'pix' && subtotal > 0 && (
                                    <div className="flex justify-between text-green-600 font-semibold"><span>Desconto Pix ({pixDiscount*100}%)</span><span>- R$ {(subtotal * pixDiscount).toFixed(2).replace('.', ',')}</span></div>
                                )}
                                {paymentMethod === 'card' && (
                                    <div className="flex justify-between text-muted-foreground"><span>Taxa Cartão ({(cardFee*100).toFixed(2)}%)</span><span>+ R$ {((subtotal + shippingCost) * cardFee).toFixed(2).replace('.', ',')}</span></div>
                                )}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>R$ {totalDisplay.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>4. Forma de Pagamento</CardTitle></CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-3">
                                <Label htmlFor="pix" className="flex items-center space-x-3 cursor-pointer rounded-lg border p-4 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-all">
                                    <RadioGroupItem value="pix" id="pix" />
                                    <div className="w-full">
                                        <p className="font-medium flex items-center gap-2">Pagar com Pix <QrCode className="h-4 w-4"/></p>
                                        <span className="text-sm text-green-600 font-semibold">Ganhe {pixDiscount*100}% de desconto!</span>
                                    </div>
                                </Label>
                                <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                    <RadioGroupItem value="card" id="card" />
                                     <div className="w-full">
                                        <p className="font-medium flex items-center gap-2">Cartão de Crédito <CreditCard className="h-4 w-4"/></p>
                                        <span className="text-sm text-muted-foreground">Pague em ambiente seguro.</span>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </CardContent>
                        <CardFooter>
                           <Button onClick={onFinalSubmit} size="lg" className="w-full h-12 text-lg rounded-xl" disabled={isProcessing || !selectedShipping}>
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : paymentMethod === 'pix' ? <QrCode className="mr-2 h-5 w-5"/> : <CreditCard className="mr-2 h-5 w-5"/>}
                                Finalizar Pedido
                           </Button>
                        </CardFooter>
                    </Card>
                </aside>
            </form>
         </FormProvider>
      </main>
      <Footer />
    </div>
    
    <AddressFormDialog 
        isOpen={isAddressFormOpen}
        onOpenChange={setIsAddressFormOpen}
        onSave={handleSaveAddress}
        addressToEdit={addressToEdit}
    />
    </>
  )
}
