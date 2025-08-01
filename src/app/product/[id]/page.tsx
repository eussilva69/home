
'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/mock-data';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Heart, Package, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/shared/product-card';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedFrame, setSelectedFrame] = useState('black');

  const product = products.find((p) => p.id === params.id);
  const relatedProducts = products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (!product) {
    notFound();
  }

  const sizes = {
    small: { label: 'Pequeno', dimensions: '20x30cm', price: 0 },
    medium: { label: 'Médio', dimensions: '30x45cm', price: 20 },
    large: { label: 'Grande', dimensions: '40x60cm', price: 45 },
  };

  const frames = {
    none: { label: 'Sem Moldura', price: 0 },
    black: { label: 'Preta', price: 30 },
    white: { label: 'Branca', price: 30 },
    wood: { label: 'Madeira', price: 40 },
  };

  const finalPrice = product.price + sizes[selectedSize as keyof typeof sizes].price + frames[selectedFrame as keyof typeof frames].price;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
             <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                    src={product.image_alt}
                    alt={`${product.name} em um ambiente`}
                    data-ai-hint={product.hint_alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="brightness-90"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[45%] h-[45%] shadow-2xl">
                        <Image
                            src={product.image}
                            alt={product.name}
                            data-ai-hint={product.hint}
                            fill
                            style={{ 
                              objectFit: 'cover',
                              border: selectedFrame !== 'none' ? `12px solid ${selectedFrame}` : 'none',
                              borderColor: selectedFrame === 'wood' ? '#854d0e' : selectedFrame,
                            }}
                            className="rounded-sm"
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-headline text-primary mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold mb-6">R$ {finalPrice.toFixed(2).replace('.', ',')}</p>

            {/* Size Selector */}
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block">Tamanho</Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex gap-4">
                {Object.entries(sizes).map(([key, { label, dimensions }]) => (
                  <div key={key}>
                    <RadioGroupItem value={key} id={`size-${key}`} className="sr-only" />
                    <Label
                      htmlFor={`size-${key}`}
                      className={`block cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${selectedSize === key ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <span className="font-bold block">{label}</span>
                      <span className="text-sm text-muted-foreground">{dimensions}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {/* Frame Selector */}
            <div className="mb-8">
                <Label className="text-lg font-medium mb-3 block">Moldura</Label>
                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-4">
                    {Object.entries(frames).map(([key, { label }]) => (
                    <div key={key} className="flex items-center">
                        <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                        <Label
                        htmlFor={`frame-${key}`}
                        className={`flex items-center justify-center cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${selectedFrame === key ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                        {key !== 'none' && (
                            <div className="h-6 w-6 rounded-full mr-2 border" style={{ backgroundColor: key === 'wood' ? '#854d0e' : key }}></div>
                        )}
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
