import { z } from 'zod';

export const productDescriptionSchema = z.object({
  productName: z.string().min(3, 'O nome do produto deve ter pelo menos 3 caracteres.'),
  productCategory: z.string().min(3, 'A categoria do produto é obrigatória.'),
  keywords: z.string().min(3, 'Forneça algumas palavras-chave.'),
  style: z.string().min(3, 'O estilo é obrigatório.'),
  colorPalette: z.string().min(3, 'A paleta de cores é obrigatória.'),
  material: z.string().min(3, 'O material é obrigatório.'),
  size: z.string().min(1, 'O tamanho é obrigatório.'),
});

export const compositionSuggesterSchema = z.object({
  artworkDescription: z.string().min(10, 'Descreva a obra de arte com pelo menos 10 caracteres.'),
  userActions: z.string().min(10, 'Descreva as ações do usuário com pelo menos 10 caracteres.'),
});

export const chatbotSchema = z.object({
  query: z.string().min(2, 'Digite uma mensagem.'),
});
