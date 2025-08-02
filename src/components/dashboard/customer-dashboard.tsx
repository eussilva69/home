
'use client';

import { User } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserData } from '@/app/actions';

type CustomerDashboardProps = {
  user: User;
};

type UserData = {
  name: string;
  email: string;
  cpf: string;
};

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const result = await getUserData(user.uid);
        if (result.success && result.data) {
          setUserData(result.data as UserData);
        } else {
           // Fallback if firestore doc doesn't exist for some reason
           setUserData({
            name: user.displayName || 'Não informado',
            email: user.email || 'Não informado',
            cpf: 'Não informado',
          })
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
        <Card className="shadow-md">
            <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    );
  }

  const displayName = userData?.name || '';
  const firstName = displayName.split(' ')[0];
  const lastName = displayName.split(' ').slice(1).join(' ');

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-6">Dados pessoais</h1>
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base">{firstName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sobrenome</p>
              <p className="text-base">{lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{userData?.email || 'Não informado'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPF</p>
                <p className="text-base">{userData?.cpf || 'Não informado'}</p>
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
