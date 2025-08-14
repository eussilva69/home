
'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/app/actions';
import { newFurnitureSchema, type NewFurniturePayload } from '@/lib/schemas';
import NextImage from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const IMG_UPLOAD_KEY = "7ecf5602b8f3c01d2df1b966c1d018af";

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
        price: 0,
        arrangement: '',
        image: '',
        image_alt: '',
        gallery_images: [],
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleImageUpload = async (file: File, fieldName: `gallery_images.${number}` | keyof Omit<NewFurniturePayload, 'gallery_images'>) => {
    const fieldId = fieldName.toString();
    setIsUploading(prev => ({...prev, [fieldId]: true}));
    
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_UPLOAD_KEY}`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        
        if (data.success) {
            const imageUrl = data.data.url;
            if (fieldName.startsWith('gallery_images.')) {
                const index = parseInt(fieldName.split('.')[1]);
                const currentGallery = form.getValues('gallery_images') || [];
                const newGallery = [...currentGallery];
                newGallery[index] = imageUrl;
                form.setValue('gallery_images', newGallery, { shouldValidate: true });
            } else {
                form.setValue(fieldName, imageUrl, { shouldValidate: true });
            }
            toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso.' });
        } else {
            throw new Error(data.error.message || "Erro desconhecido da API de imagem.");
        }
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message || "Falha no upload da imagem." });
    } finally {
        setIsUploading(prev => ({...prev, [fieldId]: false}));
    }
  };


  const onSubmit = async (data: NewFurniturePayload) => {
    const fullPayload = {
      ...data,
      category: 'Mobílias', // Categoria fixa
      // Campos não aplicáveis para mobílias
      artwork_image: '', 
      imagesByColor: {},
      hint: '',
      hint_alt: ''
    };

    const result = await addProduct(fullPayload as any); // Usamos 'any' aqui para compatibilizar com a action genérica
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/furnitures');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };

  const subCategories = ['Mesas', 'Nichos', 'Cabeceiras'];
  

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
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome da Mobília</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="arrangement" render={({ field }) => (<FormItem><FormLabel>Sub-categoria (Tipo)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo" /></SelectTrigger></FormControl><SelectContent>{subCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
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
                    <CardDescription>Adicione até 4 imagens extras que serão exibidas na página do produto.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[0, 1, 2, 3].map(index => (
                        <FormField key={index} control={form.control} name={`gallery_images.${index}` as any} render={() => (
                          <FormItem>
                             <ImageUploadField
                                label={`Imagem de Detalhe ${index + 1}`}
                                currentImageUrl={form.watch(`gallery_images.${index}` as any)}
                                onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)}
                                isUploading={isUploading[`gallery_images.${index}`]}
                             />
                             <FormMessage/>
                          </FormItem>
                       )} />
                     ))}
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
      <Footer />
    </div>
  );
}
