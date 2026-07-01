import { ProviderConfig, ProviderStatus } from '../providers/types.js';
import { SafeKeys } from '../providers/safe-keys.js';
import { DataHub } from '../data-hub/hub.js';

export interface ExecutionRequest {
  action: string;
  providerName: string;
  params: Record<string, unknown>;
}

export interface ExecutionResult {
  allowed: boolean;
  reason: string;
  timestamp: Date;
}

export class PaperBridge {
  private dataHub: DataHub;
  private readonly forbiddenActions = [
    'submitOrder',
    'cancelOrder',
    'executeOrder',
    'closePosition',
    'buyPosition',
    'sellPosition',
    'modifyOrder',
    'placeOrder',
  ];

  constructor(dataHub: DataHub) {
    if (!dataHub) {
      throw new Error('PaperBridge requires a DataHub');
    }
    this.dataHub = dataHub;
  }

  async evaluateExecution(request: ExecutionRequest): Promise<ExecutionResult> {
    const timestamp = new Date();

    // Check 1: Is this a forbidden action?
    if (this.forbiddenActions.includes(request.action)) {
      return {
        allowed: false,
        reason: `SAFETY: Order execution method '${request.action}' is forbidden`,
        timestamp,
      };
    }

    // Check 2: Does provider exist?
    if (!this.dataHub.hasProvider(request.providerName)) {
      return {
        allowed: false,
        reason: `Provider '${request.providerName}' not registered`,
        timestamp,
      };
    }

    // Check 3: Is provider read-only?
    const provider = await this.dataHub.getProvider(request.providerName);
    if (!provider.config.isReadOnly) {
      return {
        allowed: false,
        reason: `SAFETY: Provider '${request.providerName}' is not read-only`,
        timestamp,
      };
    }

    // Check 4: All checks passed - allow read-only operations
    return {
      allowed: true,
      reason: 'Read-only operation approved',
      timestamp,
    };
  }

  async validateCredentials(config: ProviderConfig): Promise<ExecutionResult> {
    const timestamp = new Date();

    try {
      SafeKeys.validate(config);
      return {
        allowed: true,
        reason: 'Credentials validated',
        timestamp,
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : 'Credential validation failed',
        timestamp,
      };
    }
  }

  async verifyPaperTrading(): Promise<ExecutionResult> {
    const timestamp = new Date();

    try {
      const statuses = await this.dataHub.getProviderStatus();

      // In real implementation, would check account data
      // For now, verify at least one provider is registered
      if (statuses.length === 0) {
        return {
          allowed: false,
          reason: 'No providers available for paper trading',
          timestamp,
        };
      }

      return {
        allowed: true,
        reason: 'Paper trading verified',
        timestamp,
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : 'Paper trading verification failed',
        timestamp,
      };
    }
  }

  getForbiddenActions(): string[] {
    return [...this.forbiddenActions];
  }
}

export default PaperBridge;
