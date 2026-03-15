/**
 * Authentication Middleware
 */

const fs = require('fs');
const path = require('path');

// Load config from ENV or file
let config;

if (process.env.API_KEY) {
  // Railway/production - use ENV vars
  config = {
    api: {
      apiKey: process.env.API_KEY
    }
  };
} else {
  // Local - use config file
  const configPath = path.join(__dirname, '../config/config.json');
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error('❌ Missing API_KEY environment variable or config.json');
    process.exit(1);
  }
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
