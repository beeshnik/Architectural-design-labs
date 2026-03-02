import { z } from 'zod';

// Схема для создания сделки
export const tradeCreateSchema = z.object({
  ticker: z.string().min(1, 'Тикер обязателен').max(50, 'Максимум 50 символов'),
  direction: z.enum(['long', 'short'], {
    required_error: 'Выберите направление',
  }),
  opened_at: z.string().min(1, 'Дата открытия обязательна'),
  closed_at: z.string().min(1, 'Дата закрытия обязательна'),
  initial_volume: z.union([
    z.number().positive('Объем должен быть положительным'),
    z.string().min(1, 'Объем обязателен'),
  ]),
  open_price: z.union([
    z.number().positive('Цена должна быть положительной'),
    z.string().min(1, 'Цена входа обязательна'),
  ]),
  close_price: z.union([
    z.number().positive('Цена должна быть положительной'),
    z.string().min(1, 'Цена выхода обязательна'),
  ]),
  commission: z.union([
    z.number().min(0, 'Комиссия не может быть отрицательной'),
    z.string(),
  ]).optional(),
  journal_id: z.string().min(1, 'Выберите журнал'),
  algorithm_id: z.string().nullable().optional(),
});

// Схема для обновления сделки (все поля опциональные)
export const tradeUpdateSchema = tradeCreateSchema.partial().extend({
  journal_id: z.string().optional(),
});

export type TradeCreateFormData = z.infer<typeof tradeCreateSchema>;
export type TradeUpdateFormData = z.infer<typeof tradeUpdateSchema>;
