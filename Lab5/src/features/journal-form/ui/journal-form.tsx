'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/shared/ui';
import { journalCreateSchema, journalUpdateSchema, type JournalCreateFormData } from '../model/schema';
import type { JournalResponse, JournalCreate, JournalUpdate } from '@/shared/api';

interface JournalFormProps {
  journal?: JournalResponse | null;
  onSubmit: (data: JournalCreate | JournalUpdate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function JournalForm({ journal, onSubmit, onCancel, isLoading }: JournalFormProps) {
  const isEditing = !!journal;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JournalCreateFormData>({
    resolver: zodResolver(isEditing ? journalUpdateSchema : journalCreateSchema),
    defaultValues: journal
      ? {
          name: journal.name,
          deposit_balance: journal.deposit_balance,
        }
      : {
          deposit_balance: '0',
        },
  });

  const handleFormSubmit = (data: JournalCreateFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название журнала *</Label>
        <Input
          id="name"
          placeholder="Мой торговый журнал"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit_balance">Начальный депозит</Label>
        <Input
          id="deposit_balance"
          type="number"
          step="any"
          placeholder="10000"
          {...register('deposit_balance')}
        />
        {errors.deposit_balance && (
          <p className="text-sm text-red-500">{errors.deposit_balance.message}</p>
        )}
      </div>

      {/* API ключи - показываем только при редактировании */}
      {isEditing && (
        <div className="space-y-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            API ключи (опционально, для интеграции с Bybit)
          </div>
          <div className="space-y-2">
            <Label htmlFor="bybit_api_key">Bybit API Key</Label>
            <Input
              id="bybit_api_key"
              placeholder="Введите API ключ"
              {...register('bybit_api_key')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bybit_api_secret">Bybit API Secret</Label>
            <Input
              id="bybit_api_secret"
              type="password"
              placeholder="Введите API секрет"
              {...register('bybit_api_secret')}
            />
          </div>
        </div>
      )}

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
