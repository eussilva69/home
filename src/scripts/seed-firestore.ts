
import { firestore } from '../lib/firebase';
import { products } from '../lib/mock-data';
import { collection, getDocs, addDoc, query } from 'firebase/firestore';

async function seedDatabase() {
  const productsCollectionRef = collection(firestore, 'products');

  try {
    // 1. Check if the collection is already populated
    const q = query(productsCollectionRef);
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log('A coleção "products" já contém dados. O script não será executado para evitar duplicatas.');
      return;
    }

    console.log('A coleção "products" está vazia. Começando a popular...');

    // 2. Add each product to the collection
    const promises = products.map((product) => {
      // The hint_alt is only used for local images, not needed in Firestore.
      const { hint_alt, ...productData } = product; 
      return addDoc(productsCollectionRef, productData).then(() => {
          console.log(`Produto "${product.name}" adicionado com sucesso.`);
      });
    });

    await Promise.all(promises);

    console.log('\n--------------------------------------------------');
    console.log('✨ Banco de dados populado com sucesso! ✨');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Ocorreu um erro ao popular o banco de dados:', error);
  } finally {
    // The script should exit automatically. If it hangs, you can uncomment the line below.
    // process.exit(0);
  }
}

seedDatabase();
