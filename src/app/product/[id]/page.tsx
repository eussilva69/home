
'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Heart, Package, ShieldCheck, Ruler, Info, Palette, Eye, FrameIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { getProductById } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';

const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_placa: 60.00, valor_sem_vidro: 75.00, valor_com_vidro: 100.00, weight: 1.2, width: 33, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_placa: 110.00, valor_sem_vidro: 140.00, valor_com_vidro: 195.00, weight: 1.8, width: 45, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_placa: 150.00, valor_sem_vidro: 180.00, valor_com_vidro: 340.00, weight: 2.5, width: 53, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_placa: 380.00, valor_sem_vidro: 455.00, valor_com_vidro: 631.00, weight: 3.5, width: 63, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_placa: 650.00, valor_sem_vidro: 760.00, valor_com_vidro: 1070.00, weight: 5.0, width: 87, height: 123, length: 3 },
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_placa: 140.00, valor_sem_vidro: 175.00, valor_com_vidro: 270.00, weight: 2.4, width: 68, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_placa: 220.00, valor_sem_vidro: 260.00, valor_com_vidro: 380.00, weight: 3.6, width: 92, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_placa: 300.00, valor_sem_vidro: 350.00, valor_com_vidro: 630.00, weight: 5.0, width: 108, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_placa: 750.00, valor_sem_vidro: 840.00, valor_com_vidro: 1340.00, weight: 7.0, width: 128, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_placa: 1200.00, valor_sem_vidro: 1370.00, valor_com_vidro: 2100.00, weight: 10.0, width: 176, height: 123, length: 3 },
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_placa: 220.00, valor_sem_vidro: 260.00, valor_com_vidro: 410.00, weight: 3.6, width: 103, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_placa: 330.00, valor_sem_vidro: 380.00, valor_com_vidro: 530.00, weight: 5.4, width: 139, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_placa: 440.00, valor_sem_vidro: 495.00, valor_com_vidro: 760.00, weight: 7.5, width: 163, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_placa: 1000.00, valor_sem_vidro: 1230.00, valor_com_vidro: 1720.00, weight: 10.5, width: 193, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_placa: 1800.00, valor_sem_vidro: 2060.00, valor_com_vidro: 2870.00, weight: 15.0, width: 265, height: 123, length: 3 },
  ]
};


const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
    none: { label: 'Sem Moldura', color: 'transparent' }
};

