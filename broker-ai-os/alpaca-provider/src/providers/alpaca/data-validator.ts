import { Quote, Bar, Account } from './types.js';

export class DataValidator {
  static validateQuote(quote: Quote): void {
    if (!quote.symbol) {
      throw new Error('Missing symbol');
    }
    if (quote.bid <= 0) {
      throw new Error('Invalid bid price');
    }
    if (quote.ask <= 0) {
      throw new Error('Invalid ask price');
    }
    if (quote.bid > quote.ask) {
      throw new Error('Bid > ask (invalid spread)');
    }
  }

  static validateBar(bar: Bar): void {
    if (!bar.symbol) {
      throw new Error('Missing symbol');
    }
    if (bar.open <= 0) {
      throw new Error('Invalid open');
    }
    if (bar.close <= 0) {
      throw new Error('Invalid close');
    }
    if (bar.high < Math.max(bar.open, bar.close)) {
      throw new Error('High < open/close');
    }
    if (bar.low > Math.min(bar.open, bar.close)) {
      throw new Error('Low > open/close');
    }
    if (bar.volume < 0) {
      throw new Error('Invalid volume');
    }
  }

  static validateAccount(account: Account): void {
    if (!account.paperTrading) {
      throw new Error('SAFETY: Not in paper trading mode');
    }
    if (account.cash < 0) {
      throw new Error('Negative cash');
    }
    if (account.buyingPower < 0) {
      throw new Error('Negative buying power');
    }
    if (account.equity < 0) {
      throw new Error('Negative equity');
    }
  }
}
