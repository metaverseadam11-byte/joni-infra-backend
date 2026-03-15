/**
 * AI Domain & Hosting Platform API Server
 * 
 * Built for AI agents with ResellerClub + Crypto payments
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import ResellerClubAPI from './services/resellerclub.js';
import CryptoPaymentService from './services/crypto.js';
import { requireAuth } from './middleware/auth.js';

import domainsRouter from './routes/domains.js';
import hostingRouter from './routes/hosting.js';
import paymentsRouter from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const configPath = join(__dirname, '../config/config.json');
let config;

try {
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('❌ Failed to load config.json');
  console.error('Copy config/config.example.json to config/config.json and fill in your credentials');
  process.exit(1);
}

// Initialize Express
const app = express();

// Security & middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

app.use('/api/', limiter);

// Initialize services
const resellerclub = new ResellerClubAPI(config.resellerclub);
const crypto = new CryptoPaymentService(config.crypto);

// Make services available to routes
app.locals.resellerclub = resellerclub;
app.locals.crypto = crypto;

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API info (no auth required)
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    name: 'AI Domain & Hosting Platform',
    version: '1.0.0',
    description: 'AI-friendly API for domain registration and hosting powered by ResellerClub',
    endpoints: {
      domains: '/api/v1/domains',
      hosting: '/api/v1/hosting',
      payments: '/api/v1/payments'
    },
    docs: 'See README.md for full documentation',
    authentication: 'Bearer token required (Authorization: Bearer YOUR_API_KEY)'
  });
});

// Protected API routes (require authentication)
const authMiddleware = requireAuth(config.api.apiKeys);

app.use('/api/v1/domains', authMiddleware, domainsRouter);
app.use('/api/v1/hosting', authMiddleware, hostingRouter);
app.use('/api/v1/payments', authMiddleware, paymentsRouter);

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
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = config.api.port || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('🤖 AI Domain & Hosting Platform');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('ResellerClub:');
  console.log(`  Mode: ${config.resellerclub.testMode ? '🧪 TEST' : '🚀 PRODUCTION'}`);
  console.log(`  Reseller ID: ${config.resellerclub.resellerId}`);
  console.log('');
  console.log('Crypto Payments:');
  console.log(`  Enabled: ${config.crypto.enabled ? '✅' : '❌'}`);
  if (config.crypto.enabled) {
    console.log(`  Chains: ${config.crypto.chains.join(', ')}`);
  }
  console.log('');
  console.log('Ready for AI agents! 🐙');
  console.log('');
});

export default app;
