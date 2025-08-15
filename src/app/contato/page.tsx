
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Instagram, ArrowRight } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function ContatoPage() {
    const whatsappUrl = "https://wa.me/5534997222303?text=Olá! Vim pelo site e gostaria de mais informações.";
    const instagramUrl = "https://www.instagram.com/home.designerplanejados?igsh=NWZsNnh1dHB1MjVy";

    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow">
                 <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://finger.ind.br/wp-content/uploads/2021/02/post_thumbnail-757ae398373789e34f676db879790a25.jpeg"
                        alt="Atendimento ao cliente"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Entre em Contato</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Estamos aqui para ajudar. Escolha seu canal preferido.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20">
                   <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                       
                        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                           <CardHeader>
                                <WhatsAppIcon className="h-10 w-10 text-green-500 mb-2"/>
                                <CardTitle className="text-2xl">WhatsApp</CardTitle>
                                <CardDescription>Para um atendimento rápido e personalizado, orçamentos ou dúvidas sobre pedidos.</CardDescription>
                           </CardHeader>
                           <CardContent>
                                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                        Iniciar Conversa <ArrowRight className="ml-2"/>
                                    </Link>
                                </Button>
                           </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                           <CardHeader>
                                <Instagram className="h-10 w-10 text-pink-600 mb-2"/>
                                <CardTitle className="text-2xl">Instagram</CardTitle>
                                <CardDescription>Acompanhe nossos lançamentos, inspirações e bastidores. Siga-nos!</CardDescription>
                           </CardHeader>
                           <CardContent>
                                 <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90">
                                    <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                                        Seguir no Instagram <ArrowRight className="ml-2"/>
                                    </Link>
                                </Button>
                           </CardContent>
                        </Card>

                   </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
