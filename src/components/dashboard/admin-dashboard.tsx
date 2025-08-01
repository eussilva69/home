
'use client';

import { User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Users, Wand2, BarChart } from 'lucide-react';

type AdminDashboardProps = {
  user: User;
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline">Painel do Administrador</h1>
        <p className="text-muted-foreground">Bem-vindo, {user.email}. Gerencie a loja aqui.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
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
            <Link href="/admin/tools">
                <Button variant="link" className="p-0 h-auto">Acessar ferramentas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

       <div>
        <h2 className="text-2xl font-headline mb-4">Ações Rápidas</h2>
         <div className="flex flex-wrap gap-4">
            <Button>Adicionar Novo Produto</Button>
            <Button variant="outline">Ver todos os pedidos</Button>
            <Button variant="outline">Gerenciar Categorias</Button>
         </div>
      </div>
    </div>
  );
}
