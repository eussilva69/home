
'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Users, DollarSign, Loader2, Sofa } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

type Stats = {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
};

export default function FinancialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === 'vvatassi@gmail.com';

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        const ordersQuery = query(collection(firestore, 'orders'));
        const usersQuery = query(collection(firestore, 'users'));

        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
            let totalSales = 0;
            snapshot.forEach(doc => {
                totalSales += doc.data().payment.total;
            });
            setStats(prev => ({ ...prev, totalSales, totalOrders: snapshot.size } as Stats));
            if(stats?.totalCustomers) setLoading(false);
        });

        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalCustomers: snapshot.size } as Stats));
             if(stats?.totalOrders) setLoading(false);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
        };
      }
    }
  }, [user, authLoading, isAdmin, router, stats?.totalCustomers, stats?.totalOrders]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <DashboardSidebar isAdmin={isAdmin} />
          <div className="md:col-span-3 space-y-8">
             <h1 className="text-2xl font-semibold">Gestão Financeira</h1>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {stats?.totalSales.toFixed(2).replace('.', ',') || '0,00'}</div>
                    <p className="text-xs text-muted-foreground">Soma de todas as vendas.</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground">Total de pedidos recebidos.</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
                    <p className="text-xs text-muted-foreground">Total de clientes registrados.</p>
                </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Relatórios Futuros</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Esta área será expandida com gráficos de vendas, relatórios de produtos mais vendidos e outras métricas financeiras.
                    </p>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
