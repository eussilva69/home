
'use server';

import { z } from 'zod';
import { loginSchema } from '@/lib/schemas';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import type { PaymentCreateData } from 'mercadopago/dist/clients/payment/create/types';
import type { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
import { randomUUID } from 'crypto';
import type { CreatePixPaymentInput, CreatePreferenceInput } from '@/lib/schemas';


// Adicione o Access Token do vendedor
const MERCADO_PAGO_ACCESS_TOKEN = 'TEST-669430014263398-080114-6223aa7da057a138568fab88ea605ccd-1118229328';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

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
