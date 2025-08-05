
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trash2, User, Home, Package, Truck, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { calculateShipping, saveOrder } from '@/app/actions';
import { products as allProducts } from '@/lib/mock-data';
import type { CartItemType } from '@/hooks/use-cart';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProductConfigDialog from '@/components/dashboard/orders/product-config-dialog';
import type { Product } from '@/lib/schemas';


const newOrderSchema = z.object({
  // Customer
  firstName: z.string().min(2, "Nome é obrigatório."),
  lastName: z.string().min(2, "Sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  docType: z.string().default('CPF'),
  docNumber: z.string().min(11, "Documento é obrigatório."),
  // Shipping
  cep: z.string().min(8, "CEP é obrigatório."),
  street: z.string().min(2, "Rua é obrigatória."),
  number: z.string().min(1, "Número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório."),
  city: z.string().min(2, "Cidade é obrigatória."),
  state: z.string().min(2, "Estado é obrigatório."),
});

type NewOrderFormValues = z.infer<typeof newOrderSchema>;

export default function NewOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [productToConfig, setProductToConfig] = useState<Product | null>(null);

  const form = useForm<NewOrderFormValues>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', docNumber: '',
      cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
    }
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // In a real app, you'd fetch from Firestore, but we use mock data here
    setProducts(allProducts as Product[]);
  }, []);
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, products]);
  
  const handleSelectProduct = (product: Product) => {
    setProductToConfig(product);
    setIsConfigDialogOpen(true);
    setSearchTerm('');
  };


  const addToCart = (configuredItem: CartItemType) => {
    setCart(currentCart => {
      // Manual orders can have multiple versions of the same product with different configs
      const uniqueId = `${configuredItem.id}-${Date.now()}`;
      return [...currentCart, {...configuredItem, id: uniqueId }];
    });
    toast({
        title: "Item Adicionado!",
        description: `${configuredItem.name} foi adicionado ao pedido.`
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCart(currentCart => {
      if (newQuantity < 1) {
        return currentCart.filter(item => item.id !== id);
      }
      return currentCart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item);
    });
  };
  
  const removeFromCart = (id: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };


  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const shippingCost = useMemo(() => selectedShipping ? parseFloat(selectedShipping.price) : 0, [selectedShipping]);
  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);
  
  const cepValue = form.watch('cep');
  useEffect(() => {
    const fetchAddressFromCep = async () => {
        const cleanCep = cepValue?.replace(/\D/g, '');
        if (cleanCep?.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    form.setValue('street', data.logradouro);
                    form.setValue('neighborhood', data.bairro);
                    form.setValue('city', data.localidade);
                    form.setValue('state', data.uf);
                }
            } catch (error) {
                console.error('Erro ao buscar CEP');
            }
        }
    };
    fetchAddressFromCep();
  }, [cepValue, form]);


  const handleCalculateShipping = async () => {
    const cep = form.getValues('cep');
    if (cep.replace(/\D/g, '').length !== 8 || cart.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha o CEP e adicione itens ao carrinho.' });
      return;
    }
    setIsLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);

    const result = await calculateShipping(cep, cart);
    if (result.success && result.options) {
      setShippingOptions(result.options);
    } else {
      toast({ variant: 'destructive', title: 'Erro de Frete', description: result.message });
    }
    setIsLoadingShipping(false);
  };
  
  const handleSelectShipping = (optionId: string) => {
      const option = shippingOptions.find(opt => opt.id.toString() === optionId);
      if (option) {
          const shippingInfo = {
            id: option.id,
            name: option.name,
            price: parseFloat(option.price),
            company: option.company.name,
            delivery_time: option.delivery_time,
          };
          setSelectedShipping(shippingInfo);
      }
  };

  const onSubmit = async (data: NewOrderFormValues) => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'O carrinho está vazio.' });
      return;
    }
    if (!selectedShipping) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma forma de envio.' });
      return;
    }

    setIsSubmitting(true);
    
    const orderDetails = {
      customer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        docType: data.docType,
        docNumber: data.docNumber,
      },
      shipping: {
        address: `${data.street}, ${data.number}`,
        city: data.city,
        state: data.state,
        cep: data.cep,
        complement: data.complement,
        details: selectedShipping,
      },
      items: cart,
      payment: {
        method: 'Manual',
        total: total,
        subtotal: subtotal,
        shippingCost: shippingCost,
      },
    };
    
    const result = await saveOrder(orderDetails as any);
    
    if (result.orderId) {
      toast({ title: 'Sucesso!', description: `Pedido #${result.orderId} criado com sucesso.` });
      router.push('/dashboard/orders');
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }

    setIsSubmitting(false);
  };
  
  const adminLinks = [
    { href: '/dashboard', label: 'Início', icon: 'Home' },
    { href: '/dashboard/orders', label: 'Pedidos', icon: 'Package' },
    { href: '#', label: 'Produtos', icon: 'Box' },
    { href: '#', label: 'Clientes', icon: 'Users' },
  ];

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
    <>
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={adminLinks} isAdmin={true} />
          <main className="flex-1">
            <h1 className="text-2xl font-semibold mb-6">Criar Novo Pedido</h1>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><User /> Informações do Cliente</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="docNumber" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><Home /> Endereço de Entrega</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                         <FormField control={form.control} name="cep" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         </div>
                         <FormField control={form.control} name="complement" render={({ field }) => (<FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} readOnly/></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} readOnly/></FormControl><FormMessage /></FormItem>)} />
                         </div>
                      </CardContent>
                    </Card>
                    
                    {/* Shipping Options */}
                     <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Truck /> Opções de Frete</CardTitle>
                        <Button type="button" onClick={handleCalculateShipping} disabled={isLoadingShipping} size="sm">
                            {isLoadingShipping ? <Loader2 className="animate-spin" /> : 'Calcular Frete'}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {shippingOptions.length > 0 && (
                             <RadioGroup value={selectedShipping?.id.toString()} onValueChange={handleSelectShipping} className="space-y-2">
                                {shippingOptions.map((option) => (
                                    <Label key={option.id} htmlFor={option.id.toString()} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted has-[:checked]:border-primary">
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                                            <span>{option.name} ({option.company.name})</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold">R$ {parseFloat(option.price).toFixed(2).replace('.', ',')}</span>
                                            <p className="text-xs text-muted-foreground">{option.delivery_time} dias</p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        )}
                        {!isLoadingShipping && shippingOptions.length === 0 && <p className="text-muted-foreground text-sm text-center">Preencha o CEP e adicione produtos para calcular o frete.</p>}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-1 space-y-6">
                    {/* Order Items */}
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><Package /> Itens do Pedido</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar produto..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            {filteredProducts.length > 0 && (
                                <div className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} onClick={() => handleSelectProduct(p)} className="p-2 hover:bg-accent cursor-pointer text-sm">
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                           {cart.length > 0 ? cart.map(item => (
                               <div key={item.id} className="flex items-start gap-4 text-sm p-2 rounded-md border">
                                   <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" />
                                   <div className="flex-grow">
                                       <p className="font-semibold">{item.name}</p>
                                       <p className="text-xs text-muted-foreground">{item.options}</p>
                                       <p className="font-medium mt-1">R$ {item.price.toFixed(2).replace('.',',')}</p>
                                   </div>
                                   <div className="flex flex-col items-end gap-2">
                                       <Input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value, 10))} className="w-16 h-8 text-center" />
                                       <Button type="button" variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                   </div>
                               </div>
                           )) : (
                               <div className="text-muted-foreground text-center text-sm py-8 border-2 border-dashed rounded-lg">
                                  <p>O carrinho está vazio.</p>
                                  <p className="text-xs">Use a busca acima para adicionar produtos.</p>
                                </div>
                           )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex-col items-stretch space-y-2 pt-4 border-t">
                           <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.',',')}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frete</span>
                                <span>R$ {shippingCost.toFixed(2).replace('.',',')}</span>
                           </div>
                            <Separator />
                           <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>R$ {total.toFixed(2).replace('.',',')}</span>
                           </div>
                           <Button type="submit" size="lg" disabled={isSubmitting}>
                               {isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar Pedido'}
                           </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </form>
            </FormProvider>
          </main>
        </div>
      </div>
    </div>
    <ProductConfigDialog
        isOpen={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        product={productToConfig}
        onAddToCart={addToCart}
    />
    </>
  );
}
