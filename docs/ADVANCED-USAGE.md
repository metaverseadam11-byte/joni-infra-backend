# 🔧 Advanced Usage

**Power features for sophisticated AI agents.**

---

## Bulk Operations

### Register Multiple Domains at Once

```python
import asyncio
import aiohttp

async def register_domains_bulk(domains, customer_data):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for domain in domains:
            task = register_single_domain(session, domain, customer_data)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

async def register_single_domain(session, domain, customer_data):
    # Search, pay, register flow
    # (similar to previous example)
    pass

# Usage
domains = ["site1.com", "site2.net", "site3.org"]
results = asyncio.run(register_domains_bulk(domains, customer_data))
```

---

## Webhook Integration

### Set Up Notifications

You can extend the platform to send webhooks when:
- Domain registration completes
- Payment is confirmed
- Domain/hosting expires soon
- Order status changes

Add to `api/server.js`:

```javascript
import axios from 'axios';

async function sendWebhook(event, data) {
  const webhookUrl = config.webhooks?.url;
  
  if (!webhookUrl) return;
  
  try {
    await axios.post(webhookUrl, {
      event,
      data,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-Webhook-Signature': generateSignature(data)
      }
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
  }
}

// Call in routes:
await sendWebhook('domain.registered', { orderId, domain });
```

---

## Custom Pricing

### Add Markup Logic

Edit `api/routes/domains.js` to add your markup:

```javascript
// In search endpoint
if (available) {
  const priceResult = await req.app.locals.resellerclub.getDomainPricing(tld);
  if (priceResult.success) {
    const markup = 1.25; // 25% markup
    pricing = {
      registration: (priceResult.data.addnewdomain * markup).toFixed(2),
      renewal: (priceResult.data.renewdomain * markup).toFixed(2),
      currency: 'USD',
      wholesale: {
        registration: priceResult.data.addnewdomain,
        renewal: priceResult.data.renewdomain
      }
    };
  }
}
```

### Dynamic Pricing by TLD

```javascript
const markupRules = {
  'com': 1.20,  // 20% markup
  'net': 1.25,  // 25% markup
  'io': 1.30,   // 30% markup
  'default': 1.25
};

const markup = markupRules[tld] || markupRules['default'];
```

---

## Caching

### Cache Domain Pricing

Pricing doesn't change frequently, so cache it:

```javascript
import NodeCache from 'node-cache';

const priceCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function getCachedPricing(tld) {
  const cacheKey = `pricing:${tld}`;
  
  let pricing = priceCache.get(cacheKey);
  
  if (!pricing) {
    const result = await resellerclub.getDomainPricing(tld);
    if (result.success) {
      pricing = result.data;
      priceCache.set(cacheKey, pricing);
    }
  }
  
  return pricing;
}
```

---

## Multi-Chain Payment Fallback

### Accept Multiple Cryptocurrencies

Allow the customer to pay with any supported chain:

```javascript
router.post('/register', async (req, res) => {
  const { domain, contacts, payment } = req.body;
  
  // Payment can be an array of attempts
  const paymentAttempts = Array.isArray(payment) ? payment : [payment];
  
  let verified = false;
  for (const attempt of paymentAttempts) {
    const result = await crypto.verifyPayment(attempt.paymentId, attempt.txHash);
    if (result.success) {
      verified = true;
      break;
    }
  }
  
  if (!verified) {
    return res.status(402).json({
      success: false,
      error: 'No valid payment found'
    });
  }
  
  // Continue with registration...
});
```

---

## Auto-Renewal

### Schedule Domain Renewals

Add a cron job or scheduled task to check expiring domains:

```javascript
import cron from 'node-cron';

// Check daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Checking for expiring domains...');
  
  // Get all domains expiring in next 30 days
  const result = await resellerclub.searchDomains('');
  
  // Filter expiring domains
  // Create renewal reminders or auto-renew
});
```

---

## DNS Management

### Add DNS Records After Registration

Extend domain registration to automatically set up DNS:

