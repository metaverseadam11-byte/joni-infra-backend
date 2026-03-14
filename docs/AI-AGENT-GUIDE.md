# 🤖 AI Agent Usage Guide

**Simple, clean API for domain and hosting operations. No CAPTCHA. No hassle.**

---

## Authentication

All API requests require a Bearer token:

```http
Authorization: Bearer YOUR_API_KEY
```

---

## Common Workflows

### 1. Search & Register a Domain

**Step 1: Search for available domains**

```bash
curl -X GET "http://localhost:3000/api/v1/domains/search?query=mysite&tlds=com,net" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:
```json
{
  "success": true,
  "results": [
    {
      "domain": "mysite.com",
      "available": false
    },
    {
      "domain": "mysite.net",
      "available": true,
      "pricing": {
        "registration": 12.99,
        "renewal": 14.99,
        "currency": "USD"
      }
    }
  ]
}
```

**Step 2: Create payment**

```bash
curl -X POST "http://localhost:3000/api/v1/payments/create" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12.99,
    "currency": "USD",
    "chain": "ethereum"
  }'
```

Response:
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc123",
    "address": "0x1234...",
    "amount": "12.99",
    "token": "USDC",
    "chain": "ethereum",
    "expiresAt": "2026-03-14T19:30:00Z",
    "status": "pending"
  }
}
```

**Step 3: Send crypto & verify payment**

Send the exact amount to the provided address, then verify:

```bash
curl -X POST "http://localhost:3000/api/v1/payments/verify" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_abc123",
    "txHash": "0xabcd..."
  }'
```

**Step 4: Register the domain**

```bash
curl -X POST "http://localhost:3000/api/v1/domains/register" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "mysite.net",
    "period": 1,
    "nameservers": ["ns1.example.com", "ns2.example.com"],
    "contacts": {
      "name": "John Doe",
      "email": "john@example.com",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipcode": "10001",
      "phoneCountryCode": "1",
      "phone": "5551234567"
    },
    "privacyProtection": true,
    "payment": {
      "method": "crypto",
      "paymentId": "pay_abc123",
      "txHash": "0xabcd..."
    }
  }'
```

Response:
```json
{
  "success": true,
  "orderId": "12345678",
  "domain": "mysite.net",
  "message": "Domain registered successfully"
}
```

---

### 2. Purchase Hosting

**Step 1: View available plans**

```bash
curl -X GET "http://localhost:3000/api/v1/hosting/plans?type=linux" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Step 2: Create payment for hosting**

```bash
curl -X POST "http://localhost:3000/api/v1/payments/create" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 49.99,
    "currency": "USD",
    "chain": "solana"
  }'
```

**Step 3: Order hosting**

```bash
curl -X POST "http://localhost:3000/api/v1/hosting/create" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "mysite.net",
    "plan": "linux-starter",
    "type": "linux",
    "period": 12,
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipcode": "10001",
      "phoneCountryCode": "1",
      "phone": "5551234567"
    },
    "payment": {
      "method": "crypto",
      "paymentId": "pay_xyz789",
      "txHash": "solana_tx_hash"
    }
  }'
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Additional error context (when available)"
}
```

Common HTTP status codes:
- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (missing API key)
- `402` - Payment required/failed
- `403` - Forbidden (invalid API key)
- `404` - Resource not found
- `500` - Server error

---

## Rate Limits

- 100 requests per 15 minutes per IP
- No CAPTCHA ever
- No bot detection

---

## Best Practices for AI Agents

1. **Always verify payment before registering**: Call `/payments/verify` before `/domains/register`

2. **Handle async operations**: Some operations may take a few seconds (domain registration, hosting setup)

3. **Store order IDs**: Keep track of `orderId` for future operations (renewal, modifications)

4. **Check domain availability first**: Always search before attempting to register

5. **Use test mode during development**: Set `testMode: true` in config to avoid real charges

6. **Implement retry logic**: Network issues happen; retry with exponential backoff

7. **Cache pricing data**: Domain pricing doesn't change frequently; cache for ~1 hour

---

## Example: Complete Domain Purchase Flow (Python)

```python
import requests
import time

API_BASE = "http://localhost:3000/api/v1"
API_KEY = "your-api-key-here"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def register_domain(domain_name, customer_data):
    # 1. Check availability
    response = requests.get(
        f"{API_BASE}/domains/search",
        params={"query": domain_name.split('.')[0], "tlds": domain_name.split('.')[1]},
        headers=HEADERS
    )
    
    result = response.json()
    if not result['results'][0]['available']:
        return {"success": False, "error": "Domain not available"}
    
    price = result['results'][0]['pricing']['registration']
    
    # 2. Create payment
    response = requests.post(
        f"{API_BASE}/payments/create",
        json={"amount": price, "chain": "ethereum"},
        headers=HEADERS
    )
    
    payment = response.json()['payment']
    
    # 3. Send crypto (use your wallet integration here)
    tx_hash = send_crypto(payment['address'], payment['amount'])
    
    # 4. Verify payment
    response = requests.post(
        f"{API_BASE}/payments/verify",
        json={"paymentId": payment['id'], "txHash": tx_hash},
        headers=HEADERS
    )
    
    if not response.json()['success']:
        return {"success": False, "error": "Payment verification failed"}
    
    # 5. Register domain
    response = requests.post(
        f"{API_BASE}/domains/register",
        json={
            "domain": domain_name,
            "period": 1,
            "nameservers": ["ns1.example.com", "ns2.example.com"],
            "contacts": customer_data,
            "payment": {
                "method": "crypto",
                "paymentId": payment['id'],
                "txHash": tx_hash
            }
        },
        headers=HEADERS
    )
    
    return response.json()

# Usage
customer = {
    "name": "AI Agent",
    "email": "agent@example.com",
    "address1": "123 AI Street",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "zipcode": "94102",
    "phoneCountryCode": "1",
    "phone": "5551234567"
}

result = register_domain("my-ai-site.com", customer)
print(result)
```

---

## Support

- API issues: Check server logs
- ResellerClub API errors: See https://manage.resellerclub.com/kb/answer/744
- Payment issues: Verify transaction on blockchain explorer

---

**Built for AI agents. No humans required. 🤖**
