import ProductCard from '@/components/shared/product-card';
import { getProducts } from '@/app/actions';
import { firestore } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { products as mockProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/schemas';

// Helper to extract the base ID from a cart item ID (e.g., 'AN-S1-size-color' -> 'AN-S1')
const getBaseProductId = (cartItemId: string): string => {
    const match = cartItemId.match(/^[A-Z]{2}-[A-Z0-9]{1,2}/);
    if (match) {
        return match[0];
    }
    return cartItemId.split('-')[0];
};

// Helper function to shuffle an array and get the first N items
function getFirstNRandomItems<T>(array: T[], n: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}


export default async function BestSellers() {
  let bestSellers: Product[] = [];

  try {
    const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
    
    if (ordersSnapshot.empty) {
      // Fallback para 4 produtos aleatórios se não houver pedidos
      bestSellers = getFirstNRandomItems(mockProducts, 4);
    } else {
      const productCounts = new Map<string, number>();
      
      ordersSnapshot.forEach(doc => {
        const orderItems = doc.data().items || [];
        orderItems.forEach((item: { id: string, quantity: number }) => {
          const baseId = getBaseProductId(item.id);
          productCounts.set(baseId, (productCounts.get(baseId) || 0) + item.quantity);
        });
      });

      const sortedProducts = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]);
      const top4Ids = sortedProducts.slice(0, 4).map(entry => entry[0]);
      
      if (top4Ids.length > 0) {
        const allProducts = await getProducts();
        bestSellers = top4Ids.map(id => allProducts.find(p => p.id === id)).filter((p): p is Product => p !== undefined);
      }
      
      // Se não houver produtos suficientes, preenche com produtos aleatórios
      if (bestSellers.length < 4) {
        const randomFallback = getFirstNRandomItems(mockProducts, 4 - bestSellers.length);
        bestSellers.push(...randomFallback);
      }
    }
  } catch (error) {
    console.error("Erro ao buscar os mais vendidos:", error);
    // Em caso de erro, usa o fallback de 4 produtos aleatórios
    bestSellers = getFirstNRandomItems(mockProducts, 4);
  }

  return (
    <section id="bestsellers" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">Nossos Mais Vendidos</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Amados por nossos clientes, perfeitos para o seu espaço.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
