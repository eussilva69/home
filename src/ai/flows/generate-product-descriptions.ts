'use server';

/**
 * @fileOverview AI-powered product description generator for e-commerce.
 *
 * - generateProductDescription - A function that generates SEO-optimized product descriptions.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., "wall art", "posters").'),
  keywords: z.string().describe('Comma-separated keywords related to the product.'),
  style: z.string().describe('The design style of the product (e.g., "modern", "minimalist", "pop art").'),
  colorPalette: z.string().describe('The color palette of the product (e.g., "vibrant", "pastel", "monochrome").'),
  material: z.string().describe('The material the product is made of (e.g., "canvas", "paper", "wood").'),
  size: z.string().describe('The size of the product (e.g., "small", "medium", "large").'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  productDescription: z
    .string()
    .describe('A detailed and SEO-optimized description of the product.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in e-commerce product descriptions.

  Based on the product details provided, create a compelling and SEO-optimized description that will attract customers and improve search engine rankings.

  Product Name: {{{productName}}}
  Category: {{{productCategory}}}
  Keywords: {{{keywords}}}
  Style: {{{style}}}
  Color Palette: {{{colorPalette}}}
  Material: {{{material}}}
  Size: {{{size}}}

The description should highlight the product's key features, benefits, and unique selling points. It should also incorporate relevant keywords to improve search engine visibility. Keep descriptions concise and targeted to ToquePop's aesthetic. Optimize for online sales.

  Write a product description:
  `,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
