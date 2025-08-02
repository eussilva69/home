
'use client';

import { useState, useMemo, ChangeEvent, DragEvent, useCallback } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Ruler, Palette, UploadCloud, X, Loader2, Eye, Image as ImageIcon, Frame, Repeat, Columns, Copy } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const IMG_UPLOAD_KEY = "7ecf5602b8f3c01d2df1b966c1d018af";

// Preços com R$5 de acréscimo
const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 80.00, valor_com_vidro: 105.00, weight: 1.2, width: 33, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 145.00, valor_com_vidro: 200.00, weight: 1.8, width: 45, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 185.00, valor_com_vidro: 345.00, weight: 2.5, width: 53, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 460.00, valor_com_vidro: 636.00, weight: 3.5, width: 63, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 765.00, valor_com_vidro: 1075.00, weight: 5.0, width: 87, height: 123, length: 3 },
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 180.00, valor_com_vidro: 275.00, weight: 2.4, width: 68, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 265.00, valor_com_vidro: 385.00, weight: 3.6, width: 92, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 355.00, valor_com_vidro: 635.00, weight: 5.0, width: 108, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 845.00, valor_com_vidro: 1345.00, weight: 7.0, width: 128, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1375.00, valor_com_vidro: 2105.00, weight: 10.0, width: 176, height: 123, length: 3 },
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 265.00, valor_com_vidro: 415.00, weight: 3.6, width: 103, height: 45, length: 3 },
    { tamanho: "42x60 cm", valor_sem_vidro: 385.00, valor_com_vidro: 535.00, weight: 5.4, width: 139, height: 63, length: 3 },
    { tamanho: "50x70 cm", valor_sem_vidro: 500.00, valor_com_vidro: 765.00, weight: 7.5, width: 163, height: 73, length: 3 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1235.00, valor_com_vidro: 1725.00, weight: 10.5, width: 193, height: 87, length: 3 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2065.00, valor_com_vidro: 2875.00, weight: 15.0, width: 265, height: 123, length: 3 },
  ]
};

