'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { JournalForm } from '@/features/journal-form';
import { useCreateJournal, useUpdateJournal } from '@/entities/journal';
import type { JournalResponse, JournalCreate, JournalUpdate } from '@/shared/api';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal?: JournalResponse | null;
}

export function JournalModal({ isOpen, onClose, journal }: JournalModalProps) {
  const isEditing = !!journal;
  
  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (data: JournalCreate | JournalUpdate) => {
    if (isEditing && journal) {
      updateMutation.mutate(
        { id: journal.id, data: data as JournalUpdate },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(data as JournalCreate, {
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
            {isEditing ? 'Редактировать журнал' : 'Новый журнал'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените параметры журнала'
              : 'Создайте новый торговый журнал'}
          </DialogDescription>
        </DialogHeader>
        <JournalForm
          journal={journal}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
