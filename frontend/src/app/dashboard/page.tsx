"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import GlassCard from '../../components/GlassCard';
import { MOCK_USAGE_HISTORY, MOCK_DAILY_STATS } from '../../../constant';
import { Activity, CreditCard, Layers } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#9BF2D5]/10 text-[#9BF2D5]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Requests</p>
              <h3 className="text-2xl font-bold text-white">1,234</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#9BF2D5]/10 text-[#9BF2D5]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <h3 className="text-2xl font-bold text-white">$42.80 USDC</h3>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#9BF2D5]/10 text-[#9BF2D5]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Models</p>
              <h3 className="text-2xl font-bold text-white">4</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <GlassCard className="p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Daily Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOCK_DAILY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2A2A2A', borderColor: '#9BF2D5', color: '#fff' }}
                itemStyle={{ color: '#9BF2D5' }}
              />
              <Line type="monotone" dataKey="calls" stroke="#9BF2D5" strokeWidth={2} dot={{ r: 4, fill: '#9BF2D5' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Cost Analysis (USDC)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_DAILY_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#2A2A2A', borderColor: '#9BF2D5', color: '#fff' }}
                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
              />
              <Bar dataKey="cost" fill="#9BF2D5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent Activity Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Request ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3 text-right">Tokens</th>
                <th className="px-6 py-3 text-right">Cost (USDC)</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_USAGE_HISTORY.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{new Date(record.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{record.modelName}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-right">{record.tokens}</td>
                  <td className="px-6 py-4 text-sm text-[#9BF2D5] text-right font-mono">${record.cost}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardPage;
