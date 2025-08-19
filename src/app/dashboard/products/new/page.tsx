
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
import { newProductSchema, type NewProductPayload } from '@/lib/schemas';
import NextImage from 'next/image';
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

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const form = useForm<NewProductPayload>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
        name: '',
        price: 0,
        category: '',
        arrangement: '',
        image: '',
        image_alt: '',
        artwork_image: '',
        imagesByColor: {},
        hint: '',
        hint_alt: ''
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleImageUpload = async (file: File, fieldName: keyof NewProductPayload | `imagesByColor.${string}`) => {
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
            if (fieldName.startsWith('imagesByColor.')) {
                const color = fieldName.split('.')[1];
                const currentImagesByColor = form.getValues('imagesByColor') || {};
                form.setValue('imagesByColor', {...currentImagesByColor, [color]: imageUrl }, { shouldValidate: true });
            } else {
                form.setValue(fieldName as keyof NewProductPayload, imageUrl, { shouldValidate: true });
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


  const onSubmit = async (data: NewProductPayload) => {
    const result = await addProduct(data);
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/products');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };
  
  const frameColors: Record<string, string> = {
    black: 'Preta',
    white: 'Branca',
    hazel_oak: 'Carvalho Avelã',
    ebony_oak: 'Carvalho Ébano',
  };

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
              Voltar para Produtos
            </Button>
            <h1 className="text-2xl font-semibold mb-1">Adicionar Novo Produto</h1>
            <p className="text-muted-foreground mb-6">Preencha os detalhes para cadastrar um novo produto.</p>
            
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Preço Base (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl><SelectContent>{collections.map(c => <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="arrangement" render={({ field }) => (<FormItem><FormLabel>Arranjo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um arranjo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Solo">Solo</SelectItem><SelectItem value="Dupla">Dupla</SelectItem><SelectItem value="Trio">Trio</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imagens</CardTitle>
                        <CardDescription>Defina as imagens para o produto.</CardDescription>
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
                         <FormField control={form.control} name="artwork_image" render={() => (
                            <FormItem>
                                <ImageUploadField label="Arte Original (para download)" currentImageUrl={form.watch('artwork_image')} onImageUpload={(file) => handleImageUpload(file, 'artwork_image')} isUploading={isUploading['artwork_image']}/>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Imagens por Cor de Moldura</CardTitle>
                        <CardDescription>Envie uma imagem para cada variação de cor da moldura.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(frameColors).map(([colorKey, colorName]) => (
                             <FormField key={colorKey} control={form.control} name={`imagesByColor.${colorKey}` as any} render={() => (
                                <FormItem>
                                  <ImageUploadField label={`Moldura ${colorName}`} currentImageUrl={form.watch(`imagesByColor.${colorKey}`)} onImageUpload={(file) => handleImageUpload(file, `imagesByColor.${colorKey}`)} isUploading={isUploading[`imagesByColor.${colorKey}`]}/>
                                  <FormMessage />
                                </FormItem>
                              )} />
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                        Adicionar Produto
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
