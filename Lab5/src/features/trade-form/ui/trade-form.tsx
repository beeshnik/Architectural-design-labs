'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { tradeCreateSchema, tradeUpdateSchema, type TradeCreateFormData } from '../model/schema';
import type { TradeResponse, TradeCreate, TradeUpdate, JournalResponse, AlgorithmResponse } from '@/shared/api';

interface TradeFormProps {
  trade?: TradeResponse | null;
  journals: JournalResponse[];
  algorithms: AlgorithmResponse[];
  onSubmit: (data: TradeCreate | TradeUpdate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  preselectedJournalId?: string | null;
}

export function TradeForm({
  trade,
  journals,
  algorithms,
  onSubmit,
  onCancel,
  isLoading,
  preselectedJournalId,
}: TradeFormProps) {
  const isEditing = !!trade;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TradeCreateFormData>({
    resolver: zodResolver(isEditing ? tradeUpdateSchema : tradeCreateSchema),
    defaultValues: trade
      ? {
          ticker: trade.ticker,
          direction: trade.direction,
          opened_at: trade.opened_at.slice(0, 16), // формат datetime-local
          closed_at: trade.closed_at.slice(0, 16),
          initial_volume: trade.initial_volume,
          open_price: trade.open_price,
          close_price: trade.close_price,
          commission: trade.commission || '0',
          journal_id: trade.journal_id,
          algorithm_id: trade.algorithm_id,
        }
      : {
          direction: 'long',
          opened_at: new Date().toISOString().slice(0, 16),
          closed_at: new Date().toISOString().slice(0, 16),
          commission: '0',
          journal_id: preselectedJournalId || '',
          algorithm_id: null,
        },
  });

  const handleFormSubmit = (data: TradeCreateFormData) => {
    // Преобразуем строковые даты обратно в ISO формат
    const formattedData = {
      ...data,
      opened_at: new Date(data.opened_at).toISOString(),
      closed_at: new Date(data.closed_at).toISOString(),
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Тикер и направление */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticker">Тикер *</Label>
          <Input
            id="ticker"
            placeholder="BTCUSDT"
            {...register('ticker')}
          />
          {errors.ticker && (
            <p className="text-sm text-red-500">{errors.ticker.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Направление *</Label>
          <Controller
            name="direction"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long (Покупка)</SelectItem>
                  <SelectItem value="short">Short (Продажа)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.direction && (
            <p className="text-sm text-red-500">{errors.direction.message}</p>
          )}
        </div>
      </div>

      {/* Даты открытия и закрытия */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opened_at">Дата открытия *</Label>
          <Input
            id="opened_at"
            type="datetime-local"
            {...register('opened_at')}
          />
          {errors.opened_at && (
            <p className="text-sm text-red-500">{errors.opened_at.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="closed_at">Дата закрытия *</Label>
          <Input
            id="closed_at"
            type="datetime-local"
            {...register('closed_at')}
          />
          {errors.closed_at && (
            <p className="text-sm text-red-500">{errors.closed_at.message}</p>
          )}
        </div>
      </div>

      {/* Объем и цены */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initial_volume">Объем *</Label>
          <Input
            id="initial_volume"
            type="number"
            step="any"
            placeholder="0.1"
            {...register('initial_volume')}
          />
          {errors.initial_volume && (
            <p className="text-sm text-red-500">{errors.initial_volume.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="open_price">Цена входа *</Label>
          <Input
            id="open_price"
            type="number"
            step="any"
            placeholder="50000"
            {...register('open_price')}
          />
          {errors.open_price && (
            <p className="text-sm text-red-500">{errors.open_price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="close_price">Цена выхода *</Label>
          <Input
            id="close_price"
            type="number"
            step="any"
            placeholder="55000"
            {...register('close_price')}
          />
          {errors.close_price && (
            <p className="text-sm text-red-500">{errors.close_price.message}</p>
          )}
        </div>
      </div>

      {/* Комиссия, Журнал, Алгоритм */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commission">Комиссия</Label>
          <Input
            id="commission"
            type="number"
            step="any"
            placeholder="0"
            {...register('commission')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal_id">Журнал *</Label>
          <Controller
            name="journal_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isEditing} // Нельзя менять журнал при редактировании
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите журнал" />
                </SelectTrigger>
                <SelectContent>
                  {journals.map((journal) => (
                    <SelectItem key={journal.id} value={journal.id}>
                      {journal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.journal_id && (
            <p className="text-sm text-red-500">{errors.journal_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="algorithm_id">Алгоритм</Label>
          <Controller
            name="algorithm_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите алгоритм" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без алгоритма</SelectItem>
                  {algorithms.map((algorithm) => (
                    <SelectItem key={algorithm.id} value={algorithm.id}>
                      {algorithm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
