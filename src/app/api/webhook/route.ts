
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, getOrderByPaymentId, updateOrderStatus } from '@/app/actions';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || (await req.json()).topic;
    const paymentId = searchParams.get('id') || (await req.json()).data?.id;

    console.log(`Webhook recebido: Tópico=${topic}, ID=${paymentId}`);

    if (topic === 'payment' && paymentId) {
      console.log(`Processando pagamento com ID: ${paymentId}`);

      // 1. Consultar o status do pagamento
      const paymentDetails = await getPaymentStatus(Number(paymentId));
      
      console.log('Detalhes do pagamento:', paymentDetails);

      // 2. Se o pagamento foi aprovado, encontrar e atualizar o pedido
      if (paymentDetails && paymentDetails.status === 'approved') {
        console.log(`Pagamento ${paymentId} aprovado. Procurando pedido no Firestore...`);
        
        const orderResult = await getOrderByPaymentId(Number(paymentId));

        if (orderResult.success && orderResult.orderId) {
          console.log(`Pedido ${orderResult.orderId} encontrado. Atualizando status para 'Aprovado'.`);
          
          // 3. Atualizar o status do pedido para 'Aprovado'
          await updateOrderStatus(orderResult.orderId, 'Aprovado');

          // 4. (Opcional) Enviar e-mail de confirmação
          // Você pode adicionar a chamada para a API de e-mail aqui se desejar
          
          console.log(`Pedido ${orderResult.orderId} atualizado com sucesso.`);
        } else {
          console.warn(`Nenhum pedido encontrado para o paymentId: ${paymentId}`);
        }
      } else {
        console.log(`Pagamento ${paymentId} não está com status 'approved'. Status atual: ${paymentDetails?.status}`);
      }
    }

    // Retorna 200 OK para o Mercado Pago confirmar o recebimento
    return NextResponse.json({ status: 'OK' }, { status: 200 });

  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    // Retorna um erro, mas para o Mercado Pago ainda é importante responder 200 para evitar re-tentativas
    return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
  }
}
