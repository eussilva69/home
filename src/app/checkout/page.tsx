
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Package, Loader2, CheckCircle, QrCode, Copy, CreditCard, AlertTriangle } from 'lucide-react';
import { processPixPayment, processRedirectPayment, getPaymentStatus } from '../actions';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRCode from 'qrcode.react';
import type { CreatePaymentOutput } from '@/lib/schemas';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Nome é obrigatório."),
  lastName: z.string().min(2, "Sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  docType: z.string().min(2, "Tipo de documento é obrigatório."),
  docNumber: z.string().min(8, "Número do documento é obrigatório."),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type PaymentMethod = 'pix' | 'card';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreatePaymentOutput | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string, paymentId: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  const { toast } = useToast();
  const { cartItems, shipping, clearCart } = useCart();
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const shippingCost = useMemo(() => shipping?.price || 0, [shipping]);

  const pixDiscount = 0.10; // 10%
  const cardFee = 0.0499; // 4.99%

  const totalPix = useMemo(() => (subtotal * (1 - pixDiscount)) + shippingCost, [subtotal, shippingCost, pixDiscount]);
  const totalCard = useMemo(() => (subtotal + shippingCost) * (1 + cardFee), [subtotal, shippingCost, cardFee]);
  const totalDisplay = paymentMethod === 'pix' ? totalPix : totalCard;

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
        title: `Frete (${shipping?.name} - ${shipping?.company})`,
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

  const onFormSubmit = (data: CheckoutFormValues) => {
    if (paymentMethod === 'pix') {
      handleGeneratePix(data);
    } else {
      handleRedirectPayment(data);
    }
  }

  const copyToClipboard = () => {
      if (pixData) {
          navigator.clipboard.writeText(pixData.qrCode);
          toast({ title: 'Copiado!', description: 'Código Pix copiado para la área de transferência.' });
      }
  }

  const handleBackFromPix = () => {
    stopPolling();
    setPixData(null);
  }

  const renderContent = () => {
    if (cartItems.length > 0 && !shipping) {
        return (
            <div className="text-center">
                <AlertTriangle className="h-24 w-24 mx-auto text-yellow-500 mb-4"/>
                <h1 className="font-headline text-4xl font-bold mb-4">Frete não calculado!</h1>
                <p className="text-muted-foreground mb-8">Por favor, volte ao carrinho para calcular o frete antes de prosseguir.</p>
                <Button onClick={() => router.push('/cart')} size="lg">
                    Voltar para o Carrinho
                </Button>
            </div>
        )
    }

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
               <Button onClick={handleBackFromPix} size="lg" variant="ghost" className="mt-8">
                  Escolher outra forma de pagamento
              </Button>
          </div>
       )
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="max-w-2xl mx-auto space-y-8">
                {/* Forma de Pagamento */}
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Escolha a forma de pagamento:</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                 {/* Informações Pessoais */}
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Seu nome</FormLabel><FormControl><Input placeholder="Digite seu nome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Seu sobrenome</FormLabel><FormControl><Input placeholder="Digite seu sobrenome" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
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

                {/* Resumo do Pedido */}
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
                                <span className="">Frete ({shipping?.name})</span>
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

                 <div className="text-center">
                    <Button type="submit" size="lg" className="w-full max-w-xs h-12 text-lg rounded-xl" disabled={isProcessing || cartItems.length === 0}>
                         {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : paymentMethod === 'pix' ? <QrCode className="mr-2 h-5 w-5"/> : <CreditCard className="mr-2 h-5 w-5"/>}
                         Finalizar Pedido
                    </Button>
                </div>

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
