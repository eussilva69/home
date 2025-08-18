
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, FileText } from 'lucide-react';
import QuoteForm from '@/components/quote/quote-form';

export default function QuotePage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow pt-20">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://img.freepik.com/fotos-gratis/a-luz-brilha-atraves-da-janela-em-um-apartamento-vazio-com-paredes-brancas-e-um-piso-de-madeira_1217-2130.jpg"
                        alt="Oficina de marcenaria"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Móveis Planejados e Orçamentos</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Transforme sua ideia em realidade com peças exclusivas.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-primary">Seu Projeto, Nosso Compromisso</h2>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Na Home Designer, além de nossos quadros, oferecemos a criação de mobílias planejadas para que seu ambiente seja único em cada detalhe. Se você tem um projeto em mente, uma necessidade específica ou apenas uma ideia, estamos aqui para ajudar.
                            </p>
                            <Card className="bg-background">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Lightbulb className="text-amber-500"/>
                                        Como Funciona?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-muted-foreground">
                                   <div className="flex items-start gap-3">
                                        <span className="font-bold text-primary">1.</span>
                                        <p>Preencha o formulário ao lado com os detalhes do seu projeto. Seja o mais descritivo possível!</p>
                                   </div>
                                    <div className="flex items-start gap-3">
                                        <span className="font-bold text-primary">2.</span>
                                        <p>Se tiver imagens de referência, plantas ou croquis, anexe no campo de upload. Isso nos ajuda a visualizar sua ideia.</p>
                                   </div>
                                    <div className="flex items-start gap-3">
                                        <span className="font-bold text-primary">3.</span>
                                        <p>Nossa equipe de especialistas analisará sua solicitação e entrará em contato para discutir os detalhes e apresentar um orçamento.</p>
                                   </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <FileText />
                                        Solicite seu Orçamento
                                    </CardTitle>
                                    <CardDescription>
                                        Preencha o formulário e dê o primeiro passo para ter o móvel dos seus sonhos.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <QuoteForm />
                                </CardContent>
                            </Card>
                        </div>
                   </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
