
'use server';

import { z } from 'zod';
import { loginSchema } from '@/lib/schemas';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Adicione o Access Token do vendedor
const client = new MercadoPagoConfig({ accessToken: 'TEST-669430014263398-080114-6223aa7da057a138568fab88ea605ccd-1118229328' });

export async function loginAction(values: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Entrada inválida." };
    }

    // This is a server action, but Firebase Auth SDK for web is client-side.
    // In a real app, you would use Firebase Admin SDK here or handle auth on the client.
    // For this prototype, we'll simulate the login and return success.
    // The actual sign-in will happen on the client after this returns.
    return { success: "Login bem-sucedido! Redirecionando..." };

  } catch (error) {
    // This is a simplified error handling. In a real app, you'd want to
    // distinguish between different kinds of errors (e.g., wrong password, user not found).
    return { error: 'Falha ao fazer login. Verifique suas credenciais.' };
  }
}

export async function logoutAction() {
  try {
    // Similarly, this would be handled on the client.
    // This action just confirms the intent.
    return { success: "Logout bem-sucedido." };
  } catch (error) {
    return { error: 'Falha ao fazer logout.' };
  }
}


type CartItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  picture_url: string;
}

export async function createPaymentPreference(cartItems: CartItem[]) {
  try {
    const preference = new Preference(client);

    const createdPreference = await preference.create({
      body: {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          picture_url: item.picture_url,
        })),
        back_urls: {
            success: "https://seusite.com/sucesso",
            failure: "https://seusite.com/falha",
            pending: "https://seusite.com/pendente"
        },
        auto_return: "approved"
      }
    });

    return { preferenceId: createdPreference.id };
  } catch (error: any) {
    console.error('Error creating payment preference:', error.cause?.message || error.message);
    return { error: 'Falha ao criar preferência de pagamento.' };
  }
}
