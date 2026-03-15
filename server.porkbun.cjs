/**
 * AI Domain Platform - Crypto Payment Edition
 * 
 * Automated domain registration with cryptocurrency payments
 * Supports: ETH, USDC, SOL, BTC
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Services
const Database = require('./database/db.cjs');
const PorkbunWrapper = require('./services/porkbun-wrapper.cjs');
const CryptoPricingService = require('./services/crypto-pricing.cjs');
const OrderManager = require('./services/order-manager.cjs');
const BlockchainMonitor = require('./services/blockchain-monitor.cjs');

// Load configuration
let config;
let walletAddresses;

if (process.env.API_PORT || process.env.PORKBUN_API_KEY) {
  console.log('📦 Loading config from environment variables...');
  config = {
    api: {
      port: parseInt(process.env.API_PORT || process.env.PORT || '3000'),
      host: process.env.API_HOST || '0.0.0.0',
      apiKey: process.env.API_KEY || 'joni-api-key-2026'
    },
    porkbun: {
      apiKey: process.env.PORKBUN_API_KEY,
      secretApiKey: process.env.PORKBUN_SECRET_KEY
    },
    crypto: {
      enabled: true,
      rpcUrls: {
        ethereum: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
        solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        bitcoin: process.env.BITCOIN_RPC_URL || 'https://blockstream.info/api'
      }
    }
  };

  // Load wallet addresses from file or environment
  const walletPath = process.env.WALLET_PATH || path.join(__dirname, 'wallet-public.json');
  try {
    walletAddresses = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    console.log('✅ Wallet addresses loaded from:', walletPath);
  } catch (err) {
    console.error('❌ Failed to load wallet addresses:', err.message);
    console.error('   Tried path:', walletPath);
    process.exit(1);
  }
} else {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Validate required config
if (!config.porkbun?.apiKey || !config.porkbun?.secretApiKey) {
  console.error('❌ Missing Porkbun API credentials');
  process.exit(1);
}

// Initialize services
const app = express();
const db = new Database(path.join(__dirname, 'database', 'orders.db'));
const porkbun = new PorkbunWrapper(config.porkbun);
const pricing = new CryptoPricingService();
const orderManager = new OrderManager(db, porkbun, pricing, walletAddresses);
const monitor = new BlockchainMonitor(config.crypto, db);

// Security & middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for frontend
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'porkbun',
    crypto: 'enabled',
    environment: process.env.RAILWAY_ENVIRONMENT || 'local'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'AI Domain Platform - Crypto Edition',
    version: '2.0.0',
    provider: 'Porkbun',
    crypto: ['ETH', 'USDC', 'SOL', 'BTC'],
    endpoints: {
      orders: {
        create: 'POST /api/v1/orders/create',
        status: 'GET /api/v1/orders/:id/status',
        details: 'GET /api/v1/orders/:id'
      },
      pricing: 'GET /api/v1/pricing',
      domains: 'POST /api/v1/domains/check'
    }
  });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.substring(7);
  
  if (token !== config.api.apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// ============================================================================
// ORDERS API
// ============================================================================

/**
 * POST /api/v1/orders/create
 * Create a new order
 */
