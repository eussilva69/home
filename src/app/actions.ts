
'use server';

import { z } from 'zod';
import { loginSchema } from '@/lib/schemas';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import type { PaymentCreateData } from 'mercadopago/dist/clients/payment/create/types';
import type { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
import { randomUUID } from 'crypto';
import type { CreatePixPaymentInput, CreatePreferenceInput, OrderDetails, Address } from '@/lib/schemas';
import { melhorEnvioService } from '@/services/melhor-envio.service';
import type { CartItemType } from '@/hooks/use-cart';
import { firestore } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc, getDocs, writeBatch, query, where, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';


// Adicione o Access Token do vendedor
const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-669430014263398-080114-d9ae331ae39f4d3412d982254159a3ac-1118229328';
const SITE_URL = 'https://homesdes.netlify.app';

const client = new MercadoPagoConfig({ 
    accessToken: MERCADO_PAGO_ACCESS_TOKEN,
    options: { timeout: 5000 }
});

const paymentClient = new Payment(client);
const preferenceClient = new Preference(client);


// Funções base de comunicação com a API
async function createPixPayment(input: CreatePixPaymentInput) {
    const paymentData: PaymentCreateData = {
        body: {
            transaction_amount: input.transaction_amount,
            description: input.description,
            payment_method_id: 'pix',
            payer: {
                email: input.payer.email,
                first_name: input.payer.first_name,
                last_name: input.payer.last_name,
                identification: {
                    type: input.payer.identification.type,
                    number: input.payer.identification.number,
                }
            }
        }
    };

     try {
        const result = await paymentClient.create(paymentData, { idempotencyKey: randomUUID() });
        return result;
    } catch (error: any) {
        console.error("Erro detalhado da API do Mercado Pago (Pix):", JSON.stringify(error.cause, null, 2));
        throw error;
    }
}

async function createPreference(input: CreatePreferenceInput) {
    const itemsWithCurrency = input.items.map(item => ({
        ...item,
        currency_id: 'BRL',
    }));

    const preferenceData: PreferenceCreateData = {
        body: {
            items: itemsWithCurrency,
            payer: {
                name: input.payer.name,
                surname: input.payer.surname,
                email: input.payer.email,
                identification: {
                    type: input.payer.identification.type,
                    number: input.payer.identification.number,
                }
            },
            back_urls: {
                success: `${SITE_URL}/checkout`,
                failure: `${SITE_URL}/checkout`,
                pending: `${SITE_URL}/checkout`,
            },
            auto_return: 'approved',
        }
    };

    try {
        const result = await preferenceClient.create(preferenceData);
        return result;
    } catch (error: any) {
        console.error("Erro detalhado da API do Mercado Pago (Preference):", JSON.stringify(error.cause, null, 2));
        throw error;
    }
}

export async function getPaymentStatus(paymentId: number) {
    try {
        const payment = await paymentClient.get({ id: paymentId });
        return {
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
        };
    } catch (error: any) {
         console.error(`Erro ao consultar status do pagamento ${paymentId}:`, JSON.stringify(error.cause, null, 2));
         // Lançar o erro para que o cliente saiba que a consulta falhou
         throw new Error(`Falha ao consultar o pagamento: ${error.message}`);
    }
}

export async function saveOrder(orderDetails: Omit<OrderDetails, 'status' | 'createdAt'>) {
    try {
        const ordersCollectionRef = collection(firestore, 'orders');

        // Calcula as dimensões totais do pacote
        const totalWeight = orderDetails.items.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
        const maxHeight = Math.max(...orderDetails.items.map(item => item.height));
        const totalWidth = orderDetails.items.reduce((acc, item) => acc + (item.width * item.quantity), 0); // Empilhamento lado a lado
        const maxLength = Math.max(...orderDetails.items.map(item => item.length));


        const finalOrderDetails = {
            ...orderDetails,
            shipping: {
                ...orderDetails.shipping,
                weight: totalWeight,
                height: maxHeight,
                width: totalWidth,
                length: maxLength,
            },
            createdAt: serverTimestamp(),
            status: 'Aprovado' // ou 'Pendente', dependendo da lógica
        };

        const docRef = await addDoc(ordersCollectionRef, finalOrderDetails);
        return { success: true, orderId: docRef.id };
    } catch (error: any) {
        console.error("Erro ao salvar pedido no Firestore:", error);
        return { success: false, message: 'Falha ao registrar o pedido no banco de dados.' };
    }
}

// Funções de orquestração chamadas pelo frontend
export async function processPixPayment(input: CreatePixPaymentInput) {
    try {
        const result = await createPixPayment(input);
        if (result && result.id && result.point_of_interaction?.transaction_data) {
            return {
                success: true,
                paymentId: result.id,
                qrCode: result.point_of_interaction.transaction_data.qr_code,
                qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64
            };
        }
        throw new Error('Resposta inválida da API de pagamento.');
    } catch (error: any) {
        return {
            success: false,
            message: error.cause?.error?.message || 'Ocorreu um erro ao gerar o pagamento Pix.'
        };
    }
}

export async function processRedirectPayment(input: CreatePreferenceInput) {
    try {
        const result = await createPreference(input);
        if (result && result.id && result.init_point) {
            return {
                success: true,
                preferenceId: result.id,
                redirectUrl: result.init_point,
            };
        }
        throw new Error('Resposta inválida da API de preferências.');
    } catch (error: any) {
        return {
            success: false,
            message: error.cause?.error?.message || 'Ocorreu um erro ao criar a preferência de pagamento.'
        };
    }
}

export async function calculateShipping(postalCode: string, products: CartItemType[]) {
    try {
        const result = await melhorEnvioService.calculateShipping(postalCode, products);
        return {
            success: true,
            options: result
        }
    } catch (error: any) {
        console.error("Erro ao calcular frete:", error);
        return {
            success: false,
            message: error.message || 'Falha ao calcular o frete.'
        }
    }
}

export async function loginAction(values: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Entrada inválida." };
    }
    return { success: "Login bem-sucedido! Redirecionando..." };
  } catch (error) {
    return { error: 'Falha ao fazer login. Verifique suas credenciais.' };
  }
}

