import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { algorithmsApi, type AlgorithmCreate, type AlgorithmUpdate } from '@/shared/api';

const QUERY_KEY = 'algorithms';

// Получить все алгоритмы
export function useAlgorithms() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => algorithmsApi.list({ limit: 100 }),
  });
}

// Получить алгоритм по ID
export function useAlgorithm(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => algorithmsApi.get(id),
    enabled: !!id,
  });
}

// Создать алгоритм
export function useCreateAlgorithm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlgorithmCreate) => algorithmsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Обновить алгоритм
export function useUpdateAlgorithm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlgorithmUpdate }) =>
      algorithmsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

// Удалить алгоритм
export function useDeleteAlgorithm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => algorithmsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
