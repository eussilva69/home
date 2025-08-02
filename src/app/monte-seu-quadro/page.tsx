
'use client';

import { useState, useMemo, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Ruler, Palette, UploadCloud, X, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
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
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
};

const environmentImage = "https://images.tcdn.com.br/img/img_prod/703418/papel_de_parede_adesivo_geometrico_costela_de_adao_clean_12087_1_de68faa1e068d65bd29f3d2e0cafe453.jpg";

export default function MonteSeuQuadroPage() {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const [arrangement, setArrangement] = useState<keyof typeof pricingData>('Solo');
    const [availableSizes, setAvailableSizes] = useState(pricingData['Solo']);
    const [selectedSize, setSelectedSize] = useState(availableSizes[0].tamanho);
    const [withGlass, setWithGlass] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState<'environment' | 'frame_only'>('environment');

    const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
    const finalPrice = withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

    const handleArrangementChange = (value: string) => {
        const key = value as keyof typeof pricingData;
        setArrangement(key);
        const newSizes = pricingData[key];
        setAvailableSizes(newSizes);
        setSelectedSize(newSizes[0].tamanho);
    };

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_UPLOAD_KEY}`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setImagePreview(data.data.url);
                toast({ title: "Sucesso!", description: "Sua imagem foi enviada." });
            } else {
                throw new Error(data.error.message);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro no Upload", description: "Não foi possível enviar sua imagem. Tente novamente." });
        } finally {
            setIsUploading(false);
        }
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };
    
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };


    const handleAddToCart = () => {
        if (!imagePreview) {
            toast({ variant: "destructive", title: "Imagem Faltando", description: "Por favor, envie uma imagem para o seu quadro." });
            return;
        }
        if (!selectedPriceInfo || !finalPrice) return;

        const itemToAdd = {
            id: `custom-${arrangement}-${selectedSize}-${selectedFrame}-${withGlass ? 'vidro' : 'sem-vidro'}-${Date.now()}`,
            name: "Quadro Personalizado",
            price: finalPrice,
            image: imagePreview,
            quantity: 1,
            options: `Personalizado: ${arrangement}, ${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}, ${withGlass ? 'Com Vidro' : 'Sem Vidro'}`,
            weight: selectedPriceInfo.weight,
            width: selectedPriceInfo.width,
            height: selectedPriceInfo.height,
            length: selectedPriceInfo.length,
        };
        addToCart(itemToAdd);
    };
    
    const FrameComponent = ({ children }: { children: React.ReactNode }) => (
        <div className="relative w-full aspect-[4/5] p-4" style={{ backgroundColor: frames[selectedFrame as keyof typeof frames].color, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <div className="relative w-full h-full bg-white">
                {children}
            </div>
             {withGlass && (
                <div className="absolute inset-4 bg-black/10 backdrop-blur-[1px]"/>
            )}
        </div>
    );

    const renderFrames = () => {
        const count = arrangement === 'Trio' ? 3 : arrangement === 'Dupla' ? 2 : 1;
        return (
            <div className={`grid grid-cols-${count} gap-4`}>
                {[...Array(count)].map((_, i) => (
                    <FrameComponent key={i}>
                       {imagePreview ? (
                            <Image src={imagePreview} alt="Pré-visualização do quadro" layout="fill" objectFit="cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-muted-foreground text-xs text-center">Sua arte aqui</span>
                          </div>
                       )}
                    </FrameComponent>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Visualização */}
          <div className="flex flex-col gap-4">
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
                        <div className="relative w-1/3">
                            {renderFrames()}
                        </div>
                     </>
                 ) : (
                     <div className="w-2/3">
                         {renderFrames()}
                     </div>
                 )}
            </div>
            
            <Card>
                <CardHeader><CardTitle className="text-lg">Envie sua imagem</CardTitle></CardHeader>
                <CardContent>
                    <div 
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors",
                            isDragging && "bg-muted border-primary",
                            imagePreview && "border-none"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                       {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Sua imagem" layout="fill" objectFit="cover" className="rounded-md" />
                                <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 rounded-full h-7 w-7" onClick={() => setImagePreview(null)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </>
                       ) : isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                       ) : (
                           <>
                             <UploadCloud className="h-8 w-8 text-muted-foreground" />
                             <p className="text-sm text-muted-foreground mt-2">Arraste ou clique para enviar</p>
                             <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onFileChange} accept="image/*" />
                           </>
                       )}
                    </div>
                </CardContent>
            </Card>

          </div>

          {/* Opções */}
          <div className="space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-primary mb-6">
                      {finalPrice ? `R$ ${finalPrice.toFixed(2).replace('.', ',')}` : 'Selecione as opções'}
                  </p>
                  
                  <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                     <AccordionItem value="item-1">
                        <AccordionTrigger className="text-base font-semibold">Arranjo</AccordionTrigger>
                        <AccordionContent>
                           <Select value={arrangement} onValueChange={handleArrangementChange}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Solo">Solo (1 quadro)</SelectItem>
                                    <SelectItem value="Dupla">Dupla (2 quadros)</SelectItem>
                                    <SelectItem value="Trio">Trio (3 quadros)</SelectItem>
                                </SelectContent>
                            </Select>
                        </AccordionContent>
                    </AccordionItem>
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
                     <AccordionItem value="item-4">
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

                  <Button size="lg" className="w-full mt-8 text-base h-12" onClick={handleAddToCart} disabled={!imagePreview || isUploading}>
                     {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2" />}
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
