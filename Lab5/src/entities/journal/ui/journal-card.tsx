import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/shared/ui';
import { formatCurrency, formatDateTime } from '@/shared/lib';
import { Wallet, Key, TrendingUp, TrendingDown } from 'lucide-react';
import type { JournalResponse } from '@/shared/api';

interface JournalCardProps {
  journal: JournalResponse;
  onClick?: () => void;
  isActive?: boolean;
  // Опциональные данные для расширенной карточки
  calculatedBalance?: string;
  balanceDifference?: string;
}

export function JournalCard({
  journal,
  onClick,
  isActive,
  calculatedBalance,
  balanceDifference,
}: JournalCardProps) {
  const hasApiKeys = journal.has_api_keys;
  const hasCalculated = calculatedBalance !== undefined;

  // Определяем цвет разницы баланса
  const getDifferenceColor = () => {
    if (!balanceDifference) return 'neutral';
    const diff = parseFloat(balanceDifference);
    if (diff > 0) return 'success';
    if (diff < 0) return 'danger';
    return 'neutral';
  };

  const diffVariant = getDifferenceColor();

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{journal.name}</CardTitle>
          {hasApiKeys && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Key className="h-3 w-3" />
              API
            </Badge>
          )}
        </div>
        <CardDescription>
          Создан: {formatDateTime(journal.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Депозитный баланс */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>Депозит:</span>
          </div>
          <span className="font-medium">
            {formatCurrency(journal.deposit_balance)}
          </span>
        </div>

        {/* Расчетный баланс (если есть) */}
        {hasCalculated && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Расчетный:</span>
              </div>
              <span className="font-medium">
                {formatCurrency(calculatedBalance!)}
              </span>
            </div>

            {/* Разница */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {parseFloat(balanceDifference!) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span>Изменение:</span>
              </div>
              <Badge
                variant={diffVariant === 'success' ? 'success' : diffVariant === 'danger' ? 'danger' : 'secondary'}
              >
                {parseFloat(balanceDifference!) >= 0 ? '+' : ''}
                {formatCurrency(balanceDifference!)}
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
