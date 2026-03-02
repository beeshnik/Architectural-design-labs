import { z } from 'zod';

export const algorithmCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  body: z.string().optional(),
});

export const algorithmUpdateSchema = algorithmCreateSchema.partial();

export type AlgorithmCreateFormData = z.infer<typeof algorithmCreateSchema>;
export type AlgorithmUpdateFormData = z.infer<typeof algorithmUpdateSchema>;
