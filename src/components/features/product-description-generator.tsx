"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { productDescriptionSchema } from '@/lib/schemas';
import { generateDescriptionAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';

type FormData = z.infer<typeof productDescriptionSchema>;

export default function ProductDescriptionGenerator() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(productDescriptionSchema),
    defaultValues: {
      productName: '',
      productCategory: '',
      keywords: '',
      style: '',
      colorPalette: '',
      material: '',
      size: '',
    },
  });

  const onSubmit = (values: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const response = await generateDescriptionAction(values);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response.success ?? null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nascer do Sol Abstrato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arte de Parede" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Palavras-chave</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: vibrante, moderno, decoração de escritório" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pop Art" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="colorPalette"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paleta de Cores</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Vibrante, cores primárias" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Impressão Giclée em tela" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 60x90 cm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
            Gerar Descrição
          </Button>
        </form>
      </Form>
      {error && (
         <Alert variant="destructive">
           <AlertTitle>Erro</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
      {result && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-headline text-lg mb-2">Descrição Gerada:</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{result}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
