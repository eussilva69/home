
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { redirect } from 'next/navigation';

const ACCESS_TOKEN = "APP_USR-669430014263398-080114-d9ae331ae39f4d3412d982254159a3ac-1118229328";

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const payment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Adiciona um ID de idempotência para evitar pagamentos duplicados
    const idempotencyKey = req.headers.get('X-Idempotency-Key') || `req-${Date.now()}`;

    const paymentData = {
      transaction_amount: body.transaction_amount,
      token: body.token,
      description: body.description || 'Compra em Home Designer',
      installments: body.installments,
      payment_method_id: body.payment_method_id,
      payer: {
        email: body.payer.email,
        identification: {
          type: body.payer.identification.type,
          number: body.payer.identification.number,
        },
      },
    };

    const paymentResponse = await payment.create({ 
        body: paymentData,
        requestOptions: {
            idempotencyKey: idempotencyKey
        }
    });

    // Retorna o resultado com ID, status e detalhes
    return NextResponse.json(
      { 
        id: paymentResponse.id,
        status: paymentResponse.status,
        detail: paymentResponse.status_detail,
        qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      }, 
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('API Error:', error.cause ? JSON.stringify(error.cause, null, 2) : error.message);
    
    const errorMessage = error.cause?.error?.message || 'Ocorreu um erro no servidor.';
    const errorStatus = error.statusCode || 500;

    return NextResponse.json(
      { 
        error: "Falha no processamento do pagamento",
        message: errorMessage,
        details: error.cause?.error?.causes
      },
      { status: errorStatus }
    );
  }
}
