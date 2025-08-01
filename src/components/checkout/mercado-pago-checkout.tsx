
'use client';

import { useState } from 'react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// Chave pública de teste do Mercado Pago
const MERCADO_PAGO_PUBLIC_KEY = "TEST-df7a6d8f-8512-4202-acb2-a54cd6d22d59";
initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });

type MercadoPagoCheckoutProps = {
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    picture_url: string;
  }[];
  shippingCost: number;
};

export default function MercadoPagoCheckout({ items, shippingCost }: MercadoPagoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ status: string; message: string } | null>(null);

  const totalAmount = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0) + shippingCost;

  const handlePayment = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'rejected') {
         let errorMessage = 'Pagamento recusado.';
         if (result.status_detail) {
            switch(result.status_detail) {
                case 'cc_rejected_bad_filled_card_number':
                    errorMessage = 'Número do cartão inválido.';
                    break;
                case 'cc_rejected_bad_filled_date':
                    errorMessage = 'Data de validade inválida.';
                    break;
                case 'cc_rejected_bad_filled_security_code':
                    errorMessage = 'Código de segurança inválido.';
                    break;
                case 'cc_rejected_insufficient_amount':
                     errorMessage = 'Saldo insuficiente.';
                     break;
                default:
                     errorMessage = 'Pagamento recusado. Verifique os dados e tente novamente.';
            }
         }
        throw new Error(errorMessage);
      }
      
       setPaymentResult({ status: 'approved', message: 'Pagamento aprovado com sucesso! Obrigado pela sua compra.' });

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar seu pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const initialization = {
    amount: totalAmount,
    description: "Compra em Home Designer",
  };

  const customization = {
    visual: {
      style: {
        theme: 'default' as 'default', // ou 'dark', 'flat'
      },
    },
    paymentMethods: {
       maxInstallments: 6,
    }
  };


  return (
    <>
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
                <p className="text-center text-sm">{error}</p>
              </div>
            )}

            {paymentResult?.status === 'approved' && (
                 <div className="flex flex-col items-center justify-center p-8 bg-green-100 text-green-800 border border-green-200 rounded-lg">
                    <CheckCircle className="h-10 w-10 mb-4 text-green-600" />
                    <h3 className="font-semibold mb-2">Pagamento Aprovado!</h3>
                    <p className="text-center text-sm">{paymentResult.message}</p>
                </div>
            )}
            
            {!isLoading && !paymentResult && (
                <CardPayment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={handlePayment}
                    onError={(err) => setError("Ocorreu um erro inesperado no formulário de pagamento.")}
                />
            )}

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
