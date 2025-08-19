
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById, updateProduct } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { productUpdateSchema, type ProductUpdatePayload } from '@/lib/schemas';
import NextImage from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  
  const arrangement = product?.arrangement;
  const imageApplication = form.watch('image_application');

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
          artwork_image: productData.artwork_image,
          image_application: productData.image_application || 'repeat',
          gallery_images: productData.gallery_images || [],
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
  
  const handleImageUpload = async (file: File, fieldName: keyof ProductUpdatePayload | `gallery_images.${number}`) => {
    const fieldId = fieldName.toString();
    setIsUploading(prev => ({...prev, [fieldId]: true}));
    
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`/api/upload-image`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        
        if (data.success) {
            const imageUrl = data.url;
            if (typeof fieldName === 'string' && fieldName.startsWith('gallery_images.')) {
                const index = parseInt(fieldName.split('.')[1]);
                const currentGallery = form.getValues('gallery_images') || [];
                const newGallery = [...currentGallery];
                newGallery[index] = imageUrl;
                form.setValue('gallery_images', newGallery, { shouldValidate: true });
            } else {
                form.setValue(fieldName as keyof ProductUpdatePayload, imageUrl, { shouldValidate: true });
            }
            toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso.' });
        } else {
            throw new Error(data.details || "Erro desconhecido ao fazer upload.");
        }
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message || "Falha no upload da imagem." });
    } finally {
         setIsUploading(prev => ({...prev, [fieldId]: false}));
    }
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
  
  const frameCount = arrangement === 'Trio' ? 3 : arrangement === 'Dupla' ? 2 : 1;

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
                     {(arrangement === 'Dupla' || arrangement === 'Trio') && (
                        <FormField
                            control={form.control}
                            name="image_application"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Aplicação da Imagem</FormLabel>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex gap-4 pt-2"
                                    >
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value="repeat" id="repeat" /></FormControl>
                                            <FormLabel htmlFor="repeat" className="font-normal">Repetir</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value="split" id="split" /></FormControl>
                                            <FormLabel htmlFor="split" className="font-normal">Dividir</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl><RadioGroupItem value="individual" id="individual" /></FormControl>
                                            <FormLabel htmlFor="individual" className="font-normal">Individual</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imagens da Arte</CardTitle>
                        <CardDescription>
                            {imageApplication === 'individual' 
                                ? 'Envie uma imagem para cada quadro do conjunto.'
                                : 'Envie a imagem principal do quadro. Ela será usada nos mockups.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {imageApplication === 'individual' && frameCount > 1 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(frameCount)].map((_, index) => (
                                   <FormField key={index} control={form.control} name={`gallery_images.${index}` as any} render={() => (
                                      <FormItem>
                                         <ImageUploadField
                                            label={`Imagem Quadro ${index + 1}`}
                                            currentImageUrl={form.watch(`gallery_images.${index}` as any)}
                                            onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)}
                                            isUploading={isUploading[`gallery_images.${index}`]}
                                         />
                                         <FormMessage/>
                                      </FormItem>
                                   )} />
                                ))}
                            </div>
                        ) : (
                             <FormField
                                control={form.control}
                                name="artwork_image"
                                render={() => (
                                   <FormItem>
                                     <ImageUploadField
                                        label="Arte Principal"
                                        currentImageUrl={form.watch('artwork_image')}
                                        onImageUpload={(file) => handleImageUpload(file, 'artwork_image')}
                                        isUploading={isUploading['artwork_image']}
                                     />
                                     <FormMessage />
                                   </FormItem>
                                )}
                             />
                        )}
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
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}
