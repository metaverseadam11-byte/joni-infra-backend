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

// Load config
const configPath = path.join(__dirname, '../config/config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('❌ Failed to load config.json');
  console.error('Copy config/config.porkbun.example.json to config/config.json and fill in your credentials');
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
    provider: 'porkbun'
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
    documentation: 'https://github.com/yourusername/ai-domain-platform'
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
const PORT = config.api?.port || 3000;
const HOST = config.api?.host || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('\n🚀 AI Domain Platform API - Porkbun Edition');
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`🐷 Provider: Porkbun`);
  console.log(`🔑 API Key: ${config.api.apiKey.substring(0, 8)}...`);
  console.log('\n✅ Ready to serve AI agents!\n');
});

module.exports = app;
