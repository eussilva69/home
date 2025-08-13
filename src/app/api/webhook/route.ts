
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, getOrderByPaymentId, updateOrderStatus } from '@/app/actions';
import { sendEmail } from '@/lib/nodemailer';
import crypto from 'crypto';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const WEBHOOK_SECRET = "507bc239502ea3a50de881b7de226e10adb6434c19078bfa0dac35322c8bcdc6";

async function validateSignature(req: NextRequest) {
    const signatureHeader = req.headers.get('x-signature');
    if (!signatureHeader) {
        console.error('[Webhook Security] Cabeçalho x-signature ausente.');
        return false;
    }

    const parts = signatureHeader.split(',').reduce((acc, part) => {
        const [key, value] = part.split('=');
        acc[key.trim()] = value.trim();
        return acc;
    }, {} as Record<string, string>);

    const ts = parts.ts;
    const hash = parts.v1;

    if (!ts || !hash) {
        console.error('[Webhook Security] Formato do cabeçalho de assinatura inválido.');
        return false;
    }

    const bodyText = await req.text(); 
    const searchParams = new URL(req.url).searchParams;
    const manifest = `id:${searchParams.get('data.id')};request-id:${req.headers.get('x-request-id')};ts:${ts};${bodyText}`;

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(manifest);
    const generatedHash = hmac.digest('hex');
    
    if (generatedHash !== hash) {
        console.warn(`[Webhook Security] Falha na validação da assinatura. Hash esperado: ${hash}, Hash gerado: ${generatedHash}`);
        return false;
    }

    return true;
}

export async function POST(req: NextRequest) {
    const reqCloneForValidation = req.clone();
    const reqCloneForBodyParsing = req.clone();

    try {
        const isSignatureValid = await validateSignature(reqCloneForValidation);
        if (!isSignatureValid) {
            console.warn('[Webhook Security] Assinatura inválida. Requisição rejeitada.');
            return NextResponse.json({ status: 'error', message: 'Assinatura inválida' }, { status: 401 });
        }
        console.log('[Webhook Security] Assinatura validada com sucesso.');

        const body = await reqCloneForBodyParsing.json().catch(() => ({})); 
        const topic = body.topic || body.type;
        const paymentId = body.data?.id;

        console.log(`[Webhook] Notificação recebida: Tópico='${topic}', ID='${paymentId}'`);

        if (topic === 'payment' && paymentId) {
            console.log(`[Webhook] Processando pagamento com ID: ${paymentId}`);

            const paymentDetails = await getPaymentStatus(Number(paymentId));
            console.log('[Webhook] Detalhes do pagamento consultados:', paymentDetails);

            if (paymentDetails && paymentDetails.status === 'approved') {
                console.log(`[Webhook] Pagamento ${paymentId} aprovado. Tentando encontrar o pedido no Firestore...`);
                
                let orderResult = await getOrderByPaymentId(paymentId);
                
                if (!orderResult.success) {
                    console.warn(`[Webhook] Pedido para o pagamento ${paymentId} não encontrado na 1ª tentativa. Tentando novamente em 3 segundos...`);
                    await delay(3000); 
                    orderResult = await getOrderByPaymentId(paymentId);
                }

                if (orderResult.success && orderResult.orderId && orderResult.data) {
                    const orderData = orderResult.data;
                    console.log(`[Webhook] Pedido ${orderResult.orderId} encontrado! Atualizando status para 'Aprovado'.`);
                    
                    await updateOrderStatus(orderResult.orderId, 'Aprovado');

                    // Enviar e-mail de confirmação para o cliente
                    if (orderData.customer?.email) {
                        await sendEmail({
                            destinatario: orderData.customer.email,
                            type: 'orderApproved',
                            data: {
                                orderId: orderResult.orderId,
                                customerName: orderData.customer.firstName,
                            }
                        });
                    }

                    // Enviar e-mail de notificação para o admin
                    await sendEmail({
                        destinatario: 'vvatassi@gmail.com',
                        type: 'newSaleAdmin',
                        data: {
                            orderId: orderResult.orderId,
                            customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
                            total: orderData.payment.total,
                            items: orderData.items,
                        }
                    });
                    
                    console.log(`[Webhook] Pedido ${orderResult.orderId} processado com sucesso.`);
                } else {
                    console.error(`[Webhook] Falha Crítica: Pedido para o pagamento ${paymentId} não foi encontrado no Firestore após 2 tentativas.`);
                }
            } else {
                console.log(`[Webhook] Pagamento ${paymentId} não está com status 'approved'. Status atual: ${paymentDetails?.status}`);
            }
        }

        return NextResponse.json({ status: 'received' }, { status: 200 });

    } catch (error) {
        console.error("[Webhook] Erro catastrófico no processamento do webhook:", error);
        return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
    }
}
