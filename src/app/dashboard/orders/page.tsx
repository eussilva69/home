
'use client';

import { useEffect, useState, Fragment } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Loader2, ChevronDown, Package, User, MapPin, CreditCard, Box, Weight, Ruler, ArrowUpRight, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderDetails } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateTrackingCode } from '@/app/actions';
import Link from 'next/link';

interface OrderDocument extends Omit<OrderDetails, 'createdAt'> {
  id: string;
  createdAt: string; // Changed from Timestamp to string
  trackingCode?: string;
}

const OrderDetailRow = ({ order, colSpan }: { order: OrderDocument; colSpan: number }) => {
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSaveTrackingCode = async () => {
        if (!order) return;
        setIsSaving(true);
        const result = await updateTrackingCode(order.id, trackingCode);
        if (result.success) {
            toast({ title: 'Sucesso', description: 'Código de rastreio salvo.' });
            // The parent component will receive the update via snapshot listener
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const handleGenerateShippingLabel = () => {
        const fromPostalCode = "38401104"; // CEP de origem fixo
        const toPostalCode = order.shipping.cep.replace(/\D/g, '');

        let url = `https://app.melhorenvio.com.br/calculator?from[postal_code]=${fromPostalCode}&to[postal_code]=${toPostalCode}`;
        
        url += `&package[weight]=${order.shipping.weight}&package[width]=${order.shipping.width}&package[height]=${order.shipping.height}&package[length]=${order.shipping.length}&package[insurance_value]=${order.payment.subtotal}`;
        
        window.open(url, '_blank');
    };
    
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="p-0">
                <div className="bg-muted/50 p-6 space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5"/> Itens do Pedido</CardTitle></CardHeader>
                                <CardContent>
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-none">
                                        <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md bg-white" />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.options}</p>
                                        </div>
                                        <div className="text-right">
                                            <p>{item.quantity} x R$ {item.price.toFixed(2).replace('.',',')}</p>
                                            <p className="font-semibold">R$ {(item.quantity * item.price).toFixed(2).replace('.',',')}</p>
                                        </div>
                                    </div>
                                ))}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5"/> Cliente e Entrega</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Dados do Cliente</h3>
                                        <p>{order.customer.firstName} {order.customer.lastName}</p>
                                        <p>{order.customer.email}</p>
                                        <p>{order.customer.docType}: {order.customer.docNumber}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                                        <p>{order.shipping.address}</p>
                                        {order.shipping.complement && <p>{order.shipping.complement}</p>}
                                        <p>{order.shipping.city}, {order.shipping.state} - {order.shipping.cep}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5"/> Pagamento</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.payment.subtotal.toFixed(2).replace('.',',')}</span></div>
                                <div className="flex justify-between"><span>Frete ({order.shipping.details.name})</span><span>R$ {order.payment.shippingCost.toFixed(2).replace('.',',')}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>R$ {order.payment.total.toFixed(2).replace('.',',')}</span></div>
                                <div className="text-sm text-muted-foreground">Método: {order.payment.method}</div>
                                <Badge>{order.status}</Badge>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Box className="h-5 w-5"/> Pacote e Rastreio</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><Weight className="w-4 h-4"/> Peso Total</h4>
                                        <p>{order.shipping.weight.toFixed(3)} kg</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><Ruler className="w-4 h-4"/> Dimensões</h4>
                                        <p>{order.shipping.length}cm (C) x {order.shipping.width}cm (L) x {order.shipping.height}cm (A)</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Código de Rastreio</h4>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={trackingCode}
                                                onChange={(e) => setTrackingCode(e.target.value)}
                                                placeholder="Insira o código aqui"
                                            />
                                            <Button onClick={handleSaveTrackingCode} disabled={isSaving}>
                                                {isSaving ? <Loader2 className="animate-spin"/> : 'Salvar'}
                                            </Button>
                                        </div>
                                    </div>
                                     <Button onClick={handleGenerateShippingLabel} variant="outline" className="w-full">
                                        Gerar Frete no Melhor Envio <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const isAdmin = user?.email === 'vvatassi@gmail.com';

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedOrders = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            return {
                id: doc.id,
                ...data,
                createdAt: createdAtTimestamp.toDate().toISOString(),
                trackingCode: data.trackingCode || ''
            } as OrderDocument
          });
          setOrders(fetchedOrders);
          setLoading(false);
        });

        return () => unsubscribe();
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const toggleExpand = (orderId: string) => {
      setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  }

  if (authLoading || loading) {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <Footer />
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Pedidos</CardTitle>
                <Button asChild>
                  <Link href="/dashboard/orders/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Pedido
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
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
                        <Fragment key={order.id}>
                            <TableRow onClick={() => toggleExpand(order.id)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{`${order.customer.firstName} ${order.customer.lastName}`}</div>
                                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                </TableCell>
                                <TableCell className="text-right">R$ {order.payment.total.toFixed(2).replace('.', ',')}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Aprovado' ? 'default' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <ChevronDown className={cn("transition-transform", expandedOrderId === order.id && "rotate-180")} />
                                </TableCell>
                            </TableRow>
                            {expandedOrderId === order.id && <OrderDetailRow order={order} colSpan={5} />}
                        </Fragment>
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
