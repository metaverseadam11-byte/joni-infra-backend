# Crypto Payment System - Setup & Deployment Guide

## Overview

This is a complete automated crypto payment system for domain registration using the Porkbun API. It supports **ETH, USDC, SOL, and BTC** payments with real-time blockchain monitoring and automatic domain registration.

## Features

✅ **Multi-Chain Support**: Ethereum, USDC, Solana, Bitcoin  
✅ **Real-Time Monitoring**: Automatic payment detection with confirmation tracking  
✅ **Auto-Registration**: Domains registered automatically upon payment confirmation  
✅ **Order Management**: Complete order lifecycle with status tracking  
✅ **Customer Frontend**: Beautiful payment interface with QR codes  
✅ **Admin Dashboard**: Monitor all orders and payments  
✅ **SQLite Database**: No external database service needed  

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Customer  │────▶│  Express API │────▶│  Porkbun    │
│   Frontend  │     │   + Monitor  │     │    API      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   SQLite DB  │
                    │   + Wallets  │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Blockchain  │
                    │   Monitors   │
                    └──────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd crypto-payment-system
npm install
```

### 2. Set Environment Variables

Required environment variables (for Railway or production):

```bash
# API Configuration
API_PORT=3000
API_KEY=joni-api-key-2026

# Porkbun API
PORKBUN_API_KEY=your_porkbun_api_key
PORKBUN_SECRET_KEY=your_porkbun_secret_key

# Wallet Path
WALLET_PATH=/home/node/.joni/wallet/wallet-public.json

# RPC Endpoints (optional, defaults provided)
ETH_RPC_URL=https://eth.llamarpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BITCOIN_RPC_URL=https://blockstream.info/api

# Railway (auto-set)
RAILWAY_ENVIRONMENT=production
```

### 3. Run Locally

```bash
npm start
```

Server will start on `http://localhost:3000`

### 4. Deploy to Railway

The app is already configured for Railway deployment:

```bash
# Commit changes
git add .
git commit -m "Add crypto payment system"
git push origin main

# Railway will auto-deploy
```

## API Endpoints

### Public Endpoints

#### `POST /api/v1/orders/create`
Create a new order

**Request:**
```json
{
  "domain": "example.com",
  "crypto_currency": "ethereum",
  "customer_email": "user@example.com",
  "customer_name": "John Doe",
  "nameservers": ["ns1.example.com", "ns2.example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "order_id": "uuid-here",
    "domain": "example.com",
    "price_usd": 10.99,
    "price_crypto": 0.0035,
    "crypto_currency": "ETH",
    "wallet_address": "0x...",
    "expires_at": 1234567890,
    "expires_in_minutes": 30,
    "status": "pending"
  }
}
```

#### `GET /api/v1/orders/:id/status`
Get order status

**Response:**
```json
{
  "success": true,
  "status": "registered",
  "order_id": "uuid-here",
  "domain": "example.com",
  "tx_hash": "0x...",
  "completed_at": 1234567890
}
```

#### `GET /api/v1/orders/:id`
Get full order details including payments

#### `POST /api/v1/domains/check`
Check domain availability

#### `GET /api/v1/pricing`
Get current crypto prices

### Protected Endpoints (Require Bearer Token)

#### `GET /api/v1/admin/orders?status=pending&limit=100`
List all orders (admin only)

**Headers:**
```
Authorization: Bearer joni-api-key-2026
```

## Payment Flow

### 1. Customer Journey

1. **Enter domain** → System checks availability via Porkbun
2. **Select crypto** → Real-time conversion to crypto amount
3. **Create order** → Unique wallet address assigned
4. **Make payment** → Send crypto to provided address
5. **Auto-detect** → System monitors blockchain (every 30s)
6. **Confirm** → Wait for required confirmations:
   - Ethereum/USDC: 3 confirmations
   - Solana: 20 confirmations  
   - Bitcoin: 3 confirmations
7. **Register** → Domain auto-registered with Porkbun
8. **Complete** → Customer receives confirmation

### 2. Order States

- `pending` → Waiting for payment
- `confirming` → Payment detected, waiting for confirmations
- `paid` → Payment confirmed, registering domain
- `registered` → Domain successfully registered
- `expired` → Order expired (30 minutes)
- `failed` → Registration failed (requires manual intervention)

## Blockchain Monitoring

The system uses a polling-based approach to monitor blockchain transactions:

### Ethereum (ETH)
- Checks wallet balance via JSON-RPC
- Retrieves transaction history
- Calculates confirmations from block numbers

### USDC (ERC-20)
- Monitors USDC contract events
- Checks `balanceOf()` for wallet
- Filters `Transfer` events to wallet address

