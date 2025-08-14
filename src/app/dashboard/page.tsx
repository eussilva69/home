
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // Simple role check based on email
  const isAdmin = user.email === 'vvatassi@gmail.com';
  
  const adminLinks = [
      { href: '/dashboard', label: 'Início', icon: 'Home' as const },
      { href: '/dashboard/orders', label: 'Pedidos', icon: 'Package' as const },
      { href: '/dashboard/products', label: 'Quadros', icon: 'Box' as const },
      { href: '/dashboard/furnitures', label: 'Mobílias', icon: 'Sofa' as const },
      { href: '/dashboard/customers', label: 'Clientes', icon: 'Users' as const },
      { href: '/dashboard/financial', label: 'Financeiro', icon: 'DollarSign' as const },
    ];

  const customerLinks = [
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' as const },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' as const },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' as const },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' as const },
  ];

  const isRootDashboard = pathname === '/dashboard';

  const renderContent = () => {
    if (isAdmin) {
      if (isRootDashboard) {
        return <AdminDashboard user={user} />;
      }
      // Outras páginas do admin podem ser renderizadas aqui com base no pathname
      return null; 
    } else {
      // Se não for admin e estiver na raiz do dashboard
      if (isRootDashboard) {
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-6">Minha Conta</h1>
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo(a)!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use o menu ao lado para navegar pelas seções da sua conta.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }
       // Renderiza outras páginas do cliente aqui, se necessário
      return null;
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={isAdmin ? adminLinks : customerLinks} isAdmin={isAdmin} />
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
