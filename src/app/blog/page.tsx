
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Tag } from 'lucide-react';

const blogPosts = [
    {
        title: "Quantos quadros minimalistas devo usar em uma parede?",
        date: "5 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Lembre-se, a quantidade certa de quadros minimalistas pode transformar sua parede – descubra como alcançar equilíbrio e impacto visual!",
        slug: "/blog/quantos-quadros-minimalistas",
        image: "https://images.unsplash.com/photo-1541123356219-2849c672e07c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "A Importância da Iluminação em Exposições de Arte Minimalista",
        date: "4 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Há um elemento crucial que transforma sua experiência nas exposições de arte minimalista – e vai além da visibilidade. Continue lendo para descobrir sua influência.",
        slug: "/blog/importancia-da-iluminacao",
        image: "https://images.unsplash.com/photo-1507494954048-934d4a8b792b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Dicas para limpar e manter as molduras minimalistas sempre com cara de novas",
        date: "4 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Incremente o visual de suas molduras minimalistas com dicas simples e eficazes – descubra como manter suas molduras sempre impecáveis!",
        slug: "/blog/limpar-molduras-minimalistas",
        image: "https://images.unsplash.com/photo-1596540314224-a8a25287da29?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Posso usar quadros minimalistas em banheiros?",
        date: "4 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Uma atmosfera sofisticada e moderna pode ser criada em banheiros com quadros minimalistas – descubra como neste artigo!",
        slug: "/blog/quadros-minimalistas-em-banheiros",
        image: "https://images.unsplash.com/photo-1600672722658-51829f4f4607?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Quando usar vários quadros decorativos minimalistas em vez de um grande?",
        date: "4 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Um guia sobre quando usar múltiplos quadros minimalistas ao invés de um único quadro grande para transformar seu espaço e mostrar seu estilo.",
        slug: "/blog/varios-quadros-vs-um-grande",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Como escolher molduras decorativas minimalistas para ambientes com pouca luz",
        date: "4 de abril de 2024",
        category: "Dicas de decoração",
        excerpt: "Faça sua escolha de molduras decorativas minimalistas para ambientes com pouca luz e descubra como aumentar a sofisticação do seu espaço.",
        slug: "/blog/molduras-para-pouca-luz",
        image: "https://images.unsplash.com/photo-1595122435559-a2810939f401?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
];


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

                <section className="container mx-auto px-4 py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <Link href={post.slug} className="block">
                                    <div className="relative h-56 w-full">
                                        <Image 
                                            src={post.image}
                                            alt={post.title}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                </Link>
                                <CardHeader>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {post.date}</div>
                                        <div className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> {post.category}</div>
                                    </div>
                                    <CardTitle className="text-xl leading-tight">
                                        <Link href={post.slug} className="hover:text-primary transition-colors">{post.title}</Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{post.excerpt}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="link" className="p-0">
                                        <Link href={post.slug}>
                                            Ver Mais <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
