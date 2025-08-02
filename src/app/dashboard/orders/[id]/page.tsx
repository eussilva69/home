
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getOrderById, updateTrackingCode } from '@/app/actions';
import type { OrderDetails } from '@/lib/schemas';
import { Timestamp } from 'firebase/firestore';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Loader2, Package, User, MapPin, CreditCard, Box, Weight, Ruler } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface OrderDocument extends OrderDetails {
  id: string;
  createdAt: Timestamp;
  trackingCode?: string;
}

export default function OrderDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingCode, setTrackingCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.email === 'vvatassi@gmail.com';

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else if (orderId) {
        getOrderById(orderId)
          .then(result => {
            if (result.success && result.data) {
              const fetchedOrder = result.data as OrderDocument;
              setOrder(fetchedOrder);
              setTrackingCode(fetchedOrder.trackingCode || '');
            } else {
              console.error(result.message);
            }
          })
          .finally(() => setLoading(false));
      }
    }
  }, [user, authLoading, isAdmin, router, orderId]);

  const handleSaveTrackingCode = async () => {
    if (!order) return;
    setIsSaving(true);
    const result = await updateTrackingCode(order.id, trackingCode);
    if (result.success) {
      toast({ title: 'Sucesso', description: 'Código de rastreio salvo.' });
      setOrder(prev => prev ? { ...prev, trackingCode } : null);
    } else {
      toast({ title: 'Erro', description: result.message, variant: 'destructive' });
    }
    setIsSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Pedido não encontrado.</p>
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
          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Detalhes do Pedido #{order.id.slice(0, 7)}</h1>
              <p className="text-muted-foreground">
                Feito em {order.createdAt.toDate().toLocaleDateString('pt-BR')} às {order.createdAt.toDate().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Package/> Itens do Pedido</CardTitle></CardHeader>
                        <CardContent>
                           {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-none">
                                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" />
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
                        <CardHeader><CardTitle className="flex items-center gap-2"><User/> Cliente e Entrega</CardTitle></CardHeader>
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
                                <p>{order.shipping.complement}</p>
                                <p>{order.shipping.city}, {order.shipping.state} - {order.shipping.cep}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Pagamento</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                           <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.payment.subtotal.toFixed(2).replace('.',',')}</span></div>
                           <div className="flex justify-between"><span>Frete ({order.shipping.details.name})</span><span>R$ {order.payment.shippingCost.toFixed(2).replace('.',',')}</span></div>
                           <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>R$ {order.payment.total.toFixed(2).replace('.',',')}</span></div>
                           <div className="text-sm text-muted-foreground">Método: {order.payment.method}</div>
                           <Badge>{order.status}</Badge>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Box /> Pacote e Rastreio</CardTitle></CardHeader>
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
                        </CardContent>
                    </Card>
                </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
