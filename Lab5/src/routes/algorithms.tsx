import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AlgorithmsManager } from '@/widgets/algorithms-manager';
import { TradesManager } from '@/widgets/trades-manager';
import type { AlgorithmResponse } from '@/shared/api';

export const Route = createFileRoute('/algorithms')({
  component: AlgorithmsPage,
});

function AlgorithmsPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmResponse | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Торговые алгоритмы</h1>
        <p className="text-muted-foreground">
          Управление алгоритмами и просмотр сделок по алгоритмам
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AlgorithmsManager
            onAlgorithmSelect={(algorithm) => {
              if (algorithm.id === selectedAlgorithm?.id) {
                setSelectedAlgorithm(null);
              } else {
                setSelectedAlgorithm(algorithm);
              }
            }}
            selectedAlgorithmId={selectedAlgorithm?.id || null}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedAlgorithm ? (
            <TradesManager
              filters={{ algorithm_id: selectedAlgorithm.id }}
              hideAlgorithmColumn={true}
              title={`Сделки: ${selectedAlgorithm.name}`}
              showCreateButton={true}
            />
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Выберите алгоритм из списка слева, чтобы увидеть связанные сделки
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
