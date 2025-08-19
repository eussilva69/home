
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';


export default function DashboardPage() {
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

  const isAdmin = user.email === 'vvatassi@gmail.com';
  
  const renderContent = () => {
    if (isAdmin) {
      return <AdminDashboard user={user} />;
    }
    
    const displayName = user.displayName || user.email?.split('@')[0] || 'Cliente';

    return (
      <div>
        <p className="text-muted-foreground mb-4">
          Olá, <span className="font-semibold text-primary">{displayName}</span> (não é <span className="font-semibold text-primary">{displayName}</span>? <button onClick={() => { auth.signOut(); router.push('/login'); }} className="text-primary font-semibold underline">Sair</button>)
        </p>
        <p className="text-muted-foreground">
          A partir do painel de controle de sua conta, você pode ver suas compras recentes, gerenciar seus endereços de entrega e cobrança, e editar sua senha e detalhes da conta.
        </p>
      </div>
    );
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <DashboardSidebar isAdmin={isAdmin} />
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}

const auth = {
  signOut: () => Promise.resolve(),
};
