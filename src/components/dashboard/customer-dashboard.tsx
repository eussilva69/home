
'use client';

import { User } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';


type CustomerDashboardProps = {
  user: User;
};

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-6">Dados pessoais</h1>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base">{user.displayName?.split(' ')[0] || ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sobrenome</p>
              <p className="text-base">{user.displayName?.split(' ').slice(1).join(' ') || ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p className="text-base">Não informado</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Gênero</p>
                <p className="text-base">Não informado</p>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de nascimento</p>
                <p className="text-base">Não informado</p>
              </div>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="text-base">Não informado</p>
              </div>
            </div>
          </div>
           <div className="flex justify-end">
              <Button variant="outline">
                <Edit className="mr-2" /> Editar
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
