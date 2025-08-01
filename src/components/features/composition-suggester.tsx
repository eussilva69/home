"use client";

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { compositionSuggesterSchema } from '@/lib/schemas';
import { suggestCompositionsAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

type FormData = z.infer<typeof compositionSuggesterSchema>;
type SuggestionResult = {
  compositions: string[];
  reasoning: string;
}

export default function CompositionSuggester() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(compositionSuggesterSchema),
    defaultValues: {
      artworkDescription: '',
      userActions: '',
    },
  });

  const onSubmit = (values: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const response = await suggestCompositionsAction(values);
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
          <FormField
            control={form.control}
            name="artworkDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Obra</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ex: Uma peça de pop art vibrante de um horizonte da cidade à noite..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico de Navegação / Preferências</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ex: Viu outras obras de pop art, já comprou molduras pretas minimalistas." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Obter Sugestões
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
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-headline text-lg mb-2 flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" />Composições Sugeridas</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.compositions.map((comp, index) => (
                  <li key={index}>{comp}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-lg mb-2">Justificativa</h3>
              <p className="text-muted-foreground">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
