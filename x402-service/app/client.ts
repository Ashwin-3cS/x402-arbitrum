import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { X402PaymentRequirement } from './types';
import { ENV, ARBITRUM_SEPOLIA_CHAIN_ID } from './config';
import { createX402PaymentPayload, encodePaymentHeader, generateNonce } from './eip3009';

export class X402AIClient {
  private fetchWithPayment: typeof fetch;
  private account: ReturnType<typeof privateKeyToAccount>;

  constructor() {
    // Create wallet account for payments
    this.account = privateKeyToAccount(ENV.PRIVATE_KEY);

    // Wrap fetch with x402 payment capabilities
    this.fetchWithPayment = wrapFetchWithPayment(fetch, this.account);
  }

  /**
   * Get a chat completion from the x402-compliant AI service
   * This will automatically handle the 402 Payment Required response and make the payment
   */
  async getChatCompletion(messages: { role: string; content: string }[]): Promise<any> {
    try {
      console.log('Requesting chat completion from x402 AI service...');

      // First, try without payment to get the 402 response
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (response.status === 402) {
        const paymentRequired = await response.json() as {
          x402Version: number;
          accepts: X402PaymentRequirement[];
          error?: string;
        };

        console.log('Payment required for AI response');

        if (!paymentRequired.accepts || paymentRequired.accepts.length === 0) {
          throw new Error('No payment requirements provided');
        }

        const requirement = paymentRequired.accepts[0];
        console.log(`Amount: ${requirement.maxAmountRequired} (${parseFloat(requirement.maxAmountRequired) / 1_000_000} USDC)`);
        console.log(`Recipient: ${requirement.payTo}`);

        // Create EIP-3009 payment authorization
        console.log('Creating EIP-3009 payment authorization...');

        const now = Math.floor(Date.now() / 1000);
        const authorization = {
          from: this.account.address,
          to: requirement.payTo as `0x${string}`,
          value: requirement.maxAmountRequired,
          validAfter: now - 60, // Valid from 1 minute ago
          validBefore: now + requirement.maxTimeoutSeconds,
          nonce: generateNonce(),
        };

        // Sign the authorization
        const paymentPayload = await createX402PaymentPayload(
          authorization,
          requirement.asset as `0x${string}`,
          requirement.extra?.name || 'TestUSDC',
          requirement.extra?.version || '1',
          ARBITRUM_SEPOLIA_CHAIN_ID,
          ENV.PRIVATE_KEY
        );

        // Encode as base64 for X-PAYMENT header
        const paymentHeader = encodePaymentHeader(paymentPayload);
        console.log('Payment authorization created and signed');

        // Make the request again with the real payment header
        const paidResponse = await fetch('http://localhost:3001/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Payment': paymentHeader,
          },
          body: JSON.stringify({ messages }),
        });

        if (!paidResponse.ok) {
          const errorData = await paidResponse.json() as { error?: string };
          throw new Error(`Chat request failed: ${errorData.error || paidResponse.statusText}`);
        }

        // Log payment response details (transaction hash)
        const paymentResponseHeader = paidResponse.headers.get('X-Payment-Response');
        if (paymentResponseHeader) {
          try {
            const paymentResponse = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString());
            console.log('\nPayment Settlement Details:');
            console.log(`Status: ${paymentResponse.status}`);
            if (paymentResponse.transactionHash) {
              console.log(`Transaction Hash: ${paymentResponse.transactionHash}`);
              console.log(`Explorer: https://sepolia.arbiscan.io/tx/${paymentResponse.transactionHash}`);
            }
          } catch (e) {
            console.warn('Failed to decode payment response header');
          }
        }

        const aiResponse = await paidResponse.json();
        console.log('AI response received successfully with verified payment');
        return aiResponse;
      } else if (response.ok) {
        // Request was successful without payment (unlikely for this demo)
        const aiResponse = await response.json();
        console.log('AI response received successfully and no payment required');
        return aiResponse;
      } else {
        const errorData = await response.json() as { error?: string };
        throw new Error(`Chat request failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to get chat completion:', error);
      throw error;
    }
  }

  getAccount() {
    return this.account;
  }
}
