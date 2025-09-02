
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById, updateProduct } from '@/app/actions';
import type { Product } from '@/lib/schemas';
import { newFurnitureSchema, type NewFurniturePayload } from '@/lib/schemas';
import NextImage from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

export default function EditFurniturePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const furnitureId = params.id as string;

  const [furniture, setFurniture] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const form = useForm<NewFurniturePayload>({
    resolver: zodResolver(newFurnitureSchema),
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const fetchFurniture = useCallback(async () => {
    if (furnitureId) {
      setLoading(true);
      const result = await getProductById(furnitureId);
      if (result.success && result.data && result.data.category === 'Mobílias') {
        const furnitureData = result.data as Product;
        setFurniture(furnitureData);
        form.reset({
          name: furnitureData.name,
          description: furnitureData.description,
          arrangement: furnitureData.arrangement, // Sub-category
          image: furnitureData.image,
          image_alt: furnitureData.image_alt,
          gallery_images: furnitureData.gallery_images || [],
          sizes: furnitureData.sizes && furnitureData.sizes.length > 0 ? furnitureData.sizes : [{ size: '', price: 0 }]
        });
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: result.message || "Mobília não encontrada." });
        router.push('/dashboard/furnitures');
      }
      setLoading(false);
    }
  }, [furnitureId, router, toast, form]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else {
        fetchFurniture();
    }
  }, [user, authLoading, router, fetchFurniture]);

  const handleImageUpload = async (file: File, fieldName: keyof NewFurniturePayload | `gallery_images.${number}`) => {
    const fieldId = fieldName.toString();
    setIsUploading(prev => ({...prev, [fieldId]: true}));
    
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`/api/upload-image`, { method: "POST", body: formData });
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
                form.setValue(fieldName as any, imageUrl, { shouldValidate: true });
            }
            toast({ title: 'Sucesso', description: 'Imagem enviada.' });
        } else {
            throw new Error(data.details || "Erro no upload.");
        }
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message || "Falha no upload." });
    } finally {
         setIsUploading(prev => ({...prev, [fieldId]: false}));
    }
  };

  const onSubmit = async (data: NewFurniturePayload) => {
    const price = data.sizes && data.sizes.length > 0 ? data.sizes[0].price : 0;
    const result = await updateProduct(furnitureId, { ...data, price });
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/furnitures');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };

  const subCategories = ['Decoração', 'Nichos', 'Prateleiras', 'Mesas', 'Móveis com Metal', 'Espaço Kids', 'Aparadores', 'Cabeceiras'];

  if (authLoading || loading || !furniture) {
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
              Voltar para Mobílias
            </Button>
            <h1 className="text-2xl font-semibold mb-1">Editar Mobília</h1>
            <p className="text-muted-foreground mb-6">Modifique os detalhes de "{furniture.name}".</p>
            
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome da Mobília</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="arrangement" render={({ field }) => (<FormItem><FormLabel>Sub-categoria (Tipo)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo" /></SelectTrigger></FormControl><SelectContent>{subCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descrição do Produto</FormLabel>
                        <FormControl><Textarea {...field} placeholder="Descreva os materiais, dimensões, etc." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Tamanhos e Preços</CardTitle>
                        <CardDescription>Adicione ou edite os tamanhos e seus respectivos preços.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                             <FormField
                                control={form.control}
                                name={`sizes.${index}.size`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Tamanho (ex: 120x60cm)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                              />
                             <FormField
                                control={form.control}
                                name={`sizes.${index}.price`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço (R$)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                              />
                              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                  <Trash2 className="h-4 w-4"/>
                              </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => append({ size: '', price: 0 })}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Tamanho
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imagens Principais</CardTitle>
                        <CardDescription>Defina as imagens de capa e de hover para a mobília.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={form.control} name="image" render={() => (
                           <FormItem><ImageUploadField label="Imagem Principal (Produto Isolado)" currentImageUrl={form.watch('image')} onImageUpload={(file) => handleImageUpload(file, 'image')} isUploading={isUploading['image']} /><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="image_alt" render={() => (
                           <FormItem><ImageUploadField label="Imagem de Ambiente (Hover)" currentImageUrl={form.watch('image_alt')} onImageUpload={(file) => handleImageUpload(file, 'image_alt')} isUploading={isUploading['image_alt']}/><FormMessage /></FormItem>
                         )} />
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Galeria de Imagens de Detalhe</CardTitle>
                    <CardDescription>Adicione até 4 imagens extras que serão exibidas na página do produto.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[0, 1, 2, 3].map(index => (
                        <FormField key={index} control={form.control} name={`gallery_images.${index}` as any} render={() => (
                          <FormItem><ImageUploadField label={`Imagem de Detalhe ${index + 1}`} currentImageUrl={form.watch(`gallery_images.${index}` as any)} onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)} isUploading={isUploading[`gallery_images.${index}`]} /><FormMessage/></FormItem>
                       )} />
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
      <div className="h-[10cm]" />
      <Footer />
    </div>
  );
}
