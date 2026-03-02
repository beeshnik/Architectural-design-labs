import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalsApi, type JournalCreate, type JournalUpdate } from '@/shared/api';

const QUERY_KEY = 'journals';

// Получить все журналы
export function useJournals() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => journalsApi.list({ limit: 100 }),
  });
}

// Получить журнал по ID с деталями
export function useJournal(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => journalsApi.get(id),
    enabled: !!id,
  });
}

// Создать журнал
export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JournalCreate) => journalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Обновить журнал
export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalUpdate }) =>
      journalsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

// Удалить журнал
export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
