# Frontend Integration Guide

This guide explains how to integrate the x402 AI Service into a frontend application (e.g., React, Next.js, Vue).

## The Flow
1.  **Request**: Frontend calls `/chat`.
2.  **Challenge**: Backend returns `402 Payment Required` with payment details (amount, recipient).
3.  **Sign**: Frontend uses user's wallet (e.g., MetaMask, Rabby) to sign the payment (EIP-712/EIP-3009).
4.  **Retry**: Frontend calls `/chat` again with the `X-Payment` header containing the signature.
5.  **Success**: Backend verifies payment, settles it, and returns the AI response.

## Integration Steps

### 1. Install Dependencies
You will need `viem` for signing and `x402-client` (or similar logic) to handle the flow.

```bash
npm install viem
```

### 2. Client-Side Code (React Example)

```typescript
import { createWalletClient, custom } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

// 1. Setup Wallet Client
const client = createWalletClient({
  chain: arbitrumSepolia,
  transport: custom(window.ethereum)
});

async function sendChat(message: string) {
  const [account] = await client.requestAddresses();

  // 2. Initial Request (Will fail with 402)
  let response = await fetch('http://localhost:3001/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
  });

  // 3. Handle 402 Payment Required
  if (response.status === 402) {
    const challenge = await response.json();
    const { maxAmountRequired, payTo, asset } = challenge.accepts[0];

    // 4. Create EIP-3009 Authorization
    // (Simplified for brevity - typically you construct the typed data here)
    const nonce = generateNonce(); // Random 32-byte hex
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const domain = {
      name: 'TestUSDC',
      version: '1',
      chainId: 421614,
      verifyingContract: asset,
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
      to: payTo,
      value: BigInt(maxAmountRequired),
      validAfter: 0n,
      validBefore: BigInt(deadline),
      nonce: nonce,
    };

    // 5. User Signs the Payment
    const signature = await client.signTypedData({
      account,
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message,
    });
    
    // Split signature into v, r, s
    const { v, r, s } = parseSignature(signature);

    // 6. Construct X-Payment Header
    const paymentProof = {
      version: '1',
      scheme: 'exact',
      network: 'arbitrum-sepolia',
      payload: {
        ...message,
        v, r, s,
        value: message.value.toString(),
        validBefore: message.validBefore.toString()
      }
    };
    
    const xPaymentHeader = btoa(JSON.stringify(paymentProof));

    // 7. Retry Request with Payment
    response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Payment': xPaymentHeader 
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
    });
  }

  // 8. Display Result
  const data = await response.json();
  console.log("AI Response:", data);
  
  // 9. Check Response Headers for Transaction Hash (like in the screenshot)
  const paymentResHeader = response.headers.get('X-Payment-Response');
  if (paymentResHeader) {
    const paymentDetails = JSON.parse(atob(paymentResHeader));
    console.log("Tx Hash:", paymentDetails.transactionHash);
  }
}
```

## Debugging with cURL (Visualizing the Headers)

To see the "Headers things" and response details like in your screenshot, you can simulate the final step using `curl` if you have a valid `X-Payment` string.

### The Request
```bash
curl -v -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -H "X-Payment: eyJ2ZXJzaW9uIjoiMSIsInNjaGVtZSI6ImV4YWN0IiwibmV0d29yayI6ImFyYml0cnVtLXNlcG9saWEiLCJwYXlsb2FkIjp7... (Your Base64 Payment Proof)" \
  -d '{"messages": [{"role": "user", "content": "Hello AI"}]}'
```

### The Output (Simulated)
This matches the data shown in your screenshot's "API Response" and "Response Headers" sections.

```http
> POST /chat HTTP/1.1
> Host: localhost:3001
> Content-Type: application/json
> X-Payment: eyJ2ZXJzaW9uIjoiMSIsInNjaGVtZSI6ImV4YWN0IiwibmV0d29yayI6ImFyYml0cnVtLXNlcG9saWEiLCJwYXlsb2FkIjp7...
>
< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Date: Sun, 01 Dec 2025 06:30:00 GMT
< X-Payment-Response: eyJzdGF0dXMiOiJjb21wbGV0ZWQiLCJ0cmFuc2FjdGlvbkhhc2giOiIweDdkMmRlMDAxZDQxNTc4YTVmNDY5NTRhOGYwMGQ4ZDMyNTM2YmVkMDIxMmIyNDMwYWE1YmQ3ZmQwZWFjZjIwNDUiLCJibG9ja051bWJlciI6MjIwNjI0NDAyLCJnYXNVc2VkIjoiNTcyMDYifQ==
< Connection: keep-alive
<
{
  "role": "assistant",
  "content": "Hello! How can I help you today?",
  "model": "llama-3.3-70b-versatile"
}
```

### Decoding the `X-Payment-Response` Header
The `X-Payment-Response` header contains the transaction details shown in the screenshot's "Payment Successful" card.

**Encoded:**
`eyJzdGF0dXMiOiJjb21wbGV0ZWQiLCJ0cmFuc2FjdGlvbkhhc2giOiIweDdkMmRlMDAxZDQxNTc4YTVmNDY5NTRhOGYwMGQ4ZDMyNTM2YmVkMDIxMmIyNDMwYWE1YmQ3ZmQwZWFjZjIwNDUiLCJibG9ja051bWJlciI6MjIwNjI0NDAyLCJnYXNVc2VkIjoiNTcyMDYifQ==`

**Decoded (JSON):**
```json
{
  "status": "completed",
  "transactionHash": "0x7d2de001d41578a5f46954a8f00d8d32536bed0212b2430aa5bd7fd0eacf2045",
  "blockNumber": 220624402,
  "gasUsed": "57206"
}
```
