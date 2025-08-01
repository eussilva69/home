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

export const loginSchema = z.object({
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  cpf: z.string().min(11, "Por favor, insira um CPF válido.").max(14, "O CPF deve ter no máximo 14 caracteres."),
  email: z.string().email('Por favor, insira um email válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem.",
  path: ["confirmPassword"],
});
