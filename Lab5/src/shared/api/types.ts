// Типы на основе OpenAPI спецификации

// === Algorithm Types ===
export interface AlgorithmResponse {
  id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface AlgorithmCreate {
  name: string;
  body?: string;
}

export interface AlgorithmUpdate {
  name?: string | null;
  body?: string | null;
}

export interface AlgorithmListResponse {
  items: AlgorithmResponse[];
  total: number;
}

// === Journal Types ===
export interface JournalResponse {
  id: string;
  name: string;
  deposit_balance: string;
  has_api_keys: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalDetailResponse extends JournalResponse {
  calculated_balance: string;
  balance_difference: string;
}

export interface JournalCreate {
  name: string;
  deposit_balance?: number | string;
  bybit_api_key?: string | null;
  bybit_api_secret?: string | null;
}

export interface JournalUpdate {
  name?: string | null;
  deposit_balance?: number | string | null;
  bybit_api_key?: string | null;
  bybit_api_secret?: string | null;
}

export interface JournalListResponse {
  items: JournalResponse[];
  total: number;
}

// === Trade Types ===
export interface TradePosition {
  id: string;
  trade_id: string;
  price: string;
  volume: string;
  position_type: 'add' | 'reduce';
  created_at: string;
}

export interface TradePositionCreate {
  price: number | string;
  volume: number | string;
  position_type: 'add' | 'reduce';
}

export interface TradeResponse {
  id: string;
  opened_at: string;
  closed_at: string;
  ticker: string;
  direction: 'long' | 'short';
  initial_volume: string;
  current_volume: string;
  open_price: string;
  close_price: string;
  commission: string;
  pnl: string;
  journal_id: string;
  algorithm_id: string | null;
  positions: TradePosition[];
  created_at: string;
  updated_at: string;
}

export interface TradeDetailResponse extends TradeResponse {
  total_added_volume: string;
  total_reduced_volume: string;
}

export interface TradeCreate {
  opened_at: string;
  closed_at: string;
  ticker: string;
  direction: 'long' | 'short';
  initial_volume: number | string;
  open_price: number | string;
  close_price: number | string;
  commission?: number | string;
  journal_id: string;
  algorithm_id?: string | null;
  positions?: TradePositionCreate[];
}

export interface TradeUpdate {
  opened_at?: string | null;
  closed_at?: string | null;
  ticker?: string | null;
  direction?: 'long' | 'short' | null;
  initial_volume?: number | string | null;
  open_price?: number | string | null;
  close_price?: number | string | null;
  commission?: number | string | null;
  algorithm_id?: string | null;
}

export interface TradeListResponse {
  items: TradeResponse[];
  total: number;
}

export interface AddPositionRequest {
  price: number | string;
  volume: number | string;
  position_type: 'add' | 'reduce';
}

// === Pagination & Filters ===
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface TradeFilters extends PaginationParams {
  journal_id?: string | null;
  algorithm_id?: string | null;
  ticker?: string | null;
  direction?: 'long' | 'short' | null;
}

// === Error Types ===
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}