
'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Heart, Package, ShieldCheck, Ruler, Info, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { getProductById } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';

const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 75.00, valor_com_vidro: 100.00, weight: 1.2, width: 33, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 140.00, valor_com_vidro: 195.00, weight: 1.8, width: 45, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 180.00, valor_com_vidro: 340.00, weight: 2.5, width: 53, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 455.00, valor_com_vidro: 631.00, weight: 3.5, width: 63, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 760.00, valor_com_vidro: 1070.00, weight: 5.0, width: 87, height: 123, length: 3 },
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 175.00, valor_com_vidro: 270.00, weight: 2.4, width: 68, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 260.00, valor_com_vidro: 380.00, weight: 3.6, width: 92, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 350.00, valor_com_vidro: 630.00, weight: 5.0, width: 108, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 840.00, valor_com_vidro: 1340.00, weight: 7.0, width: 128, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1370.00, valor_com_vidro: 2100.00, weight: 10.0, width: 176, height: 123, length: 3 },
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 260.00, valor_com_vidro: 410.00, weight: 3.6, width: 103, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 380.00, valor_com_vidro: 530.00, weight: 5.4, width: 139, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 495.00, valor_com_vidro: 760.00, weight: 7.5, width: 163, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1230.00, valor_com_vidro: 1720.00, weight: 10.5, width: 193, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2060.00, valor_com_vidro: 2870.00, weight: 15.0, width: 265, height: 123, length: 3 },
  ]
};

const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
};

