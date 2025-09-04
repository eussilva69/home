

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
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

export const ProductSizeSchema = z.object({
    size: z.string().min(1, "O tamanho é obrigatório."),
    price: z.number().min(0, "O preço deve ser maior ou igual a zero.").default(0),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string().optional(), // Adicionado campo de descrição
  sizes: z.array(ProductSizeSchema).optional(),
  artwork_image: z.string().optional(),
  image: z.string().optional(), // Imagem principal do produto (isolado)
  imagesByColor: z.record(z.string()).optional(),
  environment_images: z.array(z.string()).optional(), // Múltiplas imagens de ambiente
  category: z.string(),
  arrangement: z.string(),
  image_application: z.enum(['repeat', 'split', 'individual']).optional().default('repeat'),
  gallery_images: z.array(z.string()).optional(),
  hint: z.string().optional(),
  hint_alt: z.string().optional(),
  image_alt: z.string().optional(), // Legado, manter por compatibilidade mas usar environment_images
});
export type Product = z.infer<typeof ProductSchema>;

export const productUpdateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").optional(),
  price: z.number().min(0, "O preço não pode ser negativo.").optional(),
  category: z.string().min(1, "A categoria é obrigatória.").optional(),
  description: z.string().optional(),
  artwork_image: z.string().url("URL da arte inválida.").or(z.literal('')).optional(),
  imagesByColor: z.object({
      black: z.string().url("URL inválida").or(z.literal('')).optional(),
      white: z.string().url("URL inválida").or(z.literal('')).optional(),
      hazel_oak: z.string().url("URL inválida").or(z.literal('')).optional(),
      ebony_oak: z.string().url("URL inválida").or(z.literal('')).optional(),
  }).optional(),
  image_application: z.enum(['repeat', 'split', 'individual']).optional(),
  gallery_images: z.array(z.string().url()).optional(),
  environment_images: z.array(z.string().url()).optional(),
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
  price: z.number().min(0, "O preço não pode ser negativo.").default(0),
  category: z.string().min(1, "A categoria é obrigatória."),
  arrangement: z.string().min(1, "O arranjo é obrigatório."),
  artwork_image: z.string().url("URL da arte é obrigatória.").or(z.literal('')).optional(),
  imagesByColor: z.object({
      black: z.string().url("URL inválida").or(z.literal('')).optional(),
      white: z.string().url("URL inválida").or(z.literal('')).optional(),
      hazel_oak: z.string().url("URL inválida").or(z.literal('')).optional(),
      ebony_oak: z.string().url("URL inválida").or(z.literal('')).optional(),
  }).optional(),
  image_application: z.enum(['repeat', 'split', 'individual']).optional(),
  gallery_images: z.array(z.string().url()).optional(),
  environment_images: z.array(z.string().url()).optional(),
});
export type NewProductPayload = z.infer<typeof newProductSchema>;


export const newFurnitureSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  arrangement: z.string().min(1, "A sub-categoria (tipo) é obrigatória."),
  image: z.string().url("A imagem principal é obrigatória.").or(z.literal('')),
  image_alt: z.string().url("A imagem de ambiente é obrigatória.").or(z.literal('')),
  gallery_images: z.array(z.string()).optional(),
  sizes: z.array(ProductSizeSchema).min(1, "Adicione pelo menos um tamanho."),
  price: z.number().optional(), // Price será derivado do primeiro tamanho
});
export type NewFurniturePayload = z.infer<typeof newFurnitureSchema>;
