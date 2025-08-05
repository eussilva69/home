
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Método não permitido" }, { status: 405 });
  }

  const { destinatario, type } = await req.json();

  if (!destinatario || !type) {
    return NextResponse.json({ message: "Destinatário e tipo de e-mail são obrigatórios" }, { status: 400 });
  }

  let subject = '';
  let htmlContent = '';
  let attachFile = false;

  switch (type) {
    case 'welcome':
      subject = "Bem-vindo à Homes Design";
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Bem-vindo à Homes Designs</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fc;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#111827; color:#ffffff; text-align:center; padding:20px;">
                <h1 style="margin:0; font-size:24px;">Homes Designs</h1>
                <p style="margin:5px 0 0; font-size:14px; color:#d1d5db;">Transformando paredes em arte</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-bottom:10px;">Seja muito bem-vindo(a)!</h2>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  Obrigado por se cadastrar em nosso site. Aqui na <strong>Homes Designs</strong>, somos apaixonados por dar vida aos ambientes através da arte.
                </p>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  Trabalhamos com quadros decorativos únicos e cuidadosamente selecionados, perfeitos para transformar qualquer espaço da sua casa ou escritório.
                </p>
                <p style="margin:0 0 20px; font-size:15px; line-height:22px;">
                  A partir de agora, você receberá novidades, ofertas exclusivas e inspirações incríveis diretamente no seu e-mail.
                </p>
                <a href="https://homedecorinteriores.com" style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:bold;">
                  Visitar nossa loja
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                © 2025 Homes Designs – Todos os direitos reservados<br>
                <a href="https://homedecorinteriores.com" style="color:#3b82f6; text-decoration:none;">homedecorinteriores.com</a>
              </td>
            </tr>
          </table>
        </body>
        </html>`;
      attachFile = true;
      break;

    case 'orderApproved':
      subject = "Compra Aprovada - Homes Designs";
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Compra Aprovada - Homes Designs</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fc;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#16a34a; color:#ffffff; text-align:center; padding:20px;">
                <h1 style="margin:0; font-size:24px;">Compra Aprovada</h1>
                <p style="margin:5px 0 0; font-size:14px; color:#d1fae5;">Obrigado por comprar na Homes Designs</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-bottom:10px;">Seu pedido foi confirmado ✅</h2>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  Olá, obrigado por escolher a <strong>Homes Designs</strong>! Sua compra foi aprovada e está sendo processada.
                </p>
                <p style="margin:0 0 20px; font-size:15px; line-height:22px;">
                  Em breve você receberá o código de rastreio para acompanhar sua entrega.
                </p>
                <a href="https://homedecorinteriores.com" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:bold;">
                  Acompanhar pedido
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                © 2025 Homes Designs – Todos os direitos reservados<br>
                <a href="https://homedecorinteriores.com" style="color:#3b82f6; text-decoration:none;">homedecorinteriores.com</a>
              </td>
            </tr>
          </table>
        </body>
        </html>`;
      break;

    case 'orderShipped':
      subject = "Seu pedido está a caminho - Homes Designs";
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Seu pedido está a caminho - Homes Designs</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fc;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#2563eb; color:#ffffff; text-align:center; padding:20px;">
                <h1 style="margin:0; font-size:24px;">Seu pedido está a caminho</h1>
                <p style="margin:5px 0 0; font-size:14px; color:#dbeafe;">Homes Designs</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-bottom:10px;">Boa notícia! 🚚</h2>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  O status do seu pedido foi atualizado. Ele já está a caminho e em breve será entregue.
                </p>
                <p style="margin:0 0 20px; font-size:15px; line-height:22px;">
                  Para mais detalhes e acompanhar a entrega em tempo real, clique no botão abaixo.
                </p>
                <a href="https://homedecorinteriores.com/minha-conta/pedidos" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:bold;">
                  Acompanhar pedido
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                © 2025 Homes Designs – Todos os direitos reservados<br>
                <a href="https://homedecorinteriores.com" style="color:#3b82f6; text-decoration:none;">homedecorinteriores.com</a>
              </td>
            </tr>
          </table>
        </body>
        </html>`;
      break;
    
    case 'orderDelivered':
      subject = "Seu pedido foi entregue - Homes Designs";
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Seu pedido foi entregue - Homes Designs</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fc;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#16a34a; color:#ffffff; text-align:center; padding:20px;">
                <h1 style="margin:0; font-size:24px;">Pedido Entregue!</h1>
                <p style="margin:5px 0 0; font-size:14px; color:#d1fae5;">Aproveite sua nova arte!</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-bottom:10px;">Sua arte chegou! ✨</h2>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  Ótima notícia! Nosso sistema indica que seu pedido da <strong>Homes Designs</strong> foi entregue com sucesso.
                </p>
                <p style="margin:0 0 20px; font-size:15px; line-height:22px;">
                  Esperamos que você ame seus novos quadros tanto quanto nós amamos criá-los. Adoraríamos ver como ficou! Compartilhe uma foto nas redes sociais e marque a gente.
                </p>
                <a href="https://homedecorinteriores.com" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:bold;">
                  Visitar Loja
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                © 2025 Homes Designs – Todos os direitos reservados<br>
                <a href="https://homedecorinteriores.com" style="color:#3b82f6; text-decoration:none;">homedecorinteriores.com</a>
              </td>
            </tr>
          </table>
        </body>
        </html>`;
      break;

    case 'orderCancelled':
      subject = "Seu pedido foi cancelado - Homes Designs";
      htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Seu pedido foi cancelado - Homes Designs</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8f9fc;">
          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#dc2626; color:#ffffff; text-align:center; padding:20px;">
                <h1 style="margin:0; font-size:24px;">Pedido Cancelado</h1>
                <p style="margin:5px 0 0; font-size:14px; color:#fee2e2;">Homes Designs</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#111827;">
                <h2 style="margin-bottom:10px;">Aviso sobre o seu pedido</h2>
                <p style="margin:0 0 15px; font-size:15px; line-height:22px;">
                  Olá, informamos que o seu pedido na <strong>Homes Designs</strong> foi cancelado.
                </p>
                <p style="margin:0 0 20px; font-size:15px; line-height:22px;">
                  Se você não solicitou o cancelamento ou tiver alguma dúvida, por favor, entre em contato com nosso suporte ao cliente.
                </p>
                <a href="https://homedecorinteriores.com" style="display:inline-block; background:#dc2626; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-size:15px; font-weight:bold;">
                  Entrar em Contato
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f4f6; text-align:center; padding:15px; font-size:12px; color:#6b7280;">
                © 2025 Homes Designs – Todos os direitos reservados<br>
                <a href="https://homedecorinteriores.com" style="color:#3b82f6; text-decoration:none;">homedecorinteriores.com</a>
              </td>
            </tr>
          </table>
        </body>
        </html>`;
      break;

    default:
      return NextResponse.json({ message: "Tipo de e-mail inválido" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: "ioaiaa354@gmail.com",
        pass: "rjqh gtng utlg xjva",
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Homes Design" <ioaiaa354@gmail.com>',
      to: destinatario,
      subject: subject,
      html: htmlContent,
    };

    if (attachFile) {
      const anexoPath = path.join(process.cwd(), "public", "relatorio.pdf");
      if (fs.existsSync(anexoPath)) {
        mailOptions.attachments = [{ filename: "relatorio.pdf", path: anexoPath }];
      } else {
        console.warn(`Arquivo de anexo não encontrado em: ${anexoPath}`);
      }
    }

    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "E-mail enviado com sucesso!", infoId: info.messageId });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ message: "Erro ao enviar e-mail", error: errorMessage }, { status: 500 });
  }
}
