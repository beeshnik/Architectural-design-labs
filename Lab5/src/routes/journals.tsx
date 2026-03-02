import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { JournalsManager } from '@/widgets/journals-manager';
import { TradesManager } from '@/widgets/trades-manager';
import type { JournalResponse } from '@/shared/api';

export const Route = createFileRoute('/journals')({
  component: JournalsPage,
});

function JournalsPage() {
  const [selectedJournal, setSelectedJournal] = useState<JournalResponse | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Торговые журналы</h1>
        <p className="text-muted-foreground">
          Управление журналами и просмотр сделок по журналам
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Левая колонка - список журналов */}
        <div className="lg:col-span-1">
          <JournalsManager
            onJournalSelect={(journal) => {
              if (journal.id === selectedJournal?.id) {
                setSelectedJournal(null);
              } else {
                setSelectedJournal(journal);
              }
            }}
            selectedJournalId={selectedJournal?.id || null}
          />
        </div>

        {/* Правая колонка - сделки выбранного журнала */}
        <div className="lg:col-span-2">
          {selectedJournal ? (
            <TradesManager
              filters={{ journal_id: selectedJournal.id }}
              hideJournalColumn={true}
              title={`Сделки: ${selectedJournal.name}`}
              showCreateButton={true}
            />
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Выберите журнал из списка слева, чтобы увидеть его сделки
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
