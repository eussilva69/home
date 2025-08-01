'use server';

/**
 * @fileOverview AI chatbot support for answering customer questions about orders, shipping, sizes, and products.
 *
 * - aiChatbotSupport - A function that handles the chatbot support process.
 * - AiChatbotSupportInput - The input type for the aiChatbotSupport function.
 * - AiChatbotSupportOutput - The return type for the aiChatbotSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatbotSupportInputSchema = z.object({
  query: z.string().describe('A consulta ou pergunta do usuário.'),
  orderInformation: z
    .string()
    .optional()
    .describe('Informações sobre o pedido do usuário, se relevante.'),
  shippingInformation: z
    .string()
    .optional()
    .describe('Informações sobre políticas e opções de envio.'),
  sizeInformation: z
    .string()
    .optional()
    .describe('Informações sobre tamanhos e disponibilidade de produtos.'),
  productCatalog: z
    .string()
    .describe('Um catálogo abrangente de produtos disponíveis.'),
});
export type AiChatbotSupportInput = z.infer<typeof AiChatbotSupportInputSchema>;

const AiChatbotSupportOutputSchema = z.object({
  response: z.string().describe('A resposta do chatbot para a consulta do usuário.'),
});
export type AiChatbotSupportOutput = z.infer<typeof AiChatbotSupportOutputSchema>;

export async function aiChatbotSupport(input: AiChatbotSupportInput): Promise<AiChatbotSupportOutput> {
  return aiChatbotSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AiChatbotSupportInputSchema},
  output: {schema: AiChatbotSupportOutputSchema},
  prompt: `Você é um chatbot de suporte ao cliente para uma loja online de arte e decoração.
  Seu objetivo é responder às perguntas dos usuários sobre pedidos, envio, tamanhos e produtos em português.
  Use as informações fornecidas para dar respostas precisas e úteis.

  {{#if orderInformation}}
  Informações do Pedido:
  {{{orderInformation}}}
  {{/if}}

  {{#if shippingInformation}}
  Informações de Envio:
  {{{shippingInformation}}}
  {{/if}}

  {{#if sizeInformation}}
  Informações de Tamanho:
  {{{sizeInformation}}}
  {{/if}}

  Catálogo de Produtos:
  {{{productCatalog}}}

  Consulta do Usuário: {{{query}}}

  Resposta:`,
});

const aiChatbotSupportFlow = ai.defineFlow(
  {
    name: 'aiChatbotSupportFlow',
    inputSchema: AiChatbotSupportInputSchema,
    outputSchema: AiChatbotSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
