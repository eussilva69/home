
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Ruler, Palette, GlassWater } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/schemas';
import type { CartItemType } from '@/hooks/use-cart';

const pricingData = {
  "Teste": [ { tamanho: "10x15 cm", valor_sem_vidro: 0.50, valor_com_vidro: 0.50, weight: 0.1, width: 10, height: 15, length: 1 } ],
  "Solo": [
    { tamanho: "30x42 cm", valor_sem_vidro: 75.00, valor_com_vidro: 100.00, weight: 1.2, width: 33, height: 45, length: 3 }, { tamanho: "42x60 cm", valor_sem_vidro: 140.00, valor_com_vidro: 195.00, weight: 1.8, width: 45, height: 63, length: 3 }, { tamanho: "50x70 cm", valor_sem_vidro: 180.00, valor_com_vidro: 340.00, weight: 2.5, width: 53, height: 73, length: 3 }, { tamanho: "60x84 cm", valor_sem_vidro: 455.00, valor_com_vidro: 631.00, weight: 3.5, width: 63, height: 87, length: 3 }, { tamanho: "84x120 cm", valor_sem_vidro: 760.00, valor_com_vidro: 1070.00, weight: 5.0, width: 87, height: 123, length: 3 },
  ],
  "Dupla": [
    { tamanho: "30x42 cm", valor_sem_vidro: 175.00, valor_com_vidro: 270.00, weight: 2.4, width: 68, height: 45, length: 3 }, { tamanho: "42x60 cm", valor_sem_vidro: 260.00, valor_com_vidro: 380.00, weight: 3.6, width: 92, height: 63, length: 3 }, { tamanho: "50x70 cm", valor_sem_vidro: 350.00, valor_com_vidro: 630.00, weight: 5.0, width: 108, height: 73, length: 3 }, { tamanho: "60x84 cm", valor_sem_vidro: 840.00, valor_com_vidro: 1340.00, weight: 7.0, width: 128, height: 87, length: 3 }, { tamanho: "84x120 cm", valor_sem_vidro: 1370.00, valor_com_vidro: 2100.00, weight: 10.0, width: 176, height: 123, length: 3 },
  ],
  "Trio": [
    { tamanho: "30x42 cm", valor_sem_vidro: 260.00, valor_com_vidro: 410.00, weight: 3.6, width: 103, height: 45, length: 3 }, { tamanho: "42x60 cm", valor_sem_vidro: 380.00, valor_com_vidro: 530.00, weight: 5.4, width: 139, height: 63, length: 3 }, { tamanho: "50x70 cm", valor_sem_vidro: 495.00, valor_com_vidro: 760.00, weight: 7.5, width: 163, height: 73, length: 3 }, { tamanho: "60x84 cm", valor_sem_vidro: 1230.00, valor_com_vidro: 1720.00, weight: 10.5, width: 193, height: 87, length: 3 }, { tamanho: "84x120 cm", valor_sem_vidro: 2060.00, valor_com_vidro: 2870.00, weight: 15.0, width: 265, height: 123, length: 3 },
  ]
};

const frames = {
    black: { label: 'Preta', color: '#000000' },
    white: { label: 'Branca', color: '#FFFFFF' },
    hazel_oak: { label: 'Carvalho Avelã', color: '#C19A6B' },
    ebony_oak: { label: 'Carvalho Ébano', color: '#55453E' },
};


type ProductConfigDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onAddToCart: (item: CartItemType) => void;
};

