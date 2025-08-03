
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Método não permitido" }, { status: 405 });
  }

  const { destinatario } = await req.json();

  if (!destinatario) {
    return NextResponse.json({ message: "Destinatário é obrigatório" }, { status: 400 });
  }

  try {
    // Configurar transportador SMTP (Gmail com App Password)
    // ATENÇÃO: As credenciais estão diretamente no código a pedido do usuário.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "rodrigokanoyadani1@gmail.com", // e-mail remetente
        pass: "ruty bvrr ovof pjgb",         // senha de app (não senha normal do Gmail)
      },
    });

    // Caminho do PDF
    const anexoPath = path.join(process.cwd(), "public", "relatorio.pdf");

    // Conteúdo HTML do e-mail
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
          <div style="max-width:600px;margin:auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.05);">
            <div style="background:#111827;color:white;padding:30px;text-align:center;">
              <h1 style="margin:0;font-size:28px;">Homes Design</h1>
              <p style="margin-top:8px;color:#d1d5db;">Transformando paredes em arte</p>
            </div>
            <div style="padding:30px;color:#333;">
              <h2 style="margin-top:0;color:#111827;">Seja muito bem-vindo(a)!</h2>
              <p>Obrigado por se cadastrar em nosso site. Aqui na <strong>Homes Design</strong>, somos apaixonados por dar vida aos ambientes através da arte.</p>
              <p>Trabalhamos com quadros decorativos únicos e cuidadosamente selecionados, perfeitos para transformar qualquer espaço da sua casa ou escritório.</p>
              <p>A partir de agora, você receberá novidades, ofertas exclusivas e inspirações incríveis diretamente no seu e-mail.</p>
              <a href="https://homesdesign.com.br" target="_blank" style="display:inline-block;margin-top:20px;background:#111827;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">Visitar nossa loja</a>
            </div>
            <div style="padding:20px;text-align:center;font-size:14px;color:#6b7280;background:#f1f5f9;">
              © 2025 Homes Design – Todos os direitos reservados<br />
              <a href="https://homesdesign.com.br" style="color:#6b7280;text-decoration:underline;">homesdesign.com.br</a>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Homes Design" <rodrigokanoyadani1@gmail.com>',
      to: destinatario,
      subject: "Bem-vindo à Homes Design",
      text: "Bem-vindo(a)! Obrigado por se cadastrar na Homes Design.",
      html: htmlContent,
    };

    // Anexa o arquivo somente se ele existir
    if (fs.existsSync(anexoPath)) {
      mailOptions.attachments = [
        {
          filename: "relatorio.pdf",
          path: anexoPath,
        },
      ];
    } else {
        console.warn(`Arquivo de anexo não encontrado em: ${anexoPath}`);
    }

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "E-mail enviado com sucesso!", infoId: info.messageId });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ message: "Erro ao enviar e-mail", error: errorMessage }, { status: 500 });
  }
}
