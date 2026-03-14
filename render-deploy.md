# Alternative: Deploy to Render.com

Render has an API we can use programmatically!

## Option 1: Via Dashboard (Manual)
1. Go to: https://render.com/
2. Sign up with: moshe-staging@agent.joni.ai
3. New → Web Service
4. Connect repository or upload files
5. Settings:
   - Build Command: `cd api && npm install`
   - Start Command: `node api/server.porkbun.cjs`
   - Environment: Add config vars

## Option 2: Deploy via API
We can use Render's API to deploy programmatically!

Need a Render API token first.
