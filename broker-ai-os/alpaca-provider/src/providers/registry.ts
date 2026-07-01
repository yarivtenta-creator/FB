import { Provider, ProviderStatus } from './types.js';

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): void {
    if (!provider.config.isReadOnly) {
      throw new Error(`Provider ${provider.name} must be read-only`);
    }
    this.providers.set(provider.name, provider);
  }

  get(name: string): Provider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered`);
    }
    return provider;
  }

  getAll(): Provider[] {
    return Array.from(this.providers.values());
  }

  getStatus(): ProviderStatus[] {
    return this.getAll().map(p => p.getStatus());
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }

  unregister(name: string): boolean {
    return this.providers.delete(name);
  }
}
