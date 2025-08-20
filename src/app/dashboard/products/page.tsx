
'use client';

import { useEffect, useState, useMemo } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import { Loader2, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/schemas';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collections as allCollections } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';


export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const isAdmin = user?.email === 'vvatassi@gmail.com';

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        const productsRef = collection(firestore, 'products');
        const q = query(productsRef, where("category", "!=", "Mobílias"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          let fetchedProducts = snapshot.docs.map(doc => ({...doc.data(), id: doc.id }) as Product);
          
           // Sort alphabetically by name client-side
          fetchedProducts = fetchedProducts.sort((a, b) => a.name.localeCompare(b.name));

          setProducts(fetchedProducts);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching products: ", error);
          setLoading(false);
        });

        return () => unsubscribe();
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(product =>
        selectedCategory === 'all' || product.category === selectedCategory
      );
  }, [products, searchTerm, selectedCategory]);

  const handleConfirmDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }

  const handleDelete = async () => {
    if (!productToDelete) return;

    const result = await deleteProduct(productToDelete.id);
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      // The onSnapshot listener will automatically update the UI
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
    
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <DashboardSidebar isAdmin={isAdmin} />
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quadros</CardTitle>
                <Button asChild>
                  <Link href="/dashboard/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Quadro
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative w-full sm:w-auto flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {allCollections.filter(c => c.name !== 'Mobílias').map(c => <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Arte</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Arranjo</TableHead>
                      <TableHead className="text-right">Preço Base</TableHead>
                      <TableHead className="w-[120px] text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={product.artwork_image || product.image || "https://placehold.co/100x100"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                        <TableCell>{product.arrangement}</TableCell>
                        <TableCell className="text-right">R$ {product.price.toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                                Editar
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleConfirmDelete(product)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 {filteredProducts.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-12">
                        Nenhum produto encontrado.
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <div className="h-[10cm]" />
      <Footer />
    </div>
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente o produto <span className="font-semibold">"{productToDelete?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    