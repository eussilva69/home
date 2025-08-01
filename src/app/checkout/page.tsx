
'use client';

import { useCart } from '@/hooks/use-cart';
import { useClientOnly } from '@/hooks/use-client-only';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MercadoPagoCheckout from '@/components/checkout/mercado-pago-checkout';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const isClient = useClientOnly();
  const router = useRouter();

  useEffect(() => {
    if (isClient && cartItems.length === 0) {
      router.replace('/cart');
    }
  }, [isClient, cartItems, router]);
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isClient || cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex justify-center items-start">
        <MercadoPagoCheckout totalAmount={subtotal} />
      </main>
      <Footer />
    </div>
  );
}
