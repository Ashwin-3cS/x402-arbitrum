import { Model, UsageRecord, DailyUsage } from './types';
import { Cpu, Zap, Image as ImageIcon, Code, BarChart3, Lock } from 'lucide-react';
import React from 'react';

export const MOCK_MODELS: Model[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google DeepMind',
    description: 'A fast, cost-efficient multimodal model optimized for high-frequency tasks.',
    pricePer1kTokens: 0.0001,
    latencyMs: 120,
    tags: ['Text', 'Multimodal', 'Fast'],
    contextWindow: '1M',
    endpoint: 'https://api.arb402.com/v1/gemini/flash'
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3.0 Pro',
    provider: 'Google DeepMind',
    description: 'The most capable AI model for complex reasoning, coding, and creative work.',
    pricePer1kTokens: 0.002,
    latencyMs: 450,
    tags: ['Reasoning', 'Coding', 'SOTA'],
    contextWindow: '2M',
    endpoint: 'https://api.arb402.com/v1/gemini/pro'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'State-of-the-art open source model with excellent general purpose capabilities.',
    pricePer1kTokens: 0.0008,
    latencyMs: 280,
    tags: ['Text', 'Open Source'],
    contextWindow: '8k',
    endpoint: 'https://api.arb402.com/v1/meta/llama-3-70b'
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    description: 'High-quality sparse mixture-of-experts model.',
    pricePer1kTokens: 0.0005,
    latencyMs: 180,
    tags: ['Text', 'MoE'],
    contextWindow: '32k',
    endpoint: 'https://api.arb402.com/v1/mistral/mixtral-8x7b'
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    description: 'Next generation image synthesis model.',
    pricePer1kTokens: 0.04, // per image roughly
    latencyMs: 3200,
    tags: ['Image', 'Generation'],
    contextWindow: 'N/A',
    endpoint: 'https://api.arb402.com/v1/stability/sd3'
  },
  {
    id: 'groq-llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq (x402)',
    description: 'Ultra-fast LLM inference with pay-per-token pricing via x402 protocol.',
    pricePer1kTokens: 0.001,
    latencyMs: 120,
    tags: ['Text', 'x402', 'Instant'],
    contextWindow: '128k',
    endpoint: 'http://localhost:3001/chat'
  },
];

export const MOCK_USAGE_HISTORY: UsageRecord[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `req_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  modelName: i % 3 === 0 ? 'Gemini 2.5 Flash' : i % 2 === 0 ? 'Llama 3 70B' : 'Mixtral 8x7B',
  tokens: Math.floor(Math.random() * 1500) + 100,
  cost: Number((Math.random() * 0.005).toFixed(5)),
  status: 'success'
}));

export const MOCK_DAILY_STATS: DailyUsage[] = Array.from({ length: 7 }).map((_, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  calls: Math.floor(Math.random() * 500) + 100,
  cost: Number((Math.random() * 2).toFixed(2))
}));

export const FEATURES = [
  {
    icon: <Lock className="w-6 h-6 text-[#9BF2D5]" />,
    title: "No API Keys",
    desc: "Authenticate via wallet signature. No more leaked secrets."
  },
  {
    icon: <Zap className="w-6 h-6 text-[#9BF2D5]" />,
    title: "Pay per Request",
    desc: "Micro-transactions on Arbitrum. Pay only for what you compute."
  },
  {
    icon: <Code className="w-6 h-6 text-[#9BF2D5]" />,
    title: "Unified Interface",
    desc: "One SDK for OpenAI, Anthropic, Google, and Meta models."
  }
];
