
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, PlusCircle, MapPin } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addOrUpdateAddress, getUserAddresses, deleteAddress, setDefaultAddress } from '@/app/actions';
import type { Address } from '@/lib/schemas';
import AddressCard from '@/components/dashboard/addresses/address-card';
import AddressFormDialog from '@/components/dashboard/addresses/address-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);


  const fetchAddresses = useCallback(async () => {
    if (user) {
      setIsLoadingAddresses(true);
      const userAddresses = await getUserAddresses(user.uid);
      // Sort to show default address first
      userAddresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      setAddresses(userAddresses);
      setIsLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else {
      fetchAddresses();
    }
  }, [user, loading, router, fetchAddresses]);

  const handleOpenForm = (address: Address | null = null) => {
    setAddressToEdit(address);
    setIsFormOpen(true);
  };

  const handleSaveAddress = async (address: Address) => {
    if (!user) return;
    const result = await addOrUpdateAddress(user.uid, address);
    if (result.success) {
      toast({ title: "Sucesso!", description: "Endereço salvo com sucesso." });
      await fetchAddresses();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleConfirmDelete = (addressId: string) => {
    setAddressToDelete(addressId);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteAddress = async () => {
    if (!user || !addressToDelete) return;
    const result = await deleteAddress(user.uid, addressToDelete);
    if (result.success) {
      toast({ title: "Sucesso!", description: "Endereço excluído." });
      await fetchAddresses();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
    setAddressToDelete(null);
  }

  const handleSetDefault = async (addressId: string) => {
     if (!user) return;
     const result = await setDefaultAddress(user.uid, addressId);
     if (result.success) {
        toast({ title: "Sucesso!", description: "Endereço padrão atualizado." });
        await fetchAddresses();
     } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
     }
  }


  if (loading || !user) {
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
  
  const customerLinks = [
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={customerLinks} isAdmin={false} />
          <main className="flex-1">
             <h1 className="text-2xl font-semibold mb-6">Meus Endereços</h1>
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Endereços Salvos</CardTitle>
                  <Button variant="outline" onClick={() => handleOpenForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Novo
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingAddresses ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map(addr => (
                        <AddressCard 
                          key={addr.id} 
                          address={addr} 
                          onEdit={handleOpenForm}
                          onDelete={handleConfirmDelete}
                          onSetDefault={handleSetDefault}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>Você ainda não tem nenhum endereço cadastrado.</p>
                      <Button variant="link" onClick={() => handleOpenForm()}>Cadastre seu primeiro endereço</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
          </main>
        </div>
      </div>
      <AddressFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSave={handleSaveAddress}
        addressToEdit={addressToEdit}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente o endereço selecionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
