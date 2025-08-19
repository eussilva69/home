
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, AlertCircle, ShoppingCart } from 'lucide-react';

export default function HowToBuyPage() {
  const steps = [
    "Gostou de um quadro? Clique na arte para acessar a página do produto.",
    "Já na página do produto escolha o tipo de material que você deseja. Temos opções desde apenas impressão ou placa decorativa até vários tipos de moldura em cores e espessuras diversas. Escolha a que melhor atende suas expectativas se baseando nas imagens exemplo na página do produto. É importante lembrar de que cada opção material tem um preço.",
    "Com o tipo de material já selecionado agora escolha o tamanho do seu quadro.",
    "Informe o seu CEP para verificar as opções de FRETE e valores.",
    "Clique em COMPRAR.",
    "Na página seguinte, selecione CONTINUAR COMPRANDO (caso queira escolher mais produtos) ou FINALIZAR COMPRA (se quiser finalizar seu pedido).",
    "Na próxima página digite seu e-mail, nome , telefone para contato e endereço de entrega. É muito importante preencher todos os dados para garantir que a entrega seja feita corretamente e que você seja informado sobre as etapas do envio.",
    "Se quiser utilizar o mesmo endereço de entrega para a emissão da Nota Fiscal mantenha selecionada a opção “usar mesmos dados de endereço da entrega”, ao final da página.",
    "Por fim é só preencher as informações de pagamento. Se quiser pagar via cartão, selecione a opção e informe: número do cartão, validade, nome do titular, código de segurança e quantidade de parcelas. Caso prefira pagar via boleto selecione a opção “Boleto Bancário”. Essa etapa é muito importante para efetuar a compra. Certifique-se de que forneceu as informações corretas."
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 py-12 md:py-24">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-headline">Como Comprar</CardTitle>
            <CardDescription className="pt-2 text-base">
              Siga nosso passo a passo simples e seguro para levar sua arte favorita para casa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground prose prose-sm max-w-none">
            
            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <Badge variant="default" className="flex h-8 w-8 items-center justify-center rounded-full text-base shrink-0 mt-1">
                            {index + 1}
                        </Badge>
                        <p className="flex-1">{step}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4 rounded-lg border bg-background p-6">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2"><Ticket className="h-5 w-5 text-primary"/> Cupom de Desconto</h3>
                <p>Se você tiver um cupom de desconto, para utilizar basta digitá-lo no campo “código do cupom de desconto”, na mesma janela do passo anterior, e clicar em aplicar cupom.</p>
            </div>

            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Meu pagamento não deu certo. E agora?</AlertTitle>
                <AlertDescription>
                 A maioria dos erros na etapa de pagamento estão relacionados à erro no processamento e incompatibilidades de navegador ou dispositivos. Caso isso ocorra, tente novamente por outro navegador ou dispositivo. Se você cadastrou uma senha ao final da página seus produtos estão salvos no carrinho e só concluir a compra.
                </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
