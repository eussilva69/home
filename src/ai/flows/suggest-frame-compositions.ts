// This is a server-side file.
'use server';

/**
 * @fileOverview AI flow to suggest complementary frame compositions based on the viewed artwork.
 *
 * - suggestFrameCompositions - A function that handles the suggestion of frame compositions.
 * - SuggestFrameCompositionsInput - The input type for the suggestFrameCompositions function.
 * - SuggestFrameCompositionsOutput - The return type for the suggestFrameCompositions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFrameCompositionsInputSchema = z.object({
  artworkDescription: z
    .string()
    .describe('Description of the artwork the user is viewing.'),
  userActions: z
    .string()
    .describe(
      'Information about the users actions on the website, such as previous views and purchases'
    ),
});

export type SuggestFrameCompositionsInput = z.infer<
  typeof SuggestFrameCompositionsInputSchema
>;

const SuggestFrameCompositionsOutputSchema = z.object({
  suggestedCompositions: z
    .array(z.string())
    .describe(
      'A list of suggested complementary frame compositions based on the artwork and user actions.'
    ),
  reasoning: z
    .string()
    .describe(
      'Reasoning behind the suggested compositions, explaining why they complement the artwork.'
    ),
});

export type SuggestFrameCompositionsOutput = z.infer<
  typeof SuggestFrameCompositionsOutputSchema
>;

export async function suggestFrameCompositions(
  input: SuggestFrameCompositionsInput
): Promise<SuggestFrameCompositionsOutput> {
  return suggestFrameCompositionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFrameCompositionsPrompt',
  input: {schema: SuggestFrameCompositionsInputSchema},
  output: {schema: SuggestFrameCompositionsOutputSchema},
  prompt: `You are an AI assistant that suggests complementary frame compositions for artworks in an e-commerce store.

  Based on the description of the artwork and the user's actions, provide a list of suggested compositions and explain your reasoning.

  Artwork Description: {{{artworkDescription}}}
  User Actions: {{{userActions}}}

  Format the output as a JSON object with 'suggestedCompositions' (an array of composition descriptions) and 'reasoning' (explanation for the suggestions).
  `,
});

const suggestFrameCompositionsFlow = ai.defineFlow(
  {
    name: 'suggestFrameCompositionsFlow',
    inputSchema: SuggestFrameCompositionsInputSchema,
    outputSchema: SuggestFrameCompositionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
