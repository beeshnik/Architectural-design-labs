import { apiClient } from './base';
import type {
  TradeResponse,
  TradeDetailResponse,
  TradeCreate,
  TradeUpdate,
  TradeListResponse,
  AddPositionRequest,
  TradeFilters,
} from './types';

export const tradesApi = {
  // Получить список сделок с фильтрами
  list: async (filters: TradeFilters = {}): Promise<TradeListResponse> => {
    const { skip = 0, limit = 100, journal_id, algorithm_id, ticker, direction } = filters;
    const params: Record<string, string | number | undefined> = { skip, limit };
    
    if (journal_id) params.journal_id = journal_id;
    if (algorithm_id) params.algorithm_id = algorithm_id;
    if (ticker) params.ticker = ticker;
    if (direction) params.direction = direction;

    const response = await apiClient.get('/trades', { params });
    return response.data;
  },

  // Получить сделку по ID
  get: async (id: string): Promise<TradeDetailResponse> => {
    const response = await apiClient.get(`/trades/${id}`);
    return response.data;
  },

  // Создать сделку
  create: async (data: TradeCreate): Promise<TradeResponse> => {
    const response = await apiClient.post('/trades', data);
    return response.data;
  },

  // Обновить сделку
  update: async (id: string, data: TradeUpdate): Promise<TradeResponse> => {
    const response = await apiClient.patch(`/trades/${id}`, data);
    return response.data;
  },

  // Удалить сделку
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/trades/${id}`);
  },

  // Добавить позицию к существующей сделке
  addPosition: async (tradeId: string, data: AddPositionRequest): Promise<TradePosition> => {
    const response = await apiClient.post(`/trades/${tradeId}/positions`, data);
    return response.data;
  },
};

// Импорт типа для позиции
import type { TradePosition } from './types';
