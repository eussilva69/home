
'use client';

import { useState, ChangeEvent, useRef, DragEvent } from 'react';
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
    { tamanho: "30x42 cm", valor_sem_vidro: 85.00, valor_com_vidro: 110.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 150.00, valor_com_vidro: 205.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 190.00, valor_com_vidro: 350.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 465.00, valor_com_vidro: 641.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 770.00, valor_com_vidro: 1080.00 }
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 185.00, valor_com_vidro: 280.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 270.00, valor_com_vidro: 390.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 360.00, valor_com_vidro: 640.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 850.00, valor_com_vidro: 1350.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 1380.00, valor_com_vidro: 2110.00 }
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 270.00, valor_com_vidro: 420.00 },
    { tamanho: "42x60 cm", valor_sem_vidro: 390.00, valor_com_vidro: 540.00 },
    { tamanho: "50x70 cm", valor_sem_vidro: 505.00, valor_com_vidro: 770.00 },
    { tamanho: "60x84 cm", valor_sem_vidro: 1240.00, valor_com_vidro: 1730.00 },
    { tamanho: "84x120 cm", valor_sem_vidro: 2070.00, valor_com_vidro: 2880.00 }
  ]
};

export default function MonteSeuQuadro() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [frameStyle, setFrameStyle] = useState('moderna');
  const [glassOption, setGlassOption] = useState('sem-vidro');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [arrangement, setArrangement] = useState<keyof typeof pricingData>('Solo');
  const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>('frame_only');
  const environmentImage = "https://images.tcdn.com.br/img/img_prod/703418/papel_de_parede_adesivo_geometrico_costela_de_adao_clean_12087_1_de68faa1e068d65bd29f3d2e0cafe453.jpg";
  
  const availableSizes = pricingData[arrangement];
  const [selectedSize, setSelectedSize] = useState(availableSizes[1].tamanho);

  const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
  const finalPrice = glassOption === 'com-vidro' ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;
  
  const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
  };

  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
  const frameColor = frames[selectedFrame as keyof typeof frames].color;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const frameStyles = {
    moderna: 'solid',
    classica: 'double',
    rustica: 'groove',
  };

  const frameWidth = 15;

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const humanHeightPx = 120;
  const humanImage = "https://i.ibb.co/q3tBWm6C/pngwing-com.png";

  const getFrameDimensions = (sizeString: string) => {
    const [w_cm, h_cm] = sizeString.replace(' cm', '').split('x').map(Number);
    const scaleFactor = humanHeightPx / 170;
    return {
      width: w_cm * scaleFactor,
      height: h_cm * scaleFactor
    };
  };

  const getFrameDimensionsForPreview = (sizeString: string) => {
    const [w_cm, h_cm] = sizeString.replace(' cm', '').split('x').map(Number);
    // Adjusted scale factor for better visualization in the environment
    const scaleFactor = 0.8; 
    return {
      width: w_cm * scaleFactor,
      height: h_cm * scaleFactor,
    };
  };

  const frameCount = arrangement === 'Trio' ? 3 : (arrangement === 'Dupla' ? 2 : 1);
  const frameDimensions = getFrameDimensionsForPreview(selectedSize);

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
            <div 
              className={cn(
                  "w-full aspect-square relative flex items-center justify-center bg-secondary/50 border-2 border-dashed transition-colors",
                  isDragging ? "border-primary bg-primary/10" : "border-border",
                  viewMode === 'environment' && "border-none"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {viewMode === 'environment' && <Image src={environmentImage} alt="Ambiente" layout="fill" objectFit="cover" className="brightness-75" />}

              {imagePreview ? (
                <div 
                  className={cn(
                    "flex items-center justify-center gap-4 transition-all",
                    viewMode === 'frame_only' ? "relative p-4 md:p-12 w-full h-full" : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  )}
                  style={viewMode === 'environment' ? {
                    width: `${frameDimensions.width * frameCount + (frameCount > 1 ? 8 * (frameCount -1) : 0)}px`,
                    height: `${frameDimensions.height}px`,
                  } : {}}
                >
                  {[...Array(frameCount)].map((_, i) => (
                    <div 
                      key={i}
                      className="relative w-full h-full"
                      style={{
                        border: `${frameWidth}px ${frameStyles[frameStyle as keyof typeof frameStyles] || 'solid'} ${frameColor}`,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Image
                          src={imagePreview}
                          alt="Prévia da imagem"
                          layout="fill"
                          objectFit="cover"
                      />
                      {glassOption === 'com-vidro' && (
                          <div 
                              className="absolute inset-0 w-full h-full"
                              style={{
                                  backdropFilter: 'brightness(0.98)',
                                  background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))',
                              }}
                          />
                      )}
                    </div>
                  ))}
                  <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full"
                      onClick={() => setImagePreview(null)}
                  >
                      <X className="h-4 w-4"/>
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4 pointer-events-none z-10">
                    <Upload className="mx-auto h-10 w-10 md:h-12 md:w-12 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold">Sua arte começa aqui</h3>
                    <p className="text-sm md:text-base">Arraste e solte uma imagem ou clique no botão abaixo.</p>
                     <Button onClick={handleUploadClick} className="mt-4 pointer-events-auto">
                        <Upload className="mr-2" /> Enviar Imagem
                    </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
             <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione as opções'}
                </p>
             </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Upload className="h-5 w-5" />Opções de Upload</CardTitle></CardHeader>
              <CardContent>
                <Input ref={fileInputRef} id="picture" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Button onClick={handleUploadClick} className="w-full">{imagePreview ? 'Trocar Imagem' : 'Enviar Imagem'}</Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Arranjo</CardTitle></CardHeader>
                <CardContent>
                    <RadioGroup value={arrangement} onValueChange={(v) => {setArrangement(v as keyof typeof pricingData); setSelectedSize(pricingData[v as keyof typeof pricingData][1].tamanho);}} className="grid grid-cols-3 gap-2">
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
                    const frameCount = arrangement === 'Trio' ? 3 : (arrangement === 'Dupla' ? 2 : 1);
                    const totalWidth = width * frameCount + (frameCount > 1 ? 8 * (frameCount - 1) : 0);
                    return (
                      <div key={tamanho}>
                        <RadioGroupItem value={tamanho} id={`size-${tamanho}`} className="sr-only" />
                        <Label htmlFor={`size-${tamanho}`} className={cn("flex flex-col items-center justify-between cursor-pointer rounded-lg border-2 p-2 text-center transition-all w-28 h-40", selectedSize === tamanho ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                          <div className="w-full flex-grow flex items-end justify-center gap-2" style={{ transform: 'scale(0.8)' }}>
                            <Image src={humanImage} alt="Silhueta humana" width={30} height={humanHeightPx} style={{height: `${humanHeightPx}px`}}/>
                            <div className='flex items-center justify-center' style={{height: `${humanHeightPx}px`}}>
                              <div className="flex items-center justify-center gap-1" style={{ width: `${totalWidth}px`, height: `${height}px` }}>
                                {[...Array(frameCount)].map((_, i) => (<div key={i} className="bg-primary/50" style={{ width: `${width}px`, height: `${height}px`}} />))}
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

            <Button size="lg" className="w-full font-headline text-lg md:text-xl">
              Finalizar e Comprar
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
