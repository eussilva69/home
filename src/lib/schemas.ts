import { z } from 'zod';

export const productDescriptionSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters long.'),
  productCategory: z.string().min(3, 'Product category is required.'),
  keywords: z.string().min(3, 'Please provide some keywords.'),
  style: z.string().min(3, 'Style is required.'),
  colorPalette: z.string().min(3, 'Color palette is required.'),
  material: z.string().min(3, 'Material is required.'),
  size: z.string().min(1, 'Size is required.'),
});

export const compositionSuggesterSchema = z.object({
  artworkDescription: z.string().min(10, 'Please describe the artwork in at least 10 characters.'),
  userActions: z.string().min(10, 'Please describe user actions in at least 10 characters.'),
});

export const chatbotSchema = z.object({
  query: z.string().min(2, 'Please enter a message.'),
});
