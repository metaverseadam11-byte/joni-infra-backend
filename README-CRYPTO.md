# 🚀 Crypto Domain Platform - Complete Payment System

Automated domain registration with cryptocurrency payments (ETH, USDC, SOL, BTC).

## 🎯 What This Is

A **production-ready** crypto payment system that:
- Accepts cryptocurrency payments for domain registrations
- Monitors blockchain transactions in real-time
- Automatically registers domains when payment is confirmed
- Provides customer-facing payment interface
- Includes admin dashboard for order management

## 💎 Key Features

- ✅ **Multi-Chain Support**: Ethereum, USDC, Solana, Bitcoin
- ✅ **Automatic Detection**: Real-time blockchain monitoring (30s intervals)
- ✅ **Auto-Registration**: Domains registered automatically via Porkbun API
- ✅ **Beautiful Frontend**: Clean payment UI with QR codes
- ✅ **Admin Dashboard**: Monitor orders and track revenue
- ✅ **Order Expiry**: 30-minute payment windows
- ✅ **Confirmation Tracking**: Configurable confirmation thresholds
- ✅ **SQLite Database**: No external database needed
- ✅ **Railway Ready**: Configured for one-click deployment

## 🏗️ Architecture

```
Customer → Frontend → API → Porkbun → Domain Registered
                ↓
            Database
                ↓
         Blockchain Monitor → Detects Payment
```

## 🚀 Quick Deploy

### Option 1: Railway (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add crypto payment system"
git push origin main
```

2. **Railway will auto-deploy** (already connected)

3. **Set environment variables in Railway:**
   - `PORKBUN_API_KEY`
   - `PORKBUN_SECRET_KEY`
   - `API_KEY` (for admin access)
   - `WALLET_PATH=/home/node/.joni/wallet/wallet-public.json`

### Option 2: Run Locally

```bash
# Install dependencies
npm install

# Set environment variables
export PORKBUN_API_KEY=your_key
export PORKBUN_SECRET_KEY=your_secret
export API_KEY=joni-api-key-2026
export WALLET_PATH=/home/node/.joni/wallet/wallet-public.json

# Start server
npm start
```

Access at: `http://localhost:3000`

## 📖 Usage

### For Customers

1. Visit `https://your-domain.com`
2. Enter domain name
3. Select cryptocurrency
4. Send payment to provided address
5. Wait for automatic registration
6. Done! 🎉

### For Admins

1. Visit `https://your-domain.com/admin.html`
2. Enter API key: `joni-api-key-2026`
3. Monitor orders in real-time
4. Track revenue and conversions

## 🔧 API Endpoints

### Create Order
```bash
POST /api/v1/orders/create
{
  "domain": "example.com",
  "crypto_currency": "ethereum",
  "customer_email": "user@example.com"
}
```

### Check Order Status
```bash
GET /api/v1/orders/{order-id}/status
```

### Get Crypto Prices
```bash
GET /api/v1/pricing
```

### Admin: List Orders
```bash
GET /api/v1/admin/orders?status=pending
Authorization: Bearer joni-api-key-2026
```

## 💰 Supported Cryptocurrencies

| Crypto | Chain | Confirmations Required |
|--------|-------|------------------------|
| ETH    | Ethereum | 3 |
| USDC   | Ethereum (ERC-20) | 3 |
| SOL    | Solana | 20 |
| BTC    | Bitcoin | 3 |

## 🎨 Frontend Pages

1. **Main Page** (`/`) - Customer order creation and payment
2. **Admin Dashboard** (`/admin.html`) - Order management

## 📊 Database Tables

- **orders** - Main order records
- **payments** - Payment transaction tracking
- **wallet_addresses** - Wallet management

See `database/schema.sql` for full schema.

## 🔍 How It Works

### Payment Detection Flow

1. **Customer creates order** → System assigns wallet address
2. **Customer sends crypto** → Transaction broadcast to blockchain
3. **Monitor detects payment** (30s polling) → Checks wallet balance
4. **Wait for confirmations** → Tracks block confirmations
5. **Payment confirmed** → Triggers domain registration
6. **Porkbun registers domain** → Updates order status
7. **Customer notified** → Order marked as complete

