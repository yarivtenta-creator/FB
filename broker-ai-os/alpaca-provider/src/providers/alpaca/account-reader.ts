import { AlpacaClient } from './client.js';
import { Account, Position, HistoricalOrder } from './types.js';

export class AlpacaAccountReader {
  private client: AlpacaClient;

  constructor(client: AlpacaClient) {
    this.client = client;
  }

  async getAccount(): Promise<Account> {
    return this.client.getAccount();
  }

  async getBalance(): Promise<{ cash: number; buyingPower: number; equity: number; totalValue: number }> {
    const account = await this.client.getAccount();
    return {
      cash: account.cash,
      buyingPower: account.buyingPower,
      equity: account.equity,
      totalValue: account.equity,
    };
  }

  async getCash(): Promise<number> {
    const account = await this.client.getAccount();
    return account.cash;
  }

  async getBuyingPower(): Promise<number> {
    const account = await this.client.getAccount();
    return account.buyingPower;
  }

  async getEquity(): Promise<number> {
    const account = await this.client.getAccount();
    return account.equity;
  }

  async isPaperTrading(): Promise<boolean> {
    const account = await this.client.getAccount();
    return account.paperTrading;
  }
}
