
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dl38o4mnk',
  api_key: process.env.CLOUDINARY_API_KEY || '985145697383117',
  api_secret: process.env.CLOUDINARY_API_SECRET || '2P4uB-Zt36NqajhBgFvvoKJNaIY',
  secure: true,
});

async function buffer(file: File): Promise<Buffer> {
    const fileBuffer = await file.arrayBuffer();
    return Buffer.from(fileBuffer);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  try {
    const fileBuffer = await buffer(file);

    const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'home-designer' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        const readableStream = new Readable();
        readableStream._read = () => {};
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    }, { status: 200 });

  } catch (error) {
    console.error("Erro no upload para o Cloudinary:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
    return NextResponse.json({ error: "Falha no upload da imagem.", details: errorMessage }, { status: 500 });
  }
}
