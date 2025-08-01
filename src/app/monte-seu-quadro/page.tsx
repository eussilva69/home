
'use client';

import { useState, ChangeEvent, useRef, DragEvent, useEffect } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Palette, GlassWater, X, Image as ImageIcon, Eye, Ruler, Info } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const pricingData = {
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 95.00, valor_com_vidro: 120.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 160.00, valor_com_vidro: 215.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 200.00, valor_com_vidro: 360.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 475.00, valor_com_vidro: 651.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 780.00, valor_com_vidro: 1090.00 }
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 195.00, valor_com_vidro: 290.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 280.00, valor_com_vidro: 400.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 370.00, valor_com_vidro: 650.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 860.00, valor_com_vidro: 1360.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1390.00, valor_com_vidro: 2120.00 }
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 280.00, valor_com_vidro: 430.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 400.00, valor_com_vidro: 550.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 515.00, valor_com_vidro: 780.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1250.00, valor_com_vidro: 1740.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2080.00, valor_com_vidro: 2890.00 }
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

// Componente para o slot de upload de imagem individual
const ImageUploadSlot = ({ imagePreview, onImageChange, onImageRemove, onUploadClick, onDrop, onDragOver, onDragEnter, onDragLeave, isDragging, frameColor, frameStyle, glassOption, frameWidth, index }: any) => {
    return (
        <div
            className={cn(
                "w-full aspect-[3/4] relative flex items-center justify-center bg-secondary/30 border-2 border-dashed transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border"
            )}
            onDrop={(e) => onDrop(e, index)}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
        >
            {imagePreview ? (
                <div className="relative w-full h-full">
                    <div
                        className="relative w-full h-full"
                        style={{
                            border: `${frameWidth}px ${frameStyles[frameStyle as keyof typeof frameStyles] || 'solid'} ${frameColor}`,
                        }}
                    >
                        <Image src={imagePreview} alt="Prévia da imagem" layout="fill" objectFit="cover" />
                        {glassOption === 'com-vidro' && (
                            <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))' }} />
                        )}
                    </div>
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full" onClick={() => onImageRemove(index)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-4 pointer-events-none">
                    <Upload className="mx-auto h-8 w-8 mb-2" />
                    <h3 className="text-sm font-semibold">Arraste ou clique</h3>
                    <Button onClick={() => onUploadClick(index)} className="mt-2 pointer-events-auto" size="sm">
                        <Upload className="mr-2 h-4 w-4" /> Enviar
                    </Button>
                </div>
            )}
        </div>
    );
};

