/**
 * Authentication Middleware
 */

const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, '../../config/config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('❌ Failed to load config.json for auth');
  process.exit(1);
}

/**
 * Authenticate API requests
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer YOUR_API_KEY'
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (token !== config.api.apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
}

module.exports = { authenticate };
