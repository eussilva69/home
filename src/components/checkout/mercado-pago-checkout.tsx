
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle, Copy, ArrowLeft, Download } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MERCADO_PAGO_PUBLIC_KEY = "TEST-df7a6d8f-8512-4202-acb2-a54cd6d22d59";
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

type MercadoPagoCheckoutProps = {
  totalAmount: number;
  paymentMethods: "all" | "credit_card" | "pix";
};

type PaymentResultType = {
  status: string;
  message: string;
  qr_code?: string;
  qr_code_base64?: string;
};

export default function MercadoPagoCheckout({ totalAmount, paymentMethods }: MercadoPagoCheckoutProps) {
  const { clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResultType | null>(null);

  const handleSuccessfulPayment = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const handlePayment = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `checkout-${Date.now()}`
        },
        body: JSON.stringify(formData),
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
      } else if (result.status === 'pending' && result.payment_method_id === 'pix') {
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
    amount: totalAmount,
    description: "Compra em Home Designer",
  };

  const customization = {
     paymentMethods: {
      creditCard: paymentMethods === 'all' || paymentMethods === 'credit_card' ? "all" as const : [] as const,
      pix: paymentMethods === 'all' || paymentMethods === 'pix' ? "all" as const : [] as const,
      bankTransfer: [] as const,
      debitCard: [] as const,
      mercadoPago: [] as const,
    },
     visual: {
      style: {
        theme: 'default' as 'default', 
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex justify-center items-start">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-headline text-primary">Finalizar Pagamento</h1>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
              <ShieldCheck className="h-5 w-5 text-green-600" /> Ambiente 100% seguro
            </p>
          </div>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-secondary/50 rounded-lg min-h-[300px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Processando pagamento...</p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-10 w-10 mb-4" />
              <h3 className="font-semibold mb-2">Oops! Algo deu errado.</h3>
              <p className="text-center text-sm mb-4">{error}</p>
              <Button onClick={() => setError(null)}><ArrowLeft className="mr-2"/> Tentar Novamente</Button>
            </div>
          )}

          {paymentResult?.status === 'approved' && (
               <div className="flex flex-col items-center justify-center p-8 bg-green-100 text-green-800 border border-green-200 rounded-lg">
                  <CheckCircle className="h-10 w-10 mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Pagamento Aprovado!</h3>
                  <p className="text-center text-sm mb-4">{paymentResult.message}</p>
                  <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Voltar para a loja</Button>
              </div>
          )}

          {paymentResult?.status === 'pending_pix' && (
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
                          className="mb-4"
                      />
                  )}
                  {paymentResult.qr_code && (
                      <Button onClick={() => copyToClipboard(paymentResult.qr_code!)} className="w-full mb-4">
                          <Copy className="mr-2"/> Copiar Código Pix
                      </Button>
                  )}
                   <Button variant="outline" onClick={() => router.push('/')}><ArrowLeft className="mr-2"/> Voltar para a loja</Button>
              </div>
          )}
          
          {!isLoading && !error && !paymentResult && (
              <Payment
                  key={paymentMethods}
                  initialization={initialization}
                  customization={customization}
                  onSubmit={handlePayment}
                  onError={(err) => setError("Ocorreu um erro no formulário. Verifique os dados e tente novamente.")}
              />
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
