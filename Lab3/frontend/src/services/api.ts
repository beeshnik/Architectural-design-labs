import type { TradeCreate } from "../types/trade";

const API_URL = import.meta.env.VITE_API_URL;

export const createTrade = async (data: TradeCreate): Promise<Trade> => {
  const response = await fetch(`${API_URL}/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create trade');
  return response.json();
};
