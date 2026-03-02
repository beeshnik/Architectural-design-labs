import { apiClient } from './base';
import type {
  JournalResponse,
  JournalDetailResponse,
  JournalCreate,
  JournalUpdate,
  JournalListResponse,
  PaginationParams,
} from './types';

export const journalsApi = {
  // Получить список журналов
  list: async (params: PaginationParams = {}): Promise<JournalListResponse> => {
    const { skip = 0, limit = 100 } = params;
    const response = await apiClient.get('/journals', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Получить журнал по ID с расчетным балансом
  get: async (id: string): Promise<JournalDetailResponse> => {
    const response = await apiClient.get(`/journals/${id}`);
    return response.data;
  },

  // Создать журнал
  create: async (data: JournalCreate): Promise<JournalResponse> => {
    const response = await apiClient.post('/journals', data);
    return response.data;
  },

  // Обновить журнал
  update: async (id: string, data: JournalUpdate): Promise<JournalResponse> => {
    const response = await apiClient.patch(`/journals/${id}`, data);
    return response.data;
  },

  // Удалить журнал (удалит все сделки в нем)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/journals/${id}`);
  },
};