type ViewMode = 'product' | 'env1' | 'env2';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('product');
  const { addToCart } = useCart();

  const isFurniture = product?.category === 'Mobílias';
  
  // State for furniture
  const [selectedFurnitureSize, setSelectedFurnitureSize] = useState<string | null>(null);
  
  // State for frames
  const arrangementKey = product?.arrangement as keyof typeof pricingData || 'Solo';
  const availableSizes = pricingData[arrangementKey] || pricingData['Solo'];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.tamanho);
  const [withGlass, setWithGlass] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);

  const isFrameless = selectedFrame === 'none';

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      const result = await getProductById(id);
      if (result.success && result.data) {
        const productData = result.data as Product;
        setProduct(productData);
        if (productData.category === 'Mobílias' && productData.sizes && productData.sizes.length > 0) {
            setSelectedFurnitureSize(productData.sizes[0].size);
        } else {
             const newAvailableSizes = pricingData[productData.arrangement as keyof typeof pricingData] || pricingData['Solo'];
             setSelectedSize(newAvailableSizes[0].tamanho);
        }
      } else {
        notFound();
      }
      setLoading(false);
    };
    fetchProductData();
  }, [id]);

  const selectedPriceInfo = isFurniture 
    ? product?.sizes?.find(s => s.size === selectedFurnitureSize)
    : availableSizes.find(s => s.tamanho === selectedSize);

  const finalPrice = isFurniture 
    ? selectedPriceInfo?.price 
    : isFrameless
    ? (selectedPriceInfo as any)?.valor_placa
    : (withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro);


  const handleAddToCart = () => {
    if (!product || !finalPrice || !selectedPriceInfo) return;
    
    let itemOptions = '';
    let cartItemId = product.id;

    if (isFurniture) {
        itemOptions = selectedFurnitureSize || '';
        cartItemId += `-${itemOptions.replace(/\s/g, '')}`;
    } else {
        itemOptions = `${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}`;
        if (!isFrameless) {
            itemOptions += `, ${withGlass ? 'Com Vidro' : 'Sem Vidro'}`;
        }
        cartItemId += `-${selectedSize.replace(/\s/g, '')}-${selectedFrame}`;
        if (!isFrameless) {
          cartItemId += `-${withGlass ? 'vidro' : 'sem-vidro'}`;
        }
    }

    const itemToAdd = {
        id: cartItemId,
        name: product.name,
        price: finalPrice,
        image: product.image || "https://placehold.co/100x100.png",
        quantity: 1,
        options: itemOptions,
        weight: (selectedPriceInfo as any).weight || 1,
        width: (selectedPriceInfo as any).width || 30,
        height: (selectedPriceInfo as any).height || 42,
        length: (selectedPriceInfo as any).length || 3,
    };
    addToCart(itemToAdd);
  };
  
  const getProductImage = () => {
      if (!product) return "https://placehold.co/600x800.png";
      if (isFrameless) return product.artwork_image || product.image || "https://placehold.co/600x800.png";
      return product.imagesByColor?.[selectedFrame] || product.image || "https://placehold.co/600x800.png";
  };
  
  const getEnvironmentImage = () => {
      if (viewMode === 'product' || !product?.environment_images || product.environment_images.length === 0) return null;
      if (viewMode === 'env1') return product.environment_images[0];
      if (viewMode === 'env2' && product.environment_images.length > 1) return product.environment_images[1];
      return product.environment_images[0]; // fallback
  }

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

  const environmentImageSrc = getEnvironmentImage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
              <div 
                className="relative aspect-[4/5] w-full max-w-[600px] mx-auto overflow-hidden rounded-lg shadow-lg bg-gray-100 flex items-center justify-center"
              >
                 {environmentImageSrc ? (
                     <>
                        <Image
                            key={environmentImageSrc}
                            src={environmentImageSrc}
                            alt="Ambiente"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                             <Image
                                key={`${getProductImage()}-env`}
                                src={getProductImage()}
                                alt={product.name}
                                width={300}
                                height={375}
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                     </>
                 ) : (
                    <Image
                        key={getProductImage()}
                        src={getProductImage()}
                        alt={product.name}
                        fill
                        className={cn('object-cover', isFrameless && 'object-contain p-4')}
                        sizes="(max-width: 1024px) 90vw, 50vw"
                    />
                 )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant={viewMode === 'product' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('product')}>
                    <FrameIcon className="mr-2 h-4 w-4"/> Produto
                </Button>
                {product.environment_images?.map((img, index) => (
                    img && <Button key={index} variant={viewMode === `env${index + 1}` as ViewMode ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(`env${index + 1}` as ViewMode)}>
                        <Eye className="mr-2 h-4 w-4"/> Ambiente {index + 1}
                    </Button>
                ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">{product.name}</h1>
            <p className="text-xl md:text-2xl font-semibold mb-6">
                {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione uma opção'}
            </p>
            
            {isFurniture && product.sizes && product.sizes.length > 0 ? (
                <div className="mb-6 md:mb-8">
                    <Label className="text-base md:text-lg font-medium mb-3 flex items-center gap-2"><Ruler/> Tamanho</Label>
                     <RadioGroup value={selectedFurnitureSize || ''} onValueChange={setSelectedFurnitureSize} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {product.sizes?.map(({ size }) => (
                            <div key={size}>
                                <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                                <Label htmlFor={`size-${size}`} className={cn("flex h-16 items-center justify-center cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-semibold transition-all", selectedFurnitureSize === size ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                                {size}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ) : !isFurniture ? (
              <>
                {/* Frame Color Selector */}
                <div className="mb-6 md:mb-8">
                  <Label className="text-base md:text-lg font-medium mb-3 flex items-center gap-2"><Palette/> Cor da Moldura</Label>
                  <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-3">
                      {Object.entries(frames).map(([key, { label, color }]) => (
                          <div key={key}>
                              <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                              <Label htmlFor={`frame-${key}`} className={cn("block cursor-pointer rounded-full border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')}>
                                 {key === 'none' ? (
                                    <div className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center text-muted-foreground text-xs" title={label}>S/M</div>
                                 ) : (
                                    <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: color }} title={label}/>
                                 )}
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
                      <Info className="h-4 w-4"/> Preços variam conforme tamanho e acabamento.
                  </p>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableSizes.map(({ tamanho }) => (
                      <div key={tamanho}>
                        <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                        <Label htmlFor={`size-${tamanho}`} className={cn("flex h-16 items-center justify-center cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-semibold transition-all", selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                          {tamanho} ({product.arrangement})
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Glass Selector */}
                {!isFrameless && (
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
                )}
              </>
            ) : null}


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
                    {isFurniture 
                        ? 'Mobiliário de alta qualidade, feito com materiais selecionados para garantir durabilidade e um design incrível para o seu ambiente.'
                        : 'Eleve sua decoração com esta peça de arte vibrante. Impressa em materiais de alta qualidade com tintas resistentes ao desbotamento, esta obra é projetada para durar. Perfeita para salas de estar, quartos ou escritórios que precisam de um toque de cor e personalidade.'
                    }
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
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}
