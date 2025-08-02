
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
  
  const customerLinks = [
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' },
    { href: '/dashboard/exchanges', label: 'Trocas e devoluções', icon: 'ArrowLeftRight' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={customerLinks} isAdmin={false} />
          <main className="flex-1">
             <h1 className="text-2xl font-semibold mb-6">Meus Endereços</h1>
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Endereços Salvos</CardTitle>
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Novo
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Você ainda não tem nenhum endereço cadastrado.
                  </p>
                </CardContent>
              </Card>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