app.post('/api/v1/orders/create', async (req, res) => {
  try {
    const {
      domain,
      crypto_currency,
      customer_email,
      customer_name,
      nameservers
    } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    if (!crypto_currency) {
      return res.status(400).json({
        success: false,
        error: 'Crypto currency is required (ETH, USDC, SOL, BTC)'
      });
    }

    // Create order
    const order = await orderManager.createOrder({
      domain,
      crypto_currency,
      customer_email,
      customer_name,
      nameservers
    });

    res.json({
      success: true,
      order: order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/v1/orders/:id/status
 * Get order status
 */
app.get('/api/v1/orders/:id/status', async (req, res) => {
  try {
    const orderUuid = req.params.id;
    const order = await orderManager.getOrderStatus(orderUuid);

    res.json({
      success: true,
      status: order.status,
      order_id: order.order_id,
      domain: order.domain,
      tx_hash: order.tx_hash,
      completed_at: order.completed_at
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/v1/orders/:id
 * Get full order details
 */
app.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const orderUuid = req.params.id;
    const order = await orderManager.getOrderStatus(orderUuid);

    res.json({
      success: true,
      order: order
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/v1/webhook/payment
 * Webhook for payment notifications (future use)
 */
app.post('/api/v1/webhook/payment', requireAuth, async (req, res) => {
  try {
    // This can be used with services like BlockCypher or Alchemy webhooks
    const { order_id, tx_hash, amount, currency } = req.body;

    console.log('Webhook received:', { order_id, tx_hash, amount, currency });

    res.json({
      success: true,
      message: 'Webhook received'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ============================================================================
// ADMIN API (Protected)
// ============================================================================

/**
 * GET /api/v1/admin/orders
 * List all orders (admin only)
 */
app.get('/api/v1/admin/orders', requireAuth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const orders = await orderManager.getAllOrders(filters);

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ============================================================================
// UTILITY API
// ============================================================================

/**
 * GET /api/v1/pricing
 * Get crypto prices
 */
app.get('/api/v1/pricing', async (req, res) => {
  try {
    const cryptos = ['ethereum', 'usdc', 'solana', 'bitcoin'];
    const prices = await pricing.getPrices(cryptos);

    res.json({
      success: true,
      prices: {
        ETH: prices.ethereum,
        USDC: prices.usdc,
        SOL: prices.solana,
        BTC: prices.bitcoin
      },
      timestamp: Date.now()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/v1/domains/check
 * Check domain availability
 */
app.post('/api/v1/domains/check', async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const result = await porkbun.checkDomain(domain);

    res.json({
      success: true,
      domain: domain,
      available: result.available,
      price: result.price
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    await db.init();

    // Test Porkbun connection
    console.log('🧪 Testing Porkbun API...');
    await porkbun.testConnection();
    console.log('✅ Porkbun API connected');

    // Set up payment confirmation callback
    monitor.setPaymentConfirmedCallback(async (order, txHash) => {
      console.log(`💰 Payment confirmed callback: ${order.order_uuid}`);
      await orderManager.processPayment(order, txHash);
    });

    // Start blockchain monitor
    await monitor.start();

    // Start Express server
    const PORT = config.api.port;
    const HOST = config.api.host;

    app.listen(PORT, HOST, () => {
      console.log('');
      console.log('🚀 ════════════════════════════════════════════════════════');
      console.log('   AI Domain Platform - Crypto Payment Edition');
      console.log('════════════════════════════════════════════════════════════');
      console.log(`📍 Server: http://${HOST}:${PORT}`);
      console.log(`🐷 Provider: Porkbun`);
      console.log(`💰 Crypto: ETH, USDC, SOL, BTC`);
      console.log(`🌐 Environment: ${process.env.RAILWAY_ENVIRONMENT || 'local'}`);
      console.log('════════════════════════════════════════════════════════════');
      console.log('');
      console.log('📬 Wallet Addresses:');
      console.log(`   ETH/USDC: ${walletAddresses.evmWallet?.walletAddress}`);
      console.log(`   SOL:      ${walletAddresses.solanaWallet?.walletAddress}`);
      console.log(`   BTC:      ${walletAddresses.bitcoinWallet?.walletAddress}`);
      console.log('');
      console.log('✅ Ready to accept crypto payments!');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  monitor.stop();
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  monitor.stop();
  db.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

/**
 * POST /api/v1/orders/create-fast
 * Fast order creation with real-time crypto prices (fallback to hardcoded on error)
 */
app.post('/api/v1/orders/create-fast', async (req, res) => {
  try {
    const { domain, crypto_currency, customer_email } = req.body;
    
    if (!domain) {
      return res.status(400).json({ success: false, error: 'Domain required' });
    }
    
    const orderUuid = require('crypto').randomBytes(16).toString('hex');
    const wallets = {
      'ETH': '0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE',
      'ethereum': '0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE',
      'USDC': '0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE',
      'usdc': '0xeD0667FFcB1A1D419b22Fbb4F51bbEA5869d67aE',
      'SOL': 'Bpcjryjaqdoj2HGwJkQmZCbUFgqfo6oH53FyaWKdqnqQ',
      'solana': 'Bpcjryjaqdoj2HGwJkQmZCbUFgqfo6oH53FyaWKdqnqQ',
      'BTC': 'bc1q5ah6yk9q79w9q6506qcj8gmz2yyym4ww9lx8kg',
      'bitcoin': 'bc1q5ah6yk9q79w9q6506qcj8gmz2yyym4ww9lx8kg'
    };
    
    // Hardcoded fallback prices (updated 2026-03-15)
    const fallbackPrices = { 
      'ETH': 2800, 'ethereum': 2800, 
      'USDC': 1.0, 'usdc': 1.0, 
      'SOL': 140, 'solana': 140, 
      'BTC': 65000, 'bitcoin': 65000 
    };
    
    const priceUsd = 11.08; // Domain price
    let cryptoPrice;
    
    // Try to get real-time price, fallback to hardcoded
    try {
      cryptoPrice = await pricingService.getPrice(crypto_currency);
      console.log(`Using real-time price for ${crypto_currency}: $${cryptoPrice}`);
    } catch (err) {
      cryptoPrice = fallbackPrices[crypto_currency] || fallbackPrices[crypto_currency.toUpperCase()] || 1;
      console.log(`Using fallback price for ${crypto_currency}: $${cryptoPrice}`);
    }
    
    const priceCrypto = (priceUsd / cryptoPrice).toFixed(6);
    
    res.json({
      success: true,
      order: {
        order_id: orderUuid,
        domain: domain,
        price_usd: priceUsd,
        price_crypto: parseFloat(priceCrypto),
        crypto_currency: crypto_currency.toUpperCase(),
        wallet_address: wallets[crypto_currency] || wallets[crypto_currency.toUpperCase()],
        expires_at: Math.floor(Date.now() / 1000) + 1800,
        expires_in_minutes: 30,
        status: 'pending',
        crypto_price_usd: cryptoPrice // Include current crypto price for reference
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
