

'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/app/actions';
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
  currentImageUrl?: string | null;
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
            Enviar Imagem
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

export default function NewFurniturePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const form = useForm<NewFurniturePayload>({
    resolver: zodResolver(newFurnitureSchema),
    defaultValues: {
        name: '',
        description: '',
        arrangement: '',
        image: '',
        image_alt: '',
        gallery_images: [],
        sizes: [{ size: '', price: 0 }],
        colors: [{ name: '' }],
    }
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes",
  });
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control: form.control,
    name: "colors",
  });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery_images",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleImageUpload = async (file: File, fieldName: `gallery_images.${number}` | keyof Omit<NewFurniturePayload, 'gallery_images' | 'sizes' | 'colors'>) => {
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
            if (fieldName.startsWith('gallery_images.')) {
                const index = parseInt(fieldName.split('.')[1]);
                form.setValue(`gallery_images.${index}`, imageUrl, { shouldValidate: true });
            } else {
                form.setValue(fieldName as any, imageUrl, { shouldValidate: true });
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


  const onSubmit = async (data: NewFurniturePayload) => {
    const price = data.sizes && data.sizes.length > 0 ? data.sizes[0].price : 0;
    const fullPayload = {
      ...data,
      price: price,
      category: 'Mobílias', // Categoria fixa
      // Campos não aplicáveis para mobílias
      artwork_image: '', 
      imagesByColor: {},
      hint: '',
      hint_alt: ''
    };

    const result = await addProduct(fullPayload as any); 
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/furnitures');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };

  const subCategories = ['Decoração', 'Nichos', 'Prateleiras', 'Mesas', 'Móveis com Metal', 'Espaço Kids', 'Aparadores', 'Cabeceiras'];
  

  if (authLoading || !user) {
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
            <h1 className="text-2xl font-semibold mb-1">Adicionar Nova Mobília</h1>
            <p className="text-muted-foreground mb-6">Preencha os detalhes para cadastrar uma nova mobília.</p>
            
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
                        <CardDescription>Adicione um ou mais tamanhos e seus respectivos preços.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sizeFields.map((field, index) => (
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
                                        <FormControl><Input type="number" step="0.01" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                              />
                              <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(index)} disabled={sizeFields.length <= 1}>
                                  <Trash2 className="h-4 w-4"/>
                              </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendSize({ size: '', price: 0 })}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Tamanho
                        </Button>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Cores</CardTitle>
                        <CardDescription>Adicione as opções de cores para esta mobília.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {colorFields.map((field, index) => (
                          <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                             <FormField
                                control={form.control}
                                name={`colors.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Nome da Cor (ex: Branco, Preto, Carvalho)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                              />
                              <Button type="button" variant="destructive" size="icon" onClick={() => removeColor(index)} disabled={colorFields.length <= 1}>
                                  <Trash2 className="h-4 w-4"/>
                              </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendColor({ name: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Cor
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
                           <FormItem>
                             <ImageUploadField label="Imagem Principal (Produto Isolado)" currentImageUrl={form.watch('image')} onImageUpload={(file) => handleImageUpload(file, 'image')} isUploading={isUploading['image']} />
                             <FormMessage />
                           </FormItem>
                         )} />
                         <FormField control={form.control} name="image_alt" render={() => (
                           <FormItem>
                              <ImageUploadField label="Imagem de Ambiente (Hover)" currentImageUrl={form.watch('image_alt')} onImageUpload={(file) => handleImageUpload(file, 'image_alt')} isUploading={isUploading['image_alt']}/>
                             <FormMessage />
                           </FormItem>
                         )} />
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Galeria de Imagens de Detalhe</CardTitle>
                    <CardDescription>Adicione imagens extras que serão exibidas na página do produto.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {galleryFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                           <FormField
                            control={form.control}
                            name={`gallery_images.${index}`}
                            render={({ field: formField }) => (
                              <FormItem className="flex-grow">
                                <ImageUploadField
                                  label={`Imagem de Detalhe ${index + 1}`}
                                  currentImageUrl={formField.value || null}
                                  onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)}
                                  isUploading={isUploading[`gallery_images.${index}`]}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}>
                              <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>
                     ))}
                     <Button type="button" variant="outline" onClick={() => appendGallery("")}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Imagem de Detalhe
                     </Button>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                        Adicionar Mobília
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
