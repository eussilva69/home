
'use client';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logoutAction } from '@/app/actions';
import { Trash2, LogOut, RefreshCw } from 'lucide-react';

export default function DebugPage() {
  const { clearCart, cartItems } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleClearCart = () => {
    clearCart();
    toast({
      title: 'Carrinho Limpo!',
      description: 'Todos os itens foram removidos do carrinho.',
    });
  };

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      // Recarregar a página para refletir as mudanças (o carrinho também será limpo)
      window.location.reload();
      toast({
        title: 'Armazenamento Limpo!',
        description: 'Todo o localStorage foi limpo. A página será recarregada.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Não foi possível limpar o localStorage.',
      });
    }
  };

  const handleLogout = async () => {
    if (user) {
      await signOut(auth);
      await logoutAction();
      toast({
        title: 'Logout Realizado!',
        description: 'Você foi desconectado.',
      });
      router.push('/');
    } else {
       toast({
        variant: 'destructive',
        title: 'Ninguém Logado',
        description: 'Nenhum usuário está logado para fazer logout.',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Página de Depuração</CardTitle>
            <CardDescription>
              Use estas ações para redefinir o estado do site para testes ou apresentação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleClearCart} 
              className="w-full" 
              variant="outline"
              disabled={cartItems.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Carrinho ({cartItems.length} itens)
            </Button>

            <Button 
              onClick={handleClearLocalStorage} 
              className="w-full" 
              variant="destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar Tudo (LocalStorage)
            </Button>

            <Button 
              onClick={handleLogout} 
              className="w-full"
              variant="secondary"
              disabled={!user}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout ({user ? user.email : 'ninguém logado'})
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
