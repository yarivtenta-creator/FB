export interface Quote {
  symbol: string;
  bid: number;
  bidSize: number;
  ask: number;
  askSize: number;
  last: number;
  lastSize: number;
  timestamp: Date;
}

export interface Bar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

export interface Clock {
  timestamp: Date;
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
}

export interface Account {
  id: string;
  cash: number;
  buyingPower: number;
  equity: number;
  paperTrading: boolean;
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedGain: number;
}

export interface HistoricalOrder {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  status: 'filled' | 'pending' | 'canceled';
  timestamp: Date;
}
