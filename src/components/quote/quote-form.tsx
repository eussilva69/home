
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from 'react';
import { Loader2, UploadCloud, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const quoteSchema = z.object({
  name: z.string().min(3, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  phone: z.string().min(10, { message: 'Insira um telefone válido com DDD.' }),
  projectDescription: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  files: z.custom<FileList>().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const WHATSAPP_NUMBER = "5534997222303"; // Número da empresa sem máscaras

export default function QuoteForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      projectDescription: '',
      files: undefined,
    },
  });

  const onSubmit = (data: QuoteFormValues) => {
    startTransition(() => {
        const message = `Olá, Home Designer!

Meu nome é *${data.name}* e gostaria de solicitar um orçamento para um móvel planejado.

*Meus dados para contato são:*
- E-mail: ${data.email}
- Telefone: ${data.phone}

*Minha ideia é a seguinte:*
${data.projectDescription}

${data.files && data.files.length > 0 ? `\nTenho ${data.files.length} imagem(ns) de referência para enviar.` : ''}

Aguardo o contato de vocês. Obrigado!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Quase lá!",
        description: "Sua mensagem está pronta para ser enviada no WhatsApp.",
      });

      form.reset();
    });
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Telefone / WhatsApp</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="projectDescription" render={({ field }) => (
            <FormItem><FormLabel>Descreva sua ideia ou projeto</FormLabel><FormControl><Textarea rows={4} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
        )} />
         <FormField
            control={form.control}
            name="files"
            render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Imagens de Referência (Opcional)</FormLabel>
                    <FormControl>
                        <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, PDF...</p>
                                </div>
                                <Input
                                    {...fieldProps}
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={(e) => onChange(e.target.files)}
                                />
                            </label>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
          Enviar via WhatsApp
        </Button>
      </form>
    </Form>
  );
}
