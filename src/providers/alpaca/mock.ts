import { Quote, Bar, Clock, Account, Position } from './types.js';

export class AlpacaMock {
  static getQuote(symbol: string): Quote {
    return {
      symbol,
      bid: 150.50,
      bidSize: 100,
      ask: 150.51,
      askSize: 200,
      last: 150.50,
      lastSize: 50,
      timestamp: new Date(),
    };
  }

  static getBar(symbol: string, _timeframe: string): Bar {
    return {
      symbol,
      open: 150.00,
      high: 151.00,
      low: 149.50,
      close: 150.50,
      volume: 1000000,
      timestamp: new Date(),
    };
  }

  static getClock(): Clock {
    const now = new Date();
    return {
      timestamp: now,
      isOpen: now.getHours() >= 9 && now.getHours() < 16,
      nextOpen: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      nextClose: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    };
  }

  static getAccount(): Account {
    return {
      id: 'PA123456',
      cash: 100000,
      buyingPower: 400000,
      equity: 100000,
      paperTrading: true,
    };
  }

  static getPositions(): Position[] {
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
}
