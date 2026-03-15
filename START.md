# 🚀 Quick Start Guide

## You're Almost Ready to Accept Crypto Payments!

### What's Been Done ✅

1. **Complete crypto payment system built** - All code written and tested
2. **Pushed to GitHub** - Repository updated with latest code
3. **Railway-ready** - Configuration files in place
4. **Documentation complete** - 5 comprehensive guides created

### What You Need to Do Now 🎯

#### Step 1: Set Railway Environment Variables (5 minutes)

Go to Railway dashboard and set these:

```
PORKBUN_API_KEY=pk1_your_actual_key_here
PORKBUN_SECRET_KEY=sk1_your_actual_secret_here
API_KEY=joni-api-key-2026
```

That's it! Railway will automatically deploy.

#### Step 2: Verify Deployment (2 minutes)

Once Railway finishes deploying, test these URLs:

```bash
# Health check
https://porkbun-api-production.up.railway.app/health

# Frontend (should show beautiful payment page)
https://porkbun-api-production.up.railway.app/

# Admin dashboard
https://porkbun-api-production.up.railway.app/admin.html
```

#### Step 3: Test the Flow (10 minutes)

**Customer Flow:**
1. Go to your Railway URL
2. Enter a test domain (e.g., `crypto-test-xyz.com`)
3. Select cryptocurrency
4. System will show payment address and QR code
5. Send a small test payment
6. Wait for confirmation (~30 seconds - 5 minutes depending on blockchain)
7. Domain gets registered automatically!

**Admin View:**
1. Go to `/admin.html`
2. Enter API key: `joni-api-key-2026`
3. See all orders in real-time
4. Monitor payment status

### 🎉 You're Live!

Once the above works, you can:
- Share your Railway URL with customers
- Accept crypto payments for domains
- Watch orders auto-process
- Track revenue in admin dashboard

### 📚 Need More Info?

- **Setup & Config**: Read `CRYPTO-SETUP.md`
- **Deployment Help**: Read `DEPLOYMENT.md`
- **API Reference**: Read `README-CRYPTO.md`
- **Project Overview**: Read `SUMMARY.md`

### 💡 Pro Tips

1. **Test with Small Amounts First**
   - Send $1-5 worth of crypto to verify flow
   - Use a cheap domain TLD (.xyz is usually $1-2)

2. **Monitor Logs**
   - Watch Railway logs for payment detection
   - Look for "Payment detected" and "Domain registered" messages

3. **Check Wallet Balances**
   - Use blockchain explorers to verify payments:
     - ETH: https://etherscan.io/address/0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE
     - SOL: https://solscan.io/account/Bpcjryjaqdoj2HGwJkQmZCbUFgqfo6oH53FyaWKdqnqQ
     - BTC: https://blockstream.info/address/bc1q5ah6yk9q79w9q6506qcj8gmz2yyym4ww9lx8kg

4. **Promote Your Service**
   - Share on Twitter/X
   - Post in crypto communities
   - Add to your website
   - Accept crypto for other services

### 🛟 Troubleshooting

**Railway not deploying?**
- Check environment variables are set correctly
- View deployment logs in Railway dashboard
- Verify repository connection

**Payment not detecting?**
- Check RPC endpoints are working
- Verify correct wallet address used
- Wait for required confirmations
- Check Railway logs for errors

**Domain registration failed?**
- Verify Porkbun API credentials
- Check domain is still available
- Review error message in admin dashboard
- Check Porkbun account balance

### 📊 System Architecture

```
Customer → Frontend (HTML) → API (Express) → Database (SQLite)
                                    ↓
                            Blockchain Monitor
                                    ↓
                            Payment Detected
                                    ↓
                            Porkbun API
                                    ↓
                            Domain Registered ✅
```

### 🎯 Success Indicators

You'll know it's working when you see:

**In Railway Logs:**
```
✅ Database connected
✅ Porkbun API connected
✅ Ethereum provider initialized
🔍 Starting blockchain monitor
📍 Server running on port 3000
```

**When payment arrives:**
```
💰 Payment detected for order abc-123
⏳ Payment pending confirmations (1/3)
✅ Payment confirmed (3/3)
🔄 Processing payment
✅ Domain registered: example.com
```

### 💰 Revenue Flow

1. **Customer pays crypto** → Your wallet addresses
2. **System detects payment** → Automatic
3. **Domain registered** → Via Porkbun API
4. **Customer gets domain** → Instant
5. **You keep crypto** → No middleman!

### 🚀 Scale Up

Once you're comfortable:
- Add more cryptocurrencies
- Implement HD wallet derivation (unique address per order)
- Add email notifications
- Create custom domain packages
- Offer bulk discounts
- Add domain marketplace features

### 📞 Questions?

Everything you need is in the docs:
- `CRYPTO-SETUP.md` - Technical setup
- `DEPLOYMENT.md` - Deployment guide  
- `README-CRYPTO.md` - Feature overview
- `SUMMARY.md` - Complete project summary

---

## 🎊 That's It!

You now have a **fully automated crypto payment system** for domain registration.

**Time to first sale:** Set environment variables (5 min) → Test (10 min) → Live! 🚀

Go sell some domains and make some crypto! 💎

---

**Built for you by Joni** 🤖
