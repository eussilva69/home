
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById, updateProduct, uploadImage } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { productUpdateSchema, type ProductUpdatePayload } from '@/lib/schemas';
import NextImage from 'next/image';

const ImageUploadField = ({
  label,
  currentImageUrl,
  onImageUpload,
  isUploading,
}: {
  label: string;
  currentImageUrl?: string;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
}) => {
  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-4">
        {currentImageUrl ? (
          <NextImage src={currentImageUrl} alt={`Current ${label}`} width={80} height={80} className="rounded-md object-cover bg-muted" />
        ) : (
          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="relative">
          <Button type="button" variant="outline" disabled={isUploading}>
            {isUploading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
            Alterar Imagem
          </Button>
          <Input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
};


export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const form = useForm<ProductUpdatePayload>({
    resolver: zodResolver(productUpdateSchema),
  });

  const fetchProduct = useCallback(async () => {
    if (productId) {
      setLoading(true);
      const result = await getProductById(productId);
      if (result.success && result.data) {
        const productData = result.data as Product;
        setProduct(productData);
        form.reset({
          name: productData.name,
          price: productData.price,
          image: productData.image,
          image_alt: productData.image_alt,
          artwork_image: productData.artwork_image,
          imagesByColor: productData.imagesByColor || {},
        });
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message });
        router.push('/dashboard/products');
      }
      setLoading(false);
    }
  }, [productId, router, toast, form]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else {
        fetchProduct();
    }
  }, [user, authLoading, router, fetchProduct]);
  
  const handleImageUpload = async (file: File, fieldName: keyof ProductUpdatePayload | `imagesByColor.${string}`) => {
    const fieldId = fieldName.toString();
    setIsUploading(prev => ({...prev, [fieldId]: true}));
    
    const result = await uploadImage(file);
    
    if (result.success && result.url) {
      if (fieldName.startsWith('imagesByColor.')) {
        const color = fieldName.split('.')[1];
        const currentImagesByColor = form.getValues('imagesByColor') || {};
        form.setValue('imagesByColor', {...currentImagesByColor, [color]: result.url });
      } else {
        form.setValue(fieldName as keyof ProductUpdatePayload, result.url);
      }
      toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso.' });
    } else {
      toast({ variant: 'destructive', title: 'Erro de Upload', description: result.message });
    }
    
    setIsUploading(prev => ({...prev, [fieldId]: false}));
  };


  const onSubmit = async (data: ProductUpdatePayload) => {
    const result = await updateProduct(productId, data);
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/products');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };
  
  const frameColors = ['black', 'white', 'hazel_oak', 'ebony_oak'];

  if (authLoading || loading || !product) {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <Footer />
       </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
         <main className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Produtos
            </Button>
            <h1 className="text-2xl font-semibold mb-1">Editar Produto</h1>
            <p className="text-muted-foreground mb-6">Modifique os detalhes do produto "{product.name}".</p>
            
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Preço Base (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imagens Principais</CardTitle>
                        <CardDescription>Defina as imagens principais para o produto e para a visualização no ambiente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <ImageUploadField
                            label="Imagem Principal (Produto Isolado)"
                            currentImageUrl={form.watch('image')}
                            onImageUpload={(file) => handleImageUpload(file, 'image')}
                            isUploading={isUploading['image']}
                        />
                         <ImageUploadField
                            label="Imagem de Ambiente (Hover)"
                            currentImageUrl={form.watch('image_alt')}
                            onImageUpload={(file) => handleImageUpload(file, 'image_alt')}
                            isUploading={isUploading['image_alt']}
                        />
                         <ImageUploadField
                            label="Arte Original (para download)"
                            currentImageUrl={form.watch('artwork_image')}
                            onImageUpload={(file) => handleImageUpload(file, 'artwork_image')}
                            isUploading={isUploading['artwork_image']}
                        />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Imagens por Cor de Moldura</CardTitle>
                        <CardDescription>Envie uma imagem para cada variação de cor da moldura.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {frameColors.map(color => (
                             <ImageUploadField
                                key={color}
                                label={`Moldura ${color.replace('_', ' ')}`}
                                currentImageUrl={form.watch(`imagesByColor.${color}`)}
                                onImageUpload={(file) => handleImageUpload(file, `imagesByColor.${color}`)}
                                isUploading={isUploading[`imagesByColor.${color}`]}
                            />
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                        Salvar Alterações
                    </Button>
                </div>
              </form>
            </FormProvider>
          </main>
      </div>
      <Footer />
    </div>
  );
}

