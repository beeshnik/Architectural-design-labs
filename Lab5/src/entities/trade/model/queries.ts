import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tradesApi,
  type TradeCreate,
  type TradeUpdate,
  type TradeFilters,
  type AddPositionRequest,
} from '@/shared/api';

const QUERY_KEY = 'trades';

// Получить все сделки с фильтрами
export function useTrades(filters: TradeFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => tradesApi.list(filters),
  });
}

// Получить сделку по ID
export function useTrade(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => tradesApi.get(id),
    enabled: !!id,
  });
}

// Создать сделку
export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TradeCreate) => tradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Обновить сделку
export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradeUpdate }) =>
      tradesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

// Удалить сделку
export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Добавить позицию к сделке
export function useAddPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, data }: { tradeId: string; data: AddPositionRequest }) =>
      tradesApi.addPosition(tradeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.tradeId] });
    },
  });
}