export async function logoutAction() {
  try {
    return { success: "Logout bem-sucedido." };
  } catch (error) {
    return { error: 'Falha ao fazer logout.' };
  }
}

// Funções de Gerenciamento de Endereço

export async function addOrUpdateAddress(userId: string, address: Address) {
    try {
        const userRef = doc(firestore, 'users', userId);
        const addressesRef = collection(userRef, 'addresses');
        
        let addressId = address.id;
        
        // Se for um novo endereço principal, desmarca os outros
        if (address.isDefault) {
            const q = query(addressesRef, where("isDefault", "==", true));
            const querySnapshot = await getDocs(q);
            const batch = writeBatch(firestore);
            querySnapshot.forEach(doc => {
                batch.update(doc.ref, { isDefault: false });
            });
            await batch.commit();
        }

        if (addressId) {
            // Atualiza endereço existente
            const addressRef = doc(addressesRef, addressId);
            await setDoc(addressRef, { ...address, id: addressId }, { merge: true });
        } else {
            // Adiciona novo endereço
            const newAddressRef = doc(addressesRef); // Gera ID automaticamente
            addressId = newAddressRef.id;
            await setDoc(newAddressRef, { ...address, id: addressId });
        }
        
        return { success: true, addressId };
    } catch (error) {
        console.error("Erro ao salvar endereço:", error);
        return { success: false, message: 'Falha ao salvar o endereço.' };
    }
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
    try {
        const addressesRef = collection(firestore, 'users', userId, 'addresses');
        const snapshot = await getDocs(addressesRef);
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => doc.data() as Address);
    } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        return [];
    }
}

export async function deleteAddress(userId: string, addressId: string) {
    try {
        const addressRef = doc(firestore, 'users', userId, 'addresses', addressId);
        await deleteDoc(addressRef);
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar endereço:", error);
        return { success: false, message: 'Falha ao deletar o endereço.' };
    }
}

export async function setDefaultAddress(userId: string, addressId: string) {
    const addressesRef = collection(firestore, 'users', userId, 'addresses');
    const batch = writeBatch(firestore);

    try {
        // Remove 'isDefault' de qualquer outro endereço
        const q = query(addressesRef, where("isDefault", "==", true));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
        });

        // Define o novo endereço como padrão
        const newDefaultRef = doc(addressesRef, addressId);
        batch.update(newDefaultRef, { isDefault: true });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Erro ao definir endereço padrão:", error);
        return { success: false, message: 'Falha ao definir o endereço como padrão.' };
    }
}

// Função para buscar usuário no Firestore
export async function getUserData(userId: string) {
    try {
        const userDocRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: false, message: "Usuário não encontrado." };
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        return { success: false, message: "Erro ao buscar dados do usuário." };
    }
}

// Função para buscar um pedido específico
export async function getOrderById(orderId: string) {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      }
      return { success: false, message: 'Pedido não encontrado.' };
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, message: 'Erro ao buscar dados do pedido.' };
    }
}

// Função para atualizar o código de rastreio e o status
export async function updateTrackingCode(orderId: string, trackingCode: string) {
    try {
        const orderRef = doc(firestore, 'orders', orderId);
        await updateDoc(orderRef, { 
            trackingCode: trackingCode,
            status: 'A caminho', // Atualiza o status automaticamente
            shippedAt: serverTimestamp() // Salva a data de envio
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar código de rastreio:", error);
        return { success: false, message: "Falha ao atualizar o código de rastreio." };
    }
}

// Função para atualizar apenas o status do pedido
export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const orderRef = doc(firestore, 'orders', orderId);
        await updateDoc(orderRef, { status: status });
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        return { success: false, message: "Falha ao atualizar o status do pedido." };
    }
}

export async function clearAllOrders() {
    try {
        const ordersRef = collection(firestore, 'orders');
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            return { success: true, message: "A coleção 'orders' já está vazia." };
        }

        const batch = writeBatch(firestore);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return { success: true, message: `Todos os ${snapshot.size} pedidos foram excluídos com sucesso.` };
    } catch (error) {
        console.error("Erro ao limpar os pedidos:", error);
        return { success: false, message: 'Falha ao limpar a coleção de pedidos.' };
    }
}
