
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


type ShippingItem = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  quantity: number;
}

export async function calculateShipping(cep: string, items: ShippingItem[]) {
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMTEzYWZiZTJhYmM1Zjg4ZWQ5ZTBkM2JhZThiZTk0YTAyNWE1MDA2OWZlNDNmNTMwOTEzMDQzZDBhM2E2OWMxNjZmMGQ4YmQwYzQxZDk0N2IiLCJpYXQiOjE3NTQwNzgzMzguMzgxMzY3LCJuYmYiOjE3NTQwNzgzMzguMzgxMzY4LCJleHAiOjE3ODU2MTQzMzguMzY5NDQ1LCJzdWIiOiI5Zjg3ZmI5Zi03MjdmLTRkOGItYjI2Mi0wMTA2OThlZjk2M2QiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.SrziUlDOvd9w-RK0thnvOjNGAKqDutB2SnN9ig9V6-UcUgKrddLhtzjoHp0yqPeZXSim8__joUpDpFOoWZ6bAj4ichCN6Eo_M4-PFe8qmyK-AC_vbr2MW4ZEfjXzrA8i8a2UdyEV-WFIjyHHYByfCYcBLh-Zsk7rtP42IUR5ybj6eh5-In3HBAvxmn01KEsEPI2ctQEzzbjU7rJNWAeZqFN1FHmJPafWEK3BOieDsfIJ-BGyV_X40DZISEBqYHk0-TwD44bbWdp1_0yHbHnTOYXYzpFn87C66umi6R7ziQoS6UK0Ki0Y23bYMHSPfrA2ugNewaOjA_a6VMsH5hLF4R8P1c-7rH9L3t6nnDOURYY65A_Eej8mkkM8r4Bp-JoP8Fcj_ZKTfovgkRjhjYcpzs8bRqqgnO0ntKplIk-9BmJPPOUhY1_acg8fW_4EBLQ63VmSawEg3x5sT6GOZ0Kx33x4Zxwe8H7xXLGkrQc_GhNvK3k9bmK8kqBEfMGag0lpg3c7adtbtNlCr5d4JKDu9KCnsfMoRuHsxXZASDFXmA6iFG92IipJcPhaPVKnlDuAoghHgto-bFfeQTAF4IiBuIphigU6oYwdVlLMf--A92VYTeXJ8r062u3GOZt97qIV1fTkFaKB5sD_Orzgi1wFwRYLKXieYJ7aU9T27EjNYak";

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
