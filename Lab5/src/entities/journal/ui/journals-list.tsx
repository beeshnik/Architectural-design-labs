import { JournalCard } from './journal-card';
import type { JournalResponse } from '@/shared/api';

interface JournalsListProps {
  journals: JournalResponse[];
  onJournalClick?: (journal: JournalResponse) => void;
  selectedId?: string | null;
  // Детали для расширенных карточек
  journalsDetails?: Record<string, {
    calculated_balance: string;
    balance_difference: string;
  }>;
}

export function JournalsList({
  journals,
  onJournalClick,
  selectedId,
  journalsDetails,
}: JournalsListProps) {
  if (journals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет журналов. Создайте первый торговый журнал.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {journals.map((journal) => {
        const details = journalsDetails?.[journal.id];
        return (
          <JournalCard
            key={journal.id}
            journal={journal}
            isActive={selectedId === journal.id}
            onClick={() => onJournalClick?.(journal)}
            calculatedBalance={details?.calculated_balance}
            balanceDifference={details?.balance_difference}
          />
        );
      })}
    </div>
  );
}
