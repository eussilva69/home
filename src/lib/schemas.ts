
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
}).refine((data) => data.password === data.password, {
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

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
  options: z.string(),
  weight: z.number(),
  width: z.number(),
  height: z.number(),
  length: z.number(),
  customImages: z.array(z.string()).optional(), // Adicionado para imagens personalizadas
});

export const OrderDetailsSchema = z.object({
  customer: z.object({
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    docType: z.string(),
    docNumber: z.string(),
  }),
  shipping: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    cep: z.string(),
    complement: z.string().optional(),
    details: z.any(),
     // Dimensões do pacote
    weight: z.number(),
    width: z.number(),
    height: z.number(),
    length: z.number(),
  }),
  items: z.array(CartItemSchema),
  payment: z.object({
    method: z.string(),
    total: z.number(),
    subtotal: z.number(),
    shippingCost: z.number(),
    paymentId: z.number().optional(),
  }),
  status: z.string(),
  createdAt: z.any(), // Para Timestamp do Firebase
  shippedAt: z.any().optional(), // Para Timestamp do Firebase de quando foi enviado
});
export type OrderDetails = z.infer<typeof OrderDetailsSchema>;


export const AddressSchema = z.object({
  id: z.string().optional(),
  nickname: z.string().min(2, "O apelido é obrigatório."),
  cep: z.string().min(8, "CEP é obrigatório."),
  street: z.string().min(2, "Rua é obrigatória."),
  number: z.string().min(1, "Número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório."),
  city: z.string().min(2, "Cidade é obrigatória."),
  state: z.string().min(2, "Estado é obrigatório."),
  isDefault: z.boolean().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  image_alt: z.string(),
  artwork_image: z.string(),
  hint: z.string(),
  hint_alt: z.string(),
  category: z.string(),
  arrangement: z.string(),
  imagesByColor: z.record(z.string()).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const productUpdateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  price: z.number().min(0, "O preço não pode ser negativo."),
  image: z.string().url("URL da imagem principal inválida.").optional(),
  image_alt: z.string().url("URL da imagem de ambiente inválida.").optional(),
  artwork_image: z.string().url("URL da arte original inválida.").optional(),
  imagesByColor: z.record(z.string().url("URL da imagem de moldura inválida.")).optional(),
});
export type ProductUpdatePayload = z.infer<typeof productUpdateSchema>;


export const refundRequestSchema = z.object({
  orderId: z.string(),
  reason: z.string().min(10, 'Por favor, detalhe o motivo da devolução.'),
  photos: z.custom<FileList>().optional(),
});

export type RefundRequestInput = {
    orderId: string;
    reason: string;
    customerEmail: string;
    customerName: string;
    photoUrls: string[];
};

export const newProductSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  price: z.number().min(0, "O preço não pode ser negativo."),
  category: z.string().min(1, "A categoria é obrigatória."),
  arrangement: z.string().min(1, "O arranjo é obrigatório."),
  image: z.string().url("URL da imagem principal é obrigatória."),
  image_alt: z.string().url("URL da imagem de ambiente é obrigatória."),
  artwork_image: z.string().url("URL da arte original é obrigatória."),
  imagesByColor: z.record(z.string().url()).refine(obj => Object.keys(obj).length > 0, {
    message: "Pelo menos uma imagem de moldura é obrigatória.",
  }),
  hint: z.string().optional().default(''),
  hint_alt: z.string().optional().default(''),
});
export type NewProductPayload = z.infer<typeof newProductSchema>;


export const newFurnitureSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  price: z.number().min(0, "O preço não pode ser negativo."),
  // Categoria é fixa, então não precisa estar no formulário, mas será adicionada antes de salvar.
  arrangement: z.string().min(1, "A sub-categoria (tipo) é obrigatória."),
  image: z.string().url("A imagem principal é obrigatória."),
  image_alt: z.string().url("A imagem de ambiente é obrigatória."),
});
export type NewFurniturePayload = z.infer<typeof newFurnitureSchema>;
