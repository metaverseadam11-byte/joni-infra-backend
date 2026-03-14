# 🏗️ Architecture Overview

**Clean, modular, AI-friendly design.**

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Agents                            │
│  (Python, Node.js, Go, TypeScript, cURL, etc.)             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            │ (No CAPTCHA, No bot detection)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   API Gateway (Express.js)                  │
│  ┌─────────────┬──────────────┬────────────┬──────────────┐│
│  │   Helmet    │  Rate Limit  │    CORS    │     Auth     ││
│  │  (Security) │  (Protection)│ (Cross-Orig│  (API Keys)  ││
│  └─────────────┴──────────────┴────────────┴──────────────┘│
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌──────────────┐  ┌───────────────┐
│ Domain Routes  │  │Hosting Routes│  │Payment Routes │
│                │  │              │  │               │
│ /domains/*     │  │ /hosting/*   │  │ /payments/*   │
└────────┬───────┘  └──────┬───────┘  └───────┬───────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────────┐ ┌─────────────┐ ┌────────────────┐
│ ResellerClub API │ │Crypto Payment│ │  Auth Service  │
│     Service      │ │   Service    │ │                │
└────────┬─────────┘ └──────┬──────┘ └────────────────┘
         │                  │
         │                  │
         ▼                  ▼
┌──────────────────┐ ┌─────────────────────────┐
│  ResellerClub    │ │  Blockchain Networks    │
│  HTTP API        │ │  (Ethereum, Solana, BTC)│
│                  │ │                         │
│ • Domains        │ │ • On-chain verification │
│ • Hosting        │ │ • Transaction tracking  │
│ • DNS            │ │ • Multi-chain support   │
│ • SSL            │ │                         │
└──────────────────┘ └─────────────────────────┘
```

---

## Request Flow: Domain Registration

```
1. AI Agent → POST /api/v1/domains/search
   └─> API Gateway → Auth Middleware → Domains Route
       └─> ResellerClub Service → ResellerClub API
           └─> Returns: Available domains + pricing

2. AI Agent → POST /api/v1/payments/create
   └─> API Gateway → Auth → Payments Route
       └─> Crypto Service → Generate payment address
           └─> Returns: Payment details (address, amount, expiry)

3. AI Agent → Sends crypto to payment address
   └─> Blockchain transaction submitted

4. AI Agent → POST /api/v1/payments/verify
   └─> API Gateway → Auth → Payments Route
       └─> Crypto Service → Verify on-chain
           └─> Returns: Payment confirmed ✅

5. AI Agent → POST /api/v1/domains/register
   └─> API Gateway → Auth → Domains Route
       └─> Check payment status
       └─> ResellerClub Service → Register domain
           └─> Returns: Order ID + success ✅
```

---

## Service Layer

### ResellerClub Service
**Location:** `api/services/resellerclub.js`

**Responsibilities:**
- HTTP API wrapper around ResellerClub endpoints
- Domain availability checking
- Domain registration & renewal
- Hosting plan management
- Contact & customer management
- Error handling & retry logic

**Key Methods:**
```javascript
checkAvailability(domains)      // Check if domains are available
registerDomain(domainData)      // Register a new domain
getDomainDetails(orderId)       // Get domain info
modifyNameservers(orderId, ns)  // Update DNS
getHostingPlans(type)           // List hosting packages
orderLinuxHosting(data)         // Create hosting account
```

---

### Crypto Payment Service
**Location:** `api/services/crypto.js`

**Responsibilities:**
- Generate payment requests
- Multi-chain support (Ethereum, Solana, Bitcoin)
- On-chain transaction verification
- Payment status tracking
- Expiry management

**Key Methods:**
```javascript
createPayment(amountUSD, chain)     // Create payment request
verifyPayment(paymentId, txHash)    // Verify blockchain tx
getPaymentStatus(paymentId)         // Check payment state
```

**Supported Chains:**
- Ethereum (ETH, USDC, USDT)
- Solana (SOL, USDC)
- Bitcoin (BTC)

---

### Auth Middleware
**Location:** `api/middleware/auth.js`

**Responsibilities:**
- API key validation
- Bearer token extraction
- Request authentication
- Access control

**Methods:**
```javascript
requireAuth(validApiKeys)   // Mandatory authentication
optionalAuth(validApiKeys)  // Optional authentication
```

---

## Route Layer

### Domains Routes
**Location:** `api/routes/domains.js`

**Endpoints:**
```
GET  /api/v1/domains/search           # Search domains
POST /api/v1/domains/register         # Register domain
GET  /api/v1/domains/:orderId         # Get domain details
PUT  /api/v1/domains/:orderId/nameservers  # Update DNS
POST /api/v1/domains/:orderId/renew   # Renew domain
```

---

### Hosting Routes
**Location:** `api/routes/hosting.js`

**Endpoints:**
```
GET  /api/v1/hosting/plans            # List hosting plans
POST /api/v1/hosting/create           # Create hosting account
GET  /api/v1/hosting/:orderId         # Get hosting details
```

---

### Payment Routes
**Location:** `api/routes/payments.js`

**Endpoints:**
```
POST /api/v1/payments/create          # Create payment request
POST /api/v1/payments/verify          # Verify payment
GET  /api/v1/payments/:paymentId      # Get payment status
```

---

## Security Layers

### 1. Transport Security
- HTTPS recommended in production
- TLS 1.2+ required

### 2. Authentication
- Bearer token (API keys)
- Per-request validation
- Key rotation support

### 3. Rate Limiting
- 100 requests per 15 minutes per IP (configurable)
- Per-API-key limits (optional)

### 4. Input Validation
- JSON schema validation
- XSS protection
- SQL injection prevention (if DB is added)

### 5. Security Headers
- Helmet.js middleware
- CORS configuration
- CSP headers

---

## Data Flow

### Domain Registration
```
Request → Auth → Validation → Payment Check → ResellerClub API → Database (future) → Response
```

### Payment Verification
```
Request → Auth → Validation → Blockchain RPC → Verify TX → Update Status → Response
```

---

## Scalability Considerations

### Current Design (Single Server)
- Handles ~100 req/15min per IP
- Stateless (except in-memory payment tracking)
- Easy to replicate

### Future Scaling Options

**Horizontal Scaling:**
```
Load Balancer (nginx/HAProxy)
    ├─> API Server 1
    ├─> API Server 2
    └─> API Server 3
         └─> Shared Redis (session/payment state)
         └─> PostgreSQL (persistent storage)
```

**Database Layer (v1.1+):**
```sql
tables:
  - orders (domains, hosting, orders)
  - payments (crypto transactions)
  - customers (contact info)
  - api_keys (authentication)
  - webhooks (notifications)
```

**Caching Layer (v1.2+):**
- Redis for pricing cache
- Domain availability cache (TTL: 5 min)
- Rate limit state

---

## Testing Strategy

### Unit Tests
- Service layer methods
- Auth middleware
- Utility functions

### Integration Tests
- API endpoint responses
- ResellerClub API mocks
- Payment verification flow

### E2E Tests
- Complete domain registration flow
- Hosting purchase flow
- Error scenarios

---

## Monitoring & Logging

### Metrics to Track (Future)
- Request count per endpoint
- Average response time
- Error rate
- Payment success rate
- Domain registration success rate

### Logs
- All API requests (method, endpoint, status)
- Payment transactions (with hashes)
- ResellerClub API errors
- Security events (invalid keys, rate limits)

---

## Deployment Options

### Option 1: VPS (DigitalOcean, Linode, AWS EC2)
```bash
- Ubuntu 22.04 LTS
- Node.js 18+
- PM2 for process management
- nginx as reverse proxy (SSL)
- Cloudflare for DDoS protection
```

### Option 2: Serverless (AWS Lambda, Vercel)
```bash
- Requires state management (Redis/DynamoDB)
- Cold start considerations
- API Gateway integration
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Configuration Management

### Environment Variables
```bash
RESELLER_ID=123456
API_KEY=secret_key
TEST_MODE=true
PORT=3000
```

### Config File (Preferred)
```json
config/config.json
```

---

**Clean architecture. Easy to extend. Production-ready. 🐙**
