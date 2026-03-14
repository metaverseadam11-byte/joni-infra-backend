# 🐷 Porkbun Setup Guide

Quick setup guide for using the AI Domain Platform with Porkbun API.

---

## Why Porkbun?

✅ **No reseller account needed** - regular account works  
✅ **Instant API access** - enable in seconds  
✅ **Crypto payments** - Bitcoin support  
✅ **Low prices** - among the cheapest domain registrars  
✅ **Simple API** - easy to integrate  

---

## Step 1: Create Porkbun Account

1. Go to **https://porkbun.com**
2. Click **"Sign Up"** (top right)
3. Fill in:
   - Email address
   - Password
   - Name/Company
4. Verify your email

⏱️ **Time:** 2 minutes

---

## Step 2: Enable API Access

1. Log in to **https://porkbun.com**
2. Click your **username** (top right) → **Account**
3. Go to **API Access** section
4. Click **"Create API Key"**
5. Copy both keys:
   - **API Key** (starts with `pk1_`)
   - **Secret API Key** (starts with `sk1_`)

⏱️ **Time:** 1 minute

---

## Step 3: Configure the Platform

### Create config file:

```bash
cd ~/ai-domain-platform
cp config/config.porkbun.example.json config/config.json
```

### Edit config.json:

```bash
nano config/config.json
```

Paste your Porkbun keys:

```json
{
  "api": {
    "port": 3000,
    "host": "0.0.0.0",
    "apiKey": "generate_random_key_here"
  },
  "porkbun": {
    "apiKey": "pk1_YOUR_API_KEY_HERE",
    "secretApiKey": "sk1_YOUR_SECRET_KEY_HERE"
  },
  "crypto": {
    "enabled": true,
    "chains": ["ethereum", "solana", "bitcoin"],
    "rpcUrls": {
      "ethereum": "https://eth.llamarpc.com",
      "solana": "https://api.mainnet-beta.solana.com",
      "bitcoin": "https://blockstream.info/api"
    }
  }
}
```

### Generate API key for your platform:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `api.apiKey` in config.json.

---

## Step 4: Update Server Code

Edit `api/server.js` to use Porkbun:

```bash
nano api/server.js
```

Replace the domain routes section with:

```javascript
// Load Porkbun routes
const { router: domainsRouter, initPorkbun } = require('./routes/domains.porkbun');
initPorkbun(config.porkbun);
app.use('/api/v1/domains', domainsRouter);
```

---

## Step 5: Start the Server

```bash
cd ~/ai-domain-platform/api
npm start
```

You should see:

```
🚀 AI Domain Platform API running on http://0.0.0.0:3000
✅ Porkbun service initialized
```

---

## Step 6: Test the API

### Test API credentials:

```bash
curl -X POST http://localhost:3000/api/v1/domains/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Search for a domain:

```bash
curl -X POST http://localhost:3000/api/v1/domains/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example",
    "tlds": ["com", "net", "ai", "io"]
  }'
```

### Check specific domain:

```bash
curl -X POST http://localhost:3000/api/v1/domains/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain": "mycooldomain.ai"}'
```

---

## API Endpoints

### Domain Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/domains/search` | POST | Search available domains |
| `/api/v1/domains/register` | POST | Register a domain |
| `/api/v1/domains/renew` | POST | Renew a domain |
| `/api/v1/domains/list` | GET | List all domains |
| `/api/v1/domains/:domain` | GET | Get domain details |
| `/api/v1/domains/:domain/nameservers` | POST | Update nameservers |
| `/api/v1/domains/:domain/dns` | GET | Get DNS records |
| `/api/v1/domains/:domain/dns` | POST | Add DNS record |
| `/api/v1/domains/:domain/dns/:id` | DELETE | Delete DNS record |
| `/api/v1/domains/pricing/all` | GET | Get all TLD pricing |

---

## Crypto Payments

Porkbun supports **Bitcoin** payments natively.

To purchase a domain with Bitcoin:

1. Add funds to your Porkbun account via Bitcoin
2. Domains will be automatically registered when payment confirms

**Our platform will detect crypto payments** and trigger domain registration automatically.

---

## Pricing

Porkbun has some of the **lowest prices** in the industry:

| TLD | Registration | Renewal |
|-----|--------------|---------|
| .com | $9.13/year | $10.39/year |
| .net | $11.98/year | $13.23/year |
| .ai | $88.60/year | $88.60/year |
| .io | $34.98/year | $39.98/year |

*(Prices as of 2026-03 - check Porkbun for current pricing)*

---

## Troubleshooting

### "Invalid API credentials"

→ Double-check your API Key and Secret Key in config.json  
→ Make sure you copied both keys correctly (they're long!)

### "API access disabled"

→ Enable API access in Porkbun account settings  
→ Whitelist your server IP if needed

### "Insufficient funds"

→ Add funds to your Porkbun account  
→ Minimum $10 recommended to start

---

## Next Steps

✅ **Test domain search**  
✅ **Register your first domain**  
✅ **Integrate crypto wallet**  
✅ **Build AI agent interface**

---

## Support

**Porkbun Support:**
- Email: support@porkbun.com
- Live Chat: https://porkbun.com (bottom right)

**Platform Issues:**
- Check `~/ai-domain-platform/docs/` for documentation
- Review API logs in terminal

---

**You're ready to go! 🐷🚀**
