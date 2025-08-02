
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { OrderDetails } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';

interface OrderDocument extends OrderDetails {
  id: string;
  createdAt: Timestamp;
}

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      const fetchOrders = async () => {
          if (user?.email) {
            setIsLoadingOrders(true);
            try {
                const q = query(
                    collection(firestore, 'orders'), 
                    where("customer.email", "==", user.email)
                );
                const querySnapshot = await getDocs(q);
                const fetchedOrders = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as OrderDocument));

                // Sort client-side to avoid composite index requirement
                fetchedOrders.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return b.createdAt.toMillis() - a.createdAt.toMillis();
                    }
                    return 0;
                });

                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setIsLoadingOrders(false);
            }
          } else if (!loading) {
             setIsLoadingOrders(false);
          }
      }
      fetchOrders();
  }, [user, loading]);

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
            <h1 className="text-2xl font-semibold mb-6">Meus Pedidos</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingOrders ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.createdAt?.toDate().toLocaleDateString('pt-BR') ?? 'Data indisponível'}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === 'Aprovado' ? 'default' : 'secondary'}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">R$ {order.payment.total.toFixed(2).replace('.', ',')}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            Você ainda não fez nenhum pedido.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
