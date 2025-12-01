import { createWalletClient, custom, parseSignature } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PaymentResponse {
  status: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}

export interface ChatResponse {
  role: string;
  content: string;
  model: string;
  paymentResponse?: PaymentResponse;
}

export class X402Client {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async sendChat(messages: ChatMessage[]): Promise<{
    response: ChatResponse;
    logs: {
      request: any;
      challenge: any;
      payment: any;
      finalResponse: any;
    };
  }> {
    const logs = {
      request: null as any,
      challenge: null as any,
      payment: null as any,
      finalResponse: null as any,
    };

    console.log('[x402] Step 1: Sending initial chat request...');
    logs.request = {
      method: 'POST',
      url: this.endpoint,
      headers: { 'Content-Type': 'application/json' },
      body: { messages },
    };

    let response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (response.status === 402) {
      console.log('[x402] Step 2: Received 402 Payment Required');
      const challenge = await response.json();
      logs.challenge = challenge;

      const paymentDetails = challenge.accepts[0];
      console.log('[x402] Payment Details:', {
        amount: paymentDetails.maxAmountRequired,
        recipient: paymentDetails.payTo,
        description: paymentDetails.description,
      });

      console.log('[x402] Step 3: Creating payment authorization...');
      const client = createWalletClient({
        chain: arbitrumSepolia,
        transport: custom((window as any).ethereum),
      });

      const [account] = await client.requestAddresses();

      const nonce = `0x${Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('')}`;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const domain = {
        name: paymentDetails.extra.name,
        version: paymentDetails.extra.version,
        chainId: 421614,
        verifyingContract: paymentDetails.asset as `0x${string}`,
      };

      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' },
        ],
      };

      const message = {
        from: account,
        to: paymentDetails.payTo as `0x${string}`,
        value: BigInt(paymentDetails.maxAmountRequired),
        validAfter: 0n,
        validBefore: BigInt(deadline),
        nonce: nonce as `0x${string}`,
      };

      console.log('[x402] Requesting signature from wallet...');
      const signature = await client.signTypedData({
        account,
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message,
      });

      const { v, r, s } = parseSignature(signature);

      const paymentProof = {
        version: '1',
        scheme: 'exact',
        network: 'arbitrum-sepolia',
        payload: {
          from: account,
          to: paymentDetails.payTo,
          value: paymentDetails.maxAmountRequired,
          validAfter: 0,
          validBefore: deadline,
          nonce: nonce,
          v: Number(v),
          r,
          s,
        },
      };

      const xPaymentHeader = btoa(JSON.stringify(paymentProof));
      logs.payment = { paymentProof, xPaymentHeader: xPaymentHeader.substring(0, 50) + '...' };

      console.log('[x402] Step 4: Retrying request with payment...');
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Payment': xPaymentHeader },
        body: JSON.stringify({ messages }),
      });
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const paymentResponseHeader = response.headers.get('X-Payment-Response');
    let paymentResponse: PaymentResponse | undefined;

    if (paymentResponseHeader) {
      try {
        paymentResponse = JSON.parse(atob(paymentResponseHeader));
        console.log('[x402] Payment settled:', paymentResponse);
      } catch (e) {
        console.warn('[x402] Failed to decode payment response header');
      }
    }

    logs.finalResponse = {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type'),
        'x-payment-response': paymentResponseHeader?.substring(0, 50) + '...',
      },
      body: data,
    };

    console.log('[x402] Chat completed successfully!');
    return { response: { ...data, paymentResponse }, logs };
  }
}
