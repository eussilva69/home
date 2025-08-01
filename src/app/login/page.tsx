
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';

import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormData) => {
    setError(null);
    startTransition(async () => {
      // Login action will be here
      console.log('Login attempt with:', values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError("Funcionalidade de login ainda não implementada.");
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-screen h-screen object-cover transform -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/UQBDo9L_amU?autoplay=1&mute=1&loop=1&playlist=UQBDo9L_amU&controls=0&showinfo=0&autohide=1&modestbranding=1"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl bg-background/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Bem-vindo de volta!</CardTitle>
              <CardDescription>Acesse sua conta para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} className="bg-background/70"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Senha</FormLabel>
                          <Link href="#" className="text-sm text-primary hover:underline">
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} className="bg-background/70"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro de Autenticação</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isPending} className="w-full text-lg">
                    {isPending ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2"/>}
                    Entrar
                  </Button>
                </form>
              </Form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/80 backdrop-blur-sm px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <Button variant="outline" className="w-full text-lg bg-background/70">
                <Image src="/google.svg" width={20} height={20} alt="Google logo" className="mr-2" />
                Google
              </Button>

              <div className="mt-6 text-center text-sm">
                Não tem uma conta?{' '}
                <Link href="#" className="font-bold text-primary hover:underline">
                  Cadastre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}
