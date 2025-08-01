
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createPaymentPreference } from '@/app/actions';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

// Chave pública do Mercado Pago
const MERCADO_PAGO_PUBLIC_KEY = "TEST-df7a6d8f-8512-4202-acb2-a54cd6d22d59";

type MercadoPagoCheckoutProps = {
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    picture_url: string;
  }[];
};

export default function MercadoPagoCheckout({ items }: MercadoPagoCheckoutProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isBrickRendered, setIsBrickRendered] = useState(false);

  useEffect(() => {
    async function getPreference() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await createPaymentPreference(items);
        if (result.error) {
          throw new Error(result.error);
        }
        if (result.preferenceId) {
          setPreferenceId(result.preferenceId);
        } else {
            throw new Error('ID de preferência não foi retornado.');
        }
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao preparar o pagamento. Tente novamente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    getPreference();
  }, [items]);

  useEffect(() => {
    if (isScriptReady && preferenceId && !isBrickRendered) {
      const renderPaymentBrick = async () => {
        // @ts-ignore
        const mp = new window.MercadoPago(MERCADO_PAGO_PUBLIC_KEY);
        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            amount: items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0) + 15, // Total + Frete
            preferenceId: preferenceId,
          },
          customization: {
            visual: {
              style: {
                theme: 'default', // 'default', 'dark', 'bootstrap'
              },
            },
          },
          callbacks: {
            onReady: () => {
                setIsLoading(false);
            },
            onSubmit: (cardFormData: any) => {
              // Este callback é chamado quando o usuário clica em "Pagar"
              // O envio dos dados é feito automaticamente pelo Brick
              return new Promise<void>((resolve, reject) => {
                // Você pode adicionar aqui lógicas antes do envio, como salvar o pedido no seu banco.
                console.log('Dados do formulário do cartão:', cardFormData);
                resolve();
              });
            },
            onError: (error: any) => {
              console.error('Erro no Brick de pagamento:', error);
              setError('Ocorreu um erro ao processar seu pagamento. Verifique os dados e tente novamente.');
            },
          },
        };
        
        try {
            await bricksBuilder.create('payment', 'payment-brick-container', settings);
            setIsBrickRendered(true);
        } catch(e) {
            console.error("Erro ao renderizar o Brick", e);
            setError("Não foi possível carregar a área de pagamento. Tente recarregar a página.");
        }
      };
      setIsLoading(true);
      renderPaymentBrick();
    }
  }, [isScriptReady, preferenceId, isBrickRendered, items]);


  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={() => setIsScriptReady(true)}
      />
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
              <div className="flex flex-col items-center justify-center p-12 bg-secondary/50 rounded-lg">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Preparando seu checkout seguro...</p>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <h3 className="font-semibold mb-2">Oops! Algo deu errado.</h3>
                <p className="text-center text-sm">{error}</p>
              </div>
            )}

            <div 
              id="payment-brick-container"
              className={isLoading || error ? 'hidden' : ''} 
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
