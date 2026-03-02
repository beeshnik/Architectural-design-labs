'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui';
import { Plus } from 'lucide-react';
import { AlgorithmsList, useAlgorithms, useDeleteAlgorithm } from '@/entities/algorithm';
import { AlgorithmModal } from '@/features/algorithm-modal';
import { DeleteConfirmModal } from '@/features/delete-confirm-modal';
import type { AlgorithmResponse } from '@/shared/api';

interface AlgorithmsManagerProps {
  onAlgorithmSelect?: (algorithm: AlgorithmResponse) => void;
  selectedAlgorithmId?: string | null;
  showCreateButton?: boolean;
}

export function AlgorithmsManager({
  onAlgorithmSelect,
  selectedAlgorithmId,
  showCreateButton = true,
}: AlgorithmsManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlgorithm, setEditingAlgorithm] = useState<AlgorithmResponse | null>(null);
  const [deletingAlgorithm, setDeletingAlgorithm] = useState<AlgorithmResponse | null>(null);

  const { data, isLoading, error } = useAlgorithms();
  const deleteMutation = useDeleteAlgorithm();

  const algorithms = data?.items || [];

  const handleEdit = (algorithm: AlgorithmResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingAlgorithm(algorithm);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (algorithm: AlgorithmResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingAlgorithm(algorithm);
  };

  const confirmDelete = () => {
    if (deletingAlgorithm) {
      deleteMutation.mutate(deletingAlgorithm.id, {
        onSuccess: () => {
          setDeletingAlgorithm(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingAlgorithm(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка алгоритмов...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки алгоритмов: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Торговые алгоритмы</h2>
        {showCreateButton && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Новый алгоритм
          </Button>
        )}
      </div>

      <AlgorithmsList
        algorithms={algorithms}
        onAlgorithmClick={onAlgorithmSelect}
        selectedId={selectedAlgorithmId}
      />

      {/* Дополнительные действия для выбранного алгоритма */}
      {selectedAlgorithmId && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const algorithm = algorithms.find((a) => a.id === selectedAlgorithmId);
              if (algorithm) handleEdit(algorithm);
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => {
              const algorithm = algorithms.find((a) => a.id === selectedAlgorithmId);
              if (algorithm) handleDelete(algorithm);
            }}
          >
            Удалить
          </Button>
        </div>
      )}

      <AlgorithmModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        algorithm={editingAlgorithm}
      />

      <DeleteConfirmModal
        isOpen={!!deletingAlgorithm}
        onClose={() => setDeletingAlgorithm(null)}
        onConfirm={confirmDelete}
        title="Удалить алгоритм"
        description="Вы уверены, что хотите удалить этот алгоритм? Сделки, использующие этот алгоритм, сохранятся, но алгоритм будет отображаться как удаленный."
        itemName={deletingAlgorithm?.name}
        isLoading={deleteMutation.isPending}
        confirmText="Удалить"
      />
    </div>
  );
}
