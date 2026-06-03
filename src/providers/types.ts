export type ProviderCapability =
  | 'quotes'
  | 'bars'
  | 'clock'
  | 'account'
  | 'positions'
  | 'orders_historical';

export interface ProviderConfig {
  name: string;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  dataUrl?: string;
  isReadOnly: boolean;
  capabilities: ProviderCapability[];
}

export interface ProviderStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
}

export interface Provider {
  name: string;
  config: ProviderConfig;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): ProviderStatus;
}

export interface ProviderMetadata {
  name: string;
  description: string;
  capabilities: ProviderCapability[];
  documentation: string;
  isReadOnly: boolean;
  rateLimits: string;
  dataLatency: string;
}
