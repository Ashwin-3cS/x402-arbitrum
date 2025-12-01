# x402 AI Service - Complete Project Documentation

## Project Overview

**x402-arbi** is a decentralized AI service marketplace built on Arbitrum Sepolia that implements the **x402 Payment Protocol** for pay-per-use AI inference. Users pay with USDC on a per-token basis using gasless EIP-3009 signatures, with payments settled on-chain.

## Architecture

### Components

1. **AI Service** (`x402-service/services/ai-service/`)
   - Fastify HTTP server
   - Implements x402 protocol (HTTP 402 Payment Required)
   - Integrates with Groq API (Llama 3.3 70B)
   - Token-based pricing: 1 micro-USDC per token

2. **Facilitator Service** (`x402-service/services/facilitator/`)
   - Handles payment verification
   - Settles EIP-3009 authorizations on-chain
   - Manages USDC transfers

3. **Frontend** (`frontend/`)
   - Next.js 16 with Turbopack
   - Model marketplace UI
   - Live playground for testing models
   - Integration panel with cURL examples

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Blockchain**: Arbitrum Sepolia
- **Libraries**: 
  - `viem` - Ethereum interactions
  - `@ai-sdk/groq` - Groq AI integration
  - `ai` - Vercel AI SDK

### Frontend
- **Framework**: Next.js 16
- **Styling**: Vanilla CSS
- **Blockchain**: `viem` for wallet integration
- **UI**: Custom glass-morphism components

### Smart Contracts
- **USDC Token**: EIP-3009 compliant (transferWithAuthorization)
- **Network**: Arbitrum Sepolia (Chain ID: 421614)

## Payment Flow (x402 Protocol)

### Step-by-Step Process

1. **Initial Request**
   ```bash
   POST /chat
   Content-Type: application/json
   
   {
     "messages": [{"role": "user", "content": "Hello"}]
   }
   ```

2. **402 Payment Required**
   ```json
   {
     "x402Version": 1,
     "error": "Payment Required",
     "accepts": [{
       "scheme": "exact",
       "network": "arbitrum-sepolia",
       "maxAmountRequired": "502",
       "payTo": "0xbb7462adA69561Ff596322A2f9595c28E47FD6aa",
       "asset": "0x...",
       "description": "Payment for AI chat (2 input + 500 max output tokens)"
     }]
   }
   ```

3. **User Signs EIP-3009 Authorization**
   - User's wallet signs typed data
   - No gas required from user
   - Authorization includes: from, to, value, nonce, deadline

4. **Retry with Payment**
   ```bash
   POST /chat
   Content-Type: application/json
   X-Payment: <base64-encoded-payment-proof>
   
   {
     "messages": [{"role": "user", "content": "Hello"}]
   }
   ```

5. **Service Verifies & Settles**
   - Verifies EIP-3009 signature
   - Calls `receiveWithAuthorization()` on USDC contract
   - Settles payment on-chain

6. **AI Response**
   ```json
   {
     "role": "assistant",
     "content": "Hello! How can I help you?",
     "model": "llama-3.3-70b-versatile"
   }
   ```
   
   **Response Headers:**
   ```
   X-Payment-Response: <base64-encoded-settlement-details>
   ```

## Pricing Model

### Token-Based Pricing

**Formula:**
```
Total Cost = (Estimated Input Tokens + Output Buffer) * Price Per Token
```

**Constants:**
- Price Per Token: `1 micro-USDC` (0.000001 USDC)
- Output Buffer: `500 tokens`
- Token Estimation: `Word Count * 1.3`

**Examples:**
- "Hi" (1 word → 2 tokens): `(2 + 500) * 1 = 502 micro-USDC`
- "Write a poem..." (14 words → 19 tokens): `(19 + 500) * 1 = 519 micro-USDC`

### Sustainability Analysis

**Current Demo Model:**
- Revenue: ~$0.0005 per chat
- Gas Cost: ~$0.003 per transaction
- **Verdict**: Not sustainable for individual transactions

**Production Solutions:**
1. **Credit Model** (Recommended)
   - User deposits $5.00 once
   - Service deducts per-chat internally
   - Zero gas per chat
   - Margin: ~99%

2. **Batch Settlement**
   - Aggregate 10-20 chats
   - Single on-chain settlement
   - Reduces gas overhead

3. **Layer 3 / AppChain**
   - Deploy on ultra-low-cost L3
   - Gas: $0.000001 per tx
   - Makes individual settlements viable

## Project Structure

```
x402-arbi/
├── x402-service/
│   ├── services/
│   │   ├── ai-service/
│   │   │   ├── server.ts          # Main AI service (Groq integration)
│   │   │   └── facilitator.ts     # x402 facilitator logic
│   │   └── facilitator/
│   │       └── server.ts           # Payment settlement service
│   ├── app/
│   │   ├── client.ts               # x402 client implementation
│   │   ├── cli.ts                  # CLI for testing
│   │   ├── config.ts               # Environment config
│   │   ├── eip3009.ts              # EIP-3009 helpers
│   │   └── settlement.ts           # On-chain settlement logic
│   ├── .env                        # Environment variables
│   ├── PRICING.md                  # Pricing model details
│   ├── SUSTAINABILITY.md           # Economic analysis
│   └── FRONTEND_INTEGRATION.md     # Frontend integration guide
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── marketplace/
│   │   │   │   └── page.tsx        # Model marketplace
│   │   │   └── model/
│   │   │       └── groq-llama-3.3-70b/
│   │   │           └── page.tsx    # Model detail page
│   │   ├── components/
│   │   │   └── GlassCard.tsx       # Reusable glass card component
│   │   └── lib/
│   │       └── x402-client.ts      # Frontend x402 client
│   ├── constant.tsx                # Model definitions
│   └── types.ts                    # TypeScript types
└── contracts/                      # Smart contracts (USDC, etc.)
```