export default function MonteSeuQuadro() {
    const [arrangement, setArrangement] = useState<FrameArrangement>('Solo');
    const frameCount = getFrameCount(arrangement);
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(frameCount).fill(null));

    const [frameStyle, setFrameStyle] = useState('moderna');
    const [glassOption, setGlassOption] = useState('sem-vidro');
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>('frame_only');
    const environmentImage = "https://images.tcdn.com.br/img/img_prod/703418/papel_de_parede_adesivo_geometrico_costela_de_adao_clean_12087_1_de68faa1e068d65bd29f3d2e0cafe453.jpg";
    const availableSizes = pricingData[arrangement];
    const [selectedSize, setSelectedSize] = useState(availableSizes[1].tamanho);
    const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
    const frameColor = frames[selectedFrame as keyof typeof frames].color;
    const [isPriceVisible, setIsPriceVisible] = useState(true);
    const frameWidth = 5;

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
    }, [arrangement]);

    const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
    const finalPrice = glassOption === 'com-vidro' ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

    useEffect(() => {
        setIsPriceVisible(false);
        const timer = setTimeout(() => {
            setIsPriceVisible(true);
        }, 200);
        return () => clearTimeout(timer);
    }, [finalPrice]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...imagePreviews];
                newPreviews[index] = reader.result as string;
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = (index: number) => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = null;
        setImagePreviews(newPreviews);
    };

    const handleUploadClick = (index: number) => {
        fileInputRefs.current[index]?.click();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...imagePreviews];
                newPreviews[index] = reader.result as string;
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const humanHeightPx = 120;
    const humanImage = "https://i.ibb.co/q3tBWm6C/pngwing-com.png";

    const getFrameDimensions = (sizeString: string) => {
        const [w_cm, h_cm] = sizeString.replace(' cm', '').split('x').map(Number);
        const scaleFactor = humanHeightPx / 170;
        return { width: w_cm * scaleFactor, height: h_cm * scaleFactor };
    };

    const hasAnyImage = imagePreviews.some(img => img !== null);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-10 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-headline text-primary">Monte seu Quadro</h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Personalize sua arte, do seu jeito.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Button size="sm" variant={viewMode === 'environment' ? 'default' : 'outline'} onClick={() => setViewMode('environment')}>
                                <Eye className="mr-2" /> Ver no Ambiente
                            </Button>
                            <Button size="sm" variant={viewMode === 'frame_only' ? 'default' : 'outline'} onClick={() => setViewMode('frame_only')}>
                                <ImageIcon className="mr-2" /> Apenas o Quadro
                            </Button>
                        </div>
                        <div className={cn("w-full relative", viewMode === 'frame_only' ? 'aspect-square' : '')}>
                            {viewMode === 'environment' && (
                                <div className="relative w-full aspect-square">
                                    <Image src={environmentImage} alt="Ambiente" layout="fill" objectFit="cover" className="brightness-75" />
                                </div>
                            )}

                            <div className={cn(
                                "flex items-center justify-center gap-4 transition-all",
                                viewMode === 'environment'
                                    ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full p-4"
                                    : "relative p-4 md:p-12 w-full h-full"
                            )}>
                                <div
                                    className="flex items-center justify-center w-full max-w-4xl gap-4"
                                    style={{
                                        transform: viewMode === 'environment' ? 'scale(0.5) translateY(-30%)' : 'none'
                                    }}
                                >
                                    {Array.from({ length: frameCount }).map((_, index) => (
                                        <div key={index} className="w-full">
                                            <ImageUploadSlot
                                                index={index}
                                                imagePreview={imagePreviews[index]}
                                                onImageChange={handleImageChange}
                                                onImageRemove={handleImageRemove}
                                                onUploadClick={handleUploadClick}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                isDragging={isDragging}
                                                frameColor={frameColor}
                                                frameStyle={frameStyle}
                                                glassOption={glassOption}
                                                frameWidth={frameWidth}
                                            />
                                            <input ref={el => fileInputRefs.current[index] = el} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, index)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {!hasAnyImage && viewMode === 'frame_only' && (
                                <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground p-4 pointer-events-none">
                                    <div>
                                        <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 mb-4" />
                                        <h3 className="text-base md:text-lg font-semibold">Sua arte começa aqui</h3>
                                        <p className="text-sm md:text-base">Arraste uma imagem para um dos quadros ou clique em "Enviar".</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center h-10 flex items-center justify-center">
                            <p className={cn("text-2xl md:text-3xl font-bold text-primary transition-opacity duration-300", isPriceVisible ? 'opacity-100' : 'opacity-0')}>
                                {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione as opções'}
                            </p>
                        </div>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Arranjo</CardTitle></CardHeader>
                            <CardContent>
                                <RadioGroup value={arrangement} onValueChange={(v) => { setArrangement(v as FrameArrangement); }} className="grid grid-cols-3 gap-2">
                                    <div><RadioGroupItem value="Solo" id="arr-solo" className="sr-only" /><Label htmlFor="arr-solo" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3", arrangement === 'Solo' ? 'border-primary' : 'border-border')}>Solo</Label></div>
                                    <div><RadioGroupItem value="Dupla" id="arr-dupla" className="sr-only" /><Label htmlFor="arr-dupla" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3", arrangement === 'Dupla' ? 'border-primary' : 'border-border')}>Dupla</Label></div>
                                    <div><RadioGroupItem value="Trio" id="arr-trio" className="sr-only" /><Label htmlFor="arr-trio" className={cn("flex justify-center cursor-pointer rounded-md border-2 p-3", arrangement === 'Trio' ? 'border-primary' : 'border-border')}>Trio</Label></div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Ruler className="h-5 w-5" />Tamanho</CardTitle></CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                                    {availableSizes.map(({ tamanho }) => {
                                        const { width, height } = getFrameDimensions(tamanho);
                                        const totalWidth = width * frameCount + (frameCount > 1 ? 8 * (frameCount - 1) : 0);
                                        return (
                                            <div key={tamanho}>
                                                <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                                                <Label htmlFor={`size-${tamanho}`} className={cn("flex flex-col items-center justify-between cursor-pointer rounded-lg border-2 p-2 text-center transition-all w-28 h-40", selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                                                    <div className="w-full flex-grow flex items-end justify-center gap-2" style={{ transform: 'scale(0.8)' }}>
                                                        <Image src={humanImage} alt="Silhueta humana" width={30} height={humanHeightPx} style={{ height: `${humanHeightPx}px` }} />
                                                        <div className='flex items-center justify-center' style={{ height: `${humanHeightPx}px` }}>
                                                            <div className="flex items-center justify-center gap-1" style={{ width: `${totalWidth}px`, height: `${height}px` }}>
                                                                {[...Array(frameCount)].map((_, i) => (<div key={i} className="bg-primary/50" style={{ width: `${width}px`, height: `${height}px` }} />))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='w-full text-center py-1'><span className="font-semibold text-sm">{tamanho}</span><span className="block text-xs text-muted-foreground">{arrangement}</span></div>
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Cor da Moldura</CardTitle></CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2">
                                    {Object.entries(frames).map(([key, { label, color }]) => (
                                        <div key={key}>
                                            <RadioGroupItem value={key} id={`frame-color-${key}`} className="sr-only" />
                                            <Label htmlFor={`frame-color-${key}`} className={cn("block cursor-pointer rounded-md border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')} title={label}>
                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-md border" style={{ backgroundColor: color }} />
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Estilo da Moldura</CardTitle></CardHeader>
                            <CardContent>
                                <RadioGroup value={frameStyle} onValueChange={setFrameStyle} className="space-y-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="moderna" id="r1" /><Label htmlFor="r1">Moderna</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="classica" id="r2" /><Label htmlFor="r2">Clássica</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="rustica" id="r3" /><Label htmlFor="r3">Rústica</Label></div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><GlassWater className="h-5 w-5" />Acabamento</CardTitle></CardHeader>
                            <CardContent>
                                <RadioGroup value={glassOption} onValueChange={setGlassOption} className="space-y-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="com-vidro" id="g1" /><Label htmlFor="g1">Com Vidro</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="sem-vidro" id="g2" /><Label htmlFor="g2">Sem Vidro</Label></div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        <Button size="lg" className="w-full font-headline text-lg md:text-xl" disabled={!imagePreviews.every(img => img !== null)}>
                            Finalizar e Comprar
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
