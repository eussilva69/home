
'use client';

import { useState, ChangeEvent, useRef, DragEvent, useEffect } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Palette, GlassWater, X, Image as ImageIcon, Eye, Ruler, ShoppingCart, Paintbrush, ChevronsUpDown } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 100.00, valor_com_vidro: 125.00, weight: 1.2, width: 33, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 165.00, valor_com_vidro: 220.00, weight: 1.8, width: 45, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 205.00, valor_com_vidro: 365.00, weight: 2.5, width: 53, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 480.00, valor_com_vidro: 656.00, weight: 3.5, width: 63, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 785.00, valor_com_vidro: 1095.00, weight: 5.0, width: 87, height: 123, length: 3 }
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 200.00, valor_com_vidro: 295.00, weight: 2.4, width: 68, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 285.00, valor_com_vidro: 405.00, weight: 3.6, width: 92, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 375.00, valor_com_vidro: 655.00, weight: 5.0, width: 108, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 865.00, valor_com_vidro: 1365.00, weight: 7.0, width: 128, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1395.00, valor_com_vidro: 2125.00, weight: 10.0, width: 176, height: 123, length: 3 }
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 285.00, valor_com_vidro: 435.00, weight: 3.6, width: 103, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 405.00, valor_com_vidro: 555.00, weight: 5.4, width: 139, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 520.00, valor_com_vidro: 785.00, weight: 7.5, width: 163, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1255.00, valor_com_vidro: 1745.00, weight: 10.5, width: 193, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2085.00, valor_com_vidro: 2895.00, weight: 15.0, width: 265, height: 123, length: 3 }
  ]
};

const frameStyles = {
    moderna: 'solid',
    classica: 'double',
    rustica: 'groove',
};

const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
};

type FrameArrangement = keyof typeof pricingData;

const getFrameCount = (arrangement: FrameArrangement) => {
    if (arrangement === 'Trio') return 3;
    if (arrangement === 'Dupla') return 2;
    return 1;
};

const ImageUploadSlot = ({ imagePreview, onUploadClick, onDrop, onDragOver, onDragEnter, onDragLeave, isDragging, index, aspectRatio }: any) => {
    return (
        <div
            className={cn(
                "w-full h-full relative flex items-center justify-center bg-secondary/30 border-2 border-dashed rounded-lg transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border"
            )}
            onDrop={(e) => onDrop(e, index)}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            style={{ aspectRatio: aspectRatio || '1 / 1' }}
        >
            {imagePreview ? (
                <Image src={imagePreview} alt="Prévia da imagem" layout="fill" objectFit="contain" className="p-2"/>
            ) : (
                 <div className="text-center text-muted-foreground p-4 cursor-pointer" onClick={() => onUploadClick(index)}>
                    <Upload className="mx-auto h-8 w-8 mb-2" />
                    <h3 className="text-sm font-semibold">Arraste ou clique para enviar</h3>
                </div>
            )}
        </div>
    );
};

