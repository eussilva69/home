
'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Loader2, ChevronDown, Package, User, MapPin, CreditCard, Box, Weight, Ruler, ArrowUpRight, PlusCircle, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderDetails } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateTrackingCode, updateOrderStatus } from '@/app/actions';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrderStatusTimeline from '@/components/shared/order-status-timeline';

const SITE_URL = 'https://homedecorinteriores.com';

interface OrderDocument extends Omit<OrderDetails, 'createdAt' | 'shippedAt'> {
  id: string;
  createdAt: string; 
  shippedAt?: string;
  trackingCode?: string;
}

// Helper to safely convert Firestore Timestamps to ISO strings
const convertTimestamps = (data: any): any => {
    if (!data) return data;
    const convertedData = { ...data };
    for (const key in convertedData) {
        if (Object.prototype.hasOwnProperty.call(convertedData, key) && convertedData[key] instanceof Timestamp) {
            convertedData[key] = convertedData[key].toDate().toISOString();
        }
    }
    return convertedData;
};


const OrderDetailRow = ({ order, colSpan }: { order: OrderDocument; colSpan: number }) => {
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSaveTrackingCode = async () => {
        if (!order || !trackingCode) return;
        setIsSaving(true);
        const result = await updateTrackingCode(order.id, trackingCode);
        if (result.success) {
            toast({ title: 'Sucesso', description: 'Código de rastreio salvo e status atualizado.' });
            
            await fetch(`${SITE_URL}/api/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destinatario: order.customer.email, type: 'orderShipped' }),
            });

        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsSaving(true);
        const result = await updateOrderStatus(order.id, newStatus);
         if (result.success) {
            toast({ title: 'Sucesso!', description: 'Status do pedido atualizado.' });
            
            let emailType = '';
            if (newStatus === 'A caminho') emailType = 'orderShipped';
            else if (newStatus === 'Entregue') emailType = 'orderDelivered';
            else if (newStatus === 'Cancelado') emailType = 'orderCancelled';

            if (emailType) {
                 await fetch(`${SITE_URL}/api/send-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ destinatario: order.customer.email, type: emailType }),
                });
            }

        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
        setIsSaving(false);
    }

    const handleGenerateShippingLabel = () => {
        const url = 'https://app.melhorenvio.com.br/calculadora';
        window.open(url, '_blank');
    };
    
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="p-0">
                <div className="bg-muted/50 p-6 space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <OrderStatusTimeline status={order.status} trackingCode={order.trackingCode} shippingDetails={order.shipping.details} />
                      </CardContent>
                    </Card>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5"/> Itens do Pedido</CardTitle></CardHeader>
                                <CardContent>
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 py-2 border-b last:border-none">
                                        <div className="relative w-16 h-16">
                                            <Image 
                                               src={item.customImages && item.customImages.length > 0 ? item.customImages[0] : item.image} 
                                               alt={item.name} 
                                               width={64} height={64} 
                                               className="rounded-md bg-white object-cover"
                                            />
                                            {item.customImages && item.customImages.length > 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a href={item.customImages[0]} download target="_blank" rel="noopener noreferrer" className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/80">
                                                                <Download className="h-3 w-3" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Baixar Imagem</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.options}</p>
                                            {item.customImages && item.customImages.length > 1 && (
                                                <div className="flex gap-2 mt-2">
                                                    {item.customImages.slice(1).map((imgUrl, index) => (
                                                         <TooltipProvider key={index}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <a href={imgUrl} download target="_blank" rel="noopener noreferrer" className="relative w-8 h-8">
                                                                         <Image src={imgUrl} alt={`Imagem extra ${index+1}`} width={32} height={32} className="rounded-md object-cover"/>
                                                                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                            <Download className="h-4 w-4 text-white"/>
                                                                         </div>
                                                                    </a>
                                                                </TooltipTrigger>
                                                                <TooltipContent><p>Baixar Imagem {index + 2}</p></TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))}
                                                </div>
                                            )}
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
                             <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Box className="h-5 w-5"/> Pacote e Rastreio</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><Weight className="w-4 h-4"/> Peso Total</h4>
                                        <p>{(order.shipping.weight * 1000)} g</p>
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
                        <div className="space-y-6">
                             <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5"/> Pagamento e Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.payment.subtotal.toFixed(2).replace('.',',')}</span></div>
                                        <div className="flex justify-between"><span>Frete ({order.shipping.details.name})</span><span>R$ {order.payment.shippingCost.toFixed(2).replace('.',',')}</span></div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>R$ {order.payment.total.toFixed(2).replace('.',',')}</span></div>
                                        <div className="text-sm text-muted-foreground">Método: {order.payment.method}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Alterar Status</h4>
                                        <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={isSaving}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pendente">Pendente</SelectItem>
                                                <SelectItem value="Aprovado">Aprovado</SelectItem>
                                                <SelectItem value="Em separação">Em separação</SelectItem>
                                                <SelectItem value="A caminho">A caminho</SelectItem>
                                                <SelectItem value="Entregue">Entregue</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                                <SelectItem value="Devolução Solicitada">Devolução Solicitada</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
            const plainData = convertTimestamps(doc.data());
            return {
                id: doc.id,
                ...plainData,
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
  
  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    switch (status) {
        case 'Entregue': return 'default';
        case 'A caminho': return 'secondary';
        case 'Cancelado': 
        case 'Devolução Solicitada':
            return 'destructive';
        case 'Aprovado': return 'warning';
        case 'Em separação': 
        case 'Pendente':
            return 'outline';
        default: return 'outline';
    }
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
    { href: '/dashboard', label: 'Início', icon: 'Home' as const },
    { href: '/dashboard/orders', label: 'Pedidos', icon: 'Package' as const },
    { href: '/dashboard/products', label: 'Produtos', icon: 'Box' as const },
    { href: '/dashboard/customers', label: 'Clientes', icon: 'Users' as const },
    { href: '/dashboard/financial', label: 'Financeiro', icon: 'DollarSign' as const },
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
                                <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{`${order.customer.firstName} ${order.customer.lastName}`}</div>
                                    <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                                </TableCell>
                                <TableCell className="text-right">R$ {order.payment.total.toFixed(2).replace('.', ',')}</TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeVariant(order.status)}>
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
