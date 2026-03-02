'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';
import { TradesTable, useTrades, useDeleteTrade } from '@/entities/trade';
import { TradeModal } from '@/features/trade-modal';
import { DeleteConfirmModal } from '@/features/delete-confirm-modal';
import { useJournals } from '@/entities/journal';
import { useAlgorithms } from '@/entities/algorithm';
import type { TradeResponse, TradeFilters } from '@/shared/api';

interface TradesManagerProps {
  filters?: TradeFilters;
  hideJournalColumn?: boolean;
  hideAlgorithmColumn?: boolean;
  title?: string;
  showCreateButton?: boolean;
}

export function TradesManager({
  filters,
  hideJournalColumn = false,
  hideAlgorithmColumn = false,
  title = 'Сделки',
  showCreateButton = true,
}: TradesManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeResponse | null>(null);
  const [deletingTrade, setDeletingTrade] = useState<TradeResponse | null>(null);

  const { data, isLoading, error } = useTrades(filters);
  const { data: journalsData } = useJournals();
  const { data: algorithmsData } = useAlgorithms();
  const deleteMutation = useDeleteTrade();

  const trades = data?.items || [];
  
  // Мапы для отображения названий вместо ID
  const journalNames = useMemo(() => {
    const map: Record<string, string> = {};
    journalsData?.items.forEach((j) => {
      map[j.id] = j.name;
    });
    return map;
  }, [journalsData]);

  const algorithmNames = useMemo(() => {
    const map: Record<string, string> = {};
    algorithmsData?.items.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [algorithmsData]);

  const handleEdit = (trade: TradeResponse) => {
    setEditingTrade(trade);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (trade: TradeResponse) => {
    setDeletingTrade(trade);
  };

  const confirmDelete = () => {
    if (deletingTrade) {
      deleteMutation.mutate(deletingTrade.id, {
        onSuccess: () => {
          setDeletingTrade(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingTrade(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка сделок...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки сделок: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showCreateButton && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новая сделка
          </Button>
        )}
      </div>

      <TradesTable
        trades={trades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        journalNames={journalNames}
        algorithmNames={algorithmNames}
        hideJournalColumn={hideJournalColumn}
        hideAlgorithmColumn={hideAlgorithmColumn}
      />

      <TradeModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        trade={editingTrade}
        preselectedJournalId={filters?.journal_id}
      />

      <DeleteConfirmModal
        isOpen={!!deletingTrade}
        onClose={() => setDeletingTrade(null)}
        onConfirm={confirmDelete}
        title="Удалить сделку"
        description="Вы уверены, что хотите удалить эту сделку? Это действие нельзя отменить."
        itemName={deletingTrade?.ticker}
        isLoading={deleteMutation.isPending}
        confirmText="Удалить"
      />
    </div>
  );
}
