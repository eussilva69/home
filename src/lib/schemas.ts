
import { z } from 'zod';

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


// Tipos para as ações do Mercado Pago
const PayerIdentificationSchema = z.object({
  type: z.string(),
  number: z.string(),
});

const PayerSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  identification: PayerIdentificationSchema,
});

export const CreatePixPaymentInputSchema = z.object({
  transaction_amount: z.number(),
  description: z.string(),
  payer: PayerSchema,
});
export type CreatePixPaymentInput = z.infer<typeof CreatePixPaymentInputSchema>;


const ItemSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    picture_url: z.string().optional(),
    category_id: z.string().optional(),
    quantity: z.number(),
    unit_price: z.number(),
    currency_id: z.string(),
});

const PayerPreferenceSchema = z.object({
    name: z.string(),
    surname: z.string(),
    email: z.string().email(),
    identification: PayerIdentificationSchema
});


export const CreatePreferenceInputSchema = z.object({
  items: z.array(ItemSchema),
  payer: PayerPreferenceSchema
});
export type CreatePreferenceInput = z.infer<typeof CreatePreferenceInputSchema>;


export const CreatePaymentOutputSchema = z.object({
    success: z.boolean(),
    paymentId: z.number().optional(),
    message: z.string().optional(),
});
export type CreatePaymentOutput = z.infer<typeof CreatePaymentOutputSchema>;

export const checkoutSchema = z.object({
  email: z.string().email("E-mail inválido."),
  firstName: z.string().min(2, "Nome é obrigatório."),
  lastName: z.string().min(2, "Sobrenome é obrigatório."),
  docType: z.string().min(2, "Tipo de documento é obrigatório."),
  docNumber: z.string().min(8, "Número do documento é obrigatório."),
  cep: z.string().min(8, "CEP é obrigatório."),
  street: z.string().min(2, "Rua é obrigatória."),
  number: z.string().min(1, "Número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório."),
  city: z.string().min(2, "Cidade é obrigatória."),
  state: z.string().min(2, "Estado é obrigatório."),
});