const frames = {
    black: { label: 'Preta', color: '#000000', rusticBorder: 'rgba(255,255,255,0.1)' },
    white: { label: 'Branca', color: '#FFFFFF', rusticBorder: 'rgba(0,0,0,0.1)' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B', rusticBorder: '#d4b18c' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E', rusticBorder: '#6d5a52' },
};

const frameStyles = {
    moderna: "Moderna",
    classica: "Clássica",
    rustica: "Rústica",
}

const environmentImage = "https://http2.mlstatic.com/D_NQ_NP_988953-MLB72022418120_102023-O.webp";

type ImageMode = 'global' | 'split' | 'individual';

export default function MonteSeuQuadroPage() {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const [arrangement, setArrangement] = useState<keyof typeof pricingData>('Solo');
    const [availableSizes, setAvailableSizes] = useState(pricingData['Solo']);
    const [selectedSize, setSelectedSize] = useState(availableSizes[0].tamanho);
    const [selectedFrameStyle, setSelectedFrameStyle] = useState(Object.keys(frameStyles)[0]);
    const [withGlass, setWithGlass] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);

    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null]);
    const [uploading, setUploading] = useState<(boolean | null)[]>([null]);
    const [dragging, setDragging] = useState<(boolean | null)[]>([null]);
    
    const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>('environment');
    const [imageMode, setImageMode] = useState<ImageMode>('global');

    const frameCount = useMemo(() => arrangement === 'Trio' ? 3 : arrangement === 'Dupla' ? 2 : 1, [arrangement]);

    const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
    const finalPrice = withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

    const handleArrangementChange = (value: string) => {
        const key = value as keyof typeof pricingData;
        setArrangement(key);
        const newSizes = pricingData[key];
        setAvailableSizes(newSizes);
        setSelectedSize(newSizes[0].tamanho);
        
        const newFrameCount = key === 'Trio' ? 3 : key === 'Dupla' ? 2 : 1;
        setImagePreviews(Array(newFrameCount).fill(null));
        setUploading(Array(newFrameCount).fill(false));
        setDragging(Array(newFrameCount).fill(false));
        
        if (key === 'Solo') {
            setImageMode('global');
        }
    };

    const handleImageUpload = async (file: File, index: number) => {
        setUploading(prev => prev.map((u, i) => i === index ? true : u));
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_UPLOAD_KEY}`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                const imageUrl = data.data.url;
                if (imageMode === 'individual') {
                    setImagePreviews(prev => prev.map((p, i) => i === index ? imageUrl : p));
                } else {
                    setImagePreviews(Array(frameCount).fill(imageUrl));
                }
                toast({ title: "Sucesso!", description: "Sua imagem foi enviada." });
            } else {
                throw new Error(data.error.message);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro no Upload", description: "Não foi possível enviar sua imagem. Tente novamente." });
        } finally {
            setUploading(prev => prev.map((u, i) => i === index ? false : u));
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0], index);
            e.target.value = ''; // Reset input to allow re-uploading the same file
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault(); e.stopPropagation();
        setDragging(prev => prev.map((d, i) => i === index ? false : d));
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0], index);
        }
    };
    
    const handleDragEvent = (e: DragEvent<HTMLDivElement>, isEntering: boolean, index: number) => {
        e.preventDefault(); e.stopPropagation();
        setDragging(prev => prev.map((d, i) => i === index ? isEntering : d));
    };

    const handleRemoveImage = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (imageMode === 'individual') {
            setImagePreviews(prev => prev.map((p, i) => i === index ? null : p));
        } else {
            setImagePreviews(Array(frameCount).fill(null));
        }
    };

    const handleAddToCart = () => {
        const hasImage = imagePreviews.some(p => p !== null);
        if (!hasImage) {
            toast({ variant: "destructive", title: "Imagem Faltando", description: "Por favor, envie uma imagem para o seu quadro." });
            return;
        }
        if (!selectedPriceInfo || !finalPrice) return;

        const itemToAdd = {
            id: `custom-${arrangement}-${selectedSize}-${selectedFrame}-${withGlass ? 'vidro' : 'sem-vidro'}-${Date.now()}`,
            name: "Quadro Personalizado",
            price: finalPrice,
            image: imagePreviews[0]!, // Use a primeira imagem como miniatura do carrinho
            quantity: 1,
            options: `Personalizado: ${arrangement}, ${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}, ${withGlass ? 'Com Vidro' : 'Sem Vidro'}`,
            weight: selectedPriceInfo.weight,
            width: selectedPriceInfo.width,
            height: selectedPriceInfo.height,
            length: selectedPriceInfo.length,
            customImages: imagePreviews.filter(p => p !== null) as string[], // Salva todas as imagens
        };
        addToCart(itemToAdd);
    };
    
    const FrameComponent = ({ children }: { children: React.ReactNode; }) => {
        const frameColor = frames[selectedFrame as keyof typeof frames].color;
        
        const frameStyleOptions: {[key: string]: React.CSSProperties} = {
            moderna: {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
                border: 'none',
            },
            classica: {
                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.3), inset 0px 0px 0px 4px rgba(0, 0, 0, 0.15)',
                border: 'none',
            },
            rustica: {
                 boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                 border: `1px solid ${frames[selectedFrame as keyof typeof frames].rusticBorder}`,
                 backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.02) 75%, transparent 75%, transparent 100%)',
                 backgroundSize: '8px 8px'
            }
        };

        return (
            <div 
                className="relative w-48 aspect-[4/5] p-2 transition-all duration-300"
                style={{ 
                    backgroundColor: frameColor,
                    ...frameStyleOptions[selectedFrameStyle] 
                }}
            >
                <div className="relative w-full h-full bg-white overflow-hidden">
                    {children}
                </div>
                 {withGlass && (
                    <div className="absolute inset-2 bg-black/10 backdrop-blur-[1px]"/>
                )}
            </div>
        )
    };

    const renderFrames = () => {
        return (
            <div className="flex justify-center items-center gap-4">
                {[...Array(frameCount)].map((_, i) => {
                     const imageSrc = imagePreviews[imageMode === 'individual' ? i : 0];
                     const imageStyle: React.CSSProperties = {};
                     if (imageMode === 'split' && frameCount > 1) {
                         imageStyle.objectPosition = `${(i * 100) / (frameCount - 1)}% 50%`;
                     }

                    return (
                    <label 
                        key={i}
                        htmlFor={`image-upload-${i}`}
                        className="cursor-pointer"
                        onDrop={(e) => handleDrop(e, i)}
                        onDragOver={(e) => handleDragEvent(e, true, i)}
                        onDragEnter={(e) => handleDragEvent(e, true, i)}
                        onDragLeave={(e) => handleDragEvent(e, false, i)}
                    >
                        <FrameComponent>
                        {imageSrc ? (
                            <>
                                <Image src={imageSrc} alt={`Pré-visualização ${i+1}`} layout="fill" objectFit="cover" style={imageStyle}/>
                                 <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 rounded-full h-7 w-7 z-10" onClick={(e) => handleRemoveImage(e, i)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </>
                        ) : uploading[i] ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className={cn("w-full h-full flex flex-col items-center justify-center bg-gray-100 text-muted-foreground", dragging[i] && "border-primary border-2 border-dashed")}>
                                <UploadCloud className="h-8 w-8 mb-2" />
                                <span className="text-xs text-center">Arraste ou clique para enviar</span>
                            </div>
                        )}
                        </FrameComponent>
                     </label>
                    )
                })}
                 <input 
                    id={`image-upload-0`}
                    type="file" 
                    className="sr-only" 
                    onChange={(e) => onFileChange(e, 0)} 
                    accept="image/*" 
                    multiple={false}
                />
                 {frameCount > 1 && [...Array(frameCount-1)].map((_, i) => (
                      <input 
                        key={i+1}
                        id={`image-upload-${i+1}`}
                        type="file" 
                        className="sr-only" 
                        onChange={(e) => onFileChange(e, i+1)} 
                        accept="image/*" 
                        multiple={false}
                        disabled={imageMode !== 'individual'}
                     />
                 ))}
            </div>
        )
    }

    return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-primary">Monte seu Quadro</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">Crie uma peça única com a sua imagem e do seu jeito.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Visualização */}
          <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                  <Button size="sm" variant={viewMode === 'environment' ? 'default' : 'outline'} onClick={() => setViewMode('environment')}>
                      <Eye className="mr-2 h-4 w-4" /> No Ambiente
                  </Button>
                  <Button size="sm" variant={viewMode === 'frame_only' ? 'default' : 'outline'} onClick={() => setViewMode('frame_only')}>
                      <ImageIcon className="mr-2 h-4 w-4" /> Somente o Quadro
                  </Button>
              </div>

             <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
                 {viewMode === 'environment' ? (
                     <>
                        <Image src={environmentImage} alt="Ambiente de exemplo" layout="fill" objectFit="cover" className="brightness-90"/>
                        <div className="relative">
                            {renderFrames()}
                        </div>
                     </>
                 ) : (
                     <div className="p-4">
                         {renderFrames()}
                     </div>
                 )}
            </div>

          </div>

          {/* Opções */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-primary mb-6">
                      {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione as opções'}
                  </p>
                  
                  <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                     <AccordionItem value="item-1">
                        <AccordionTrigger className="text-base font-semibold">Arranjo</AccordionTrigger>
                        <AccordionContent>
                           <RadioGroup value={arrangement} onValueChange={(v) => handleArrangementChange(v as any)} className="grid grid-cols-3 gap-3">
                                {Object.keys(pricingData).map((key) => (
                                    <div key={key}>
                                        <RadioGroupItem value={key} id={`arrangement-${key}`} className="sr-only" />
                                        <Label
                                            htmlFor={`arrangement-${key}`}
                                            className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-12", arrangement === key ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}
                                        >
                                            {key}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>

                    {arrangement !== 'Solo' && (
                        <AccordionItem value="item-image-mode">
                           <AccordionTrigger className="text-base font-semibold flex items-center gap-2"><ImageIcon/> Aplicação da Imagem</AccordionTrigger>
                           <AccordionContent>
                                <RadioGroup value={imageMode} onValueChange={(v) => setImageMode(v as any)} className="grid grid-cols-3 gap-3">
                                    <div>
                                        <RadioGroupItem value="global" id="mode-global" className="sr-only" />
                                        <Label htmlFor="mode-global" className={cn("flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-20", imageMode === 'global' ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                            <Repeat className="h-5 w-5 mb-1"/>
                                            Global
                                        </Label>
                                    </div>
                                     <div>
                                        <RadioGroupItem value="split" id="mode-split" className="sr-only" />
                                        <Label htmlFor="mode-split" className={cn("flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-20", imageMode === 'split' ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                            <Columns className="h-5 w-5 mb-1"/>
                                            Split
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="individual" id="mode-individual" className="sr-only" />
                                        <Label htmlFor="mode-individual" className={cn("flex flex-col items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-20", imageMode === 'individual' ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                            <Copy className="h-5 w-5 mb-1"/>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                           </AccordionContent>
                       </AccordionItem>
                    )}

                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-base font-semibold flex items-center gap-2"><Ruler/> Tamanho</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 gap-3">
                                {availableSizes.map(({ tamanho }) => (
                                    <div key={tamanho}>
                                        <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                                        <Label htmlFor={`size-${tamanho}`} className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-12", selectedSize === tamanho ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                            {tamanho}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger className="text-base font-semibold flex items-center gap-2"><Frame/> Estilo da Moldura</AccordionTrigger>
                        <AccordionContent>
                             <RadioGroup value={selectedFrameStyle} onValueChange={setSelectedFrameStyle} className="grid grid-cols-3 gap-3">
                                {Object.entries(frameStyles).map(([key, label]) => (
                                    <div key={key}>
                                        <RadioGroupItem value={key} id={`style-${key}`} className="sr-only" />
                                        <Label htmlFor={`style-${key}`} className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm transition-all h-12", selectedFrameStyle === key ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger className="text-base font-semibold flex items-center gap-2"><Palette/> Cor da Moldura</AccordionTrigger>
                        <AccordionContent>
                            <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-3">
                                {Object.entries(frames).map(([key, { label, color }]) => (
                                    <div key={key}>
                                        <RadioGroupItem value={key} id={`frame-${key}`} className="sr-only" />
                                        <Label htmlFor={`frame-${key}`} className={cn("block cursor-pointer rounded-full border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')}>
                                            <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: color }} title={label}/>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger className="text-base font-semibold">Acabamento</AccordionTrigger>
                        <AccordionContent>
                           <RadioGroup value={withGlass ? "com-vidro" : "sem-vidro"} onValueChange={(value) => setWithGlass(value === "com-vidro")} className="grid grid-cols-2 gap-3">
                                 <RadioGroupItem value="com-vidro" id="g1" className="sr-only" />
                                 <Label htmlFor="g1" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm h-12", withGlass ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                     Com Vidro
                                 </Label>
                                 <RadioGroupItem value="sem-vidro" id="g2" className="sr-only" />
                                 <Label htmlFor="g2" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm h-12", !withGlass ? 'border-primary bg-primary/5 font-semibold' : 'border-border')}>
                                     Sem Vidro
                                 </Label>
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button size="lg" className="w-full mt-8 text-base h-12" onClick={handleAddToCart} disabled={uploading.some(u => u)}>
                     {uploading.some(u => u) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2" />}
                     Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    );
}

    