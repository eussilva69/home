
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getOrderById, requestRefund } from '@/app/actions';
import type { OrderDetails } from '@/lib/schemas';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Loader2, Package, User, Undo2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import OrderStatusTimeline from '@/components/shared/order-status-timeline';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import RefundRequestDialog from '@/components/dashboard/orders/refund-request-dialog';


interface OrderDocument extends Omit<OrderDetails, 'createdAt' | 'shippedAt'> {
  id: string;
  createdAt: string; 
  shippedAt?: string;
  trackingCode?: string;
}

export default function OrderDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  
  const customerLinks = [
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' as const },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' as const },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' as const },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' as const },
  ];

  const fetchOrder = useCallback(async () => {
    if (orderId && user) {
        try {
            setLoading(true);
            const result = await getOrderById(orderId);
            if (result.success && result.data) {
                const orderData = result.data as any; 
                if (orderData.customer.email !== user.email) {
                    setError('Você não tem permissão para ver este pedido.');
                    setLoading(false);
                    return;
                }
                setOrder(orderData);

            } else {
                setError(result.message || 'Pedido não encontrado.');
            }
        } catch (err) {
            setError('Falha ao carregar os dados do pedido.');
        } finally {
            setLoading(false);
        }
    }
  }, [orderId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [orderId, user, authLoading, router, fetchOrder]);
  
  const handleRefundSuccess = () => {
      fetchOrder(); // Re-fetch order data para mostrar o novo status
  }
  
  const canRequestRefund = order && ['Aprovado', 'Em separação', 'A caminho', 'Entregue'].includes(order.status);


  if (loading || authLoading) {
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

  return (
    <>
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={customerLinks} isAdmin={false} />
          <main className="flex-1">
            {error ? (
              <Card>
                <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
              </Card>
            ) : order ? (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl">Detalhes do Pedido</CardTitle>
                            <CardDescription>Pedido #{order.id.slice(0, 8)}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                              <Link href="/dashboard/my-orders">Voltar para Meus Pedidos</Link>
                          </Button>
                          {canRequestRefund && (
                              <Button variant="destructive" onClick={() => setIsRefundDialogOpen(true)}>
                                  <Undo2 className="mr-2 h-4 w-4" />
                                  Solicitar Devolução
                              </Button>
                          )}
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <OrderStatusTimeline status={order.status} trackingCode={order.trackingCode} shippingDetails={order.shipping.details}/>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5"/> Itens Enviados</CardTitle></CardHeader>
                            <CardContent>
                               {order.items.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 py-3 border-b last:border-none">
                                        <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md bg-white object-cover" />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.options}</p>
                                            <p className="text-sm mt-1">{item.quantity} x R$ {item.price.toFixed(2).replace('.',',')}</p>
                                        </div>
                                        <div className="text-right font-semibold">
                                            <p>R$ {(item.quantity * item.price).toFixed(2).replace('.',',')}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                         <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5"/> Resumo</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-1">Enviado Para</h3>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{order.customer.firstName} {order.customer.lastName}</p>
                                        <p>{order.shipping.address}</p>
                                        {order.shipping.complement && <p>{order.shipping.complement}</p>}
                                        <p>{order.shipping.city}, {order.shipping.state} - {order.shipping.cep}</p>
                                    </div>
                                </div>
                                <Separator/>
                                <div>
                                    <h3 className="font-semibold mb-2">Pagamento</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between"><span>Subtotal:</span><span>R$ {order.payment.subtotal.toFixed(2).replace('.',',')}</span></div>
                                        <div className="flex justify-between"><span>Frete:</span><span>R$ {order.payment.shippingCost.toFixed(2).replace('.',',')}</span></div>
                                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span><span>R$ {order.payment.total.toFixed(2).replace('.',',')}</span></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                               <p className="text-sm text-muted-foreground mb-4">Deu tudo certo? Se precisar, a gente está aqui para ajudar.</p>
                               <Button>Comprar Novamente</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

              </div>
            ) : (
              <p>Carregando pedido...</p>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
     {order && user && (
        <RefundRequestDialog
            isOpen={isRefundDialogOpen}
            onOpenChange={setIsRefundDialogOpen}
            orderId={order.id}
            customerEmail={user.email || ''}
            customerName={order.customer.firstName}
            onSuccess={handleRefundSuccess}
        />
     )}
    </>
  );
}
