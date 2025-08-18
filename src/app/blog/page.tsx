
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { PenSquare } from 'lucide-react';

export default function BlogPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow pt-20">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Pessoa escrevendo em um caderno"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Nosso Blog</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Dicas, inspirações e novidades do mundo da decoração.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20 text-center">
                    <div className="max-w-2xl mx-auto">
                        <PenSquare className="mx-auto h-16 w-16 text-primary/50 mb-4" />
                        <h2 className="text-3xl font-bold text-primary mb-4">Em Breve</h2>
                        <p className="text-muted-foreground text-lg">
                            Estamos preparando um espaço incrível com muitas dicas de decoração, tendências e inspirações para você. Volte em breve para conferir nosso conteúdo!
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
