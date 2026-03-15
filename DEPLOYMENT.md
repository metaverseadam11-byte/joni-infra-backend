# 🚀 Deployment Guide - Crypto Payment System

## Quick Deployment to Railway

### Step 1: Code is Already Pushed ✅

The complete crypto payment system has been pushed to GitHub:
- Repository: `metaverseadam11-byte/joni-infra-backend`
- Branch: `main`
- Commit: Latest

### Step 2: Configure Railway Environment Variables

**Required Environment Variables:**

```bash
# API Configuration
API_PORT=3000
API_KEY=joni-api-key-2026

# Porkbun API Credentials
PORKBUN_API_KEY=pk1_your_porkbun_api_key_here
PORKBUN_SECRET_KEY=sk1_your_porkbun_secret_key_here

# Wallet Configuration
WALLET_PATH=/app/wallet-public.json

# Optional: Custom RPC Endpoints (defaults are provided)
ETH_RPC_URL=https://eth.llamarpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BITCOIN_RPC_URL=https://blockstream.info/api
```

### Step 3: Add Wallet File to Railway

Since Railway needs the wallet file, you have two options:

**Option A: Create wallet-public.json in the repo (Recommended)**

```bash
# In crypto-payment-system directory
cat > wallet-public.json << 'EOF'
{
  "evmWallet": {
    "walletAddress": "0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE"
  },
  "solanaWallet": {
    "walletAddress": "Bpcjryjaqdoj2HGwJkQmZCbUFgqfo6oH53FyaWKdqnqQ"
  },
  "bitcoinWallet": {
    "walletAddress": "bc1q5ah6yk9q79w9q6506qcj8gmz2yyym4ww9lx8kg"
  }
}
EOF

git add wallet-public.json
git commit -m "Add wallet addresses for Railway deployment"
git push origin main
```

Then set `WALLET_PATH=/app/wallet-public.json` in Railway.

**Option B: Use Environment Variable**

Set this in Railway:
```bash
WALLET_JSON='{"evmWallet":{"walletAddress":"0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE"},"solanaWallet":{"walletAddress":"Bpcjryjaqdoj2HGwJkQmZCbUFgqfo6oH53FyaWKdqnqQ"},"bitcoinWallet":{"walletAddress":"bc1q5ah6yk9q79w9q6506qcj8gmz2yyym4ww9lx8kg"}}'
```

And modify server to read from env var if file doesn't exist.

### Step 4: Railway Will Auto-Deploy

Railway is already connected to your GitHub repo and will automatically:
1. Pull the latest code
2. Install dependencies (`npm install`)
3. Start the server (`npm start` → runs `server.crypto.cjs`)
4. Assign a public URL

### Step 5: Verify Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://porkbun-api-production.up.railway.app/health

# API info
curl https://porkbun-api-production.up.railway.app/api/v1

# Check pricing
curl https://porkbun-api-production.up.railway.app/api/v1/pricing

# Test domain check
curl -X POST https://porkbun-api-production.up.railway.app/api/v1/domains/check \
  -H "Content-Type: application/json" \
  -d '{"domain": "test123.com"}'
