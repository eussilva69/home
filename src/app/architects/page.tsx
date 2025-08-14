
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Mail } from 'lucide-react';
import ContactForm from '@/components/architects/contact-form';

const benefits = [
    "Acesso a um catálogo exclusivo com curadoria de especialistas.",
    "Condições comerciais especiais e descontos progressivos.",
    "Suporte dedicado para especificação de produtos e projetos.",
    "Agilidade na entrega e logística pensada para profissionais.",
    "Materiais de marketing e amostras para apresentar aos seus clientes.",
];

export default function ArchitectsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://img.freepik.com/fotos-gratis/a-luz-brilha-atraves-da-janela-em-um-apartamento-vazio-com-paredes-brancas-e-um-piso-de-madeira_1217-2130.jpg"
                        alt="Escritório de arquitetura moderno"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Parceria para Arquitetos e Designers</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Eleve seus projetos com a arte e o design da Home Designer.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-primary">Um universo de possibilidades para seus projetos</h2>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Na Home Designer, valorizamos a visão e a criatividade dos profissionais que transformam espaços. Nosso programa de parceria foi criado para oferecer a você, arquiteto ou designer de interiores, as melhores ferramentas, produtos e condições para encantar seus clientes.
                            </p>
                            <Card className="bg-background">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <CheckCircle className="text-green-500"/>
                                        Vantagens Exclusivas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-muted-foreground">
                                        {benefits.map((benefit, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card className="shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <Users />
                                        Faça Parte do Nosso Time
                                    </CardTitle>
                                    <CardDescription>
                                        Preencha o formulário abaixo para entrarmos em contato e iniciarmos nossa parceria.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ContactForm />
                                </CardContent>
                            </Card>
                        </div>
                   </div>
                </section>
                
                 <section className="bg-primary text-primary-foreground">
                    <div className="container mx-auto px-4 py-16 text-center">
                        <Mail className="mx-auto h-12 w-12 mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Dúvidas? Fale Conosco!</h2>
                        <p className="max-w-2xl mx-auto mb-6 text-lg text-primary-foreground/80">
                            Nossa equipe está pronta para atender você e encontrar a melhor solução para seus projetos.
                        </p>
                        <p className="text-xl font-semibold">homedecorinterioresplanejados@gmail.com</p>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