### Solana (SOL)
- Uses Solana JSON-RPC API
- Checks wallet balance (lamports → SOL)
- Queries transaction signatures

### Bitcoin (BTC)
- Uses Blockstream API
- Checks address balance (satoshis → BTC)
- Retrieves transaction confirmations

## Database Schema

### Tables

**orders**
- Primary order data
- Payment status tracking
- Domain and pricing info

**payments**
- Individual payment records
- Transaction hashes
- Confirmation tracking

**wallet_addresses**
- Wallet management (for future HD derivation)

See `database/schema.sql` for full schema.

## Configuration

### Wallet Addresses

The system reads wallet addresses from `~/.joni/wallet/wallet-public.json`:

```json
{
  "evmWallet": {
    "walletAddress": "0x..."
  },
  "solanaWallet": {
    "walletAddress": "..."
  },
  "bitcoinWallet": {
    "walletAddress": "bc1..."
  }
}
```

### RPC Endpoints

Default free RPC endpoints are provided but you can configure your own:

- **Ethereum**: Alchemy, Infura, QuickNode
- **Solana**: QuickNode, Helius
- **Bitcoin**: Blockstream, BlockCypher

## Testing

### Test Payment Flow

1. **Testnet Addresses**: Use testnet wallets for testing
2. **Small Amounts**: Send test payments
3. **Monitor Logs**: Watch console for payment detection
4. **Admin Dashboard**: Check order status at `/admin.html`

### Manual Testing

```bash
# Create test order
curl -X POST http://localhost:3000/api/v1/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test123.com",
    "crypto_currency": "ethereum",
    "customer_email": "test@test.com"
  }'

# Check order status
curl http://localhost:3000/api/v1/orders/{order-id}/status
```

## Monitoring & Logs

### Console Logs

The system logs all important events:
- ✅ Payment detected
- 💰 Payment confirmed  
- 🔄 Domain registration started
- ✅ Domain registered
- ❌ Errors and failures

### Admin Dashboard

Access at: `https://your-domain.com/admin.html`

**Features:**
- Real-time order list
- Status filtering
- Revenue tracking
- Auto-refresh every 30s

## Troubleshooting

### Payment Not Detected

1. **Check RPC endpoint**: Ensure RPC is working
2. **Verify address**: Confirm payment sent to correct address
3. **Check confirmations**: May need more confirmations
4. **Review logs**: Look for errors in console

### Domain Registration Failed

1. **Check Porkbun API**: Test with `/health` endpoint
2. **Verify domain**: Ensure domain is still available
3. **Check order**: Review error_message in database
4. **Manual registration**: Use admin API to retry

### Database Issues

```bash
# Check database
sqlite3 database/orders.db "SELECT * FROM orders;"

# Reset database (WARNING: deletes all data)
rm database/orders.db
# Restart server to recreate
```

## Security Considerations

### API Authentication

- Admin endpoints require Bearer token
- Store API key securely in environment variables
- Rotate keys regularly

### Wallet Security

- Never expose private keys
- Use `wallet-public.json` only
- Keep full wallet.json secure and backed up

### Rate Limiting

- Default: 100 requests per 15 minutes
- Adjust in server configuration

## Scaling

### High Volume

For high transaction volumes:

1. **Dedicated RPC**: Use paid RPC services (Alchemy, QuickNode)
2. **Webhooks**: Implement blockchain webhooks instead of polling
3. **Database**: Migrate to PostgreSQL for better performance
4. **Caching**: Add Redis for order caching
5. **Monitoring**: Use services like Sentry for error tracking

### Multiple Wallets

To generate unique addresses per order:

1. Implement HD wallet derivation
2. Store derivation paths in `wallet_addresses` table
3. Update `BlockchainMonitor` to check multiple addresses

## Support & Maintenance

### Regular Tasks

- **Monitor blockchain**: Check for stuck transactions
- **Verify registrations**: Confirm domains are registered
- **Clean database**: Archive old expired orders
- **Update pricing**: Ensure crypto prices are accurate
- **Test flow**: Regularly test end-to-end

### Backup

```bash
# Backup database
cp database/orders.db database/orders.backup.db

# Export orders
sqlite3 database/orders.db "SELECT * FROM orders;" > orders_backup.csv
```

## Future Enhancements

- [ ] HD wallet address generation
- [ ] Email notifications
- [ ] Refund system for failed registrations
- [ ] Multiple payment methods (Lightning Network)
- [ ] Bulk domain registration
- [ ] Domain marketplace integration
- [ ] Stripe/fiat payment option
- [ ] Multi-year registration support

## Contact & Support

- **GitHub**: metaverseadam11-byte/joni-infra-backend
- **API Docs**: https://porkbun.com/api/json/v3/documentation

---

**Built with ❤️ for automated crypto domain sales**
