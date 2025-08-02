
'use client';

import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Users, DollarSign, Loader2 } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

type AdminDashboardProps = {
  user: User;
};

type Stats = {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersQuery = query(collection(firestore, 'orders'));
    const usersQuery = query(collection(firestore, 'users'));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        let totalSales = 0;
        snapshot.forEach(doc => {
            totalSales += doc.data().payment.total;
        });
        setStats(prev => ({ ...prev, totalSales, totalOrders: snapshot.size } as Stats));
        setLoading(false);
    });

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        setStats(prev => ({ ...prev, totalCustomers: snapshot.size } as Stats));
        setLoading(false);
    });

    return () => {
        unsubscribeOrders();
        unsubscribeUsers();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Administrador</h1>
        <p className="text-muted-foreground">Bem-vindo, {user.email}. Gerencie a loja aqui.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <>
                    <div className="text-2xl font-bold">R$ {stats?.totalSales.toFixed(2).replace('.', ',') || '0,00'}</div>
                    <p className="text-xs text-muted-foreground">Soma de todas as vendas.</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground">Total de pedidos recebidos.</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
                    <p className="text-xs text-muted-foreground">Total de clientes registrados.</p>
                </>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                <p className="text-muted-foreground">Carregando dados...</p>
            ) : (
                <p className="text-muted-foreground">
                    {stats?.totalOrders === 0 ? "Quando os pedidos começarem a chegar, os gráficos e tabelas aparecerão aqui." : "Gráficos e relatórios detalhados aparecerão aqui em breve."}
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
