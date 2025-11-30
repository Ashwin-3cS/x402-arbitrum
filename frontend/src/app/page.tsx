"use client";

import React from 'react';
import { ArrowRight, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '../components/GlassCard';
import AnimatedGridBackground from '../components/AnimatedGridBackground';
import { FEATURES, MOCK_MODELS } from '../../constant';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedGridBackground />
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#9BF2D5]/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#9BF2D5]/10 blur-[120px]" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#9BF2D5]/30 bg-[#9BF2D5]/10 text-[#9BF2D5] text-sm mb-8 animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-[#9BF2D5] mr-2"></span>
          Integrating x402 payments
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          The <span className="text-[#9BF2D5]">Decentralized</span><br />
          API Marketplace
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Access top LLM endpoints instantly. Pay per token in stablecoins on Arbitrum. 
          No API keys to manage. No monthly subscriptions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/marketplace"
            className="px-8 py-4 rounded-full bg-[#9BF2D5] text-[#2A2A2A] font-bold text-lg hover:bg-[#9BF2D5]/90 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(155,242,213,0.3)]"
          >
            Explore Models <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#"
            className="px-8 py-4 rounded-full border border-[#9BF2D5]/30 bg-[#2A2A2A] text-[#9BF2D5] font-semibold text-lg hover:bg-[#2A2A2A]/80 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <PlayCircle className="w-5 h-5" /> Watch Demo
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <GlassCard key={idx} className="flex flex-col items-center text-center p-8">
              <div className="p-4 rounded-2xl bg-[#2A2A2A] mb-6 border border-[#9BF2D5]/30 w-fit">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Mini Market Preview */}
      <section className="py-20 border-t border-[#9BF2D5]/10 bg-[#0A0A0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Trending Models</h2>
              <p className="text-gray-400">Most used endpoints this week.</p>
            </div>
            <Link href="/marketplace" className="text-[#9BF2D5] hover:text-[#9BF2D5]/80 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_MODELS.slice(0, 3).map((model) => (
              <GlassCard key={model.id} hoverEffect className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{model.name}</h3>
                    <span className="px-2 py-1 rounded bg-[#2A2A2A] border border-[#9BF2D5]/30 text-xs text-[#9BF2D5] font-mono">
                      {model.latencyMs}ms
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{model.description}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm text-gray-300 font-mono">${model.pricePer1kTokens}/1k</span>
                  <div className="flex gap-2">
                    {model.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">{tag}</span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
