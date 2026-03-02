'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { AlgorithmForm } from '@/features/algorithm-form';
import { useCreateAlgorithm, useUpdateAlgorithm } from '@/entities/algorithm';
import type { AlgorithmResponse, AlgorithmCreate, AlgorithmUpdate } from '@/shared/api';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithm?: AlgorithmResponse | null;
}

export function AlgorithmModal({ isOpen, onClose, algorithm }: AlgorithmModalProps) {
  const isEditing = !!algorithm;
  
  const createMutation = useCreateAlgorithm();
  const updateMutation = useUpdateAlgorithm();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (data: AlgorithmCreate | AlgorithmUpdate) => {
    if (isEditing && algorithm) {
      updateMutation.mutate(
        { id: algorithm.id, data: data as AlgorithmUpdate },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(data as AlgorithmCreate, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать алгоритм' : 'Новый алгоритм'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените параметры алгоритма'
              : 'Создайте новый торговый алгоритм'}
          </DialogDescription>
        </DialogHeader>
        <AlgorithmForm
          algorithm={algorithm}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
