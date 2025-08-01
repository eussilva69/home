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
            return { error: "Entrada inválida." };
        }

        const productCatalog = products.map(p => `${p.name} - ${p.category} - $${p.price}`).join('\n');
        
        const input: AiChatbotSupportInput = {
            query: validatedFields.data.query,
            productCatalog: productCatalog,
            shippingInformation: "Enviamos para todo o mundo. O envio padrão leva de 5 a 7 dias úteis. O envio expresso leva de 2 a 3 dias úteis.",
            sizeInformation: "Nossas impressões estão disponíveis em Pequeno (20x25 cm), Médio (30x40 cm) e Grande (45x60 cm).",
        };

        const result = await aiChatbotSupport(input);
        return { success: result.response };
    } catch (error) {
        console.error(error);
        return { error: 'Estou com problemas de conexão. Por favor, tente novamente mais tarde.' };
    }
}
