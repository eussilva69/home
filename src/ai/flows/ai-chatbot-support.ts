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
  query: z.string().describe('The user query or question.'),
  orderInformation: z
    .string()
    .optional()
    .describe('Information about the users order, if relevant.'),
  shippingInformation: z
    .string()
    .optional()
    .describe('Information about shipping policies and options.'),
  sizeInformation: z
    .string()
    .optional()
    .describe('Information about product sizes and availability.'),
  productCatalog: z
    .string()
    .describe('A comprehensive catalog of available products.'),
});
export type AiChatbotSupportInput = z.infer<typeof AiChatbotSupportInputSchema>;

const AiChatbotSupportOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type AiChatbotSupportOutput = z.infer<typeof AiChatbotSupportOutputSchema>;

export async function aiChatbotSupport(input: AiChatbotSupportInput): Promise<AiChatbotSupportOutput> {
  return aiChatbotSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AiChatbotSupportInputSchema},
  output: {schema: AiChatbotSupportOutputSchema},
  prompt: `You are a customer support chatbot for an online art and decor store.
  Your goal is to answer user questions about orders, shipping, sizes, and products.
  Use the provided information to give accurate and helpful responses.

  {% if orderInformation %}
  Order Information:
  {{orderInformation}}
  {% endif %}

  {% if shippingInformation %}
  Shipping Information:
  {{shippingInformation}}
  {% endif %}

  {% if sizeInformation %}
  Size Information:
  {{sizeInformation}}
  {% endif %}

  Product Catalog:
  {{productCatalog}}

  User Query: {{query}}

  Response:`,
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
