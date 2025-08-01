
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Copy, ArrowLeft, Download, User as UserIcon, CreditCard, QrCode } from 'lucide-react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const MERCADO_PAGO_PUBLIC_KEY = "TEST-df7a6d8f-8512-4202-acb2-a54cd6d22d59";
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'Nome inválido.' }),
  lastName: z.string().min(2, { message: 'Sobrenome inválido.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
  docType: z.string().min(2, { message: 'Selecione um documento.' }),
  docNumber: z.string().min(11, { message: 'Número de documento inválido.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type PaymentResultType = {
  status: string;
  message: string;
  qr_code?: string;
  qr_code_base64?: string;
};

const PayerForm = ({ setPayerInfo }: { setPayerInfo: (info: any) => void }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();
    const formData = watch();

    useEffect(() => {
        setPayerInfo({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            identification: {
                type: formData.docType,
                number: formData.docNumber,
            },
        });
    }, [formData, setPayerInfo]);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon /> Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input id="firstName" {...register('firstName')} placeholder="Seu nome" />
                        {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input id="lastName" {...register('lastName')} placeholder="Seu sobrenome" />
                        {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" {...register('email')} placeholder="seu@email.com" />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="docType">Tipo de Documento</Label>
                         <Select onValueChange={(value) => register('docType').onChange({ target: { value } })} name="docType">
                            <SelectTrigger id="docType"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CPF">CPF</SelectItem>
                                <SelectItem value="CNPJ">CNPJ</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.docType && <p className="text-destructive text-sm mt-1">{errors.docType.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="docNumber">Número do Documento</Label>
                        <Input id="docNumber" {...register('docNumber')} placeholder="000.000.000-00" />
                        {errors.docNumber && <p className="text-destructive text-sm mt-1">{errors.docNumber.message}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function MercadoPagoCheckout({ totalAmount }: {totalAmount: number}) {
  const { clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResultType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'creditCard'>('pix');
  const [payerInfo, setPayerInfo] = useState({});

  const methods = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) });
  const { trigger, getValues } = methods;
  
  const totalWithFee = totalAmount * 1.05;
  const finalAmount = paymentMethod === 'creditCard' ? totalWithFee : totalAmount;
  const pixDiscount = totalWithFee - totalAmount;

  const handleSuccessfulPayment = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const handlePayment = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setPaymentResult(null);

    const isPayerFormValid = await trigger();
    if (!isPayerFormValid) {
        setIsLoading(false);
        setError("Por favor, preencha suas informações pessoais corretamente.");
        return;
    }
    
    const allFormData = { ...formData, payer: { ...getValues(), identification: { type: getValues().docType, number: getValues().docNumber.replace(/\D/g, '') } } };

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': `checkout-${Date.now()}` },
        body: JSON.stringify(allFormData),
      });

      const result = await response.json();

      if (!response.ok) {
         let errorMessage = result.message || 'Pagamento recusado.';
         if (result.details && result.details.length > 0) {
            const detailMsg = result.details[0].description;
            if (detailMsg) errorMessage = detailMsg;
         }
         throw new Error(errorMessage);
      }
      
      if (result.status === 'approved' || result.status === 'in_process') {
         setPaymentResult({ status: 'approved', message: 'Pagamento aprovado com sucesso! Obrigado pela sua compra.' });
         handleSuccessfulPayment();
      } else if (result.status === 'pending' && result.qr_code_base64) {
         setPaymentResult({ 
             status: 'pending_pix', 
             message: 'Aponte a câmera do seu celular para o QR Code ou copie o código para pagar.',
             qr_code: result.qr_code,
             qr_code_base64: result.qr_code_base64,
         });
         handleSuccessfulPayment();
      } else {
         throw new Error(result.detail || 'Seu pagamento foi recusado. Verifique os dados e tente novamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar seu pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código Pix copiado para a área de transferência!');
  };

  const initialization = {
    amount: finalAmount,
    payer: payerInfo,
  };

  const customization = {
     paymentMethods: {
      creditCard: "all" as const,
      debitCard: [] as const,
      pix: "all" as const,
      bankTransfer: [] as const,
      mercadoPago: [] as const,
    },
  };
  
   const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-secondary/50 rounded-lg min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Processando pagamento...</p>
        </div>
      );
    }
    
    if (error && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-10 w-10 mb-4" />
          <h3 className="font-semibold mb-2">Oops! Algo deu errado.</h3>
          <p className="text-center text-sm mb-4">{error}</p>
          <Button onClick={() => setError(null)}><ArrowLeft className="mr-2"/> Tentar Novamente</Button>
        </div>
      );
    }

    if (paymentResult?.status === 'approved') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-green-100 text-green-800 border border-green-200 rounded-lg">
          <CheckCircle className="h-10 w-10 mb-4 text-green-600" />
          <h3 className="font-semibold mb-2">Pagamento Aprovado!</h3>
          <p className="text-center text-sm mb-4">{paymentResult.message}</p>
          <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Voltar para a loja</Button>
        </div>
      );
    }

    if (paymentResult?.status === 'pending_pix') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg">
            <Download className="h-10 w-10 mb-4 text-blue-600" />
            <h3 className="font-semibold mb-2">Aguardando Pagamento Pix</h3>
            <p className="text-center text-sm mb-4">{paymentResult.message}</p>
            {paymentResult.qr_code_base64 && (
                <Image 
                    src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                    alt="QR Code Pix"
                    width={200}
                    height={200}
                    className="mb-4 rounded-md"
                />
            )}
            {paymentResult.qr_code && (
                <Button onClick={() => copyToClipboard(paymentResult.qr_code!)} className="w-full mb-4">
                    <Copy className="mr-2"/> Copiar Código Pix
                </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Voltar para a loja</Button>
        </div>
      );
    }

    return (
      <>
        <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
                <PayerForm setPayerInfo={setPayerInfo}/>
            </form>
        </FormProvider>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard /> Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button onClick={() => setPaymentMethod('pix')} variant={paymentMethod === 'pix' ? 'default' : 'outline'} className="h-12 text-base">
                        <QrCode className="mr-2" /> Pix
                    </Button>
                    <Button onClick={() => setPaymentMethod('creditCard')} variant={paymentMethod === 'creditCard' ? 'default' : 'outline'} className="h-12 text-base">
                        <CreditCard className="mr-2" /> Cartão
                    </Button>
                 </div>
                 {paymentMethod === 'pix' && pixDiscount > 0 && (
                     <p className="text-sm text-center text-green-600 font-semibold mb-4">
                         Você economiza R$ {pixDiscount.toFixed(2).replace('.',',')} pagando com Pix!
                     </p>
                 )}
                <div id="payment-brick_container">
                    <Payment
                        key={paymentMethod} // Re-mount the component when method changes
                        initialization={{
                          ...initialization,
                          amount: finalAmount,
                        }}
                        customization={{
                            ...customization,
                            paymentMethods: {
                                creditCard: paymentMethod === 'creditCard' ? 'all' : [],
                                debitCard: [],
                                pix: paymentMethod === 'pix' ? 'all' : [],
                                bankTransfer: [],
                                mercadoPago: [],
                            }
                        }}
                        onSubmit={handlePayment}
                        onError={(err) => setError("Ocorreu um erro no formulário de pagamento. Verifique os dados e tente novamente.")}
                    />
                </div>
            </CardContent>
        </Card>
      </>
    );
  };


  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-headline text-primary">Finalizar Pagamento</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
          <ShieldCheck className="h-5 w-5 text-green-600" /> Ambiente 100% seguro
        </p>
      </div>
      {renderContent()}
    </div>
  );
}
