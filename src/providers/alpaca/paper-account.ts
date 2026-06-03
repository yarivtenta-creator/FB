import { AlpacaClient } from './client.js';
import { Account, Position, HistoricalOrder } from './types.js';
import { DataValidator } from './data-validator.js';

export class AlpacaPaperAccount {
  private client: AlpacaClient;

  constructor(client: AlpacaClient) {
    this.client = client;
  }

  async getAccount(): Promise<Account> {
    const account = await this.client.getAccount();
    DataValidator.validateAccount(account);
    if (!account.paperTrading) {
      throw new Error('SAFETY: Account is not in paper trading mode');
    }
    return {
      id: account.id,
      cash: account.cash,
      buyingPower: account.buyingPower,
      equity: account.equity,
      paperTrading: account.paperTrading,
    };
  }

  async getPositions(): Promise<Position[]> {
    const positions = await this.client.getPositions();
    return positions.map(p => ({
      symbol: p.symbol,
      quantity: p.quantity,
      entryPrice: p.entryPrice,
      currentPrice: p.currentPrice,
      unrealizedGain: p.unrealizedGain,
    }));
  }

  async getOrders(): Promise<HistoricalOrder[]> {
    const orders = await this.client.getOrders();
    return orders.map(o => ({
      id: o.id,
      symbol: o.symbol,
      quantity: o.quantity,
      price: o.price,
      status: o.status,
      timestamp: o.timestamp,
    }));
  }

  async getBalance(): Promise<{ cash: number; buyingPower: number; equity: number }> {
    const account = await this.getAccount();
    return {
      cash: account.cash,
      buyingPower: account.buyingPower,
      equity: account.equity,
    };
  }
}