export default function ProductConfigDialog({ isOpen, onOpenChange, product, onAddToCart }: ProductConfigDialogProps) {
  const arrangementKey = product?.arrangement as keyof typeof pricingData || 'Solo';
  const availableSizes = pricingData[arrangementKey];
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[0].tamanho);
  const [withGlass, setWithGlass] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(Object.keys(frames)[0]);
  const [quantity, setQuantity] = useState(1);
  
  // Reset state when product changes
  useEffect(() => {
    if (product) {
      const newAvailableSizes = pricingData[product.arrangement as keyof typeof pricingData] || pricingData['Solo'];
      setSelectedSize(newAvailableSizes[0].tamanho);
      setWithGlass(false);
      setSelectedFrame(Object.keys(frames)[0]);
      setQuantity(1);
    }
  }, [product]);

  const selectedPriceInfo = availableSizes.find(s => s.tamanho === selectedSize);
  const finalPrice = withGlass ? selectedPriceInfo?.valor_com_vidro : selectedPriceInfo?.valor_sem_vidro;

  const handleAddToCart = () => {
    if (!product || !selectedPriceInfo || !finalPrice) return;
    
    const itemToAdd: CartItemType = {
        id: `${product.id}-${selectedSize}-${selectedFrame}-${withGlass ? 'vidro' : 'sem-vidro'}`,
        name: product.name,
        price: finalPrice,
        image: product.image,
        quantity: quantity,
        options: `${selectedSize}, ${frames[selectedFrame as keyof typeof frames].label}, ${withGlass ? 'Com Vidro' : 'Sem Vidro'}`,
        weight: selectedPriceInfo.weight,
        width: selectedPriceInfo.width,
        height: selectedPriceInfo.height,
        length: selectedPriceInfo.length,
    };
    onAddToCart(itemToAdd);
    onOpenChange(false);
  };
  
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Produto: {product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Left side: options */}
            <div className="space-y-4">
                <div>
                    <Label className="text-base font-medium mb-2 flex items-center gap-2"><Ruler/> Tamanho</Label>
                    <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-2 gap-2">
                        {availableSizes.map(({ tamanho }) => (
                            <div key={tamanho}>
                                <RadioGroupItem value={tamanho} id={`size-modal-${tamanho}`} className="sr-only" />
                                <Label htmlFor={`size-modal-${tamanho}`} className={cn("flex h-12 items-center justify-center cursor-pointer rounded-md border-2 p-3 text-center text-sm", selectedSize === tamanho ? 'border-primary' : 'border-border')}>
                                    {tamanho}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <div>
                    <Label className="text-base font-medium mb-2 flex items-center gap-2"><Palette/> Cor da Moldura</Label>
                    <RadioGroup value={selectedFrame} onValueChange={setSelectedFrame} className="flex items-center gap-2">
                        {Object.entries(frames).map(([key, { label, color }]) => (
                            <div key={key}>
                                <RadioGroupItem value={key} id={`frame-color-modal-${key}`} className="sr-only" />
                                <Label htmlFor={`frame-color-modal-${key}`} className={cn("block cursor-pointer rounded-full border-2 p-1 transition-all", selectedFrame === key ? 'border-primary' : 'border-transparent')} title={label}>
                                    <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} />
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <div>
                    <Label className="text-base font-medium mb-2 flex items-center gap-2"><GlassWater/> Acabamento</Label>
                     <RadioGroup value={withGlass ? "com-vidro" : "sem-vidro"} onValueChange={(value) => setWithGlass(value === "com-vidro")} className="grid grid-cols-2 gap-2">
                         <RadioGroupItem value="com-vidro" id="g1-modal" className="sr-only" />
                         <Label htmlFor="g1-modal" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-sm h-12", withGlass ? 'border-primary' : 'border-border')}>Com Vidro</Label>
                         <RadioGroupItem value="sem-vidro" id="g2-modal" className="sr-only" />
                         <Label htmlFor="g2-modal" className={cn("flex items-center justify-center cursor-pointer rounded-md border-2 p-3 text-sm h-12", !withGlass ? 'border-primary' : 'border-border')}>Sem Vidro</Label>
                    </RadioGroup>
                </div>
            </div>
            {/* Right side: summary */}
            <div className="space-y-4 rounded-lg bg-secondary/50 p-4 flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Resumo da Seleção</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Tamanho:</strong> {selectedSize}</p>
                        <p><strong>Moldura:</strong> {frames[selectedFrame as keyof typeof frames].label}</p>
                        <p><strong>Acabamento:</strong> {withGlass ? 'Com Vidro' : 'Sem Vidro'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <Separator/>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="quantity">Quantidade:</Label>
                        <Input 
                            id="quantity"
                            type="number" 
                            min="1" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">Preço Total:</p>
                        <p className="text-2xl font-bold">
                            {finalPrice ? `R$ ${(finalPrice * quantity).toFixed(2).replace('.', ',')}` : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleAddToCart} disabled={!finalPrice}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