## Environment Variables

### Backend (.env)
```bash
QUOTE_SERVICE_PRIVATE_KEY=0x...    # Service wallet private key
USDC_ADDRESS=0x...                  # USDC contract address
ENABLE_SETTLEMENT=true              # Enable on-chain settlement
GROQ_API_KEY=gsk_...               # Groq API key
```

### Frontend
No environment variables required (uses localhost endpoints for dev).

## Running the Project

### Prerequisites
- Node.js 18+
- pnpm (backend)
- npm (frontend)
- MetaMask or compatible wallet
- USDC on Arbitrum Sepolia

### Backend Services

```bash
cd x402-service

# Terminal 1: Facilitator
pnpm dev:facilitator

# Terminal 2: AI Service
pnpm dev:service
```

**Endpoints:**
- AI Service: `http://localhost:3001`
- Facilitator: `http://localhost:3002`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**URL:** `http://localhost:3000`

### Testing via CLI

```bash
cd x402-service
pnpm pay chat --message "Hello AI"
```

**Expected Output:**
```
Payment required for AI response
Amount: 502 (0.000502 USDC)
Creating EIP-3009 payment authorization...
Payment Settlement Details:
Status: completed
Transaction Hash: 0x...
AI Response:
----------------------------------------
Hello! How can I help you today?
----------------------------------------
```

## Frontend Usage

1. **Navigate to Marketplace**
   - Go to `http://localhost:3000/marketplace`
   - See all available models

2. **Select Groq Model**
   - Click "Llama 3.3 70B" card
   - Opens model detail page

3. **Test in Live Playground**
   - Type message in left panel
   - Click "Run"
   - Wallet prompts for signature
   - View response and logs

4. **Integration Panel (Right)**
   - See cURL command
   - View request/response headers
   - Check transaction hash
   - Inspect payment logs

## Key Features

### ✅ Implemented
- [x] x402 payment protocol
- [x] EIP-3009 gasless signatures
- [x] Token-based dynamic pricing
- [x] On-chain settlement (Arbitrum Sepolia)
- [x] Groq AI integration (Llama 3.3 70B)
- [x] Frontend marketplace
- [x] Live playground UI
- [x] Payment flow visualization
- [x] Transaction hash display

### 🔄 Future Enhancements
- [ ] Credit/deposit system
- [ ] Batch settlement
- [ ] Multi-model support (GPT-4, Claude, etc.)
- [ ] Streaming responses
- [ ] Usage analytics dashboard
- [ ] Refund mechanism for unused tokens
- [ ] L3 deployment for lower gas costs

## Security Considerations

1. **EIP-3009 Signatures**
   - Nonce prevents replay attacks
   - Deadline prevents stale authorizations
   - User never exposes private key

2. **Payment Verification**
   - Service verifies signature on-chain
   - Checks amount, recipient, asset
   - Validates time bounds

3. **No API Keys**
   - Users authenticate via wallet
   - No leaked credentials
   - Self-sovereign identity

## Troubleshooting

### Common Issues

**1. "Cannot find module 'viem'"**
```bash
cd frontend
npm install viem
```

**2. "Port 3001 already in use"**
```bash
fuser -k 3001/tcp
```

**3. "Payment verification failed"**
- Check USDC balance
- Verify wallet is connected
- Ensure correct network (Arbitrum Sepolia)

**4. "Settlement failed"**
- Check `ENABLE_SETTLEMENT=true` in `.env`
- Verify service has USDC approval
- Check gas balance of service wallet

## Transaction Examples

### Successful Payment
- **Input**: "Hi" (2 tokens)
- **Cost**: 502 micro-USDC ($0.000502)
- **Tx**: [0x69c411f...](https://sepolia.arbiscan.io/tx/0x69c411f5071fc717a6172d8b375f10f76fb80e0288c34e85c71f20c475f84e2e)

### Longer Prompt
- **Input**: "Write a poem..." (19 tokens)
- **Cost**: 519 micro-USDC ($0.000519)
- **Tx**: [0xef6046c...](https://sepolia.arbiscan.io/tx/0xef6046ce096553c5f0f2b8fd9abf627ad7088640b72a08ec0791c56607a0f88e)

## Contributing

This is a proof-of-concept demonstrating:
- x402 payment protocol
- EIP-3009 gasless payments
- Token-based AI pricing
- Decentralized AI marketplace

For production use, implement the credit model or L3 deployment to achieve economic sustainability.

## License

MIT

## Contact

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ using x402, Arbitrum, and Groq**
