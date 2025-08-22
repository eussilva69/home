
'use client';

import React, { useState, useEffect, use } from 'react';
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


export default function ProductPage({ params }: { params: { id: string } }) {
  const id = use(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [activeImage, setActiveImage] = useState('');
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
        setActiveImage(productData.image || 'https://placehold.co/600x800.png');
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
  
  
  useEffect(() => {
      if (product && !isFurniture) {
          if (isFrameless) {
              setActiveImage(product.artwork_image || product.image || '');
          } else {
              const initialImage = product.imagesByColor?.[selectedFrame] || product.image || 'https://placehold.co/600x800.png';
              setActiveImage(initialImage);
          }
      }
  }, [product, selectedFrame, isFurniture, isFrameless]);

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

  const handleFrameChange = (value: string) => {
    setSelectedFrame(value);
    if (value === 'none') {
        setActiveImage(product?.artwork_image || product?.image || '');
    } else if (product && product.imagesByColor) {
        setActiveImage(product.imagesByColor[value] || product.image || '');
    }
  }

  const galleryImages = [
      product?.image,
      product?.image_alt,
      ...(product?.gallery_images || [])
  ].filter((img): img is string => !!img && img.trim() !== '');


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

  const mainImageUrl = isFrameless ? (product.artwork_image || activeImage) : activeImage;
  const altImageUrl = isFrameless ? (product.artwork_image || mainImageUrl) : (product.image_alt || mainImageUrl);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
              <div 
                className="relative aspect-[4/5] w-full max-w-[600px] mx-auto overflow-hidden rounded-lg shadow-lg bg-gray-100 cursor-pointer"
                onMouseEnter={() => !isFurniture && setIsHovering(true)}
                onMouseLeave={() => !isFurniture && setIsHovering(false)}
              >
                 <Image
                    key="main-image"
                    src={mainImageUrl}
                    alt={product.name}
                    fill
                    className={cn(
                        'object-cover transition-opacity duration-300',
                       !isFurniture && isHovering ? 'opacity-0' : 'opacity-100',
                       isFrameless && 'object-contain p-4' // Contain for frameless art
                    )}
                    sizes="(max-width: 1024px) 90vw, 50vw"
                />
                {!isFurniture && (
                    <Image
                        key="alt-image"
                        src={altImageUrl}
                        alt={`${product.name} em ambiente`}
                        fill
                        className={cn(
                            'object-cover transition-opacity duration-300',
                            isHovering ? 'opacity-100' : 'opacity-0'
                        )}
                        sizes="(max-width: 1024px) 90vw, 50vw"
                    />
                )}
              </div>
              {isFurniture && galleryImages.length > 1 && (
                  <div className="flex gap-2 justify-center">
                      {galleryImages.map((img, index) => (
                           <button key={index} onClick={() => setActiveImage(img)} className={cn("relative w-16 h-16 rounded-md overflow-hidden border-2", activeImage === img ? 'border-primary' : 'border-transparent')}>
                               <Image src={img} alt={`Detalhe ${index+1}`} layout="fill" objectFit="cover" />
                           </button>
                      ))}
                  </div>
              )}
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
                  <RadioGroup value={selectedFrame} onValueChange={handleFrameChange} className="flex items-center gap-3">
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
