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
import { productDescriptionSchema, compositionSuggesterSchema, loginSchema } from '@/lib/schemas';
import { products } from '@/lib/mock-data';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

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

export async function loginAction(values: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Entrada inválida." };
    }

    // This is a server action, but Firebase Auth SDK for web is client-side.
    // In a real app, you would use Firebase Admin SDK here or handle auth on the client.
    // For this prototype, we'll simulate the login and return success.
    // The actual sign-in will happen on the client after this returns.
    return { success: "Login bem-sucedido! Redirecionando..." };

  } catch (error) {
    // This is a simplified error handling. In a real app, you'd want to
    // distinguish between different kinds of errors (e.g., wrong password, user not found).
    return { error: 'Falha ao fazer login. Verifique suas credenciais.' };
  }
}

export async function logoutAction() {
  try {
    // Similarly, this would be handled on the client.
    // This action just confirms the intent.
    return { success: "Logout bem-sucedido." };
  } catch (error) {
    return { error: 'Falha ao fazer logout.' };
  }
}
