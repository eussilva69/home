
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore';
import type { OrderDetails } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface OrderDocument extends Omit<OrderDetails, 'createdAt' | 'shippedAt'> {
  id: string;
  createdAt: string; 
  trackingCode?: string;
  shippedAt?: string;
}

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const { toast } = useToast();

  const checkAndUpdateOrderStatus = useCallback(async (ordersToCheck: OrderDocument[]) => {
    const batch = writeBatch(firestore);
    let hasUpdates = false;

    ordersToCheck.forEach(order => {
        if (order.status === 'A caminho' && order.shippedAt && order.shipping.details.delivery_time) {
            const shippedDate = new Date(order.shippedAt);
            const deliveryTime = order.shipping.details.delivery_time;
            const estimatedDeliveryDate = new Date(shippedDate);
            estimatedDeliveryDate.setDate(shippedDate.getDate() + deliveryTime);
            
            if (new Date() > estimatedDeliveryDate) {
                const orderRef = doc(firestore, 'orders', order.id);
                batch.update(orderRef, { status: 'Entregue' });
                hasUpdates = true;
            }
        }
    });

    if (hasUpdates) {
        try {
            await batch.commit();
            toast({ title: 'Status de Pedidos Atualizado', description: 'Alguns pedidos foram marcados como "Entregue" automaticamente.' });
            // Re-fetch orders after update
            const fetchAgain = async () => {
                 if (user?.email) {
                    const q = query(collection(firestore, 'orders'), where("customer.email", "==", user.email));
                    const querySnapshot = await getDocs(q);
                    let fetchedOrders = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        const createdAtTimestamp = data.createdAt as Timestamp;
                        const shippedAtTimestamp = data.shippedAt as Timestamp | undefined;
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: createdAtTimestamp.toDate().toISOString(),
                            shippedAt: shippedAtTimestamp?.toDate().toISOString(),
                        } as OrderDocument;
                    });
                    fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setOrders(fetchedOrders);
                }
            };
            fetchAgain();
        } catch (error) {
            console.error("Erro ao atualizar status em lote:", error);
        }
    }
  }, [user, toast]);


  useEffect(() => {
      const fetchOrders = async () => {
          if (user?.email) {
            setIsLoadingOrders(true);
            try {
                const q = query(collection(firestore, 'orders'), where("customer.email", "==", user.email));
                const querySnapshot = await getDocs(q);
                let fetchedOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAtTimestamp = data.createdAt as Timestamp;
                    const shippedAtTimestamp = data.shippedAt as Timestamp | undefined;
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: createdAtTimestamp.toDate().toISOString(),
                        shippedAt: shippedAtTimestamp?.toDate().toISOString(),
                    } as OrderDocument
                });
                
                fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(fetchedOrders);
                // Check statuses after fetching
                checkAndUpdateOrderStatus(fetchedOrders);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setIsLoadingOrders(false);
            }
          } else if (!loading) {
             setIsLoadingOrders(false);
          }
      }
      if (!loading && user) {
        fetchOrders();
      }
  }, [user, loading, checkAndUpdateOrderStatus]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


    const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
        switch (status) {
            case 'Entregue':
                return 'default';
            case 'A caminho':
                return 'secondary';
            case 'Cancelado':
                return 'destructive';
            case 'Aprovado':
                 return 'warning';
            case 'Em separação':
                return 'outline';
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

    