### Order States

```
pending → confirming → paid → registered
   ↓           ↓
expired     failed
```

## 🛡️ Security

- ✅ Rate limiting (100 req/15min)
- ✅ Bearer token authentication for admin
- ✅ Public wallet addresses only (no private keys)
- ✅ Input validation on all endpoints
- ✅ CORS and Helmet security headers

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | Server port | 3000 |
| `API_KEY` | Admin authentication | joni-api-key-2026 |
| `PORKBUN_API_KEY` | Porkbun API key | Required |
| `PORKBUN_SECRET_KEY` | Porkbun secret | Required |
| `WALLET_PATH` | Wallet JSON path | /home/node/.joni/wallet/wallet-public.json |
| `ETH_RPC_URL` | Ethereum RPC | https://eth.llamarpc.com |
| `SOLANA_RPC_URL` | Solana RPC | https://api.mainnet-beta.solana.com |
| `BITCOIN_RPC_URL` | Bitcoin API | https://blockstream.info/api |

## 📁 File Structure

```
crypto-payment-system/
├── server.crypto.cjs         # Main server
├── database/
│   ├── schema.sql            # Database schema
│   └── db.cjs                # Database manager
├── services/
│   ├── blockchain-monitor.cjs    # Payment detection
│   ├── crypto-pricing.cjs        # Price conversion
│   ├── order-manager.cjs         # Order logic
│   ├── porkbun-wrapper.cjs       # Porkbun API
│   └── porkbun.cjs               # Core Porkbun service
├── public/
│   ├── index.html            # Customer interface
│   └── admin.html            # Admin dashboard
├── package.json
└── CRYPTO-SETUP.md           # Full documentation
```

## 🧪 Testing

### Test Order Creation

```bash
curl -X POST https://your-domain.com/api/v1/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test123.com",
    "crypto_currency": "ethereum",
    "customer_email": "test@test.com"
  }'
```

### Test Payment Detection

1. Create order
2. Send test payment to provided address
3. Watch logs for detection
4. Check status endpoint

## 📈 Monitoring

### Logs to Watch

- `💰 Payment detected` - Transaction found
- `✅ Payment confirmed` - Confirmations met
- `🔄 Processing payment` - Registering domain
- `✅ Domain registered` - Success!
- `❌ Registration failed` - Error occurred

### Health Check

```bash
curl https://your-domain.com/health
```

## 🐛 Troubleshooting

**Payment not detected?**
- Check RPC endpoint status
- Verify correct wallet address
- Confirm transaction on block explorer
- Check monitor logs

**Registration failed?**
- Verify Porkbun API credentials
- Check domain is still available
- Review error_message in database

**Database issues?**
```bash
sqlite3 database/orders.db "SELECT * FROM orders;"
```

## 🚀 Scaling Tips

1. **Use paid RPC services** (Alchemy, QuickNode) for reliability
2. **Implement webhooks** instead of polling for instant detection
3. **Add caching** (Redis) for high traffic
4. **Migrate to PostgreSQL** for better performance
5. **Use HD wallets** to generate unique addresses per order

## 📝 TODO / Future Enhancements

- [ ] Email notifications
- [ ] Webhook-based payment detection
- [ ] HD wallet address generation
- [ ] Refund system
- [ ] Lightning Network support
- [ ] Multi-year registration
- [ ] Bulk domain orders
- [ ] Invoice generation

## 🤝 Contributing

This is a production system. Test thoroughly before modifying core payment logic.

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- **Documentation**: See `CRYPTO-SETUP.md` for detailed setup
- **Porkbun API**: https://porkbun.com/api/json/v3/documentation
- **GitHub**: metaverseadam11-byte/joni-infra-backend

---

**⚡ Built for instant crypto domain sales**

Start selling domains with crypto payments in minutes! 🚀
