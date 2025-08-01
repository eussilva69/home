
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const ACCESS_TOKEN = "TEST-669430014263398-080114-6223aa7da057a138568fab88ea605ccd-1118229328";

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const payment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    const paymentResponse = await payment.create({ body: paymentData });
    
    return NextResponse.json(paymentResponse, { status: 200 });
    
  } catch (error: any) {
    console.error('API Error:', error.cause?.message || error.message);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  }
}