```

## Manual Railway Setup (if needed)

If you need to configure Railway from scratch:

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Link Project

```bash
cd crypto-payment-system
railway link
# Select: joni-infra-backend project
```

### 3. Set Environment Variables

```bash
railway variables set PORKBUN_API_KEY="pk1_your_key"
railway variables set PORKBUN_SECRET_KEY="sk1_your_secret"
railway variables set API_KEY="joni-api-key-2026"
railway variables set WALLET_PATH="/app/wallet-public.json"
```

### 4. Deploy

```bash
railway up
```

## Environment-Specific Configuration

### Development (Local)

```bash
export PORKBUN_API_KEY=pk1_test_key
export PORKBUN_SECRET_KEY=sk1_test_secret
export API_KEY=test-key
export WALLET_PATH=/home/node/.joni/wallet/wallet-public.json
npm start
```

### Production (Railway)

Railway automatically sets:
- `PORT` (Railway assigns this)
- `RAILWAY_ENVIRONMENT=production`

You must set:
- All API keys and credentials
- Wallet path or JSON

## Post-Deployment Checklist

- [ ] Health check returns 200 OK
- [ ] Frontend loads at root URL
- [ ] Admin dashboard accessible at `/admin.html`
- [ ] API endpoints respond correctly
- [ ] Domain check works
- [ ] Order creation works
- [ ] Test small payment flow end-to-end

## Monitoring

### Railway Dashboard

1. Go to Railway dashboard
2. Select your project
3. Check:
   - **Deployments**: See build and deploy logs
   - **Metrics**: CPU, memory, network usage
   - **Logs**: Real-time application logs
   - **Variables**: Verify all env vars set

### Application Logs

Watch for these key log messages:

```
✅ Database connected
✅ Porkbun API connected
✅ Ethereum provider initialized
✅ Solana provider initialized
✅ Bitcoin provider initialized
🔍 Starting blockchain monitor
📍 Server running on port 3000
```

### Test Payment Detection

Create a test order and monitor logs:

```
🔍 Checking 1 pending orders...
💰 Payment detected for order xyz-123
⏳ Payment pending confirmations (1/3)
✅ Payment confirmed (3/3) for order xyz-123
🔄 Processing payment for order xyz-123
✅ Domain registered: test123.com
```

## Troubleshooting

### Deployment Fails

**Check build logs in Railway:**
- Missing dependencies? → Verify package.json
- Build errors? → Check Node version compatibility
- Start command fails? → Verify main entry point

### Application Crashes

**Common issues:**

1. **Missing environment variables**
   - Error: "Missing Porkbun API credentials"
   - Fix: Set PORKBUN_API_KEY and PORKBUN_SECRET_KEY

2. **Wallet file not found**
   - Error: "Failed to load wallet addresses"
   - Fix: Add wallet-public.json or set WALLET_JSON env var

3. **Database errors**
   - Error: "SQLITE_CANTOPEN"
   - Fix: Ensure /app/database directory is writable
   - Railway should handle this automatically

4. **RPC endpoint failures**
   - Error: "Ethereum provider initialization failed"
   - Fix: Use reliable RPC endpoints (Alchemy, Infura)

### Payment Detection Not Working

1. **Check RPC connectivity**
   ```bash
   curl https://eth.llamarpc.com \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **Verify wallet addresses**
   - Check blockchain explorer
   - Confirm funds received
   - Check correct network (mainnet vs testnet)

3. **Review monitor logs**
   - Look for "Checking N pending orders"
   - Check for error messages
   - Verify confirmation thresholds

## Scaling Considerations

### Current Setup (Good for MVP)

- Free RPC endpoints
- Polling-based monitoring (30s intervals)
- Single server instance
- SQLite database

**Capacity:** ~100 orders/day

### For Higher Volume

1. **Upgrade RPC Services**
   - Alchemy (free tier: 300M compute units/month)
   - Infura (free tier: 100k requests/day)
   - QuickNode (paid plans)

2. **Add Webhooks**
   - BlockCypher webhooks for Bitcoin
   - Alchemy webhooks for Ethereum
   - Helius webhooks for Solana
   - Remove polling, instant detection

3. **Database Migration**
   - Move to PostgreSQL or MySQL
   - Better for concurrent writes
   - Easier to scale horizontally

4. **Add Caching**
   - Redis for order status
   - Reduce database queries
   - Faster API responses

5. **Load Balancing**
   - Multiple server instances
   - Railway supports horizontal scaling
   - Share database across instances

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs
- Check for stuck orders
- Verify domain registrations

**Weekly:**
- Review order success rate
- Check RPC endpoint reliability
- Backup database

**Monthly:**
- Rotate API keys
- Review and archive old orders
- Update dependencies

### Database Backup

```bash
# SSH into Railway container (if possible)
railway run bash

# Backup database
sqlite3 database/orders.db ".backup backup.db"

# Download backup
railway file download backup.db
```

### Updates and Rollbacks

```bash
# Deploy new version
git push origin main
# Railway auto-deploys

# Rollback if needed
railway rollback
# Select previous deployment from list
```

## Security Best Practices

1. **API Keys**
   - Store in Railway environment variables only
   - Never commit to code
   - Rotate regularly
   - Use different keys for dev/prod

2. **Wallet Security**
   - Only expose public addresses
   - Keep private keys secure and offline
   - Use hardware wallet for hot wallet
   - Regular security audits

3. **Rate Limiting**
   - Current: 100 req/15min
   - Adjust based on traffic
   - Add IP-based limits if needed

4. **HTTPS**
   - Railway provides SSL automatically
   - Force HTTPS for all requests
   - No sensitive data over HTTP

5. **Monitoring**
   - Set up alerts for failures
   - Monitor unusual transaction patterns
   - Log all payment attempts

## Support

- **Railway Docs**: https://docs.railway.app
- **Porkbun API**: https://porkbun.com/api/json/v3/documentation
- **GitHub Repo**: metaverseadam11-byte/joni-infra-backend

---

**🎉 You're Ready to Accept Crypto Payments!**

Visit your Railway URL to start selling domains with cryptocurrency! 🚀
