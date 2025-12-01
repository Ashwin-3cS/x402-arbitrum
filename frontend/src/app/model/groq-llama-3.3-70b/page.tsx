"use client";

import React, { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import GlassCard from '../../../components/GlassCard';
import { X402Client, ChatMessage } from '../../../lib/x402-client-wagmi';

const GroqModelPage: React.FC = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [curlCommand, setCurlCommand] = useState<string>('');
  const [headers, setHeaders] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading || !isConnected) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setLoading(true);
    setResponse('');
    setCurlCommand('');
    setHeaders(null);
    setTxHash(null);

    const curlCmd = `curl -X POST http://localhost:3001/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "${input}"}]
  }'`;
    setCurlCommand(curlCmd);

    try {
      const client = new X402Client('http://localhost:3001/chat');
      const result = await client.sendChat([userMessage]);

      setResponse(result.response.content);
      setHeaders(result.logs);

      if (result.response.paymentResponse?.transactionHash) {
        setTxHash(result.response.paymentResponse.transactionHash);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button
        onClick={() => router.push('/marketplace')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Llama 3.3 70B</h1>
          <p className="text-gray-400">Groq x402 Integration</p>
        </div>

        {!isConnected ? (
          <div className="flex gap-2">
            {connectors
              .filter((connector) => connector.name === 'MetaMask')
              .map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="px-4 py-2 bg-[#9BF2D5] text-black rounded-lg font-medium hover:bg-[#9BF2D5]/90 transition-colors"
                >
                  Connect {connector.name}
                </button>
              ))}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-gray-400">Connected</p>
              <p className="text-white font-mono">{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</p>
            </div>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {!isConnected && (
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Please connect your wallet to use this service. Make sure you're on Arbitrum Sepolia network.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm text-gray-400">Live Playground</span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a prompt to test this model..."
            disabled={loading || !isConnected}
            className="w-full h-32 px-4 py-3 bg-[#1A1A1A] border border-[#9BF2D5]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9BF2D5]/50 resize-none mb-4 disabled:opacity-50"
          />

          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-500">Uses credits from your connected wallet (Simulated)</span>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || !isConnected}
              className="px-6 py-2 bg-[#9BF2D5] text-black rounded-lg font-medium hover:bg-[#9BF2D5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Run
                </>
              )}
            </button>
          </div>

          {response && (
            <div className="mt-4 p-4 bg-[#1A1A1A] border border-[#9BF2D5]/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Response:</p>
              <p className="text-white whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-400">Integration</span>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <button className="px-3 py-1 text-xs bg-[#9BF2D5]/20 text-[#9BF2D5] rounded">Curl</button>
                <button className="px-3 py-1 text-xs text-gray-500">Node</button>
                <button className="px-3 py-1 text-xs text-gray-500">Python</button>
              </div>

              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#9BF2D5]/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-gray-500">BASH</span>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  {curlCommand || `curl -X POST http://localhost:3001/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [{"role": "user", "content": "..."}]
  }'`}
                </pre>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Endpoint</p>
              <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#9BF2D5]/20">
                <code className="text-xs text-[#9BF2D5]">http://localhost:3001/chat</code>
              </div>
              <p className="text-xs text-gray-500 mt-2">Supports JSON mode & Streaming</p>
            </div>
          </GlassCard>

          {txHash && (
            <GlassCard>
              <h3 className="text-sm font-bold text-white mb-3">Payment Successful</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Transaction Hash</p>
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#9BF2D5] hover:underline break-all font-mono"
                  >
                    {txHash}
                  </a>
                </div>
              </div>
            </GlassCard>
          )}

          {headers && (
            <GlassCard>
              <h3 className="text-sm font-bold text-white mb-3">Request Headers & Logs</h3>
              <div className="space-y-3 text-xs max-h-96 overflow-y-auto">
                {headers.challenge && (
                  <div>
                    <p className="text-gray-500 mb-1">402 Payment Required</p>
                    <pre className="bg-[#1A1A1A] p-2 rounded overflow-x-auto text-gray-400 text-[10px]">
                      {JSON.stringify(headers.challenge, null, 2)}
                    </pre>
                  </div>
                )}
                {headers.payment && (
                  <div>
                    <p className="text-gray-500 mb-1">X-Payment Header</p>
                    <pre className="bg-[#1A1A1A] p-2 rounded overflow-x-auto text-gray-400 text-[10px]">
                      {JSON.stringify(headers.payment.paymentProof, null, 2)}
                    </pre>
                  </div>
                )}
                {headers.finalResponse && (
                  <div>
                    <p className="text-gray-500 mb-1">Response Headers</p>
                    <pre className="bg-[#1A1A1A] p-2 rounded overflow-x-auto text-gray-400 text-[10px]">
                      {JSON.stringify(headers.finalResponse.headers, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroqModelPage;
