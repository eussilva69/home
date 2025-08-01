
'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Heart, Package, ShieldCheck, Ruler, Info, Eye, Image as ImageIcon } from 'lucide-react';
import ProductCard from '@/components/shared/product-card';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  const relatedProducts = products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    notFound();
  }
  
  const sizes = {
    p: { label: 'Pequeno', dimensions: '20x30cm', price: 0, scale: 0.6 },
    m: { label: 'Médio', dimensions: '30x45cm', price: 20, scale: 0.8 },
    g: { label: 'Grande', dimensions: '40x60cm', price: 45, scale: 1.0 },
    xg: { label: 'Extra Grande', dimensions: '60x90cm', price: 75, scale: 1.2 },
    gg: { label: 'Gigante', dimensions: '84x120cm', price: 110, scale: 1.5 },
  };

  const frames = {
    black: { label: 'Preta', color: '#000000', price: 30 },
    white: { label: 'Branca', color: '#FFFFFF', price: 30 },
    wood: { label: 'Madeira', color: '#A0522D', price: 40 },
    darkwood: { label: 'Madeira Escura', color: '#5C4033', price: 45 },
  };

  const glassOptions = {
    with_glass: { label: 'Com Vidro', price: 25 },
    without_glass: { label: 'Sem Vidro', price: 0 },
  };

  const [selectedSize, setSelectedSize] = useState(Object.keys(sizes)[1]);
  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
  const [selectedGlass, setSelectedGlass] = useState(Object.keys(glassOptions)[1]);
  const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>(
    product.arrangement === 'Solo' ? 'environment' : 'frame_only'
  );


  const finalPrice = product.price + sizes[selectedSize as keyof typeof sizes].price + frames[selectedFrame as keyof typeof frames].price + glassOptions[selectedGlass as keyof typeof glassOptions].price;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
             {product.arrangement === 'Solo' && (
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Button variant={viewMode === 'environment' ? 'default' : 'outline'} onClick={() => setViewMode('environment')}>
                        <Eye className="mr-2" /> No Ambiente
                    </Button>
                    <Button variant={viewMode === 'frame_only' ? 'default' : 'outline'} onClick={() => setViewMode('frame_only')}>
                        <ImageIcon className="mr-2" /> Somente o Quadro
                    </Button>
                </div>
             )}
            {viewMode === 'environment' && product.arrangement === 'Solo' ? (
                 <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
                    <Image
                        src={product.image_alt}
                        alt={`${product.name} em um ambiente`}
                        data-ai-hint={product.hint_alt}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="brightness-75"
                    />
                    <div
                        className="absolute"
                        style={{
                            top: '50px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(-2deg)',
                            width: '240px',
                            height: '320px',
                            backgroundColor: '#fff',
                            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)',
                            border: selectedFrame !== 'none' ? `8px solid ${frames[selectedFrame as keyof typeof frames].color}` : 'none',
                        }}
                        >
                        <Image
                            src={product.image}
                            alt={product.name}
                            data-ai-hint={product.hint}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="p-1.5"
                        />
                        {selectedGlass === 'with_glass' && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"/>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative aspect-square w-full flex items-center justify-center bg-secondary/30 rounded-lg shadow-lg p-8">
                     <div
                        className="relative"
                        style={{
                            width: '320px',
                            height: '426px',
                            backgroundColor: '#fff',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                            border: selectedFrame !== 'none' ? `10px solid ${frames[selectedFrame as keyof typeof frames].color}` : 'none',
                        }}
                        >
                        <Image
                            src={product.image}
                            alt={product.name}
                            data-ai-hint={product.hint}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="p-2"
                        />
                        {selectedGlass === 'with_glass' && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"/>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-headline text-primary mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold mb-6">R$ {finalPrice.toFixed(2).replace('.', ',')}</p>

             {/* Size Selector */}
             <div className="mb-8">
                <div className="flex items-center mb-3">
                    <Ruler className="h-5 w-5 mr-2" />
                    <Label className="text-lg font-medium">Tamanho: <span className="font-bold">{sizes[selectedSize as keyof typeof sizes].label} ({sizes[selectedSize as keyof typeof sizes].dimensions})</span></Label>
                </div>
                 <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <Info className="h-4 w-4"/> Entenda os tamanhos
                </p>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                {Object.entries(sizes).map(([key, { dimensions, scale }]) => (
                  <div key={key}>
                    <RadioGroupItem value={key} id={`size-${key}`} className="sr-only" />
                    <Label
                      htmlFor={`size-${key}`}
                      className={cn(
                        "flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 p-3 text-center transition-all w-24 h-24",
                        selectedSize === key ? 'border-primary bg-primary/5' : 'border-border bg-background'
                      )}
                    >
                      <div className="relative flex items-end justify-center h-12">
                          <Image src="https://images.icon-icons.com/1458/PNG/512/personavatar_99746.png" alt="Pessoa" width={40} height={40} className="object-contain h-10 w-10 opacity-70" />
                          <div className="absolute bottom-0 right-0 border border-foreground/50 bg-white" style={{ width: `${scale * 12}px`, height: `${scale*16}px`}} />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{dimensions}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Frame Selector */}
            <div className="mb-8">
                <Label className="text-lg font-medium mb-3 block">Cor da Moldura: <span className="font-bold">{frames[selectedFrame as keyof typeof frames].label}</span></Label>
                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2">
                    {Object.entries(frames).map(([key, { color }]) => (
                        <div key={key}>
                            <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                            <Label htmlFor={`frame-${key}`} className={cn("block cursor-pointer rounded-md border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')}>
                                <div className="w-16 h-16 rounded-md overflow-hidden border">
                                    <div className="w-full h-full relative">
                                        <div style={{ backgroundColor: color, width: '50%', height: '15px', position: 'absolute', top: 0, left: 0 }} />
                                        <div style={{ backgroundColor: color, width: '15px', height: '50%', position: 'absolute', top: 0, left: 0 }} />
                                        <div style={{ backgroundColor: '#f0f0f0', width: 'calc(100% - 15px)', height: 'calc(100% - 15px)', position: 'absolute', bottom: 0, right: 0 }} />
                                    </div>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Glass Selector */}
            <div className="mb-8">
                <Label className="text-lg font-medium mb-3 block">Vidro: <span className="font-bold">{glassOptions[selectedGlass as keyof typeof glassOptions].label}</span></Label>
                <RadioGroup value={selectedGlass} onValueChange={setSelectedGlass} className="grid grid-cols-2 gap-4">
                     {Object.entries(glassOptions).map(([key, { label }]) => (
                         <div key={key}>
                             <RadioGroupItem value={key} id={`glass-${key}`} className="sr-only" />
                             <Label htmlFor={`glass-${key}`} className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-4 text-center font-semibold transition-all h-20", selectedGlass === key ? 'border-primary bg-primary/5' : 'border-border')}>
                                 {label}
                             </Label>
                         </div>
                     ))}
                </RadioGroup>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2" /> Adicionar ao Carrinho
              </Button>
              <Button variant="outline" size="lg">
                <Heart />
              </Button>
            </div>

            {/* Accordion for more info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Descrição do Produto</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Eleve sua decoração com esta peça de arte vibrante. Impressa em materiais de alta qualidade com tintas resistentes ao desbotamento, esta obra é projetada para durar. Perfeita para salas de estar, quartos ou escritórios que precisam de um toque de cor e personalidade.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Envio e Devoluções</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                   <div className="flex items-start gap-2">
                        <Package className="h-5 w-5 mt-0.5" />
                        <p>Envio seguro para todo o Brasil. O prazo de entrega é de 5 a 10 dias úteis.</p>
                   </div>
                   <div className="flex items-start gap-2">
                        <ShieldCheck className="h-5 w-5 mt-0.5" />
                        <p>Satisfação garantida. Devoluções gratuitas em até 7 dias após o recebimento.</p>
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
            <h2 className="text-3xl font-headline text-center mb-12">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

    