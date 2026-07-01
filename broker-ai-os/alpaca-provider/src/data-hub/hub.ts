import { ProviderRegistry } from '../providers/registry.js';
import { Provider, ProviderStatus } from '../providers/types.js';

export interface DataHubConfig {
  registry: ProviderRegistry;
  refreshIntervalMs?: number;
}

export class DataHub {
  private registry: ProviderRegistry;
  private refreshIntervalMs: number;
  private lastRefresh: Date = new Date();

  constructor(config: DataHubConfig) {
    if (!config.registry) {
      throw new Error('DataHub requires a ProviderRegistry');
    }
    this.registry = config.registry;
    this.refreshIntervalMs = config.refreshIntervalMs || 30000;
  }

  async getProviderStatus(): Promise<ProviderStatus[]> {
    const providers = this.registry.getAll();

    if (providers.length === 0) {
      throw new Error('No providers registered');
    }

    const statuses = providers.map(p => p.getStatus());
    this.lastRefresh = new Date();
    return statuses;
  }

  async getProvider(name: string): Promise<Provider> {
    return this.registry.get(name);
  }

  hasProvider(name: string): boolean {
    return this.registry.has(name);
  }

  getLastRefresh(): Date {
    return this.lastRefresh;
  }

  async getAccountData(providerName: string = 'alpaca') {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // This will be called with concrete providers that have account methods
    // For now, return provider name for testing
    return {
      providerName,
      lastFetch: new Date(),
    };
  }

  async getPositionsData(providerName: string = 'alpaca') {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    return {
      providerName,
      lastFetch: new Date(),
    };
  }
}

export default DataHub;
