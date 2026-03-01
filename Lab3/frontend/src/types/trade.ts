export type Direction = 'long' | 'short';

export interface TradePosition {
  price: number;
  volume: number;
}

export interface TradeCreate {
  journal_id: number;
  instrument_name: string;
  direction: Direction;
  volume: number;
  open_time: string; // ISO format
  close_time: string;
  open_price: number;
  close_price: number;
  commission: number;
  positions: TradePosition[];
  algorithm_id?: number;
}