#!/bin/bash

echo "🚀 Starting AI Domain Platform API..."

# Create config directory if it doesn't exist
mkdir -p config

# Generate config.json from environment variables if it doesn't exist
if [ ! -f config/config.json ] && [ -n "$PORKBUN_API_KEY" ]; then
  echo "📝 Generating config.json from environment variables..."
  cat > config/config.json << EOF
{
  "api": {
    "port": ${API_PORT:-3000},
    "host": "${API_HOST:-0.0.0.0}",
    "apiKey": "${API_KEY}"
  },
  "porkbun": {
    "apiKey": "${PORKBUN_API_KEY}",
    "secretApiKey": "${PORKBUN_SECRET_KEY}"
  },
  "crypto": {
    "enabled": ${CRYPTO_ENABLED:-true},
    "chains": ["ethereum", "solana", "bitcoin"],
    "rpcUrls": {
      "ethereum": "${ETH_RPC_URL:-https://eth.llamarpc.com}",
      "solana": "${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}",
      "bitcoin": "${BITCOIN_RPC_URL:-https://blockstream.info/api}"
    }
  },
  "server": {
    "cors": {
      "enabled": true,
      "origins": ["*"]
    },
    "rateLimit": {
      "windowMs": ${RATE_LIMIT_WINDOW_MS:-900000},
      "max": ${RATE_LIMIT_MAX:-100}
    }
  }
}
EOF
  echo "✅ Config file created"
fi

# Start the server
cd api
node server.porkbun.cjs
