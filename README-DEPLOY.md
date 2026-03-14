# 🚀 Deploy Instructions for Railway

## Quick Deploy via Railway Dashboard:

1. **Go to:** https://railway.app/
2. **Sign up** with: moshe-staging@agent.joni.ai
3. **Click:** "New Project" → "Deploy from GitHub repo" (or "Empty Project")
4. **If empty project:**
   - Click "Add a Service" → "Empty Service"
   - Connect via GitHub or upload files

## Files to Deploy:

**Location:** `/home/node/ai-domain-platform/`

**Required files:**
- `api/server.porkbun.cjs` (main server)
- `api/services/porkbun.cjs` (API service)
- `api/routes/domains.porkbun.cjs` (routes)
- `api/middleware/auth.cjs` (auth)
- `api/package.json` (dependencies)
- `config/config.json` (credentials)

## Railway Configuration:

### Environment Variables:
```
NODE_ENV=production
PORT=3000
```

### Start Command:
```
node api/server.porkbun.cjs
```

### Root Directory:
Leave as root or set to `/`

## Alternative: ZIP Upload

1. Create deployment package:
```bash
cd /home/node/ai-domain-platform
tar -czf joni-api.tar.gz api/ config/
```

2. Upload to Railway or use GitHub

## After Deploy:

1. Get your Railway URL (e.g., `https://joni-api-production.up.railway.app`)
2. Update frontend index.html:
   - Change `API_ENDPOINT` to your Railway URL
3. Re-upload index.html to FTP
4. Test the API!

## Test Endpoints:

```bash
# Replace YOUR_URL with Railway URL
curl https://YOUR_URL/health

curl -X POST https://YOUR_URL/api/v1/domains/search \
  -H "Authorization: Bearer a7f8e9d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0" \
  -H "Content-Type: application/json" \
  -d '{"domain": "test123.com"}'
```

---

**Current Status:** Code ready, waiting for Railway deployment
