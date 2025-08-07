
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, getOrderByPaymentId, updateOrderStatus } from '@/app/actions';
import crypto from 'crypto';

// Função para introduzir um atraso
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para validar a assinatura do Mercado Pago
async function validateSignature(req: NextRequest) {
    const signatureHeader = req.headers.get('x-signature');
    if (!signatureHeader) {
        console.error('[Webhook Security] Cabeçalho x-signature ausente.');
        return false;
    }

    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (!secret) {
        console.error('[Webhook Security] A chave secreta do webhook não está configurada no .env');
        return false; // Não pode validar sem a chave secreta
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

    const searchParams = req.nextUrl.searchParams;
    const body = await req.text(); // Lê o corpo como texto bruto para a validação

    const manifest = `id:${searchParams.get('id')};request-id:${req.headers.get('x-request-id')};ts:${ts};${body}`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const generatedHash = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hash));
}


export async function POST(req: NextRequest) {
    const reqCloneForValidation = req.clone();
    const reqCloneForBodyParsing = req.clone();

    try {
        // 1. Validar a assinatura primeiro
        const isSignatureValid = await validateSignature(reqCloneForValidation);
        if (!isSignatureValid) {
            console.warn('[Webhook Security] Assinatura inválida. Requisição rejeitada.');
            return NextResponse.json({ status: 'error', message: 'Assinatura inválida' }, { status: 401 });
        }
        console.log('[Webhook Security] Assinatura validada com sucesso.');

        // 2. Prosseguir com a lógica do webhook
        const body = await reqCloneForBodyParsing.json().catch(() => ({})); // Garante que o body seja um objeto
        
        const topic = new URL(req.url).searchParams.get('topic') || body.topic || body.type;
        const paymentId = new URL(req.url).searchParams.get('id') || body.data?.id;

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

                if (orderResult.success && orderResult.orderId) {
                    console.log(`[Webhook] Pedido ${orderResult.orderId} encontrado! Atualizando status para 'Aprovado'.`);
                    
                    await updateOrderStatus(orderResult.orderId, 'Aprovado');

                    if (orderResult.data?.customer?.email) {
                        await fetch(new URL("/api/send-email", req.url).toString(), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ destinatario: orderResult.data.customer.email, type: 'orderApproved' }),
                        });
                         console.log(`[Webhook] E-mail de confirmação enviado para ${orderResult.data.customer.email}.`);
                    }
                    
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
