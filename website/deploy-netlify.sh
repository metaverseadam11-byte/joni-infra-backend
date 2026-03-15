#!/bin/bash

# Deploy to Netlify
# Usage: ./deploy-netlify.sh

echo "🚀 Deploying joni.bz to Netlify..."

# Check if netlify is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Deploy
netlify deploy --prod --dir=.

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Netlify dashboard"
echo "2. Add custom domain: joni.bz"
echo "3. Update DNS at Porkbun to point to Netlify"
echo ""
echo "SSL will be automatically configured by Netlify."
