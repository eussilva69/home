
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export default function QuemSomosPage() {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow pt-20">
                <section className="relative h-64 md:h-80 w-full flex items-center justify-center text-center text-white">
                    <Image 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Equipe colaborando em um projeto"
                        layout="fill"
                        objectFit="cover"
                        className="brightness-50"
                        priority
                    />
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-lg">Quem Somos</h1>
                        <p className="mt-2 text-lg md:text-xl drop-shadow-md">Nossa paixão é transformar ambientes através da arte.</p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 md:py-20">
                   <div className="max-w-4xl mx-auto text-center space-y-6">
                        <Heart className="mx-auto h-12 w-12 text-primary/80"/>
                        <h2 className="text-3xl font-bold text-primary">Nossa História</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            A Home Designer nasceu do desejo de levar mais cor, personalidade e arte para o dia a dia das pessoas. Acreditamos que um quadro na parede não é apenas um objeto de decoração, mas uma janela para emoções, histórias e inspirações.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Cada peça em nossa coleção é selecionada com um olhar cuidadoso, buscando artistas talentosos e obras que transmitam sentimentos. Nosso compromisso é com a qualidade, desde a impressão em alta definição até a moldura que finaliza a obra.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Seja bem-vindo ao nosso universo. Estamos felizes em fazer parte da sua decoração e da sua vida.
                        </p>
                   </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
