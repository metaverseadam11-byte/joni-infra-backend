/**
 * AI Domain Platform API Server - Porkbun Edition
 * 
 * Built for AI agents with Porkbun API + Crypto payments
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const { router: domainsRouter, initPorkbun } = require('./routes/domains.porkbun.cjs');

// Load config from environment variables or config file
let config;

if (process.env.API_PORT || process.env.PORKBUN_API_KEY) {
  // Load from environment variables (Railway/production)
  console.log('📦 Loading config from environment variables...');
  config = {
    api: {
      port: parseInt(process.env.API_PORT || process.env.PORT || '3000'),
      host: process.env.API_HOST || '0.0.0.0',
      apiKey: process.env.API_KEY || 'default-key'
    },
    porkbun: {
      apiKey: process.env.PORKBUN_API_KEY,
      secretApiKey: process.env.PORKBUN_SECRET_KEY
    },
    crypto: {
      enabled: process.env.CRYPTO_ENABLED === 'true',
      chains: ['ethereum', 'solana', 'bitcoin'],
      rpcUrls: {
        ethereum: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
        solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        bitcoin: process.env.BITCOIN_RPC_URL || 'https://blockstream.info/api'
      }
    },
    server: {
      cors: {
        enabled: true,
        origins: (process.env.CORS_ORIGINS || '*').split(',')
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100')
      }
    }
  };
} else {
  // Load from config file (local development)
  const configPath = path.join(__dirname, '../config/config.json');
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error('❌ Failed to load config.json and no environment variables found');
    console.error('Set environment variables or copy config/config.porkbun.example.json to config/config.json');
    process.exit(1);
  }
}

// Validate required config
if (!config.porkbun?.apiKey || !config.porkbun?.secretApiKey) {
  console.error('❌ Missing Porkbun API credentials');
  console.error('Set PORKBUN_API_KEY and PORKBUN_SECRET_KEY environment variables');
  process.exit(1);
}

// Initialize Porkbun service
initPorkbun(config.porkbun);

// Initialize Express
const app = express();

// Security & middleware
app.use(helmet());
app.use(cors(config.server?.cors || {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.server?.rateLimit?.windowMs || 900000, // 15 minutes
  max: config.server?.rateLimit?.max || 100
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'porkbun',
    environment: process.env.RAILWAY_ENVIRONMENT || 'local'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Domain Platform API',
    version: '1.0.0',
    provider: 'Porkbun',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      domains: '/api/v1/domains'
    }
  });
});

// API Info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'AI Domain Platform API',
    version: '1.0.0',
    provider: 'Porkbun',
    endpoints: {
      domains: '/api/v1/domains',
      health: '/health'
    },
    documentation: 'https://github.com/metaverseadam11-byte/joni-infra-backend'
  });
});

// Mount routes
app.use('/api/v1/domains', domainsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/v1',
      'POST /api/v1/domains/search',
      'POST /api/v1/domains/register',
      'GET /api/v1/domains/list'
    ]
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

// Start server
const PORT = config.api?.port || process.env.PORT || 3000;
const HOST = config.api?.host || '0.0.0.0';

// Fast order creation endpoint (no external API calls)
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
    
    const prices = { 'ETH': 2800, 'ethereum': 2800, 'USDC': 1, 'usdc': 1, 'SOL': 140, 'solana': 140, 'BTC': 65000, 'bitcoin': 65000 };
    const priceUsd = 11.08;
    const cryptoPrice = prices[crypto_currency] || prices[crypto_currency.toUpperCase()] || 1;
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
        status: 'pending'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log('\n🚀 AI Domain Platform API - Porkbun Edition');
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`🐷 Provider: Porkbun`);
  console.log(`🌐 Environment: ${process.env.RAILWAY_ENVIRONMENT || 'local'}`);
  console.log(`🔑 API Key: ${config.api.apiKey.substring(0, 8)}...`);
  console.log('\n✅ Ready to serve AI agents!\n');
});

module.exports = app;
