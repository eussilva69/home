
'use client';

import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderDetails } from '@/lib/schemas';

interface OrderDocument extends OrderDetails {
  id: string;
  createdAt: Timestamp;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === 'vvatassi@gmail.com';

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as OrderDocument));
          setOrders(fetchedOrders);
          setLoading(false);
        });

        return () => unsubscribe();
      }
    }
  }, [user, authLoading, isAdmin, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const adminLinks = [
    { href: '/dashboard', label: 'Início', icon: 'Home' },
    { href: '/dashboard/orders', label: 'Pedidos', icon: 'Package' },
    { href: '#', label: 'Produtos', icon: 'Box' },
    { href: '#', label: 'Clientes', icon: 'Users' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={adminLinks} isAdmin={isAdmin} />
          <main className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhum pedido encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(order => (
                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Link href={`/dashboard/orders/${order.id}`} className="block w-full h-full">
                                {order.createdAt?.toDate().toLocaleDateString('pt-BR')}
                            </Link>
                          </TableCell>
                          <TableCell>
                             <Link href={`/dashboard/orders/${order.id}`} className="block w-full h-full">
                                <div className="font-medium">{`${order.customer.firstName} ${order.customer.lastName}`}</div>
                                <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                             </Link>
                          </TableCell>
                           <TableCell>
                            <Link href={`/dashboard/orders/${order.id}`} className="block w-full h-full">
                                <div className="text-sm truncate max-w-xs">{order.shipping.address}</div>
                                <div className="text-xs text-muted-foreground">{`${order.shipping.city}, ${order.shipping.state} - ${order.shipping.cep}`}</div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">
                             <Link href={`/dashboard/orders/${order.id}`} className="block w-full h-full">
                                R$ {order.payment.total.toFixed(2).replace('.', ',')}
                             </Link>
                          </TableCell>
                          <TableCell>
                             <Link href={`/dashboard/orders/${order.id}`} className="block w-full h-full">
                                <Badge variant={order.status === 'Aprovado' ? 'default' : 'secondary'}>
                                {order.status}
                                </Badge>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
