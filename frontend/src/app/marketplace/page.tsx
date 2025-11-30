"use client";

import React, { useState } from 'react';
import { Search, Filter, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlassCard from '../../components/GlassCard';
import { MOCK_MODELS } from '../../../constant';

const MarketplacePage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = MOCK_MODELS.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-4">Model Marketplace</h1>
        <p className="text-gray-400">Browse and integrate decentralized AI endpoints.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search models (e.g. Llama, Gemini, Image)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#2A2A2A]/50 border border-[#9BF2D5]/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#9BF2D5]/50 focus:ring-1 focus:ring-[#9BF2D5]/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center px-6 py-3 rounded-xl border border-[#9BF2D5]/20 bg-[#2A2A2A]/50 text-[#9BF2D5] hover:text-white hover:bg-[#2A2A2A] transition-colors gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <GlassCard 
            key={model.id} 
            hoverEffect 
            onClick={() => router.push(`/model/${model.id}`)}
            className="flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] border border-[#9BF2D5]/30 flex items-center justify-center">
                  <Cpu className="text-[#9BF2D5] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{model.name}</h3>
                  <p className="text-xs text-gray-500">{model.provider}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${model.latencyMs < 200 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {model.latencyMs}ms
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-6 flex-grow">{model.description}</p>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {model.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-[#2A2A2A] text-gray-300 border border-[#9BF2D5]/20">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Price</span>
                  <span className="text-sm font-mono text-[#9BF2D5] font-semibold">${model.pricePer1kTokens} <span className="text-gray-600 text-xs">/ 1k</span></span>
                </div>
                <button className="text-sm font-medium text-white hover:text-[#9BF2D5] transition-colors">
                  View Details &rarr;
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
