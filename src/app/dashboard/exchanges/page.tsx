
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExchangesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
    { href: '/dashboard/personal-data', label: 'Dados pessoais', icon: 'User' as const },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' as const },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' as const },
    { href: '/dashboard/authentication', label: 'Autenticação', icon: 'Heart' as const },
    { href: '/dashboard/exchanges', label: 'Trocas e devoluções', icon: 'ArrowLeftRight' as const },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={customerLinks} isAdmin={false} />
          <main className="flex-1">
             <h1 className="text-2xl font-semibold mb-6">Trocas e Devoluções</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Política de Devolução - Home Designer</CardTitle>
                   <CardDescription>
                    Na Home Designer, prezamos pela sua satisfação e qualidade dos nossos produtos. Por isso, estabelecemos esta Política de Devolução em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm text-muted-foreground prose prose-sm max-w-none">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-base text-foreground">1. Prazo para Devolução ou Troca</h3>
                      <p>
                        Você tem o direito de desistir da compra no prazo de até <strong>7 (sete) dias corridos</strong> a contar do recebimento do produto, conforme previsto no artigo 49 do CDC, no caso de compras realizadas fora do estabelecimento comercial (como compras online).
                      </p>
                    </div>

                    <div className="space-y-2">
                       <h3 className="font-semibold text-base text-foreground">2. Condições para Devolução ou Troca</h3>
                       <ul className="list-disc pl-5 space-y-1">
                          <li>O produto deve ser devolvido em sua embalagem original, sem sinais de uso, com todos os acessórios, manuais e certificados que o acompanham.</li>
                          <li>O produto deve estar em perfeito estado, sem danos, riscos ou avarias.</li>
                          <li>Para produtos personalizados ou feitos sob encomenda, a devolução só será aceita em caso de defeito de fabricação ou erro no pedido.</li>
                       </ul>
                    </div>
                    
                    <div className="space-y-2">
                       <h3 className="font-semibold text-base text-foreground">3. Produtos com Defeito</h3>
                       <p>
                        Caso o produto apresente algum defeito de fabricação, você tem o prazo de <strong>30 (trinta) dias corridos</strong>, a contar da data do recebimento, para solicitar a troca, reparo ou devolução, conforme previsto nos artigos 18 e 26 do CDC.
                       </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-foreground">4. Procedimento para Solicitação de Devolução ou Troca</h3>
                        <p>
                            Para iniciar o processo, entre em contato com nosso atendimento pelo e-mail <strong>homedecorinterioresplanejados@gmail.com</strong> ou telefone <strong>(34) 99722-2303</strong>, informando o número do pedido e o motivo da devolução ou troca.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-foreground">5. Custos de Envio</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Em caso de desistência dentro do prazo de 7 dias, o cliente é responsável pelos custos do envio de devolução, salvo em casos de defeito ou erro da loja.</li>
                            <li>Em casos de defeito de fabricação ou erro no pedido, a Home Designer arcará com os custos de envio para a devolução e reenvio do produto correto.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-foreground">6. Restituição</h3>
                        <p>
                            Após o recebimento e análise do produto devolvido, caso a devolução seja aprovada, o valor pago será restituído ao cliente no prazo de até <strong>10 (dez) dias úteis</strong>, utilizando a mesma forma de pagamento da compra.
                        </p>
                    </div>

                     <div className="space-y-2">
                        <h3 className="font-semibold text-base text-foreground">7. Produtos Personalizados</h3>
                        <p>
                           Produtos personalizados ou feitos sob encomenda não poderão ser devolvidos ou trocados por desistência, exceto em casos de defeito de fabricação ou erro da loja.
                        </p>
                    </div>
                </CardContent>
              </Card>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
