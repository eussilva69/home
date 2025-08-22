
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

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
        artwork_image: '',
        imagesByColor: { black: '', white: '', hazel_oak: '', ebony_oak: '' },
        image_application: 'repeat',
        gallery_images: [],
        environment_images: [],
    }
  });

  const arrangement = form.watch('arrangement');
  const imageApplication = form.watch('image_application');
  const frameCount = arrangement === 'Trio' ? 3 : arrangement === 'Dupla' ? 2 : 1;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  const handleImageUpload = async (file: File, fieldName: keyof NewProductPayload | `gallery_images.${number}` | `imagesByColor.${string}` | `environment_images.${number}`) => {
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


  const onSubmit = async (data: NewProductPayload) => {
    const result = await addProduct(data);
    if (result.success) {
      toast({ title: 'Sucesso!', description: result.message });
      router.push('/dashboard/products');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
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
                        <CardTitle>Imagens da Arte e Ambientes</CardTitle>
                        <CardDescription>Envie a imagem da arte pura e as imagens de ambiente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={form.control} name="artwork_image" render={() => (
                           <FormItem><ImageUploadField label="Arte Pura (para mockups de moldura)" currentImageUrl={form.watch('artwork_image')} onImageUpload={(file) => handleImageUpload(file, 'artwork_image')} isUploading={isUploading['artwork_image']} /><FormMessage /></FormItem>
                         )} />
                         <Separator/>
                         <FormField control={form.control} name="environment_images.0" render={() => (
                           <FormItem><ImageUploadField label="Imagem Ambiente 1" currentImageUrl={form.watch('environment_images.0')} onImageUpload={(file) => handleImageUpload(file, 'environment_images.0')} isUploading={isUploading['environment_images.0']}/><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="environment_images.1" render={() => (
                           <FormItem><ImageUploadField label="Imagem Ambiente 2" currentImageUrl={form.watch('environment_images.1')} onImageUpload={(file) => handleImageUpload(file, 'environment_images.1')} isUploading={isUploading['environment_images.1']}/><FormMessage /></FormItem>
                         )} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Imagens por Cor de Moldura</CardTitle>
                        <CardDescription>Envie a imagem principal para cada cor de moldura.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="imagesByColor.black" render={() => (<FormItem><ImageUploadField label="Moldura Preta" currentImageUrl={form.watch('imagesByColor.black')} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.black')} isUploading={isUploading['imagesByColor.black']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.white" render={() => (<FormItem><ImageUploadField label="Moldura Branca" currentImageUrl={form.watch('imagesByColor.white')} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.white')} isUploading={isUploading['imagesByColor.white']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.hazel_oak" render={() => (<FormItem><ImageUploadField label="Moldura Carvalho Avelã" currentImageUrl={form.watch('imagesByColor.hazel_oak')} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.hazel_oak')} isUploading={isUploading['imagesByColor.hazel_oak']}/><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="imagesByColor.ebony_oak" render={() => (<FormItem><ImageUploadField label="Moldura Carvalho Ébano" currentImageUrl={form.watch('imagesByColor.ebony_oak')} onImageUpload={(file) => handleImageUpload(file, 'imagesByColor.ebony_oak')} isUploading={isUploading['imagesByColor.ebony_oak']}/><FormMessage/></FormItem>)} />
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
                               <FormField key={index} control={form.control} name={`gallery_images.${index}` as any} render={() => (
                                  <FormItem>
                                     <ImageUploadField label={`Imagem Quadro ${index + 1}`} currentImageUrl={form.watch(`gallery_images.${index}` as any)} onImageUpload={(file) => handleImageUpload(file, `gallery_images.${index}`)} isUploading={isUploading[`gallery_images.${index}`]}/>
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
