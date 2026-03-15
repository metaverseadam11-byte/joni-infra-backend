#!/bin/bash

# Deploy to Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 Deploying joni.bz to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Add custom domain: joni.bz"
echo "3. Update DNS at Porkbun:"
echo "   Type: CNAME"
echo "   Host: @"
echo "   Target: cname.vercel-dns.com"
echo ""
echo "SSL will be automatically configured by Vercel."
