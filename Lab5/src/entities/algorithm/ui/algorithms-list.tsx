import { AlgorithmCard } from './algorithm-card';
import type { AlgorithmResponse } from '@/shared/api';

interface AlgorithmsListProps {
  algorithms: AlgorithmResponse[];
  onAlgorithmClick?: (algorithm: AlgorithmResponse) => void;
  selectedId?: string | null;
}

export function AlgorithmsList({ algorithms, onAlgorithmClick, selectedId }: AlgorithmsListProps) {
  if (algorithms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет алгоритмов. Создайте первый алгоритм.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {algorithms.map((algorithm) => (
        <AlgorithmCard
          key={algorithm.id}
          algorithm={algorithm}
          isActive={selectedId === algorithm.id}
          onClick={() => onAlgorithmClick?.(algorithm)}
        />
      ))}
    </div>
  );
}
