'use server';

import { z } from 'zod';
import {
  generateProductDescription,
  GenerateProductDescriptionInput,
} from '@/ai/flows/generate-product-descriptions';
import {
  suggestFrameCompositions,
  SuggestFrameCompositionsInput,
} from '@/ai/flows/suggest-frame-compositions';
import {
  aiChatbotSupport,
  AiChatbotSupportInput
} from '@/ai/flows/ai-chatbot-support';
import { productDescriptionSchema, compositionSuggesterSchema, chatbotSchema } from '@/lib/schemas';
import { products } from '@/lib/mock-data';

export async function generateDescriptionAction(values: z.infer<typeof productDescriptionSchema>) {
  try {
    const validatedFields = productDescriptionSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: 'Invalid input.' };
    }

    const input: GenerateProductDescriptionInput = validatedFields.data;
    const result = await generateProductDescription(input);

    return { success: result.productDescription };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate description. Please try again.' };
  }
}

export async function suggestCompositionsAction(values: z.infer<typeof compositionSuggesterSchema>) {
    try {
        const validatedFields = compositionSuggesterSchema.safeParse(values);
        if (!validatedFields.success) {
            return { error: "Invalid input." };
        }
        
        const input: SuggestFrameCompositionsInput = validatedFields.data;
        const result = await suggestFrameCompositions(input);

        return { success: { compositions: result.suggestedCompositions, reasoning: result.reasoning } };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to suggest compositions. Please try again.' };
    }
}

export async function chatbotSupportAction(values: z.infer<typeof chatbotSchema>) {
    try {
        const validatedFields = chatbotSchema.safeParse(values);
        if (!validatedFields.success) {
            return { error: "Invalid input." };
        }

        const productCatalog = products.map(p => `${p.name} - ${p.category} - $${p.price}`).join('\n');
        
        const input: AiChatbotSupportInput = {
            query: validatedFields.data.query,
            productCatalog: productCatalog,
            shippingInformation: "We ship worldwide. Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.",
            sizeInformation: "Our prints are available in Small (8x10 in), Medium (12x16 in), and Large (18x24 in).",
        };

        const result = await aiChatbotSupport(input);
        return { success: result.response };
    } catch (error) {
        console.error(error);
        return { error: 'I am having trouble connecting. Please try again later.' };
    }
}
