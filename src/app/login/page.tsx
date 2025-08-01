
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { loginAction } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormData) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        const actionResult = await loginAction(values);
        if (actionResult.error) {
          setError(actionResult.error);
        } else {
          setSuccess("Login bem-sucedido! Redirecionando...");
          router.push('/dashboard');
        }
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
            setError('Email ou senha inválidos. Por favor, tente novamente.');
        } else {
            setError('Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.');
        }
      }
    });
  };

  if (loading || user) {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
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
                          <Input type="email" placeholder="seu@email.com" {...field} />
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
                          <Input type="password" placeholder="********" {...field} />
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

                  {success && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Sucesso</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isPending} className="w-full text-lg">
                    {isPending ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2"/>}
                    Entrar
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="font-bold text-primary hover:underline">
                  Cadastre-se
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
    </div>
  );
}