```javascript
async function setupDNS(orderId, records) {
  for (const record of records) {
    await resellerclub._request('POST', '/dns/manage/add-record.json', {
      'domain-name': record.domain,
      'host': record.host,
      'type': record.type,
      'value': record.value,
      'ttl': record.ttl || 3600
    });
  }
}

// Usage after domain registration:
await setupDNS(orderId, [
  { domain: 'example.com', host: '@', type: 'A', value: '1.2.3.4' },
  { domain: 'example.com', host: 'www', type: 'CNAME', value: 'example.com' }
]);
```

---

## Error Recovery

### Retry Failed Operations

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryOperation(async () => {
  return await resellerclub.registerDomain(domainData);
});
```

---

## Database Integration

### Store Orders in Database

For production, you'll want to track all orders:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// After successful registration
await prisma.order.create({
  data: {
    orderId: result.data.orderid,
    domain,
    type: 'domain_registration',
    status: 'active',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    customerId,
    amount: pricing.registration,
    paymentTxHash: payment.txHash
  }
});
```

---

## Rate Limit Customization

### Per-API-Key Rate Limits

```javascript
const apiKeyLimits = {
  'key-1': { max: 1000, windowMs: 15 * 60 * 1000 },  // High limit
  'key-2': { max: 100, windowMs: 15 * 60 * 1000 },   // Standard
  'default': { max: 50, windowMs: 15 * 60 * 1000 }   // Low
};

app.use((req, res, next) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  const limits = apiKeyLimits[apiKey] || apiKeyLimits['default'];
  
  const limiter = rateLimit({
    windowMs: limits.windowMs,
    max: limits.max
  });
  
  limiter(req, res, next);
});
```

---

## Monitoring & Analytics

### Track API Usage

```javascript
const usage = new Map();

app.use((req, res, next) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  
  if (apiKey) {
    const current = usage.get(apiKey) || { requests: 0, lastSeen: null };
    current.requests++;
    current.lastSeen = new Date();
    usage.set(apiKey, current);
  }
  
  next();
});

// Endpoint to view usage
app.get('/api/v1/admin/usage', authMiddleware, (req, res) => {
  const stats = {};
  for (const [key, data] of usage.entries()) {
    stats[key] = data;
  }
  res.json({ success: true, usage: stats });
});
```

---

## Security Best Practices

### 1. API Key Rotation

Implement key expiration:

```javascript
const apiKeys = {
  'key-abc': { expires: '2026-12-31', active: true },
  'key-xyz': { expires: '2026-06-30', active: true }
};

function validateApiKey(key) {
  const keyData = apiKeys[key];
  if (!keyData || !keyData.active) return false;
  
  if (new Date(keyData.expires) < new Date()) {
    return false;
  }
  
  return true;
}
```

### 2. IP Whitelisting

```javascript
const ipWhitelist = ['1.2.3.4', '5.6.7.8'];

app.use((req, res, next) => {
  const clientIp = req.ip;
  
  if (!ipWhitelist.includes(clientIp)) {
    return res.status(403).json({
      success: false,
      error: 'IP not whitelisted'
    });
  }
  
  next();
});
```

### 3. Request Signing

Verify requests are authentic:

```javascript
import crypto from 'crypto';

function verifySignature(body, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return hash === signature;
}

app.use(express.json({
  verify: (req, res, buf) => {
    const signature = req.headers['x-signature'];
    if (signature && !verifySignature(buf, signature, SECRET)) {
      throw new Error('Invalid signature');
    }
  }
}));
```

---

## Testing

### Unit Tests (Jest)

```javascript
// __tests__/domains.test.js
import request from 'supertest';
import app from '../server.js';

describe('Domain Search', () => {
  it('should return available domains', async () => {
    const response = await request(app)
      .get('/api/v1/domains/search?query=test&tlds=com')
      .set('Authorization', 'Bearer test-key')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.results).toBeDefined();
  });
});
```

---

**Built for scale. Ready for production. 🐙**