export default function MonteSeuQuadro() {
    const { addToCart } = useCart();
    const [arrangement, setArrangement] = useState<FrameArrangement>('Solo');
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([]);
    const [imageAspectRatios, setImageAspectRatios] = useState<(number | null)[]>([]);
    const [frameStyle, setFrameStyle] = useState('moderna');
    const [glassOption, setGlassOption] = useState('sem-vidro');
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>('frame_only');
    const environmentImage = "https://images.tcdn.com.br/img/img_prod/703418/papel_de_parede_adesivo_geometrico_costela_de_adao_clean_12087_1_de68faa1e068d65bd29f3d2e0cafe453.jpg";
    const [selectedSize, setSelectedSize] = useState(pricingData.Solo[1].tamanho);
    const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
    const frameColor = frames[selectedFrame as keyof typeof frames].color;
    const [isPriceVisible, setIsPriceVisible] = useState(true);
    const frameWidth = 10;

    const frameCount = getFrameCount(arrangement);
    
    useEffect(() => {
        const newFrameCount = getFrameCount(arrangement);
        setSelectedSize(pricingData[arrangement][1].tamanho);
        setImagePreviews(currentPreviews => {
            const newPreviews = Array(newFrameCount).fill(null);
            for (let i = 0; i < Math.min(currentPreviews.length, newFrameCount); i++) {
                newPreviews[i] = currentPreviews[i];
            }
            return newPreviews;
        });
        setImageAspectRatios(currentRatios => {
            const newRatios = Array(newFrameCount).fill(null);
            for (let i = 0; i < Math.min(currentRatios.length, newFrameCount); i++) {
                newRatios[i] = currentRatios[i];
            }
            return newRatios;
        });
    }, [arrangement]);

    const availableSizes = pricingData[arrangement];
    const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
    const finalPrice = glassOption === 'com-vidro' ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

    useEffect(() => {
        setIsPriceVisible(false);
        const timer = setTimeout(() => setIsPriceVisible(true), 200);
        return () => clearTimeout(timer);
    }, [finalPrice]);

    const processFile = (file: File, index: number) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;

                const img = document.createElement('img');
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    setImageAspectRatios(ratios => {
                        const newRatios = [...ratios];
                        newRatios[index] = aspectRatio;
                        return newRatios;
                    });
                };
                img.src = dataUrl;
                
                setImagePreviews(previews => {
                    const newPreviews = [...previews];
                    newPreviews[index] = dataUrl;
                    return newPreviews;
                });
            };
            reader.readAsDataURL(file);
        }
    }

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        processFile(file, index);
    };

    const handleImageRemove = (index: number) => {
        setImagePreviews(previews => {
            const newPreviews = [...previews];
            newPreviews[index] = null;
            return newPreviews;
        });
        setImageAspectRatios(ratios => {
            const newRatios = [...ratios];
            newRatios[index] = null;
            return newRatios;
        });
    };
    
    const handleUploadClick = (index: number) => fileInputRefs.current[index]?.click();
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file, index);
    };

    const handleAddToCart = () => {
        if (!selectedPriceInfo || !finalPrice || !allImagesUploaded) return;

        const itemToAdd = {
            id: `personalizado-${selectedSize}-${selectedFrame}-${glassOption}-${Date.now()}`,
            name: `Quadro Personalizado (${arrangement})`,
            price: finalPrice,
            quantity: 1,
            image: imagePreviews[0]!,
            options: `${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}, ${glassOption === 'com-vidro' ? 'Com Vidro' : 'Sem Vidro'}`,
            weight: selectedPriceInfo.weight,
            width: selectedPriceInfo.width,
            height: selectedPriceInfo.height,
            length: selectedPriceInfo.length,
        };
        addToCart(itemToAdd);
    };

    const allImagesUploaded = imagePreviews.every(img => img !== null);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-10 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-headline text-primary">Monte seu Quadro</h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Personalize sua arte, do seu jeito. Envie suas imagens e escolha cada detalhe.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                     <div className="lg:col-span-2">
                        <Card className="sticky top-24">
                           <CardContent className="p-4">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Button size="sm" variant={viewMode === 'environment' ? 'default' : 'outline'} onClick={() => setViewMode('environment')}><Eye className="mr-2" /> Ver no Ambiente</Button>
                                    <Button size="sm" variant={viewMode === 'frame_only' ? 'default' : 'outline'} onClick={() => setViewMode('frame_only')}><ImageIcon className="mr-2" /> Apenas o Quadro</Button>
                                </div>
                                <div className={cn("w-full relative rounded-lg bg-secondary/50 overflow-hidden", viewMode === 'environment' ? "aspect-video" : "aspect-auto")}>
                                     {viewMode === 'environment' && <Image src={environmentImage} alt="Ambiente" layout="fill" objectFit="cover" className="brightness-75" />}
                                    <div className={cn("relative flex items-center justify-center p-4", viewMode === 'environment' ? "absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "")}>
                                        <div className="flex items-center justify-center gap-4 w-full h-full max-w-4xl" style={{ transform: viewMode === 'environment' ? 'scale(0.8)' : 'none' }}>
                                            {Array.from({ length: frameCount }).map((_, index) => (
                                                <div key={index} className="w-full h-full flex items-center justify-center" style={{
                                                     border: `${frameWidth}px ${frameStyles[frameStyle as keyof typeof frameStyles] || 'solid'} ${frameColor}`,
                                                     boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                                     backgroundColor: 'white',
                                                     aspectRatio: imageAspectRatios[index] ? `${imageAspectRatios[index]}` : '1 / 1.25'
                                                }}>
                                                     <div className="relative w-full h-full">
                                                        <ImageUploadSlot index={index} imagePreview={imagePreviews[index]} onUploadClick={handleUploadClick} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} isDragging={isDragging} aspectRatio={imageAspectRatios[index]} />
                                                        {imagePreviews[index] && (
                                                            <>
                                                                {glassOption === 'com-vidro' && <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))' }} />}
                                                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full" onClick={() => handleImageRemove(index)}><X className="h-4 w-4" /></Button>
                                                            </>
                                                        )}
                                                         <input ref={el => fileInputRefs.current[index] = el} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, index)} />
                                                     </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                           </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="shadow-lg">
                           <CardContent className="p-4 space-y-2">
                                <div className="text-center h-10 flex items-center justify-center mb-4">
                                    <p className={cn("text-2xl md:text-3xl font-bold text-primary transition-opacity duration-300", isPriceVisible ? 'opacity-100' : 'opacity-0')}>
                                        {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione as opções'}
                                    </p>
                                </div>
                                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="text-base font-semibold"><ChevronsUpDown className="mr-2"/>Arranjo</AccordionTrigger>
                                        <AccordionContent>
                                            <RadioGroup value={arrangement} onValueChange={(v) => setArrangement(v as FrameArrangement)} className="grid grid-cols-3 gap-2 pt-2">
                                                <div><RadioGroupItem value="Solo" id="arr-solo" className="sr-only" /><Label htmlFor="arr-solo" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", arrangement === 'Solo' ? 'border-primary' : 'border-border')}>Solo</Label></div>
                                                <div><RadioGroupItem value="Dupla" id="arr-dupla" className="sr-only" /><Label htmlFor="arr-dupla" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", arrangement === 'Dupla' ? 'border-primary' : 'border-border')}>Dupla</Label></div>
                                                <div><RadioGroupItem value="Trio" id="arr-trio" className="sr-only" /><Label htmlFor="arr-trio" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", arrangement === 'Trio' ? 'border-primary' : 'border-border')}>Trio</Label></div>
                                            </RadioGroup>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger className="text-base font-semibold"><Ruler className="mr-2"/>Tamanho</AccordionTrigger>
                                        <AccordionContent>
                                             <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 gap-2 pt-2">
                                                 {availableSizes.map(({ tamanho }) => (
                                                    <div key={tamanho}>
                                                        <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                                                        <Label htmlFor={`size-${tamanho}`} className={cn("flex items-center justify-center cursor-pointer rounded-lg border-2 p-3 text-center transition-all h-20", selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                                                            <span className="font-semibold text-sm">{tamanho}</span>
                                                        </Label>
                                                    </div>
                                                ))}
                                             </RadioGroup>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger className="text-base font-semibold"><Palette className="mr-2"/>Cor da Moldura</AccordionTrigger>
                                        <AccordionContent>
                                             <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2 pt-2">
                                                {Object.entries(frames).map(([key, { label, color }]) => (
                                                    <div key={key}>
                                                        <RadioGroupItem value={key} id={`frame-color-${key}`} className="sr-only" />
                                                        <Label htmlFor={`frame-color-${key}`} className={cn("block cursor-pointer rounded-full border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')} title={label}>
                                                            <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} />
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="item-4">
                                        <AccordionTrigger className="text-base font-semibold"><Paintbrush className="mr-2"/>Estilo da Moldura</AccordionTrigger>
                                        <AccordionContent>
                                            <RadioGroup value={frameStyle} onValueChange={setFrameStyle} className="grid grid-cols-3 gap-2 pt-2">
                                                 <div><RadioGroupItem value="moderna" id="r1" className="sr-only" /><Label htmlFor="r1" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", frameStyle === 'moderna' ? 'border-primary' : 'border-border')}>Moderna</Label></div>
                                                 <div><RadioGroupItem value="classica" id="r2" className="sr-only" /><Label htmlFor="r2" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", frameStyle === 'classica' ? 'border-primary' : 'border-border')}>Clássica</Label></div>
                                                 <div><RadioGroupItem value="rustica" id="r3" className="sr-only" /><Label htmlFor="r3" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", frameStyle === 'rustica' ? 'border-primary' : 'border-border')}>Rústica</Label></div>
                                            </RadioGroup>
                                        </AccordionContent>
                                    </AccordionItem>
                                     <AccordionItem value="item-5" className="border-b-0">
                                        <AccordionTrigger className="text-base font-semibold"><GlassWater className="mr-2"/>Acabamento</AccordionTrigger>
                                        <AccordionContent>
                                            <RadioGroup value={glassOption} onValueChange={setGlassOption} className="grid grid-cols-2 gap-2 pt-2">
                                                 <div><RadioGroupItem value="com-vidro" id="g1" className="sr-only" /><Label htmlFor="g1" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", glassOption === 'com-vidro' ? 'border-primary' : 'border-border')}>Com Vidro</Label></div>
                                                 <div><RadioGroupItem value="sem-vidro" id="g2" className="sr-only" /><Label htmlFor="g2" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3 text-sm", glassOption === 'sem-vidro' ? 'border-primary' : 'border-border')}>Sem Vidro</Label></div>
                                            </RadioGroup>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <div className="pt-4">
                                     <Button size="lg" className="w-full font-headline text-lg md:text-xl" disabled={!allImagesUploaded} onClick={handleAddToCart}>
                                        <ShoppingCart className="mr-2" /> Adicionar ao Carrinho
                                    </Button>
                                    {!allImagesUploaded && <p className="text-xs text-center text-muted-foreground mt-2">Envie todas as imagens para poder adicionar ao carrinho.</p>}
                                </div>
                           </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

    