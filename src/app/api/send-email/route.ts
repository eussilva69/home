
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Método não permitido' }, { status: 405 });
  }

  const { destinatario, type, data } = await req.json();

  if (!destinatario || !type) {
    return NextResponse.json({ message: 'Destinatário e tipo de e-mail são obrigatórios' }, { status: 400 });
  }

  const result = await sendEmail({ destinatario, type, data });

  if (result.success) {
    return NextResponse.json({ message: 'E-mail enviado com sucesso!', infoId: result.messageId });
  } else {
    return NextResponse.json({ message: 'Erro ao enviar e-mail', error: result.error }, { status: 500 });
  }
}
