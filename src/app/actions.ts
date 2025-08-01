
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

export async function createPaymentPreference(cartItems: CartItem[], shippingCost: number) {
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
        shipments: {
            cost: shippingCost,
            mode: "not_specified",
        },
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

type ShippingItem = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  quantity: number;
}

export async function calculateShipping(cep: string, items: ShippingItem[]) {
    const token = process.env.MELHOR_ENVIO_API_TOKEN;

    if (!token) {
        return { error: 'API de frete não configurada.' };
    }

    const body = {
        from: {
            postal_code: "38400-000", // CEP de origem (loja)
        },
        to: {
            postal_code: cep.replace(/\D/g, ''),
        },
        products: items.map(item => ({
            id: item.id,
            width: item.width,
            height: item.height,
            length: item.length,
            weight: item.weight,
            quantity: item.quantity,
        })),
    };

    try {
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Aplicação vvatassi@gmail.com'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Melhor Envio API Error:', errorData);
            return { error: `Erro ao calcular o frete: ${errorData.message || 'Verifique o CEP e tente novamente.'}` };
        }

        const data = await response.json();
        
        // Filtrar apenas opções válidas sem erro
        const validOptions = data.filter((option: any) => !option.error);

        return { shippingOptions: validOptions };
    } catch (error: any) {
        console.error('Error calculating shipping:', error);
        return { error: 'Falha na comunicação com a API de frete.' };
    }
}
