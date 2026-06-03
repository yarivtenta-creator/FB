import React, { useEffect, useState } from 'react';
import { PaperAccountData, PanelProps } from './types.js';

interface PaperAccountPanelProps extends PanelProps {
  onAccountChange?: (account: PaperAccountData) => void;
}

export const PaperAccountPanel: React.FC<PaperAccountPanelProps> = ({
  className,
  onAccountChange
}) => {
  const [account, setAccount] = useState<PaperAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const loadAccountData = async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        // Mock paper account data
        const mockAccount: PaperAccountData = {
          id: 'PA123456',
          cash: 100000,
          buyingPower: 400000,
          equity: 100000,
          positions: 3,
          orders: 2,
          paperTrading: true,
        };

        setAccount(mockAccount);
        onAccountChange?.(mockAccount);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
    const interval = setInterval(loadAccountData, 30000);
    return () => clearInterval(interval);
  }, [onAccountChange]);

  const getEquityPercentage = () => {
    if (!account) return 0;
    return (account.equity / (account.equity + account.cash)) * 100;
  };

  return (
    <div className={`paper-account-panel ${className || ''}`}>
      <h2>Paper Trading Account</h2>

      {isLoading && <div className="loading">Loading...</div>}

      {error && <div className="error">Error: {error}</div>}

      {account && (
        <>
          <div className="account-header">
            <div className="account-id">Account ID: {account.id}</div>
            <div className={`paper-badge ${account.paperTrading ? 'active' : 'inactive'}`}>
              {account.paperTrading ? '📄 PAPER TRADING' : '⚠️ NOT PAPER'}
            </div>
          </div>

          <div className="account-summary">
            <div className="summary-card">
              <h3>Equity</h3>
              <div className="value">${account.equity.toLocaleString()}</div>
              <div className="percentage">{getEquityPercentage().toFixed(1)}%</div>
            </div>

            <div className="summary-card">
              <h3>Cash</h3>
              <div className="value">${account.cash.toLocaleString()}</div>
            </div>

            <div className="summary-card">
              <h3>Buying Power</h3>
              <div className="value">${account.buyingPower.toLocaleString()}</div>
              <div className="leverage">{(account.buyingPower / account.cash).toFixed(1)}x</div>
            </div>
          </div>

          <div className="positions-section">
            <h3>Portfolio Status</h3>
            <div className="position-stats">
              <div className="stat">
                <span className="label">Open Positions:</span>
                <span className="value">{account.positions}</span>
              </div>

              <div className="stat">
                <span className="label">Pending Orders:</span>
                <span className="value">{account.orders}</span>
              </div>

              <div className="stat">
                <span className="label">Account Type:</span>
                <span className="value">
                  {account.paperTrading ? 'Paper Trading' : 'Live Trading'}
                </span>
              </div>
            </div>
          </div>

          <div className="compliance-notice">
            <strong>Paper Trading Only:</strong> This account is in paper trading mode. No real money or
            trades occur. This is for testing and simulation only.
          </div>
        </>
      )}
    </div>
  );
};

export default PaperAccountPanel;
