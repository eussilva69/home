
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Package, Loader2, CheckCircle, QrCode, Copy, CreditCard } from 'lucide-react';
import { processPixPayment, processRedirectPayment, getPaymentStatus } from '../actions';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCode from 'qrcode.react';
import type { CreatePaymentOutput } from '@/lib/schemas';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Nome é obrigatório."),
  lastName: z.string().min(2, "Sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  docType: z.string().min(2, "Tipo de documento é obrigatório."),
  docNumber: z.string().min(8, "Número do documento é obrigatório."),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreatePaymentOutput | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string, paymentId: number } | null>(null);
  
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 0; // Temporariamente zerado
  const finalTotal = subtotal + shippingCost;
  const pixDiscount = 0.10; // 10%
  const cardFee = 0.0499; // 4.99%
  const totalPix = finalTotal * (1 - pixDiscount);
  const totalCard = finalTotal * (1 + cardFee);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { firstName: '', lastName: '', email: '', docType: 'CPF', docNumber: '' }
  });
  
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleSuccessfulPayment = (paymentId?: number) => {
    stopPolling();
    setPaymentResult({ success: true, paymentId });
    clearCart();
  };
  
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
  }, [router, toast, clearCart]);


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


  const handleGeneratePix = async () => {
     const validation = await form.trigger();
     if (!validation) {
         toast({ variant: 'destructive', title: 'Dados incompletos', description: 'Por favor, preencha suas informações pessoais primeiro.' });
         return;
     }

     setIsProcessing(true);
     const result = await processPixPayment({
         transaction_amount: parseFloat(totalPix.toFixed(2)),
         description: "Compra na Home Designer via Pix",
         payer: {
             email: form.getValues('email'),
             first_name: form.getValues('firstName'),
             last_name: form.getValues('lastName'),
             identification: {
                 type: form.getValues('docType'),
                 number: form.getValues('docNumber'),
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

  const handleRedirectPayment = async () => {
    const validation = await form.trigger();
    if (!validation) {
      toast({ variant: 'destructive', title: 'Dados incompletos', description: 'Por favor, preencha suas informações pessoais primeiro.' });
      return;
    }
    
    setIsProcessing(true);

    const cartAndShippingItems = [
      ...cartItems.map(item => ({
        id: item.id,
        title: `${item.name} (${item.options})`,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL',
      })),
      {
        id: 'shipping',
        title: 'Frete',
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'BRL'
      }
    ];

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + shippingCost;
    const fee = totalAmount * cardFee;

    const itemsWithFee = [
        ...cartAndShippingItems,
        {
            id: 'fee',
            title: 'Taxa de Serviço (Cartão)',
            quantity: 1,
            unit_price: parseFloat(fee.toFixed(2)),
            currency_id: 'BRL',
        }
    ];

    const result = await processRedirectPayment({
        items: itemsWithFee,
        payer: {
            name: form.getValues('firstName'),
            surname: form.getValues('lastName'),
            email: form.getValues('email'),
            identification: {
                type: form.getValues('docType'),
                number: form.getValues('docNumber'),
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


  const copyToClipboard = () => {
      if (pixData) {
          navigator.clipboard.writeText(pixData.qrCode);
          toast({ title: 'Copiado!', description: 'Código Pix copiado para a área de transferência.' });
      }
  }

  const handleBackFromPix = () => {
    stopPolling();
    setPixData(null);
  }

  const renderContent = () => {
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
          <div className="text-center">
              <h1 className="font-headline text-4xl font-bold mb-4">Pague com Pix</h1>
              <p className="text-muted-foreground mb-8">Escaneie o QR Code abaixo com o app do seu banco.</p>
              <div className="flex justify-center mb-6">
                <QRCode value={pixData.qrCode} size={256} />
              </div>
               <p className="text-muted-foreground mb-4">Ou copie o código:</p>
              <div className="flex justify-center items-center gap-2 max-w-lg mx-auto mb-8">
                  <Input readOnly value={pixData.qrCode} className="text-center text-xs truncate"/>
                  <Button onClick={copyToClipboard} size="icon" variant="outline"><Copy className="h-4 w-4"/></Button>
              </div>
              <div className="flex justify-center items-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin"/>
                  <span className="font-semibold">Aguardando pagamento...</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">(ID do Pedido: {pixData.paymentId})</p>
               <Button onClick={handleBackFromPix} size="lg" variant="ghost" className="mt-8">
                  Escolher outra forma de pagamento
              </Button>
          </div>
       )
    }

    return (
        <>
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center">Finalizar Compra</h1>
            <FormProvider {...form}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-primary"/> Informações Pessoais</CardTitle></CardHeader>
                    <CardContent>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Seu sobrenome" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="md:col-span-2">
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="docType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Documento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CPF">CPF</SelectItem>
                                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                                    </SelectContent>
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
                      </form>
                    </CardContent>
                  </Card>
    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                        <CardDescription>Escolha a forma de pagamento.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="pix">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pix"><QrCode className="mr-2 h-4 w-4"/>Pix</TabsTrigger>
                            <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4"/>Cartão de Crédito</TabsTrigger>
                          </TabsList>
                          <TabsContent value="pix" className="mt-6">
                             <p className="text-muted-foreground mb-4">Ganhe <span className="font-bold text-green-600">{(pixDiscount * 100)}% de desconto</span>! Após preencher seus dados, clique no botão para gerar o QR Code.</p>
                             <Button onClick={handleGeneratePix} size="lg" className="w-full" disabled={isProcessing || cartItems.length === 0}>
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <QrCode className="mr-2 h-5 w-5"/>}
                                {isProcessing ? 'Gerando...' : `Pagar R$ ${totalPix.toFixed(2)} com Pix`}
                             </Button>
                          </TabsContent>
                           <TabsContent value="card" className="mt-6">
                             <p className="text-muted-foreground mb-4">Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar o pagamento com seu cartão de crédito. Haverá uma taxa de serviço de {(cardFee * 100).toFixed(2)}%.</p>
                             <Button onClick={handleRedirectPayment} size="lg" className="w-full" disabled={isProcessing || cartItems.length === 0}>
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <CreditCard className="mr-2 h-5 w-5"/>}
                                {isProcessing ? 'Redirecionando...' : `Pagar R$ ${totalCard.toFixed(2)} com Cartão`}
                             </Button>
                           </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                </div>
    
                <div className="lg:col-span-1">
                  <Card className="bg-secondary/50 sticky top-24">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> Resumo do Pedido</CardTitle></CardHeader>
                      <CardContent className="grid gap-4">
                          <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                              {cartItems.map(item => (
                                  <div key={item.id} className="flex justify-between items-center text-sm">
                                      <span className="font-semibold">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                                      <span>R$ {(item.price * item.quantity).toFixed(2).replace('.',',')}</span>
                                  </div>
                              ))}
                              {shippingCost > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold">Frete</span>
                                    <span>R$ {shippingCost.toFixed(2).replace('.',',')}</span>
                                </div>
                               )}
                          </div>
                          <Separator className="my-2 bg-border" />
                          <div className="flex justify-between font-bold text-xl">
                              <span>Total</span>
                              <span>R$ {finalTotal.toFixed(2).replace('.',',')}</span>
                          </div>
                      </CardContent>
                  </Card>
                </div>
              </div>
            </FormProvider>
        </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
}
