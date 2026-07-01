import { ProviderConfig } from './types.js';

export class SafeKeys {
  static validate(config: ProviderConfig): void {
    if (config.apiKey === 'sk_live_' || config.apiKey.includes('real')) {
      throw new Error('Real credentials detected - refusing to load');
    }
    if (config.secretKey === 'secret_' || config.secretKey.includes('real')) {
      throw new Error('Real credentials detected - refusing to load');
    }
    if (config.apiKey === '<your-read-only-api-key-here>') {
      throw new Error('Placeholder API key detected - please set real credentials in .env');
    }
    if (config.secretKey === '<your-read-only-secret-here>') {
      throw new Error('Placeholder secret key detected - please set real credentials in .env');
    }
  }

  static preventLogging(obj: ProviderConfig): Partial<ProviderConfig> {
    return {
      name: obj.name,
      baseUrl: obj.baseUrl,
      dataUrl: obj.dataUrl,
      isReadOnly: obj.isReadOnly,
      capabilities: obj.capabilities,
      apiKey: '[REDACTED]',
      secretKey: '[REDACTED]',
    };
  }

  static loadFromEnv(name: string): ProviderConfig {
    const apiKey = process.env[`${name}_API_KEY`];
    const secretKey = process.env[`${name}_SECRET_KEY`];
    const baseUrl = process.env[`${name}_BASE_URL`];
    const dataUrl = process.env[`${name}_DATA_URL`];

    if (!apiKey || !secretKey) {
      throw new Error(`Missing ${name} credentials in .env`);
    }

    const config: ProviderConfig = {
      name,
      apiKey,
      secretKey,
      baseUrl: baseUrl || `https://${name.toLowerCase()}.example.com`,
      dataUrl,
      isReadOnly: true,
      capabilities: [],
    };

    this.validate(config);
    return config;
  }
}
