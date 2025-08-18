
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LojaPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow pt-20">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Interior de loja de decoração"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Nossa Loja</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Explore nossas coleções e encontre a arte perfeita para seu espaço.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20 text-center">
                   <h2 className="text-3xl font-bold text-primary mb-4">Bem-vindo à Home Designer</h2>
                   <p className="max-w-3xl mx-auto text-muted-foreground mb-8">
                       Navegue por nossas categorias cuidadosamente selecionadas ou explore todas as nossas peças. Cada quadro é uma oportunidade de transformar seu ambiente.
                   </p>
                   <div className="flex justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/collection/abstrato">Ver Coleções</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/monte-seu-quadro">Monte seu Quadro</Link>
                        </Button>
                   </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
