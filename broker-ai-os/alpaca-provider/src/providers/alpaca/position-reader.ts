import { AlpacaClient } from './client.js';
import { Position, HistoricalOrder } from './types.js';

export class AlpacaPositionReader {
  private client: AlpacaClient;

  constructor(client: AlpacaClient) {
    this.client = client;
  }

  async getPositions(): Promise<Position[]> {
    return this.client.getPositions();
  }

  async getPosition(symbol: string): Promise<Position | null> {
    const positions = await this.client.getPositions();
    return positions.find(p => p.symbol === symbol) || null;
  }

  async getOrders(): Promise<HistoricalOrder[]> {
    return this.client.getOrders();
  }

  async getOrdersBySymbol(symbol: string): Promise<HistoricalOrder[]> {
    const orders = await this.client.getOrders();
    return orders.filter(o => o.symbol === symbol);
  }

  async getTotalPositionValue(): Promise<number> {
    const positions = await this.client.getPositions();
    return positions.reduce((total, p) => {
      return total + (p.currentPrice * p.quantity);
    }, 0);
  }

  async getTotalUnrealizedGain(): Promise<number> {
    const positions = await this.client.getPositions();
    return positions.reduce((total, p) => total + p.unrealizedGain, 0);
  }

  async getPositionCount(): Promise<number> {
    const positions = await this.client.getPositions();
    return positions.length;
  }
}
