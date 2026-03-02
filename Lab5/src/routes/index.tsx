import { createFileRoute } from '@tanstack/react-router';
import { TradesManager } from '@/widgets/trades-manager';

export const Route = createFileRoute('/')({
  component: TradesPage,
});

function TradesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Все сделки</h1>
        <p className="text-muted-foreground">
          Управление всеми торговыми сделками
        </p>
      </div>
      <TradesManager />
    </div>
  );
}
