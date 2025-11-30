export interface Model {
    id: string;
    name: string;
    provider: string;
    description: string;
    pricePer1kTokens: number; // in USDC
    latencyMs: number;
    tags: string[];
    contextWindow: string;
    endpoint: string;
  }
  
  export interface User {
    walletAddress: string | null;
    balanceUSDC: number;
    apiKeys: string[];
  }
  
  export interface UsageRecord {
    id: string;
    timestamp: string;
    modelName: string;
    tokens: number;
    cost: number;
    status: 'success' | 'failed';
  }
  
  export interface DailyUsage {
    date: string;
    calls: number;
    cost: number;
  }