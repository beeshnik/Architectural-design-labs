'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import {
  algorithmCreateSchema,
  algorithmUpdateSchema,
  type AlgorithmCreateFormData,
} from '../model/schema';
import type { AlgorithmResponse, AlgorithmCreate, AlgorithmUpdate } from '@/shared/api';

interface AlgorithmFormProps {
  algorithm?: AlgorithmResponse | null;
  onSubmit: (data: AlgorithmCreate | AlgorithmUpdate) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function AlgorithmForm({ algorithm, onSubmit, onCancel, isLoading }: AlgorithmFormProps) {
  const isEditing = !!algorithm;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlgorithmCreateFormData>({
    resolver: zodResolver(isEditing ? algorithmUpdateSchema : algorithmCreateSchema),
    defaultValues: algorithm
      ? {
          name: algorithm.name,
          body: algorithm.body,
        }
      : undefined,
  });

  const handleFormSubmit = (data: AlgorithmCreateFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название алгоритма *</Label>
        <Input
          id="name"
          placeholder="Например: Скальпинг BTC"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Описание / Правила</Label>
        <Textarea
          id="body"
          placeholder="Опишите правила торговли по этому алгоритму..."
          rows={6}
          {...register('body')}
        />
        {errors.body && (
          <p className="text-sm text-red-500">{errors.body.message}</p>
        )}
      </div>

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
