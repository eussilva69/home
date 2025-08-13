
'use server';

import nodemailer from 'nodemailer';
import { getEmailContent } from '@/lib/email-templates';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'ioaiaa354@gmail.com',
    pass: 'rjqh gtng utlg xjva',
  },
});

type SendEmailParams = {
  destinatario: string;
  type: string;
  data?: any;
};

export async function sendEmail({ destinatario, type, data }: SendEmailParams) {
  try {
    const { subject, htmlContent } = getEmailContent({ type, data });

    if (!subject || !htmlContent) {
      throw new Error('Tipo de e-mail inválido ou conteúdo não encontrado.');
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Homes Design" <ioaiaa354@gmail.com>',
      to: destinatario,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail do tipo '${type}' enviado para ${destinatario} com sucesso. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`Erro ao enviar e-mail do tipo '${type}' para ${destinatario}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}
