
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { registerSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { auth, firestore } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmail } from '@/lib/nodemailer';

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const formatCPF = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    return onlyDigits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const onSubmit = (values: FormData) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: values.name });

        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            name: values.name,
            email: values.email,
            cpf: values.cpf,
            createdAt: serverTimestamp()
        });
        
        await sendEmail({
            destinatario: values.email,
            type: 'welcome',
            data: { customerName: values.name }
        });

        setSuccess("Conta criada com sucesso! Redirecionando para o login...");
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
            setError('Este e-mail já está sendo utilizado por outra conta.');
        } else {
            setError('Ocorreu um erro inesperado ao criar sua conta. Tente novamente.');
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Crie sua Conta</CardTitle>
              <CardDescription>É rápido e fácil. Comece a personalizar sua arte!</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                   <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="000.000.000-00" 
                            {...field}
                            onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
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
                      <AlertTitle>Erro no Cadastro</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                   {success && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Sucesso!</AlertTitle>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isPending} className="w-full text-lg">
                    {isPending ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2"/>}
                    Criar Conta
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Faça login
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
    </div>
  );
}
