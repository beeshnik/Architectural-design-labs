import { useState } from 'react';
import { createTrade } from '../services/api';
import type { TradeCreate } from '../types/trade';

export const TradeForm = ({ journalId }: { journalId: number }) => {
  // Локальное состояние (YAGNI: не используем глобальный стор для простой формы)
  const [formData, setFormData] = useState<Partial<TradeCreate>>({
    journal_id: journalId,
    direction: 'long',
    positions: [{ price: 0, volume: 0 }],
    commission: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Простая валидация (KISS)
    if (!formData.instrument_name) return alert('Введите инструмент');
    
    await createTrade(formData as TradeCreate);
    alert('Сделка сохранена');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Инструмент" 
        onChange={e => setFormData({...formData, instrument_name: e.target.value})} 
      />
      {/* Остальные поля... */}
      <button type="submit">Сохранить сделку</button>
    </form>
  );
};