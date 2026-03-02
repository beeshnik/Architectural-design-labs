import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from '@/shared/ui';
import {
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPnL,
  cn,
} from '@/shared/lib';
import { ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import type { TradeResponse } from '@/shared/api';

interface TradesTableProps {
  trades: TradeResponse[];
  onEdit?: (trade: TradeResponse) => void;
  onDelete?: (trade: TradeResponse) => void;
  // Опционально: отображать названия журналов и алгоритмов
  journalNames?: Record<string, string>;
  algorithmNames?: Record<string, string>;
  // Флаг для скрытия колонок журнала/алгоритма (если мы уже в контексте конкретного журнала)
  hideJournalColumn?: boolean;
  hideAlgorithmColumn?: boolean;
}

export function TradesTable({
  trades,
  onEdit,
  onDelete,
  journalNames,
  algorithmNames,
  hideJournalColumn = false,
  hideAlgorithmColumn = false,
}: TradesTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg">
        Нет сделок. Создайте первую сделку.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тикер</TableHead>
            <TableHead>Направление</TableHead>
            <TableHead>Открытие</TableHead>
            <TableHead>Закрытие</TableHead>
            <TableHead className="text-right">Объем</TableHead>
            <TableHead className="text-right">Цена входа</TableHead>
            <TableHead className="text-right">Цена выхода</TableHead>
            <TableHead className="text-right">Комиссия</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            {!hideJournalColumn && <TableHead>Журнал</TableHead>}
            {!hideAlgorithmColumn && <TableHead>Алгоритм</TableHead>}
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const pnl = formatPnL(trade.pnl);
            const isLong = trade.direction === 'long';

            return (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">{trade.ticker}</TableCell>
                <TableCell>
                  <Badge
                    variant={isLong ? 'success' : 'danger'}
                    className="flex w-fit items-center gap-1"
                  >
                    {isLong ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {isLong ? 'Long' : 'Short'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDateTime(trade.opened_at)}</TableCell>
                <TableCell>{formatDateTime(trade.closed_at)}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(trade.initial_volume, 4)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(trade.open_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(trade.close_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(trade.commission)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    pnl.isPositive && 'text-green-600',
                    pnl.isNegative && 'text-red-600'
                  )}
                >
                  {pnl.text}
                </TableCell>
                {!hideJournalColumn && (
                  <TableCell>
                    {journalNames?.[trade.journal_id] || trade.journal_id}
                  </TableCell>
                )}
                {!hideAlgorithmColumn && (
                  <TableCell>
                    {trade.algorithm_id
                      ? algorithmNames?.[trade.algorithm_id] || trade.algorithm_id
                      : '-'}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(trade)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => onDelete(trade)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
