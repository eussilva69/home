
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Frame } from 'lucide-react';

const frameTypes = [
    {
        title: "Moldura Filete",
        measurements: "0,5 cm de espessura frontal x 3 cm de espessura lateral",
        description: "Impressão de alta definição em vinil acetinado com tinta não tóxica. Moldura em madeira 100% de reflorestamento revestida com polietileno que garante maior qualidade e durabilidade do produto. Esta opção de acabamento não tem vidro, atente-se a esse detalhe no momento da compra. Você receberá o quadro pronto para instalação com penduradores e kit de buchas e parafusos. Para pendurar corretamente, leia as instruções no verso do quadro."
    },
    {
        title: "Moldura Slim",
        measurements: "0,7 cm de espessura frontal x 2 cm de espessura lateral",
        description: "Impressão de alta definição em vinil acetinado com tinta não tóxica. Moldura em madeira 100% de reflorestamento revestida com polietileno que garante maior qualidade e durabilidade do produto. Esta opção de acabamento possui vidro. Você receberá o quadro pronto para instalação com penduradores e kit de buchas e parafusos. Para pendurar corretamente, leia as instruções no verso do quadro."
    },
    {
        title: "Canvas com Moldura",
        measurements: "0,5 cm de espessura frontal x 4 cm de espessura lateral",
        description: "Impressão de alta definição em tecido canvas, gramatura 205g (trama 12 fios/algodão), com tinta não tóxica. Moldura em madeira 100% de reflorestamento revestida com polietileno que garante maior qualidade e durabilidade do produto. Tem um aspecto “flutuante” entre a arte e a moldura, que junto à face slim dá um toque de minimalismo ao quadro. Sua característica principal é o efeito de arte pintada à mão. Esta opção de acabamento não tem vidro, atente-se a esse detalhe no momento da compra. Você receberá o quadro pronto para instalação com penduradores e kit de buchas e parafusos. Para pendurar corretamente, leia as instruções no verso do quadro."
    },
    {
        title: "Moldura Premium",
        measurements: "2 cm de espessura frontal x 3 cm de espessura lateral",
        description: "Impressão de alta definição em vinil acetinado com tinta não tóxica. Moldura em madeira 100% de reflorestamento revestida com polietileno que garante maior qualidade e durabilidade do produto. Nesta opção, a arte tem mais profundidade em relação à moldura, trazendo um aspecto de elegância. Temos as opções com e sem vidro, que você pode selecionar no momento da compra. Você receberá o quadro pronto para instalação com penduradores e kit de buchas e parafusos. Para pendurar corretamente, leia as instruções no verso do quadro."
    },
    {
        title: "Placa Decorativa",
        measurements: "Opção selecionada no campo tamanho",
        description: "Impressão em alta qualidade em vinil acetinado com tinta não tóxica aplicada em base MDF de 6mm com bordas infinitas. Não acompanha moldura."
    }
];

export default function ProductGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto p-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-10 shadow-lg">
             <CardHeader className="text-center">
                <Frame className="mx-auto h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-3xl font-headline">Guia do Produto</CardTitle>
                <CardDescription className="pt-2 text-base">
                    Nos quadros verticais considere as medidas do campo Tamanho na ordem largura x altura. Nos horizontais considere a ordem altura x largura. Veja abaixo em quais tipos de material você pode adquirir a sua arte:
                </CardDescription>
             </CardHeader>
          </Card>

          <div className="space-y-8">
            {frameTypes.map((frame, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{frame.title}</CardTitle>
                   <CardDescription>
                     <Badge variant="secondary">{frame.measurements}</Badge>
                   </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{frame.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
