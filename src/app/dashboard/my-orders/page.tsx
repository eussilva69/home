
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { OrderDetails } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrderDocument extends Omit<OrderDetails, 'createdAt'> {
  id: string;
  createdAt: string; // Changed from Timestamp to string to avoid serialization error
  trackingCode?: string;
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
                let fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAtTimestamp = data.createdAt as Timestamp;
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: createdAtTimestamp.toDate().toISOString(), // Convert Timestamp to ISO string
                    } as OrderDocument
                });
                
                // Sort orders by date client-side
                fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
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
  }, [user]);

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Entregue':
                return 'default'; // Greenish
            case 'A caminho':
                return 'secondary'; // Blueish
            case 'Cancelado':
                return 'destructive'; // Reddish
            case 'Aprovado':
                return 'outline'; // Default
            default:
                return 'secondary';
        }
    }


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
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' as const },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' as const },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' as const },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' as const },
    { href: '/dashboard/exchanges', label: 'Trocas e devoluções', icon: 'ArrowLeftRight' as const },
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
                                <TableHead>Pedido</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/my-orders/${order.id}`)}>
                                            <TableCell className="font-medium">#{order.id.slice(0, 7)}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR') ?? 'Data indisponível'}</TableCell>
                                            <TableCell>
                                                <Badge variant={getBadgeVariant(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">R$ {order.payment.total.toFixed(2).replace('.', ',')}</TableCell>
                                            <TableCell>
                                                <ChevronRight className="h-4 w-4" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
