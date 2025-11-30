import Fastify from 'fastify';
import cors from '@fastify/cors';
import { loadContractAddresses, ENV, ARBITRUM_SEPOLIA_CHAIN_ID } from '../../app/config';
import { decodePaymentHeader, verifyTransferAuthorization } from '../../app/eip3009';
import { SettlementService } from '../../app/settlement';

const fastify = Fastify({ logger: true });

fastify.register(cors as any, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment'],
  exposedHeaders: ['X-Payment-Response'],
});

// Initialize settlement service and load addresses
const addresses = loadContractAddresses();
// Use the quote service private key for settlement/signing for now
const settlementService = ENV.ENABLE_SETTLEMENT ? new SettlementService(ENV.QUOTE_SERVICE_PRIVATE_KEY) : null;
// We'll use the settlement service address (derived from private key) as the payee
const payeeAddress = settlementService ? settlementService.getAddress() : '0xbb7462adA69561Ff596322A2f9595c28E47FD6aa'; // Fallback to hardcoded if settlement disabled

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'x402-ai-service' };
});

// x402 chat endpoint
fastify.post('/chat', async (request, reply) => {
  try {
    // Check for X-Payment header (x402 payment proof)
    const paymentHeader = request.headers['x-payment'] as string;

    if (!paymentHeader) {
      // Return HTTP 402 Payment Required with x402-compliant payment details
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Payment Required',
        accepts: [
          {
            scheme: 'exact',
            network: 'arbitrum-sepolia',
            maxAmountRequired: '1000', // 0.001 USDC
            resource: '/chat',
            description: 'Payment for AI chat response',
            mimeType: 'application/json',
            outputSchema: null,
            payTo: payeeAddress,
            maxTimeoutSeconds: 300,
            asset: addresses.usdc, // Token contract address as string
            extra: {
              name: 'TestUSDC',
              version: '1',
            },
          }
        ],
        facilitator: {
          url: 'http://localhost:3002',
        }
      };
    }

    fastify.log.info('Processing paid chat request with payment proof...');

    // Decode and verify payment
    const paymentPayload = decodePaymentHeader(paymentHeader);
    if (!paymentPayload) {
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Invalid payment header format',
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    // Verify payment scheme and network
    if (paymentPayload.scheme !== 'exact' || paymentPayload.network !== 'arbitrum-sepolia') {
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Unsupported payment scheme or network',
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    // Verify payment amount
    const paymentAmount = BigInt(paymentPayload.payload.value);
    const requiredAmount = BigInt('1000');
    if (paymentAmount < requiredAmount) {
      reply.status(402);
      return {
        x402Version: 1,
        error: `Insufficient payment amount. Required: ${requiredAmount}, provided: ${paymentAmount}`,
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    // Verify payment recipient
    if (paymentPayload.payload.to.toLowerCase() !== payeeAddress.toLowerCase()) {
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Payment recipient mismatch',
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    // Verify EIP-3009 signature
    const authorization = {
      from: paymentPayload.payload.from,
      to: paymentPayload.payload.to,
      value: paymentPayload.payload.value,
      validAfter: paymentPayload.payload.validAfter,
      validBefore: paymentPayload.payload.validBefore,
      nonce: paymentPayload.payload.nonce,
    };

    const paymentSignature = {
      v: paymentPayload.payload.v,
      r: paymentPayload.payload.r,
      s: paymentPayload.payload.s,
    };

    const recoveredSigner = await verifyTransferAuthorization(
      authorization,
      paymentSignature,
      addresses.usdc,
      'TestUSDC',
      '1',
      ARBITRUM_SEPOLIA_CHAIN_ID
    );

    fastify.log.info({
      recoveredSigner,
      expectedSigner: paymentPayload.payload.from,
      match: recoveredSigner?.toLowerCase() === paymentPayload.payload.from.toLowerCase(),
    }, 'Signature verification result');

    if (!recoveredSigner || recoveredSigner.toLowerCase() !== paymentPayload.payload.from.toLowerCase()) {
      fastify.log.error({
        recoveredSigner,
        expectedSigner: paymentPayload.payload.from,
      }, 'Signature verification failed');
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Invalid payment signature',
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    // Check time validity
    const now = Math.floor(Date.now() / 1000);
    if (now < paymentPayload.payload.validAfter || now > paymentPayload.payload.validBefore) {
      reply.status(402);
      return {
        x402Version: 1,
        error: 'Payment authorization expired or not yet valid',
        accepts: [{
          scheme: 'exact',
          network: 'arbitrum-sepolia',
          maxAmountRequired: '1000',
          resource: '/chat',
          description: 'Payment for AI chat response',
          mimeType: 'application/json',
          outputSchema: null,
          payTo: payeeAddress,
          maxTimeoutSeconds: 300,
          asset: addresses.usdc,
          extra: { name: 'TestUSDC', version: '1' },
        }],
      };
    }

    fastify.log.info({
      payer: paymentPayload.payload.from,
      amount: paymentPayload.payload.value,
      nonce: paymentPayload.payload.nonce,
    }, 'Payment verified successfully');

    // Execute settlement if enabled
    let settlementResult = null;
    if (settlementService && ENV.ENABLE_SETTLEMENT) {
      fastify.log.info('Executing on-chain settlement...');
      settlementResult = await settlementService.settlePayment(
        addresses.usdc,
        paymentPayload
      );

      if (!settlementResult.success) {
        fastify.log.error({ error: settlementResult.error }, 'Settlement failed');
        reply.status(402);
        return {
          x402Version: 1,
          error: `Settlement failed: ${settlementResult.error}`,
          accepts: [{
            scheme: 'exact',
            network: 'arbitrum-sepolia',
            maxAmountRequired: '1000',
            resource: '/chat',
            description: 'Payment for AI chat response',
            mimeType: 'application/json',
            outputSchema: null,
            payTo: payeeAddress,
            maxTimeoutSeconds: 300,
            asset: addresses.usdc,
            extra: { name: 'TestUSDC', version: '1' },
          }],
        };
      }

      fastify.log.info({
        transactionHash: settlementResult.transactionHash,
        blockNumber: settlementResult.blockNumber?.toString(),
        gasUsed: settlementResult.gasUsed?.toString(),
      }, 'Settlement executed successfully');
    }

    // Mock AI Response
    const body = request.body as any;
    const messages = body.messages || [];
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : 'Hello';

    const aiResponse = {
      role: 'assistant',
      content: `[PAID RESPONSE] I received your message: "${lastMessage}". This is a mock AI response served after successful x402 payment verification.`,
      model: 'mock-gpt-4',
    };

    // Add X-Payment-Response header to indicate successful payment processing
    const paymentResponse = {
      status: settlementResult?.success ? 'completed' : 'verified',
      transactionHash: settlementResult?.transactionHash || null,
      blockNumber: settlementResult?.blockNumber ? Number(settlementResult.blockNumber) : null,
      gasUsed: settlementResult?.gasUsed ? settlementResult.gasUsed.toString() : null,
      amount: paymentPayload.payload.value,
      token: addresses.usdc,
      settled: !!settlementResult?.success,
    };

    reply.header('X-Payment-Response', Buffer.from(JSON.stringify(paymentResponse)).toString('base64'));

    return aiResponse;

  } catch (error) {
    fastify.log.error(error, 'Chat request failed');

    if (error instanceof Error) {
      reply.status(400).send({ error: error.message });
    } else {
      reply.status(500).send({ error: 'Internal server error' });
    }
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('x402-compliant AI service running on http://localhost:3001');
    console.log('Accepts payments via x402 protocol');
    console.log('Payee address:', payeeAddress);
    console.log('Payment: 0.001 USDC per chat request');
    console.log('Settlement:', ENV.ENABLE_SETTLEMENT ? 'ENABLED (on-chain)' : 'DISABLED (verification only)');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
