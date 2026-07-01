// Dashboard types and interfaces

export interface ProviderStatusData {
  name: string;
  status: 'up' | 'down' | 'degraded';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  capabilities: string[];
  readOnly: boolean;
}

export interface DashboardState {
  providers: ProviderStatusData[];
  lastRefresh: Date;
  isLoading: boolean;
  error?: string;
}

export interface DataReadinessStatus {
  source: string;
  ready: boolean;
  lastUpdate: Date;
  recordCount: number;
  latency: number;
}

export interface PaperAccountData {
  id: string;
  cash: number;
  buyingPower: number;
  equity: number;
  positions: number;
  orders: number;
  paperTrading: boolean;
}

export interface PanelProps {
  className?: string;
}
