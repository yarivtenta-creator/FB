import React, { useEffect, useState } from 'react';
import { DataReadinessStatus, PanelProps } from './types.js';

interface DataReadinessPanelProps extends PanelProps {
  onReadinessChange?: (status: DataReadinessStatus[]) => void;
}

export const DataReadinessPanel: React.FC<DataReadinessPanelProps> = ({
  className,
  onReadinessChange
}) => {
  const [readiness, setReadiness] = useState<DataReadinessStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReadinessStatus = async () => {
      setIsLoading(true);
      try {
        // Mock data for data readiness
        const mockReadiness: DataReadinessStatus[] = [
          {
            source: 'Alpaca Quotes',
            ready: true,
            lastUpdate: new Date(),
            recordCount: 500,
            latency: 45,
          },
          {
            source: 'Alpaca Bars',
            ready: true,
            lastUpdate: new Date(),
            recordCount: 1000,
            latency: 50,
          },
          {
            source: 'Alpaca Account',
            ready: true,
            lastUpdate: new Date(),
            recordCount: 1,
            latency: 35,
          },
        ];

        setReadiness(mockReadiness);
        onReadinessChange?.(mockReadiness);
      } catch (error) {
        console.error('Failed to load data readiness:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReadinessStatus();
    const interval = setInterval(loadReadinessStatus, 60000);
    return () => clearInterval(interval);
  }, [onReadinessChange]);

  return (
    <div className={`data-readiness-panel ${className || ''}`}>
      <h2>Data Readiness</h2>

      {isLoading && <div className="loading">Loading...</div>}

      <div className="readiness-grid">
        {readiness.map(source => (
          <div
            key={source.source}
            className={`readiness-card ${source.ready ? 'ready' : 'not-ready'}`}
          >
            <h3>{source.source}</h3>

            <div className="status">
              <span className={`badge ${source.ready ? 'ready' : 'not-ready'}`}>
                {source.ready ? '✅ READY' : '❌ NOT READY'}
              </span>
            </div>

            <div className="metrics">
              <div className="metric">
                <span className="label">Last Update:</span>
                <span className="value">{source.lastUpdate.toLocaleTimeString()}</span>
              </div>

              <div className="metric">
                <span className="label">Records:</span>
                <span className="value">{source.recordCount}</span>
              </div>

              <div className="metric">
                <span className="label">Latency:</span>
                <span className="value">{source.latency}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataReadinessPanel;
