
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, QrCode, Copy, CreditCard, User, LogIn, PlusCircle, Check, Truck, Banknote, ShoppingCart } from 'lucide-react';
import { processPixPayment, getPaymentStatus, calculateShipping, saveOrder, getUserAddresses, addOrUpdateAddress } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { useClientOnly } from '@/hooks/use-client-only';

const MERCADO_PAGO_PUBLIC_KEY = "TEST-df7a6d8f-8512-4202-acb2-a54cd6d22d59";


type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type PaymentMethod = 'pix' | 'card';

const steps = [
    { id: 'identification', name: 'Identificação', icon: User },
    { id: 'shipping', name: 'Entrega', icon: Truck },
    { id: 'payment', name: 'Pagamento', icon: Banknote },
];

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
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
  const isClient = useClientOnly();
  
  const [currentStep, setCurrentStep] = useState(0);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const shippingCost = useMemo(() => selectedShipping ? parseFloat(selectedShipping.price) : 0, [selectedShipping]);
  const total = subtotal + shippingCost;
  
  useEffect(() => {
    if(isClient) {
      initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });
    }
  }, [isClient]);


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
        total: total,
        subtotal: subtotal,
        shippingCost: shippingCost,
        paymentId: paymentId,
      },
    };
  
    const result = await saveOrder(orderDetails);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro no Pedido', description: result.message });
    }

    // A notificação de email agora é enviada pelo webhook após a confirmação do pagamento
  
    setPaymentResult({ success: true, paymentId });
    clearCart();
  }, [form, selectedShipping, cartItems, paymentMethod, total, subtotal, shippingCost, clearCart, toast, stopPolling]);
  
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


  useEffect(() => {
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');

    if (status === 'approved' && paymentId) {
        handleSuccessfulPayment(Number(paymentId));
        router.replace('/checkout', undefined);
    } else if (status && status !== 'approved') {
         toast({ variant: 'destructive', title: 'Pagamento não aprovado', description: 'Por favor, tente novamente ou use outra forma de pagamento.' });
         router.replace('/checkout', undefined);
    }
  }, [searchParams, router, toast, handleSuccessfulPayment]);

  useEffect(() => {
    if (isClient && cartItems.length === 0 && !isProcessing && !paymentResult && !searchParams.has('status') && !pixData) {
        router.push('/');
    }
  }, [cartItems.length, isProcessing, paymentResult, pixData, router, searchParams, isClient]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);


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
  
  const handleSelectShipping = (option: any) => {
      setSelectedShipping(option);
      setErrorShipping(null); 
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
          const newOrUpdatedAddress = updatedAddresses.find(a => a.id === result.addressId);
          if (newOrUpdatedAddress) {
              handleSelectAddress(newOrUpdatedAddress);
          }
      } else {
          toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
  }


  const handleGeneratePix = async () => {
     setIsProcessing(true);
     const formData = form.getValues();
     const result = await processPixPayment({
         transaction_amount: parseFloat(total.toFixed(2)),
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

  const onCardPaymentSubmit = async (formData: any) => {
    setIsProcessing(true);
    const payerData = form.getValues();

    try {
        const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                payer: {
                    ...formData.payer,
                    first_name: payerData.firstName,
                    last_name: payerData.lastName,
                },
                transaction_amount: total,
                description: `Compra na Home Designer - Pedido #${Date.now()}`
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Pagamento com cartão falhou.');
        }

        if (result.status === 'approved') {
            handleSuccessfulPayment(result.id);
        } else {
            throw new Error(result.message || 'Pagamento não aprovado.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro no Pagamento', description: error.message });
    } finally {
        setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (pixData) {
        navigator.clipboard.writeText(pixData.qrCode);
        toast({ title: 'Copiado!', description: 'Código Pix copiado para a área de transferência.' });
    }
  }

  if (!isClient || authLoading) {
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
  
  const renderCurrentStep = () => {
    switch (currentStep) {
        case 0: // Identification
            return (
                <Card>
                    <CardHeader><CardTitle>1. Informações do Cliente</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       <FormProvider {...form}>
                          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-mail</FormLabel> <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Como no documento" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Como no documento" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="docType" render={({ field }) => ( <FormItem> <FormLabel>Tipo de Documento</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl> <SelectContent><SelectItem value="CPF">CPF</SelectItem><SelectItem value="CNPJ">CNPJ</SelectItem></SelectContent> </Select> </FormItem> )} />
                              <FormField control={form.control} name="docNumber" render={({ field }) => ( <FormItem> <FormLabel>Número do Documento</FormLabel> <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          </div>
                       </FormProvider>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => form.trigger(['email', 'firstName', 'lastName', 'docType', 'docNumber']).then(isValid => isValid && setCurrentStep(1))}>Avançar para Entrega</Button>
                    </CardFooter>
                </Card>
            );
        case 1: // Shipping
            return (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Truck className="h-6 w-6"/> Entrega</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => handleOpenAddressForm(null)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Endereço</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="font-semibold text-base mb-2 block">Selecione o endereço</Label>
                            {userAddresses.length > 0 ? (
                                <RadioGroup value={selectedAddressId || ''} onValueChange={(id) => { const addr = userAddresses.find(a => a.id === id); if(addr) handleSelectAddress(addr); }}>
                                    <div className="space-y-3">
                                        {userAddresses.map(address => (
                                            <div key={address.id}>
                                                <RadioGroupItem value={address.id!} id={`addr-${address.id}`} className="sr-only" />
                                                <Label htmlFor={`addr-${address.id}`} className={cn("w-full text-left p-4 border rounded-lg cursor-pointer hover:bg-accent block", selectedAddressId === address.id && 'bg-accent border-primary ring-2 ring-primary')}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-semibold">{address.nickname}</span>
                                                            <p className="text-sm text-muted-foreground">{address.street}, {address.number}</p>
                                                            <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.cep}</p>
                                                        </div>
                                                        {address.isDefault && <Badge>Padrão</Badge>}
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            ) : (
                                <div className="text-center p-4 border-2 border-dashed rounded-lg text-muted-foreground">
                                    <p>Nenhum endereço cadastrado.</p>
                                    <Button variant="link" onClick={() => handleOpenAddressForm(null)}>Cadastre o primeiro</Button>
                                </div>
                            )}
                        </div>
                         <div>
                            <Label className="font-semibold text-base mb-2 block">Selecione o frete</Label>
                            {isLoadingShipping && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Calculando frete...</div>}
                            {errorShipping && <p className="text-sm text-red-600">{errorShipping}</p>}
                            {!isLoadingShipping && shippingOptions.length > 0 ? (
                                 <RadioGroup onValueChange={(id) => handleSelectShipping(shippingOptions.find(opt => opt.id.toString() === id))} className="space-y-3">
                                    {shippingOptions.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem value={option.id.toString()} id={`ship-${option.id}`} className="sr-only" />
                                            <Label htmlFor={`ship-${option.id}`} className={cn("flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-100 has-[:checked]:bg-black/5 has-[:checked]:border-black transition-all", selectedShipping?.id === option.id && 'border-primary ring-2 ring-primary')}>
                                                <div className="flex items-center gap-3">
                                                    {option.company.picture && <Image src={option.company.picture} alt={option.company.name} width={24} height={24} className="rounded-full"/>}
                                                    <span className="font-semibold text-gray-800">{option.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900">{option.price === '0.00' ? 'Grátis' : `R$ ${parseFloat(option.price).toFixed(2).replace('.', ',')}`}</span>
                                                    <p className="text-xs text-gray-500">Prazo: {option.delivery_time} dias úteis</p>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : !isLoadingShipping && <p className="text-muted-foreground text-sm">Selecione um endereço para ver as opções de frete.</p>}
                         </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                         <Button variant="ghost" onClick={() => setCurrentStep(0)}>Voltar</Button>
                         <Button onClick={() => setCurrentStep(2)} disabled={!selectedShipping}>Avançar para Pagamento</Button>
                    </CardFooter>
                </Card>
            );
        case 2: // Payment
            return (
                 <Card>
                    <CardHeader><CardTitle>3. Forma de Pagamento</CardTitle></CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-3 mb-6">
                            <Label htmlFor="pix" className="flex items-center space-x-3 cursor-pointer rounded-lg border p-4 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-all">
                                <RadioGroupItem value="pix" id="pix" />
                                <div className="w-full">
                                    <p className="font-medium flex items-center gap-2">Pagar com Pix <QrCode className="h-4 w-4"/></p>
                                    <span className="text-sm text-green-600 font-semibold">Pagamento aprovado na hora!</span>
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

                        {paymentMethod === 'pix' ? (
                            <Button onClick={handleGeneratePix} size="lg" className="w-full h-12 text-lg rounded-xl" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <QrCode className="mr-2 h-5 w-5"/>}
                                Gerar Pix de R$ {total.toFixed(2).replace('.',',')}
                           </Button>
                        ) : (
                           <Payment
                                initialization={{ 
                                    amount: total,
                                    payer: {
                                        firstName: form.getValues('firstName'),
                                        lastName: form.getValues('lastName'),
                                        email: form.getValues('email'),
                                    }
                                }}
                                customization={{
                                    paymentMethods: {
                                        creditCard: "all",
                                        debitCard: [],
                                        mercadoPago: [],
                                    },
                                    visual: {
                                        style: {
                                            theme: 'default'
                                        }
                                    }
                                }}
                                onSubmit={onCardPaymentSubmit}
                            />
                        )}

                    </CardContent>
                    <CardFooter className="justify-start pt-6 border-t">
                       <Button variant="ghost" onClick={() => setCurrentStep(1)}>Voltar para Entrega</Button>
                    </CardFooter>
                </Card>
            );
    }
  }


  return (
    <>
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {!user && (
            <Card className="max-w-4xl mx-auto mb-8 bg-blue-50 border-blue-200">
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
        {/* Stepper */}
        <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className={cn("flex flex-col items-center gap-1 w-24", currentStep >= index ? 'text-primary' : 'text-muted-foreground')}>
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                            currentStep > index ? "bg-primary text-primary-foreground border-primary" :
                            currentStep === index ? "border-primary" : "border-border"
                        )}>
                            {currentStep > index ? <Check/> : <step.icon className="h-5 w-5"/>}
                        </div>
                        <span className="text-sm font-medium text-center">{step.name}</span>
                    </div>
                    {index < steps.length - 1 && <div className={cn("flex-1 h-1 transition-colors", currentStep > index ? "bg-primary" : "bg-border")}></div>}
                </React.Fragment>
            ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
                {renderCurrentStep()}
            </div>
            
            <aside className="lg:col-span-2">
                <div className="sticky top-24 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart/> Resumo do Pedido</CardTitle></CardHeader>
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
                                <div className="flex justify-between"><span>Frete</span><span className="font-medium">{selectedShipping ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'A calcular'}</span></div>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </aside>
        </div>
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
  );
}
