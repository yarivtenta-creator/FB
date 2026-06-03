import { ProviderCapability, ProviderMetadata } from './types.js';

export const PROVIDERS_METADATA: Record<string, ProviderMetadata> = {
  alpaca: {
    name: 'Alpaca',
    description: 'Market data and paper trading',
    capabilities: ['quotes', 'bars', 'clock', 'account', 'positions', 'orders_historical'],
    documentation: 'https://alpaca.markets/docs/api-references/',
    isReadOnly: true,
    rateLimits: '200 requests per minute',
    dataLatency: 'Real-time',
  },
};

export function getProviderMetadata(name: string): ProviderMetadata | null {
  return PROVIDERS_METADATA[name] || null;
}

export function getProviderCapabilities(name: string): ProviderCapability[] {
  const metadata = getProviderMetadata(name);
  return metadata?.capabilities || [];
}

export function isProviderReadOnly(name: string): boolean {
  const metadata = getProviderMetadata(name);
  return metadata?.isReadOnly ?? false;
}

export function listAllProviders(): string[] {
  return Object.keys(PROVIDERS_METADATA);
}
