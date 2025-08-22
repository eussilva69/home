

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
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collections } from '@/lib/mock-data';

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
          category: productData.category,
          artwork_image: productData.artwork_image,
          imagesByColor: productData.imagesByColor || { black: '', white: '', hazel_oak: '', ebony_oak: '' },
          image_application: productData.image_application || 'repeat',
          gallery_images: productData.gallery_images || [],
          environment_images: productData.environment_images || [],
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
  
  const handleImageUpload = async (file: File, fieldName: keyof ProductUpdatePayload | `gallery_images.${number}` | `imagesByColor.${string}` | `environment_images.${number}`) => {
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
            form.setValue(fieldName as any, imageUrl, { shouldValidate: true });
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
                    <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl><SelectContent>{collections.filter(c => c.name !== 'Mobílias').map(c => <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
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
                        <CardTitle>Imagens do Produto</CardTitle>
                        <CardDescription>Envie a imagem para a placa decorativa e para cada cor de moldura.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="artwork_image" render={({ field }) => (
                           <FormItem>
                            <ImageUploadField label="Placa Decorativa (Sem Moldura)" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'artwork_image')} isUploading={isUploading['artwork_image']} />
                            <FormMessage />
                           </FormItem>
                         )} />
                         <div className="md:col-span-2"><Separator/></div>
                        <FormField control={form.control} name="imagesByColor.black" render={({ field }) => (<FormItem><ImageUploadField label="Moldura Preta" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.black')} isUploading={isUploading['imagesByColor.black']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.white" render={({ field }) => (<FormItem><ImageUploadField label="Moldura Branca" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.white')} isUploading={isUploading['imagesByColor.white']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.hazel_oak" render={({ field }) => (<FormItem><ImageUploadField label="Moldura Carvalho Avelã" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.hazel_oak')} isUploading={isUploading['imagesByColor.hazel_oak']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.ebony_oak" render={({ field }) => (<FormItem><ImageUploadField label="Moldura Carvalho Ébano" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.ebony_oak')} isUploading={isUploading['imagesByColor.ebony_oak']}/><FormMessage/></FormItem>)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imagens de Ambiente</CardTitle>
                        <CardDescription>Envie até duas imagens do produto aplicado em um ambiente.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="environment_images.0" render={({ field }) => (
                           <FormItem>
                            <ImageUploadField label="Imagem Ambiente 1" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'environment_images.0')} isUploading={isUploading['environment_images.0']}/>
                            <FormMessage />
                           </FormItem>
                         )} />
                         <FormField control={form.control} name="environment_images.1" render={({ field }) => (
                           <FormItem>
                            <ImageUploadField label="Imagem Ambiente 2" currentImageUrl={field.value} onImageUpload={(file) => handleImageUpload(file, 'environment_images.1')} isUploading={isUploading['environment_images.1']}/>
                            <FormMessage />
                           </FormItem>
                         )} />
                    </CardContent>
                </Card>


                {imageApplication === 'individual' && frameCount > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagens Individuais</CardTitle>
                            <CardDescription>Envie uma imagem de arte para cada quadro do conjunto.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(frameCount)].map((_, index) => (
                               <FormField key={index} control={form.control} name={`gallery_images.${index}` as any} render={({ field }) => (
                                  <FormItem>
                                     <ImageUploadField
                                        label={`Imagem Quadro ${index + 1}`}
                                        currentImageUrl={field.value}
                                        onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)}
                                        isUploading={isUploading[`gallery_images.${index}`]}
                                     />
                                     <FormMessage/>
                                  </FormItem>
                               )} />
                            ))}
                        </CardContent>
                    </Card>
                )}
                
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

