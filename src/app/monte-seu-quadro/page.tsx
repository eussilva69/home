
'use client';

import { useState, ChangeEvent, useRef, DragEvent } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Palette, GlassWater, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function MonteSeuQuadro() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [frameStyle, setFrameStyle] = useState('moderna');
  const [glassOption, setGlassOption] = useState('sem-vidro');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const frameWidth = 15; // Fixed frame width

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
             <div 
                className={cn(
                    "w-full aspect-square relative flex items-center justify-center bg-secondary/50 border-2 border-dashed transition-colors",
                    isDragging ? "border-primary bg-primary/10" : "border-border"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
             >
                {imagePreview ? (
                     <div 
                        className="relative w-full h-full p-4 md:p-12 transition-all"
                     >
                        <div 
                            className="absolute inset-0 m-auto transition-all"
                            style={{
                                border: `${frameWidth}px ${frameStyles[frameStyle as keyof typeof frameStyles] || 'solid'} ${frameColor}`,
                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                width: `calc(100% - ${frameWidth * 2}px)`,
                                height: `calc(100% - ${frameWidth * 2}px)`,
                            }}
                        />
                        <Image
                            src={imagePreview}
                            alt="Prévia da imagem"
                            layout="fill"
                            objectFit="contain"
                            className="p-2"
                            style={{
                                padding: `${frameWidth + 5}px`
                            }}
                        />
                         {glassOption === 'com-vidro' && (
                            <div 
                                className="absolute inset-0 w-full h-full"
                                style={{
                                    backdropFilter: 'brightness(0.98)',
                                    background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))',
                                    padding: `${frameWidth}px`,
                                    boxSizing: 'border-box',
                                }}
                            />
                        )}
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
                    <div className="text-center text-muted-foreground p-4 pointer-events-none">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg"><Upload className="h-5 w-5" />Opções de Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  ref={fileInputRef}
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                 <Button onClick={handleUploadClick} className="w-full">
                    {imagePreview ? 'Trocar Imagem' : 'Enviar Imagem'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
               <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Cor da Moldura</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2">
                    {Object.entries(frames).map(([key, { label, color }]) => (
                        <div key={key}>
                            <RadioGroupItem value={key} id={`frame-color-${key}`} className="sr-only" />
                            <Label 
                              htmlFor={`frame-color-${key}`} 
                              className={cn(
                                "block cursor-pointer rounded-md border-2 p-1 transition-all", 
                                selectedFrame === key ? 'border-primary' : 'border-transparent'
                              )}
                              title={label}
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-md border" style={{ backgroundColor: color }} />
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg"><Palette className="h-5 w-5" />Estilo da Moldura</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={frameStyle} onValueChange={setFrameStyle} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="moderna" id="r1" />
                            <Label htmlFor="r1">Moderna</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="classica" id="r2" />
                            <Label htmlFor="r2">Clássica</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rustica" id="r3" />
                            <Label htmlFor="r3">Rústica</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg"><GlassWater className="h-5 w-5" />Acabamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={glassOption} onValueChange={setGlassOption} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="com-vidro" id="g1" />
                            <Label htmlFor="g1">Com Vidro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sem-vidro" id="g2" />
                            <Label htmlFor="g2">Sem Vidro</Label>
                        </div>
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

    