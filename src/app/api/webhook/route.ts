
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, getOrderByPaymentId, updateOrderStatus } from '@/app/actions';

// Função para introduzir um atraso
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getPaymentId(req: NextRequest): Promise<string | null> {
    const { searchParams } = new URL(req.url);
    if (searchParams.has('id')) {
        return searchParams.get('id');
    }
    
    // Tenta ler o corpo como JSON apenas se não houver parâmetros na URL
    try {
        const body = await req.json();
        // O Mercado Pago pode enviar o ID de diferentes formas
        return body.data?.id || body.id || null;
    } catch (error) {
        console.error("Webhook: Não foi possível parsear o corpo da requisição ou corpo vazio.", error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Clone a requisição para poder ler o corpo mais de uma vez se necessário
        const reqClone = req.clone();
        const body = await req.json().catch(() => ({})); // Garante que o body seja um objeto
        
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
                
                // Lógica de retry: Se o pedido não for encontrado, espere um pouco e tente novamente.
                // Isso resolve o problema de a notificação do webhook chegar antes de o pedido ser salvo.
                if (!orderResult.success) {
                    console.warn(`[Webhook] Pedido para o pagamento ${paymentId} não encontrado na 1ª tentativa. Tentando novamente em 3 segundos...`);
                    await delay(3000); 
                    orderResult = await getOrderByPaymentId(paymentId);
                }

                if (orderResult.success && orderResult.orderId) {
                    console.log(`[Webhook] Pedido ${orderResult.orderId} encontrado! Atualizando status para 'Aprovado'.`);
                    
                    await updateOrderStatus(orderResult.orderId, 'Aprovado');

                    // Envio do e-mail de confirmação
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

        // Retorna 200 OK para o Mercado Pago para confirmar o recebimento da notificação
        return NextResponse.json({ status: 'received' }, { status: 200 });

    } catch (error) {
        console.error("[Webhook] Erro catastrófico no processamento do webhook:", error);
        return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
    }
}
