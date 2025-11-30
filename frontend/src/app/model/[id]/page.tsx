"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Terminal, Box, Loader2 } from 'lucide-react';
import GlassCard from '../../../components/GlassCard';
import CodeBlock from '../../../components/CodeBlock';
import { MOCK_MODELS } from '../../../../constant';
// import { generateCompletion } from '../services/geminiService';

const ModelDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const model = MOCK_MODELS.find(m => m.id === id) || MOCK_MODELS[0];
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');
  
  // Playground State
  const [prompt, setPrompt] = useState('');
  const [response] = useState('');
  const [isLoading] = useState(false);

//   const handleTestRun = async () => {
//     if (!prompt.trim()) return;
//     setIsLoading(true);
//     setResponse('');
//     try {
//       const result = await generateCompletion(model.id, prompt);
//       setResponse(result);
//     } catch (err) {
//       setResponse("Error occurred during generation.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const codeSnippets = {
    curl: `curl -X POST ${model.endpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-User-Wallet: 0x71C...9A21" \\
  -d '{
    "model": "${model.id}",
    "messages": [{"role": "user", "content": "Hello world"}]
  }'`,
    node: `import { NexusClient } from '@nexus-ai/sdk';

const client = new NexusClient({
  walletPrivateKey: process.env.WALLET_KEY
});

const response = await client.chat.completions.create({
  model: '${model.id}',
  messages: [{ role: 'user', content: 'Hello world' }]
});

console.log(response.choices[0].message.content);`,
    python: `from nexus_ai import NexusClient

client = NexusClient(
    wallet_private_key=os.getenv("WALLET_KEY")
)

response = client.chat.completions.create(
    model="${model.id}",
    messages=[{"role": "user", "content": "Hello world"}]
)

print(response.choices[0].message.content)`
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link href="/marketplace" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Playground */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-white">{model.name}</h1>
              <span className="px-3 py-1 rounded-full border border-[#9BF2D5]/30 bg-[#9BF2D5]/10 text-[#9BF2D5] text-xs font-bold uppercase tracking-wide">
                Instant Access
              </span>
            </div>
            <p className="text-lg text-gray-400">{model.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Price / 1k</span>
              <span className="text-xl font-bold text-white">${model.pricePer1kTokens}</span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Context</span>
              <span className="text-xl font-bold text-white">{model.contextWindow}</span>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Latency</span>
              <span className="text-xl font-bold text-green-400">{model.latencyMs}ms</span>
            </GlassCard>
             <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-gray-500 text-xs uppercase tracking-wider mb-1">Provider</span>
              <span className="text-xl font-bold text-white truncate w-full">{model.provider}</span>
            </GlassCard>
          </div>

          {/* Playground */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Play className="w-5 h-5 text-[#9BF2D5]" />
                <h2 className="text-xl font-bold text-white">Live Playground</h2>
             </div>
             <div className="rounded-2xl border border-[#9BF2D5]/20 bg-[#2A2A2A] overflow-hidden">
                <textarea
                  className="w-full h-32 bg-[#2A2A2A] p-4 text-gray-300 focus:outline-none resize-none placeholder-gray-600"
                  placeholder="Enter a prompt to test this model..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="px-4 py-3 bg-[#0A0A0C]/50 border-t border-[#9BF2D5]/10 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Uses credits from your connected wallet (Simulated)</span>
                  <button 
                    // onClick={handleTestRun}
                    disabled={isLoading || !prompt}
                    className="px-4 py-2 rounded-lg bg-[#9BF2D5] text-[#2A2A2A] font-medium text-sm hover:bg-[#9BF2D5]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Run
                  </button>
                </div>
                {response && (
                  <div className="p-4 bg-[#2A2A2A]/50 border-t border-[#9BF2D5]/10">
                    <p className="text-xs text-gray-400 mb-2 font-mono uppercase">Output</p>
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{response}</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Integration */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-400" /> Integration
            </h3>
            
            <div className="flex p-1 bg-[#2A2A2A]/50 rounded-lg mb-4">
              {(['curl', 'node', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-[#9BF2D5] text-[#2A2A2A] shadow-sm' 
                      : 'text-gray-400 hover:text-[#9BF2D5]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <CodeBlock 
              code={codeSnippets[activeTab]} 
              language={activeTab === 'curl' ? 'bash' : activeTab === 'node' ? 'typescript' : 'python'} 
            />
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#9BF2D5]/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="text-lg font-bold text-white mb-2">Endpoint</h3>
            <div className="bg-[#2A2A2A] border border-[#9BF2D5]/30 rounded-lg p-3 flex items-center justify-between group">
              <code className="text-[#9BF2D5] text-sm truncate mr-2">{model.endpoint}</code>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
               <Box className="w-4 h-4" /> 
               <span>Supports JSON mode & Streaming</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;
