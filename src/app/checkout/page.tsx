
import { Suspense } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';
import CheckoutClientPage from '@/components/checkout/checkout-client-page';

function CheckoutLoading() {
    return (
        <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-28">
            <Suspense fallback={<CheckoutLoading />}>
                <CheckoutClientPage />
            </Suspense>
        </main>
        <Footer />
    </div>
  );
}
