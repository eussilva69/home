
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Gift, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ValePresentePage() {
    const whatsappUrl = "https://wa.me/5534997222303?text=Olá! Gostaria de saber mais sobre o Vale Presente.";

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow pt-20">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://images.unsplash.com/photo-1577962917302-cd874c4eac1d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Caixa de presente elegante"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Vale Presente</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">O presente perfeito para quem ama decoração.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-primary">Presenteie com Arte e Liberdade</h2>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Na dúvida sobre qual quadro escolher? Deixe que a pessoa presenteada decida! Com o Vale Presente da Home Designer, você oferece um mundo de possibilidades em forma de arte.
                            </p>
                            <Card className="bg-background">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Gift className="text-primary"/>
                                        Como Funciona?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-muted-foreground">
                                   <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 mt-1 text-green-500 flex-shrink-0"/>
                                        <p><span className="font-semibold text-foreground">Escolha o Valor:</span> Entre em contato conosco pelo WhatsApp para definir o valor do seu vale-presente.</p>
                                   </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 mt-1 text-green-500 flex-shrink-0"/>
                                        <p><span className="font-semibold text-foreground">Receba o Cartão Virtual:</span> Nós criamos um lindo cartão virtual personalizado com um código exclusivo.</p>
                                   </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 mt-1 text-green-500 flex-shrink-0"/>
                                        <p><span className="font-semibold text-foreground">Presenteie:</span> Você envia o cartão para a pessoa especial, que poderá usar o código em qualquer compra no nosso site.</p>
                                   </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="text-center">
                           <Image 
                             src="https://placehold.co/500x500.png"
                             data-ai-hint="gift card design"
                             alt="Exemplo de um Vale Presente"
                             width={500}
                             height={500}
                             className="rounded-lg shadow-xl mx-auto"
                           />
                           <Button size="lg" className="mt-8" asChild>
                               <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                   Comprar Vale Presente via WhatsApp
                                </Link>
                           </Button>
                        </div>
                   </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

