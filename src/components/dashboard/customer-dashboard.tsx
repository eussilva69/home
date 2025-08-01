
'use client';

import { User } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MapPin, User as UserIcon } from 'lucide-react';

type CustomerDashboardProps = {
  user: User;
};

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline">Bem-vinda, {user.displayName || user.email}!</h1>
        <p className="text-muted-foreground">Aqui você pode gerenciar seus pedidos, dados e endereços.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meus Pedidos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Pedidos</div>
            <p className="text-xs text-muted-foreground">
              Você não tem pedidos recentes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meus Dados</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm truncate">{user.email}</p>
             <Button variant="link" className="p-0 h-auto">Editar dados</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Endereços</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-sm">Você tem 1 endereço cadastrado.</p>
             <Button variant="link" className="p-0 h-auto">Gerenciar endereços</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-headline mb-4">Histórico de Pedidos</h2>
         <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                <p>Seu histórico de pedidos aparecerá aqui.</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
