'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui';
import { TradeForm } from '@/features/trade-form';
import { useCreateTrade, useUpdateTrade } from '@/entities/trade';
import { useAlgorithms } from '@/entities/algorithm';
import { useJournals } from '@/entities/journal';
import type { TradeResponse, TradeCreate, TradeUpdate } from '@/shared/api';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade?: TradeResponse | null;
  preselectedJournalId?: string | null;
}

export function TradeModal({ isOpen, onClose, trade, preselectedJournalId }: TradeModalProps) {
  const isEditing = !!trade;
  
  const { data: journalsData } = useJournals();
  const { data: algorithmsData } = useAlgorithms();
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();

  const journals = journalsData?.items || [];
  const algorithms = algorithmsData?.items || [];

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (data: TradeCreate | TradeUpdate) => {
    if (isEditing && trade) {
      updateMutation.mutate(
        { id: trade.id, data: data as TradeUpdate },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(data as TradeCreate, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать сделку' : 'Новая сделка'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Измените параметры сделки'
              : 'Заполните данные новой сделки'}
          </DialogDescription>
        </DialogHeader>
        <TradeForm
          trade={trade}
          journals={journals}
          algorithms={algorithms}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          preselectedJournalId={preselectedJournalId}
        />
      </DialogContent>
    </Dialog>
  );
}

