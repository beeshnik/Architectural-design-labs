import { z } from 'zod';

export const journalCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  deposit_balance: z.union([
    z.number().min(0, 'Баланс не может быть отрицательным'),
    z.string(),
  ]).optional(),
  bybit_api_key: z.string().nullable().optional(),
  bybit_api_secret: z.string().nullable().optional(),
});

export const journalUpdateSchema = journalCreateSchema.partial();

export type JournalCreateFormData = z.infer<typeof journalCreateSchema>;
export type JournalUpdateFormData = z.infer<typeof journalUpdateSchema>;
