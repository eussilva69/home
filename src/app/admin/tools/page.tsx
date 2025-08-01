
'use client';

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductDescriptionGenerator from "@/components/features/product-description-generator";
import CompositionSuggester from "@/components/features/composition-suggester";
import { Lightbulb, Wand2 } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";

const dashboardLinks = [
    { href: '/dashboard', label: 'Início', icon: 'Home' },
    { href: '#', label: 'Pedidos', icon: 'Package' },
    { href: '#', label: 'Produtos', icon: 'Box' },
    { href: '/admin/tools', label: 'Ferramentas IA', icon: 'Wand2' },
    { href: '#', label: 'Clientes', icon: 'Users' },
];


export default function AiToolsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex">
                <DashboardSidebar links={dashboardLinks} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-headline">Ferramentas de IA</h1>
                        <p className="text-muted-foreground">Use o poder da IA para otimizar o conteúdo e as recomendações da sua loja.</p>
                    </div>

                    <Tabs defaultValue="description-generator" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="description-generator">
                                <Lightbulb className="mr-2" /> Gerador de Descrição
                            </TabsTrigger>
                            <TabsTrigger value="composition-suggester">
                                <Wand2 className="mr-2" /> Sugestão de Composição
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="description-generator">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gerador de Descrição de Produto</CardTitle>
                                    <CardDescription>
                                        Crie descrições de produtos otimizadas para SEO e atraentes para seus clientes.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ProductDescriptionGenerator />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="composition-suggester">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sugestão de Composição de Quadros</CardTitle>
                                    <CardDescription>
                                       Receba sugestões de composições de quadros com base na arte e nas preferências do usuário.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <CompositionSuggester />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </main>
            </div>
            <Footer />
        </div>
    );
}
