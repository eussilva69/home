
'use client';

import { User } from 'firebase/auth';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Package, Users, Wand2, DollarSign, ArrowUpRight } from 'lucide-react';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const salesData = [
  { month: 'Jan', sales: 12345 },
  { month: 'Fev', sales: 15678 },
  { month: 'Mar', sales: 18901 },
  { month: 'Abr', sales: 22345 },
  { month: 'Mai', sales: 25678 },
  { month: 'Jun', sales: 28901 },
];

const recentOrders = [
  { id: 'ORD001', customer: 'Alice Silva', date: '2024-07-22', total: 'R$ 259,90', status: 'Processando' },
  { id: 'ORD002', customer: 'Bruno Costa', date: '2024-07-21', total: 'R$ 149,50', status: 'Enviado' },
  { id: 'ORD003', customer: 'Carla Dias', date: '2024-07-21', total: 'R$ 499,00', status: 'Entregue' },
  { id: 'ORD004', customer: 'Diego Lima', date: '2024-07-20', total: 'R$ 89,90', status: 'Entregue' },
];

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
};

type AdminDashboardProps = {
  user: User;
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Administrador</h1>
        <p className="text-muted-foreground">Bem-vindo, {user.email}. Gerencie a loja aqui.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">+20.1% do último mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Novos pedidos para processar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">+5% esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ferramentas de IA</CardTitle>
            <Wand2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Otimize seu fluxo de trabalho.</p>
            <Link href="/admin/tools" passHref>
              <Button variant="outline" size="sm" className="mt-2">
                Acessar <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Desempenho de Vendas</CardTitle>
            <p className="text-sm text-muted-foreground">Vendas mensais dos últimos 6 meses.</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={salesData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `R$${value / 1000}k`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-xs text-muted-foreground">{order.date}</div>
                    </TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Processando' ? 'destructive' : order.status === 'Enviado' ? 'secondary' : 'default'} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
