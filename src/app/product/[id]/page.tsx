
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


const parsePrice = (priceString: string) => {
    return parseFloat(priceString.replace('R$ ', '').replace('.', '').replace(',', '.'));
}

const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 75.00, valor_com_vidro: 100.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 140.00, valor_com_vidro: 195.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 180.00, valor_com_vidro: 340.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 455.00, valor_com_vidro: 631.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 760.00, valor_com_vidro: 1070.00 }
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 175.00, valor_com_vidro: 270.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 260.00, valor_com_vidro: 380.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 350.00, valor_com_vidro: 630.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 840.00, valor_com_vidro: 1340.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1370.00, valor_com_vidro: 2100.00 }
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 260.00, valor_com_vidro: 410.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 380.00, valor_com_vidro: 530.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 495.00, valor_com_vidro: 760.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1230.00, valor_com_vidro: 1720.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2060.00, valor_com_vidro: 2870.00 }
  ]
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  const relatedProducts = products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    notFound();
  }

  const arrangementKey = product.arrangement as keyof typeof pricingData;
  const availableSizes = pricingData[arrangementKey];
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[1].tamanho);
  const [withGlass, setWithGlass] = useState(false);
  
  const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>(
    product.arrangement === 'Solo' ? 'environment' : 'frame_only'
  );

  const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
  const finalPrice = withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

  const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    wood: { label: 'Madeira', color: '#A0522D' },
    darkwood: { label: 'Madeira Escura', color: '#5C4033' },
  };
  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
             {product.arrangement === 'Solo' && (
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Button size="sm" variant={viewMode === 'environment' ? 'default' : 'outline'} onClick={() => setViewMode('environment')}>
                        <Eye className="mr-2" /> No Ambiente
                    </Button>
                    <Button size="sm" variant={viewMode === 'frame_only' ? 'default' : 'outline'} onClick={() => setViewMode('frame_only')}>
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
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-2deg)',
                            width: 'min(40vw, 250px)',
                            aspectRatio: '3/4',
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.35)',
                            border: `10px solid ${frames[selectedFrame as keyof typeof frames].color}`,
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
                        {withGlass && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"/>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative aspect-square w-full flex items-center justify-center bg-secondary/30 rounded-lg shadow-lg p-4 md:p-8">
                     <div
                        className="relative"
                        style={{
                            width: 'min(75vw, 320px)',
                            aspectRatio: product.arrangement === 'Dupla' ? '8/5' : (product.arrangement === 'Trio' ? '12/5' : '3/4'),
                            backgroundColor: '#fff',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
                            border: `10px solid ${frames[selectedFrame as keyof typeof frames].color}`,
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
                        {withGlass && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"/>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">{product.name}</h1>
            <p className="text-xl md:text-2xl font-semibold mb-6">
                {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione uma opção'}
            </p>

             {/* Size Selector */}
             <div className="mb-6 md:mb-8">
                <div className="flex items-center mb-3">
                    <Ruler className="h-5 w-5 mr-2" />
                    <Label className="text-base md:text-lg font-medium">Tamanho: <span className="font-bold">{selectedSize}</span></Label>
                </div>
                 <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <Info className="h-4 w-4"/> Entenda os tamanhos
                </p>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                {availableSizes.map(({ tamanho }) => (
                  <div key={tamanho}>
                    <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                    <Label
                      htmlFor={`size-${tamanho}`}
                      className={cn(
                        "flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 p-2 text-center transition-all w-28 h-20 md:w-28 md:h-24",
                        selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background'
                      )}
                    >
                      <span className="font-semibold text-sm">{tamanho}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {product.arrangement}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Frame Selector */}
            <div className="mb-6 md:mb-8">
                <Label className="text-base md:text-lg font-medium mb-3 block">Cor da Moldura: <span className="font-bold">{frames[selectedFrame as keyof typeof frames].label}</span></Label>
                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2">
                    {Object.entries(frames).map(([key, { color }]) => (
                        <div key={key}>
                            <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                            <Label htmlFor={`frame-${key}`} className={cn("block cursor-pointer rounded-md border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')}>
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border">
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
            <div className="mb-6 md:mb-8">
                <Label className="text-base md:text-lg font-medium mb-3 block">Acabamento: <span className="font-bold">{withGlass ? 'Com Vidro' : 'Sem Vidro'}</span></Label>
                <RadioGroup value={withGlass ? "com-vidro" : "sem-vidro"} onValueChange={(value) => setWithGlass(value === "com-vidro")} className="grid grid-cols-2 gap-4">
                     <RadioGroupItem value="com-vidro" id="g1" className="sr-only" />
                     <Label htmlFor="g1" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-4 text-center font-semibold transition-all h-16 md:h-20", withGlass ? 'border-primary bg-primary/5' : 'border-border')}>
                         Com Vidro
                     </Label>
                     <RadioGroupItem value="sem-vidro" id="g2" className="sr-only" />
                     <Label htmlFor="g2" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-4 text-center font-semibold transition-all h-16 md:h-20", !withGlass ? 'border-primary bg-primary/5' : 'border-border')}>
                         Sem Vidro
                     </Label>
                </RadioGroup>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="flex-1 text-base">
                <ShoppingCart className="mr-2" /> Adicionar ao Carrinho
              </Button>
              <Button variant="outline" size="lg" className="px-4">
                <Heart />
              </Button>
            </div>

            {/* Accordion for more info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Descrição do Produto</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm">
                    Eleve sua decoração com esta peça de arte vibrante. Impressa em materiais de alta qualidade com tintas resistentes ao desbotamento, esta obra é projetada para durar. Perfeita para salas de estar, quartos ou escritórios que precisam de um toque de cor e personalidade.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Envio e Devoluções</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground text-sm">
                   <div className="flex items-start gap-2">
                        <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>Envio seguro para todo o Brasil. O prazo de entrega é de 5 a 10 dias úteis.</p>
                   </div>
                   <div className="flex items-start gap-2">
                        <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>Satisfação garantida. Devoluções gratuitas em até 7 dias após o recebimento.</p>
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 md:mt-24">
            <h2 className="text-2xl md:text-3xl font-headline text-center mb-8 md:mb-12">Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
