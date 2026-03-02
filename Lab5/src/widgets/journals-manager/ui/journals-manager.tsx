'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';
import { JournalsList, useJournals, useDeleteJournal, useJournal } from '@/entities/journal';
import { JournalModal } from '@/features/journal-modal';
import { DeleteConfirmModal } from '@/features/delete-confirm-modal';
import type { JournalResponse } from '@/shared/api';

interface JournalsManagerProps {
  onJournalSelect?: (journal: JournalResponse) => void;
  selectedJournalId?: string | null;
  showCreateButton?: boolean;
}

export function JournalsManager({
  onJournalSelect,
  selectedJournalId,
  showCreateButton = true,
}: JournalsManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalResponse | null>(null);
  const [deletingJournal, setDeletingJournal] = useState<JournalResponse | null>(null);

  const { data, isLoading, error } = useJournals();
  const deleteMutation = useDeleteJournal();
  
  // Загружаем детали для выбранного журнала
  const { data: selectedJournalDetails } = useJournal(selectedJournalId || '');

  const journals = data?.items || [];

  // Собираем детали журналов для отображения баланса
  const journalsDetails = selectedJournalDetails && selectedJournalId
    ? { [selectedJournalId]: selectedJournalDetails }
    : undefined;

  const handleEdit = (journal: JournalResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingJournal(journal);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (journal: JournalResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingJournal(journal);
  };

  const confirmDelete = () => {
    if (deletingJournal) {
      deleteMutation.mutate(deletingJournal.id, {
        onSuccess: () => {
          setDeletingJournal(null);
          // Если удалили выбранный журнал - сбрасываем выбор
          if (selectedJournalId === deletingJournal.id) {
            onJournalSelect?.(null as unknown as JournalResponse);
          }
        },
      });
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingJournal(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка журналов...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки журналов: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Торговые журналы</h2>
        {showCreateButton && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новый журнал
          </Button>
        )}
      </div>

      <JournalsList
        journals={journals}
        onJournalClick={onJournalSelect}
        selectedId={selectedJournalId}
        journalsDetails={journalsDetails}
      />

      {/* Дополнительные действия для выбранного журнала */}
      {selectedJournalId && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const journal = journals.find((j) => j.id === selectedJournalId);
              if (journal) handleEdit(journal);
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => {
              const journal = journals.find((j) => j.id === selectedJournalId);
              if (journal) handleDelete(journal);
            }}
          >
            Удалить
          </Button>
        </div>
      )}

      <JournalModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        journal={editingJournal}
      />

      <DeleteConfirmModal
        isOpen={!!deletingJournal}
        onClose={() => setDeletingJournal(null)}
        onConfirm={confirmDelete}
        title="Удалить журнал"
        description="Вы уверены, что хотите удалить этот журнал? Все сделки внутри журнала также будут удалены. Это действие нельзя отменить."
        itemName={deletingJournal?.name}
        isLoading={deleteMutation.isPending}
        confirmText="Удалить"
      />
    </div>
  );
}
