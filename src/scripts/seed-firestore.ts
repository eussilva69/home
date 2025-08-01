
import { firestore } from '../lib/firebase';
import { products } from '../lib/mock-data';
import { collection, getDocs, addDoc, query, writeBatch } from 'firebase/firestore';

async function seedDatabase() {
  const productsCollectionRef = collection(firestore, 'products');

  try {
    // 1. Check if the collection is already populated and delete existing documents
    const q = query(productsCollectionRef);
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log('Coleção "products" já contém dados. Deletando dados antigos...');
      const batch = writeBatch(firestore);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Dados antigos deletados com sucesso.');
    }

    console.log('Começando a popular a coleção "products"...');

    // 2. Add each product to the collection
    const batch = writeBatch(firestore);
    products.forEach((product) => {
      const { hint_alt, ...productData } = product; 
      const newDocRef = collection(firestore, 'products').doc(); // Auto-generates an ID
      batch.set(newDocRef, productData);
      console.log(`Produto "${product.name}" adicionado ao batch.`);
    });

    await batch.commit();

    console.log('\n--------------------------------------------------');
    console.log('✨ Banco de dados populado com sucesso! ✨');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Ocorreu um erro ao popular o banco de dados:', error);
  }
}

seedDatabase();