const FrameMockup = ({ artworkUrl, frameColor, withGlass, imageApplication = 'repeat', arrangement = 'Solo' }: { artworkUrl: string; frameColor: string, withGlass: boolean, imageApplication?: 'repeat' | 'split', arrangement?: string }) => {
    const frameCount = arrangement === 'Trio' ? 3 : arrangement === 'Dupla' ? 2 : 1;

    const renderFrames = () => {
        return [...Array(frameCount)].map((_, i) => {
            const imageStyle: React.CSSProperties = { objectFit: 'cover' };
            if (imageApplication === 'split' && frameCount > 1) {
                const position = frameCount === 2 ? (i === 0 ? '0%' : '100%') : `${(i * 100) / (frameCount - 1)}%`;
                imageStyle.objectPosition = `${position} 50%`;
                imageStyle.width = `${frameCount * 100}%`;
                imageStyle.height = '100%';
                imageStyle.position = 'absolute';
                imageStyle.left = `-${i * 100}%`;
                imageStyle.objectFit = 'cover';
            }

            return (
                <div
                    key={i}
                    className="relative w-80"
                    style={{ 
                        backgroundColor: frames[frameColor as keyof typeof frames]?.color || '#000',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div className="relative bg-white w-full aspect-[4/5] overflow-hidden">
                        <Image src={artworkUrl} alt={`Arte do quadro ${i + 1}`} layout="fill" style={imageStyle} />
                        {withGlass && <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"/>}
                    </div>
                </div>
            );
        });
    };
    
    return <div className="flex gap-2 items-center justify-center">{renderFrames()}</div>;
};


export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      const result = await getProductById(id);
      if (result.success && result.data) {
        setProduct(result.data as Product);
      } else {
        notFound();
      }
      setLoading(false);
    };
    fetchProductData();
  }, [id]);

  const arrangementKey = product?.arrangement as keyof typeof pricingData || 'Solo';
  const availableSizes = pricingData[arrangementKey] || pricingData['Solo'];
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[0].tamanho);
  const [withGlass, setWithGlass] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
  
  useEffect(() => {
      if (product) {
        const newAvailableSizes = pricingData[product.arrangement as keyof typeof pricingData] || pricingData['Solo'];
        setSelectedSize(newAvailableSizes[0].tamanho);
      }
  }, [product]);

  const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
  const finalPrice = withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

  const handleAddToCart = () => {
    if (!product || !selectedPriceInfo || !finalPrice) return;
    
    const itemToAdd = {
        id: `${product.id}-${selectedSize}-${selectedFrame}-${withGlass ? 'vidro' : 'sem-vidro'}`,
        name: product.name,
        price: finalPrice,
        image: product.artwork_image, // Usa a arte como imagem principal no carrinho
        quantity: 1,
        options: `${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}, ${withGlass ? 'Com Vidro' : 'Sem Vidro'}`,
        weight: selectedPriceInfo.weight,
        width: selectedPriceInfo.width,
        height: selectedPriceInfo.height,
        length: selectedPriceInfo.length,
    };
    addToCart(itemToAdd);
  };

  const handleFrameChange = (value: string) => {
    setSelectedFrame(value);
  }

  const humanHeightPx = 120;
  const humanImage = "https://res.cloudinary.com/dl38o4mnk/image/upload/v1755621040/pngegg_jq7lzi.png";

  const getFrameDimensions = (sizeString: string) => {
    const [w_cm, h_cm] = sizeString.replace(' cm', '').split('x').map(Number);
    const scaleFactor = humanHeightPx / 170; // px per cm
    return {
      width: w_cm * scaleFactor,
      height: h_cm * scaleFactor
    };
  };

  if (loading || !product) {
      return (
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </main>
            <Footer />
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4 items-center justify-center bg-gray-100 rounded-lg p-4 h-[600px]">
            <FrameMockup 
              artworkUrl={product.artwork_image} 
              frameColor={selectedFrame} 
              withGlass={withGlass}
              imageApplication={product.image_application}
              arrangement={product.arrangement}
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">{product.name}</h1>
            <p className="text-xl md:text-2xl font-semibold mb-6">
                {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione uma opção'}
            </p>
            
            {/* Frame Color Selector */}
            <div className="mb-6 md:mb-8">
              <Label className="text-base md:text-lg font-medium mb-3 flex items-center gap-2"><Palette/> Cor da Moldura</Label>
              <RadioGroup value={selectedFrame} onValueChange={handleFrameChange} className="flex items-center gap-3">
                  {Object.entries(frames).map(([key, { label, color }]) => (
                      <div key={key}>
                          <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                          <Label htmlFor={`frame-${key}`} className={cn("block cursor-pointer rounded-full border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')}>
                              <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: color }} title={label}/>
                          </Label>
                      </div>
                  ))}
              </RadioGroup>
            </div>


             {/* Size Selector */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center mb-3">
                  <Ruler className="h-5 w-5 mr-2" />
                  <Label className="text-base md:text-lg font-medium">Tamanho: <span className="font-bold">{selectedSize}</span></Label>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                  <Info className="h-4 w-4"/> Escolha um tamanho para ver a escala real.
              </p>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSizes.map(({ tamanho }) => {
                  const { width, height } = getFrameDimensions(tamanho);
                  
                  return (
                    <div key={tamanho}>
                      <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                      <Label
                        htmlFor={`size-${tamanho}`}
                        className={cn(
                          "flex flex-col items-center justify-between cursor-pointer rounded-lg border-2 p-2 text-center transition-all h-40",
                          selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background'
                        )}
                      >
                        <div className="w-full flex-grow flex items-end justify-center gap-2" style={{ transform: 'scale(0.8)' }}>
                          <Image src={humanImage} alt="Silhueta humana" width={30} height={humanHeightPx} style={{height: `${humanHeightPx}px`}}/>
                          <div className='flex items-center justify-center' style={{height: `${humanHeightPx}px`}}>
                             <div className="bg-primary/50" style={{ width: `${width}px`, height: `${height}px`}} />
                          </div>
                        </div>
                        <div className='w-full text-center py-1'>
                          <span className="font-semibold text-sm">{tamanho}</span>
                           <span className="block text-xs text-muted-foreground">
                            {product.arrangement}
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
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
              <Button size="lg" className="flex-1 text-base" onClick={handleAddToCart}>
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
      </main>
      <Footer />
    </div>
  );
}
