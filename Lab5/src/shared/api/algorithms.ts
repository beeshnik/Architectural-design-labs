import { apiClient } from './base';
import type {
  AlgorithmResponse,
  AlgorithmCreate,
  AlgorithmUpdate,
  AlgorithmListResponse,
  PaginationParams,
} from './types';

export const algorithmsApi = {
  // Получить список алгоритмов
  list: async (params: PaginationParams = {}): Promise<AlgorithmListResponse> => {
    const { skip = 0, limit = 100 } = params;
    const response = await apiClient.get('/algorithms', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Получить алгоритм по ID
  get: async (id: string): Promise<AlgorithmResponse> => {
    const response = await apiClient.get(`/algorithms/${id}`);
    return response.data;
  },

  // Создать алгоритм
  create: async (data: AlgorithmCreate): Promise<AlgorithmResponse> => {
    const response = await apiClient.post('/algorithms', data);
    return response.data;
  },

  // Обновить алгоритм
  update: async (id: string, data: AlgorithmUpdate): Promise<AlgorithmResponse> => {
    const response = await apiClient.patch(`/algorithms/${id}`, data);
    return response.data;
  },

  // Удалить алгоритм
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/algorithms/${id}`);
  },
};
