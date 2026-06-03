import React, { useEffect, useState } from 'react';
import { ProviderStatusData, DashboardState } from './types.js';

interface ProviderStatusPanelProps {
  className?: string;
  onStatusChange?: (status: DashboardState) => void;
}

export const ProviderStatusPanel: React.FC<ProviderStatusPanelProps> = ({
  className,
  onStatusChange
}) => {
  const [state, setState] = useState<DashboardState>({
    providers: [],
    lastRefresh: new Date(),
    isLoading: false,
    error: undefined,
  });

  useEffect(() => {
    const loadProviderStatus = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        // Mock data for now - will be replaced by real provider registry
        const mockProviders: ProviderStatusData[] = [
          {
            name: 'alpaca',
            status: 'up',
            lastCheck: new Date(),
            responseTime: 45,
            errorRate: 0,
            capabilities: ['quotes', 'bars', 'clock', 'account', 'positions'],
            readOnly: true,
          },
        ];

        const newState: DashboardState = {
          providers: mockProviders,
          lastRefresh: new Date(),
          isLoading: false,
          error: undefined,
        };

        setState(newState);
        onStatusChange?.(newState);
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    loadProviderStatus();
    const interval = setInterval(loadProviderStatus, 30000);
    return () => clearInterval(interval);
  }, [onStatusChange]);

  return (
    <div className={`provider-status-panel ${className || ''}`}>
      <h2>Provider Status</h2>

      {state.isLoading && <div className="loading">Loading...</div>}

      {state.error && <div className="error">Error: {state.error}</div>}

      <div className="providers-grid">
        {state.providers.map(provider => (
          <div
            key={provider.name}
            className={`provider-card status-${provider.status}`}
          >
            <h3>{provider.name}</h3>

            <div className="status-info">
              <div className={`status-badge status-${provider.status}`}>
                {provider.status.toUpperCase()}
              </div>
            </div>

            <div className="details">
              <div className="detail-row">
                <span className="label">Last Check:</span>
                <span className="value">{provider.lastCheck.toLocaleTimeString()}</span>
              </div>

              <div className="detail-row">
                <span className="label">Response Time:</span>
                <span className="value">{provider.responseTime}ms</span>
              </div>

              <div className="detail-row">
                <span className="label">Error Rate:</span>
                <span className="value">{(provider.errorRate * 100).toFixed(2)}%</span>
              </div>

              <div className="detail-row">
                <span className="label">Read-Only:</span>
                <span className="value">{provider.readOnly ? '✅' : '❌'}</span>
              </div>
            </div>

            <div className="capabilities">
              <h4>Capabilities:</h4>
              <div className="capability-list">
                {provider.capabilities.map(cap => (
                  <span key={cap} className="capability-badge">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="refresh-info">
        Last refresh: {state.lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ProviderStatusPanel;
