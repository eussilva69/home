
import { firestore } from '../lib/firebase';
import { products } from '../lib/mock-data';
import { collection, getDocs, addDoc, query, writeBatch, doc } from 'firebase/firestore';

async function seedDatabase() {
  const productsCollectionRef = collection(firestore, 'products');

  try {
    // 1. Check if the collection is already populated and delete existing documents
    console.log('Verificando se a coleção "products" já existe...');
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
    } else {
        console.log('Coleção "products" está vazia. Nenhum dado para deletar.');
    }

    console.log('Começando a popular a coleção "products" com a nova lista...');

    // 2. Add each product to the collection using the specified ID
    const batch = writeBatch(firestore);
    products.forEach((product) => {
      // Use the product's `id` field for the document ID
      const newDocRef = doc(firestore, 'products', product.id); 
      batch.set(newDocRef, product);
      console.log(`Produto "${product.name}" (ID: ${product.id}) adicionado ao batch.`);
    });

    await batch.commit();

    console.log('\n--------------------------------------------------');
    console.log(`✨ Banco de dados populado com ${products.length} produtos! ✨`);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('Ocorreu um erro ao popular o banco de dados:', error);
  }
}

seedDatabase();
