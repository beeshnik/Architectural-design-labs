import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/shared/ui';
import { formatCurrency, formatNumber, formatPnL, formatDateTime, cn } from '@/shared/lib';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { TradeResponse } from '@/shared/api';

interface TradeCardProps {
  trade: TradeResponse;
  onClick?: () => void;
  isActive?: boolean;
  journalName?: string;
  algorithmName?: string;
  showJournal?: boolean;
  showAlgorithm?: boolean;
}

export function TradeCard({
  trade,
  onClick,
  isActive,
  journalName,
  algorithmName,
  showJournal = true,
  showAlgorithm = true,
}: TradeCardProps) {
  const pnl = formatPnL(trade.pnl);
  const isLong = trade.direction === 'long';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isActive && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{trade.ticker}</CardTitle>
            <Badge
              variant={isLong ? 'success' : 'danger'}
              className="flex items-center gap-1"
            >
              {isLong ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {isLong ? 'Long' : 'Short'}
            </Badge>
          </div>
          <div
            className={cn(
              'text-sm font-medium',
              pnl.isPositive && 'text-green-600',
              pnl.isNegative && 'text-red-600'
            )}
          >
            {pnl.isPositive ? '+' : ''}
            {pnl.text}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Цены и объем */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Вход</div>
            <div className="font-medium">{formatCurrency(trade.open_price)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Выход</div>
            <div className="font-medium">{formatCurrency(trade.close_price)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Объем</div>
            <div className="font-medium">{formatNumber(trade.initial_volume, 4)}</div>
          </div>
        </div>

        {/* Временные метки */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>Открытие: {formatDateTime(trade.opened_at)}</div>
          <div>Закрытие: {formatDateTime(trade.closed_at)}</div>
        </div>

        {/* Журнал и алгоритм */}
        {(showJournal || showAlgorithm) && (
          <div className="pt-2 border-t text-sm space-y-1">
            {showJournal && journalName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Журнал:</span>
                <span>{journalName}</span>
              </div>
            )}
            {showAlgorithm && algorithmName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Алгоритм:</span>
                <span>{algorithmName}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
