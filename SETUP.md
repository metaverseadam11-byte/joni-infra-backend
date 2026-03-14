# 🚀 Setup Guide

**Get your AI-friendly domain & hosting platform running in 10 minutes.**

---

## Prerequisites

- Node.js 18+ installed
- ResellerClub account
- Crypto wallet (optional, for payments)

---

## Step 1: Get ResellerClub Account

### Sign Up

1. Go to **https://www.resellerclub.com/reseller-program**
2. Click "Become a Reseller"
3. Fill in your details
4. Choose your currency (USD recommended)
5. Complete registration

### Get API Credentials

1. Log in to https://manage.resellerclub.com
2. Go to **Settings** → **API**
3. Note your **Reseller ID** (displayed at top of page)
4. Generate an **API Key** or copy existing one
5. Enable **API Access** if not already enabled

### Add Funds (Test Mode)

For testing:
1. Use the demo environment: https://test.httpapi.com
2. Test credentials are provided after signup
3. No real money needed

For production:
1. Add funds to your ResellerClub account
2. Minimum deposit: $100-200 (depends on region)
3. You'll use this balance to purchase domains/hosting

---

## Step 2: Install Platform

### Clone/Download

```bash
cd ~
# If you don't have the folder, it's already created at ~/ai-domain-platform
cd ~/ai-domain-platform
```

### Install Dependencies

```bash
cd api
npm install
```

This installs:
- Express (API server)
- Axios (HTTP client)
- Ethers.js (Ethereum)
- Solana Web3.js (Solana)
- Bitcoin libraries
- Security middleware

---

## Step 3: Configure

### Create Config File

```bash
cp config/config.example.json config/config.json
```

### Edit Config

Open `config/config.json` and fill in your details:

```json
{
  "resellerclub": {
    "resellerId": "123456",           // Your ResellerClub Reseller ID
    "apiKey": "your_api_key_here",    // Your API Key
    "testMode": true                   // true for testing, false for production
  },
  "crypto": {
    "enabled": true,
    "chains": ["ethereum", "solana"],
    "rpcUrls": {
      "ethereum": "https://eth.llamarpc.com",
      "solana": "https://api.mainnet-beta.solana.com"
    }
  },
  "api": {
    "port": 3000,
    "apiKeys": [
      "generate-a-random-key-here"     // Generate strong random keys
    ]
  }
}
```

### Generate API Keys

For security, generate strong random API keys:

```bash
# macOS/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or online: https://randomkeygen.com
```

Add these keys to the `api.apiKeys` array. These are the keys your AI agents will use.

---

## Step 4: Integrate Joni Wallet (Optional)

If you want to use your existing Joni crypto wallet for payments:

### Update Crypto Service

Edit `api/services/crypto.js` and modify the `_getPaymentAddress` method:

```javascript
async _getPaymentAddress(chain) {
  // Read from Joni wallet
  const walletPath = '/home/node/.joni/wallet/wallet-public.json';
  const wallet = JSON.parse(readFileSync(walletPath, 'utf-8'));
  
  const addresses = {
    ethereum: wallet.ethereum?.address || wallet.evm?.address,
    solana: wallet.solana?.address,
    bitcoin: wallet.bitcoin?.address
  };
  
  return addresses[chain];
}
```

This will direct all payments to your Joni wallet addresses.

---

## Step 5: Run the Server

### Development Mode (with auto-reload)

```bash
cd ~/ai-domain-platform/api
npm run dev
```

### Production Mode

```bash
npm start
```

You should see:

```
🤖 AI Domain & Hosting Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port 3000
📍 API: http://localhost:3000/api/v1
🏥 Health: http://localhost:3000/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ResellerClub:
  Mode: 🧪 TEST
  Reseller ID: 123456

Crypto Payments:
  Enabled: ✅
  Chains: ethereum, solana

Ready for AI agents! 🐙
```

---

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-03-14T18:50:00.000Z"
}
```

### Search Domains (with auth)

```bash
curl -X GET "http://localhost:3000/api/v1/domains/search?query=test&tlds=com" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If you see domain results, **you're all set!** 🎉

---

## Step 7: Deploy (Optional)

### For Production Use

1. **Change to production mode**: Set `testMode: false` in config
2. **Use a proper server**: Deploy to VPS, AWS, or similar
3. **Add HTTPS**: Use nginx or Caddy as reverse proxy with SSL
4. **Set up monitoring**: Track API usage and errors
5. **Enable logging**: Log all transactions for accounting

### Quick Deploy with PM2

```bash
npm install -g pm2
cd ~/ai-domain-platform/api
pm2 start server.js --name ai-domain-platform
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

---

## Troubleshooting

### "Failed to load config.json"
→ Make sure you copied `config.example.json` to `config.json` and filled in credentials

### "ResellerClub API Error"
→ Check your Reseller ID and API Key are correct
→ Make sure API access is enabled in ResellerClub settings
→ If using test mode, ensure test credentials are valid

### "Payment verification failed"
→ Make sure the transaction hash is correct
→ Wait for blockchain confirmation (can take a few minutes)
→ Check RPC URLs are accessible

### Port 3000 already in use
→ Change `api.port` in config.json to another port (e.g., 3001)

---

## Next Steps

1. **Read AI Agent Guide**: See `docs/AI-AGENT-GUIDE.md` for usage examples
2. **Test with real AI agent**: Try registering a test domain
3. **Set up webhooks**: Get notified when domains/hosting expire
4. **Add monitoring**: Track usage and costs

---

## ResellerClub Resources

- Dashboard: https://manage.resellerclub.com
- API Docs: https://manage.resellerclub.com/kb/answer/744
- Test Environment: https://test.httpapi.com
- Support: support@resellerclub.com

---

**Questions? Check the README or open an issue. 🐙**
