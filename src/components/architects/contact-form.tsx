
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
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const contactSchema = z.object({
  name: z.string().min(3, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  phone: z.string().min(10, { message: 'Insira um telefone válido com DDD.' }),
  company: z.string().optional(),
  message: z.string().min(10, { message: 'Sua mensagem deve ter pelo menos 10 caracteres.' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    startTransition(() => {
      // Simulação de envio
      console.log('Dados do formulário:', data);
      
      // Aqui você integraria com uma action ou API para enviar o email/salvar os dados
      // Ex: await sendArchitectContact(data);
      
      setTimeout(() => {
        setIsSuccess(true);
        form.reset();
        toast({
          title: "Mensagem Enviada!",
          description: "Recebemos seus dados e entraremos em contato em breve.",
        });
      }, 1000);
    });
  };
  
  if (isSuccess) {
      return (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertTitle className="font-bold text-green-800">Enviado com Sucesso!</AlertTitle>
            <AlertDescription className="text-green-700">
                Obrigado pelo seu interesse! Entraremos em contato o mais breve possível para dar os próximos passos na nossa parceria.
            </AlertDescription>
          </Alert>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telefone / WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem><FormLabel>Empresa (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem><FormLabel>Fale sobre você e seu trabalho</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Quero ser Parceiro
        </Button>
      </form>
    </Form>
  );
}
