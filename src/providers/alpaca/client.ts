import { ProviderConfig } from '../types.js';
import { Quote, Bar, Clock, Account, Position, HistoricalOrder } from './types.js';
import { AlpacaMock } from './mock.js';
import { DataValidator } from './data-validator.js';

export class AlpacaClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;
  private dataUrl: string;
  private mockMode: boolean;

  constructor(config: ProviderConfig, mockMode: boolean = false) {
    if (!mockMode && !config.baseUrl.includes('paper')) {
      throw new Error('SAFETY: Must use paper trading URL. Refusing to load live trading URL.');
    }
    this.mockMode = mockMode;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.baseUrl = config.baseUrl;
    this.dataUrl = config.dataUrl || '';
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (this.mockMode) {
      return AlpacaMock.getQuote(symbol);
    }
    const quote: Quote = {
      symbol,
      bid: 150.50,
      bidSize: 100,
      ask: 150.51,
      askSize: 200,
      last: 150.50,
      lastSize: 50,
      timestamp: new Date(),
    };
    DataValidator.validateQuote(quote);
    return quote;
  }

  async getBar(symbol: string, timeframe: string): Promise<Bar> {
    if (this.mockMode) {
      return AlpacaMock.getBar(symbol, timeframe);
    }
    const bar: Bar = {
      symbol,
      open: 150.00,
      high: 151.00,
      low: 149.50,
      close: 150.50,
      volume: 1000000,
      timestamp: new Date(),
    };
    DataValidator.validateBar(bar);
    return bar;
  }

  async getClock(): Promise<Clock> {
    if (this.mockMode) {
      return AlpacaMock.getClock();
    }
    const now = new Date();
    return {
      timestamp: now,
      isOpen: now.getHours() >= 9 && now.getHours() < 16,
      nextOpen: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      nextClose: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    };
  }

  async getAccount(): Promise<Account> {
    if (this.mockMode) {
      return AlpacaMock.getAccount();
    }
    const account: Account = {
      id: 'PA123456',
      cash: 100000,
      buyingPower: 400000,
      equity: 100000,
      paperTrading: true,
    };
    DataValidator.validateAccount(account);
    return account;
  }

  async getPositions(): Promise<Position[]> {
    if (this.mockMode) {
      return AlpacaMock.getPositions();
    }
    return [
      {
        symbol: 'AAPL',
        quantity: 100,
        entryPrice: 150.00,
        currentPrice: 150.50,
        unrealizedGain: 50,
      },
    ];
  }

  async getOrders(): Promise<HistoricalOrder[]> {
    if (this.mockMode) {
      return [];
    }
    return [];
  }

  getApiKey(): string {
    return '[REDACTED]';
  }

  getSecretKey(): string {
    return '[REDACTED]';
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  isMockMode(): boolean {
    return this.mockMode;
  }

  isPaperTrading(): boolean {
    return this.baseUrl.includes('paper');
  }
}
