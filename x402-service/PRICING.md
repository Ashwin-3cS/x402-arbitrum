# x402 AI Service Pricing Model

## Overview
The x402 AI Service uses a **Token-Based Pricing** model. Users pay for the computational resources (tokens) required to process their prompt and generate a response.

## Pricing Formula
Since x402 requires payment *before* generation, we use an **Estimation-Based Pre-Payment** model:

```
Total Cost = (Estimated Input Tokens + Output Buffer) * Price Per Token
```

### Constants
- **Price Per Token**: `1 micro-USDC` (0.000001 USDC)
- **Output Buffer**: `500 tokens` (Fixed buffer to cover potential response length)
- **Token Estimation**: `1 word ≈ 1.3 tokens`

## FAQ

### Is pricing based on prompt complexity?
**No.** The pricing is currently based purely on the **length** of the input prompt (number of tokens). A complex logic puzzle that is short in words will cost less than a long, simple text processing request.

### How does actual token consumption work?
1.  **Estimation**: When you send a request, the service estimates the input tokens and adds the 500-token buffer.
2.  **Payment**: You pay this estimated total *before* the AI processes your request.
3.  **Consumption**: The service then calls the Groq API.
    -   If the AI generates 50 tokens, you effectively paid for 500.
    -   In a production environment, unused tokens could be credited back or refunded, but in this demo, the payment is final.

### Example
- **Prompt**: "Hi" (1 word)
    -   Input Estimate: `ceil(1 * 1.3) = 2 tokens`
    -   Total: `2 + 500 = 502 tokens`
    -   **Cost**: `502 micro-USDC`

## Production & Multi-Model Strategy

In a real-world production environment, the simple estimation model has limitations. Here is how you would architect it for scale and flexibility:

### 1. Handling Different Models
Different models (e.g., Llama 3 70B vs 8B, or Mixtral) have vastly different costs.
-   **Implementation**: The client sends the desired `model` in the request body.
-   **Dynamic Pricing**: The service looks up the `price_per_token` for that specific model before calculating the 402 payment requirement.
    -   *Example*: Llama 8B might cost 0.1 micro-USDC/token, while 70B costs 1.0 micro-USDC/token.

### 2. Accurate Billing (Solving the Buffer Issue)
Paying for a 500-token buffer when you only use 50 is not ideal. In production, you would use one of these patterns:

#### A. Pre-Authorization (Recommended for x402)
Similar to a gas station hold or hotel deposit:
1.  **Authorize**: User signs an intent for a *maximum* amount (e.g., 1000 tokens worth).
2.  **Serve**: Service generates the response and tracks *actual* usage (e.g., 150 tokens).
3.  **Settle**: Service submits the transaction to claim *only* the 150 tokens used, releasing the rest (requires smart contract support for "transferWithAuthorization" where the amount can be adjusted downwards by the payee, or a refund flow).

#### B. Credit Balance Protocol
1.  **Deposit**: User makes one large x402 payment (e.g., 5 USDC) to "top up" their account.
2.  **Deduct**: Each request is authenticated via signature, and the service deducts the *exact* cost from the internal balance.
3.  **Low Gas**: This avoids an on-chain transaction for every single chat message.

#### C. Refund Flow
1.  **Pay Max**: User pays the full estimated buffer (as we do now).
2.  **Refund**: Service calculates actual usage and immediately sends a refund transaction for the difference.
    -   *Pros*: Stateless.
    -   *Cons*: Double gas costs (payment + refund). Viable only on very cheap L2s/L3s.

