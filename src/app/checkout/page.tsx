
'use client';

import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, QrCode, Copy, CreditCard, Truck, Edit, ChevronRight, User, MailIcon, Home, Check } from 'lucide-react';
import { processPixPayment, processRedirectPayment, getPaymentStatus, calculateShipping, saveOrder, getUserAddresses } from '../actions';
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


type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type PaymentMethod = 'pix' | 'card';

const StepCard = ({ title, step, currentStep, onEdit, children, isCompleted }: { title: string; step: number; currentStep: number; onEdit: (s: number) => void; children: React.ReactNode; isCompleted: boolean; }) => {
    if (currentStep < step) return null;

    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">{step}. {title}</CardTitle>
                {isCompleted && currentStep > step && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(step)}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
                )}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
};


export default function CheckoutPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreatePaymentOutput | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string, paymentId: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [errorShipping, setErrorShipping] = useState<string | null>(null);
  
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);


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

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  }
  
  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);

  useEffect(() => {
    return () => stopPolling();
  }, []);
  
  const cepValue = form.watch('cep');
  
  const fetchAddresses = useCallback(async () => {
    if (user) {
      const addresses = await getUserAddresses(user.uid);
      addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setUserAddresses(addresses);
      // If no address form is open, try to pre-fill with default
      if (!showAddressForm && addresses.length > 0) {
        const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
        handleSelectAddress(defaultAddress);
      } else if (addresses.length === 0) {
        setShowAddressForm(true); // Force form if no addresses
      }
    }
  }, [user, showAddressForm]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const fetchAddressFromCep = async () => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    form.setValue('street', data.logradouro);
                    form.setValue('neighborhood', data.bairro);
                    form.setValue('city', data.localidade);
                    form.setValue('state', data.uf);
                } else {
                    toast({ title: 'CEP não encontrado', variant: 'destructive'});
                }
            } catch (error) {
                toast({ title: 'Erro ao buscar CEP', variant: 'destructive'});
            }
        }
    };
    if (showAddressForm) {
      fetchAddressFromCep();
    }
  }, [cepValue, form, toast, showAddressForm]);


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
        address: `${formData.street}, ${formData.number}, ${formData.neighborhood}`,
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
      // Even with an error saving, the payment was approved, so continue the user flow
    }

    // Send order approved email
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinatario: formData.email, type: 'orderApproved' }),
    });
  
    setPaymentResult({ success: true, paymentId });
    clearCart();
    setStep(6); // Final success step
  }, [form, selectedShipping, cartItems, paymentMethod, totalDisplay, subtotal, shippingCost, clearCart, toast]);
  
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
        toast({ title: 'Carrinho vazio!', description: 'Você será redirecionado para a loja.', variant: 'default'});
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
            toast({ variant: 'destructive', title: 'Erro de comunicação', description: 'Não foi possível verificar o status do seu pagamento no momento.' });
            stopPolling();
        }
    }, 5000);
  }
  
  const handleCalculateShipping = async (cepToCalculate?: string) => {
    const cep = cepToCalculate || form.getValues('cep');
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
    form.setValue('cep', address.cep);
    form.setValue('street', address.street);
    form.setValue('number', address.number);
    form.setValue('complement', address.complement || '');
    form.setValue('neighborhood', address.neighborhood);
    form.setValue('city', address.city);
    form.setValue('state', address.state);
    setShowAddressForm(false);
    handleCalculateShipping(address.cep);
  };

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
        setStep(6); // Go to Pix display step
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
  
  const handleEditStep = (stepNumber: number) => {
      if (step > stepNumber) {
          setStep(stepNumber);
      }
  }
  
  const isStepComplete = (stepNumber: number) => {
      switch(stepNumber) {
          case 1: return form.getValues('email') !== '';
          case 2: return form.getValues('firstName') !== '' && form.getValues('lastName') !== '' && form.getValues('docNumber') !== '';
          case 3: return !!selectedShipping && form.getValues('street') !== '';
          case 4: return true;
          default: return false;
      }
  }

  const renderContent = () => {
    if (step === 6) { // Final State Screen (Success or Pix QR)
        if (paymentResult?.success) {
            return (
              <div className="text-center">
                  <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-4"/>
                  <h1 className="font-headline text-4xl font-bold mb-4">Pagamento Aprovado!</h1>
                  <p className="text-muted-foreground mb-2">Obrigado pela sua compra!</p>
                  {paymentResult.paymentId && <p className="text-sm text-muted-foreground mb-8">ID do Pagamento: {paymentResult.paymentId}</p>}
                  <Button onClick={() => router.push('/')} size="lg">
                      Voltar para a Loja
                  </Button>
              </div>
            )
        }

        if (pixData) {
           return (
              <div className="text-center max-w-md mx-auto">
                  <h1 className="font-headline text-4xl font-bold mb-4">Pague com Pix</h1>
                  <p className="text-muted-foreground mb-8">Escaneie o QR Code abaixo com o app do seu banco.</p>
                  <div className="flex justify-center mb-6">
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
           )
        }
    }

    // Multi-step form
    return (
        <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl mx-auto space-y-6">
                
                <StepCard title="Identificação" step={1} currentStep={step} onEdit={handleEditStep} isCompleted={isStepComplete(1)}>
                    {step === 1 ? (
                         <>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seu melhor e-mail</FormLabel>
                                    <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button onClick={async () => {
                                const isValid = await form.trigger('email');
                                if (isValid) setStep(2);
                            }} className="mt-4">
                                Continuar <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <p className="text-muted-foreground flex items-center gap-2"><MailIcon className="h-4 w-4" /> {form.getValues('email')}</p>
                    )}
                </StepCard>

                <StepCard title="Informações Pessoais" step={2} currentStep={step} onEdit={handleEditStep} isCompleted={isStepComplete(2)}>
                    {step === 2 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Seu nome</FormLabel><FormControl><Input placeholder="Digite seu nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Seu sobrenome</FormLabel><FormControl><Input placeholder="Digite seu sobrenome" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                             <Button onClick={async () => {
                                const isValid = await form.trigger(['firstName', 'lastName', 'docType', 'docNumber']);
                                if (isValid) setStep(3);
                            }} className="mt-4">
                                Continuar <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <p className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> {form.getValues('firstName')} {form.getValues('lastName')}</p>
                    )}
                </StepCard>

                <StepCard title="Entrega" step={3} currentStep={step} onEdit={handleEditStep} isCompleted={isStepComplete(3)}>
                     {step === 3 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Selecione um endereço salvo ou cadastre um novo.</p>
                             <div className="space-y-2">
                                {userAddresses.map(address => (
                                    <button key={address.id} onClick={() => handleSelectAddress(address)} className={cn("w-full text-left p-3 border rounded-lg hover:bg-accent", form.getValues('cep') === address.cep && 'bg-accent border-primary')}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">{address.nickname}</span>
                                            {address.isDefault && <Badge>Padrão</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{address.street}, {address.number}</p>
                                    </button>
                                ))}
                             </div>

                             <Button variant="link" onClick={() => setShowAddressForm(!showAddressForm)}>
                                {showAddressForm ? 'Cancelar' : 'Cadastrar outro endereço'}
                            </Button>

                             {showAddressForm && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-start gap-2">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>CEP</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Digite seu CEP" {...field} maxLength={9} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button onClick={() => handleCalculateShipping()} disabled={isLoadingShipping} className="mt-8">
                                            {isLoadingShipping ? <Loader2 className="animate-spin" /> : 'Calcular Frete'}
                                        </Button>
                                    </div>

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
                            )}

                            {errorShipping && <p className="text-sm text-red-600 mt-2">{errorShipping}</p>}
                            
                            {!isLoadingShipping && shippingOptions.length > 0 && (
                                <div className="mt-6">
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
                             <Button onClick={async () => { 
                                const isValid = await form.trigger(['cep', 'street', 'number', 'neighborhood', 'city', 'state']);
                                if (isValid && selectedShipping) setStep(4);
                                if (!selectedShipping) setErrorShipping('Por favor, selecione uma opção de frete.');
                             }} className="mt-4" disabled={!selectedShipping}>
                                Continuar <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                     ) : (
                         <div className="text-muted-foreground flex flex-col gap-1">
                            <p className="flex items-center gap-2"><Home className="h-4 w-4" />{form.getValues('street')}, {form.getValues('number')} - {form.getValues('neighborhood')}</p>
                            <p className="flex items-center gap-2 ml-6">{form.getValues('city')} - {form.getValues('state')}, {form.getValues('cep')}</p>
                            <p className="flex items-center gap-2 mt-2"><Truck className="h-4 w-4" />{selectedShipping?.name} (R$ {selectedShipping?.price.toFixed(2).replace('.',',')})</p>
                         </div>
                     )}
                </StepCard>

                <StepCard title="Forma de Pagamento" step={4} currentStep={step} onEdit={handleEditStep} isCompleted={isStepComplete(4)}>
                    {step === 4 ? (
                        <>
                             <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-3">
                                <Label htmlFor="pix" className="flex items-center space-x-3 cursor-pointer rounded-lg border p-4 has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-all">
                                    <RadioGroupItem value="pix" id="pix" />
                                    <span className="font-medium">
                                    Pix <span className="text-green-600 font-semibold">(Ganhe {pixDiscount*100}% de desconto!)</span>
                                    </span>
                                </Label>
                                <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                    <RadioGroupItem value="card" id="card" />
                                    <span className="font-medium">Cartão de Crédito</span>
                                </Label>
                            </RadioGroup>
                             <Button onClick={() => setStep(5)} className="mt-4">
                                Revisar Pedido <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                         <p className="text-muted-foreground flex items-center gap-2">
                           {paymentMethod === 'pix' ? <QrCode className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                           {paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito'}
                        </p>
                    )}
                </StepCard>

                {step === 5 && (
                    <Card className="rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Resumo do Pedido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                                    <span>R$ {(item.price * item.quantity).toFixed(2).replace('.',',')}</span>
                                </div>
                            ))}
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="">Frete ({selectedShipping?.name})</span>
                                    <span>R$ {shippingCost.toFixed(2).replace('.',',')}</span>
                                </div>
                            )}
                            {paymentMethod === 'pix' && (
                                <div className="flex justify-between text-sm text-green-600 font-semibold">
                                    <span>Desconto Pix ({pixDiscount*100}%)</span>
                                    <span>- R$ {(subtotal * pixDiscount).toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                            {paymentMethod === 'card' && (
                                <div className="flex justify-between text-sm">
                                    <span>Taxa Cartão ({(cardFee*100).toFixed(2)}%)</span>
                                    <span>+ R$ {((subtotal + shippingCost) * cardFee).toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}

                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>R$ {totalDisplay.toFixed(2).replace('.',',')}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 
                 {step === 5 && (
                    <div className="text-center">
                        <Button onClick={onFinalSubmit} size="lg" className="w-full max-w-xs h-12 text-lg rounded-xl" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : paymentMethod === 'pix' ? <QrCode className="mr-2 h-5 w-5"/> : <CreditCard className="mr-2 h-5 w-5"/>}
                            Finalizar Pedido
                        </Button>
                    </div>
                 )}
            </form>
        </FormProvider>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">Finalizar Compra</h1>
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}
