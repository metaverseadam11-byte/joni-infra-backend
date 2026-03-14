# ⚡ Quick Start - 5 Minutes to First Domain

**Get from zero to registered domain in 5 minutes.**

---

## 1. Prerequisites Check (1 minute)

```bash
# Check Node.js version (need 18+)
node --version

# If not installed or too old:
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
```

---

## 2. Get ResellerClub Test Account (2 minutes)

1. Go to **https://test.httpapi.com**
2. Click "Sign Up" for test account
3. Note your **Test Reseller ID** and **API Key**
4. No payment needed for testing!

---

## 3. Setup Project (1 minute)

```bash
cd ~/ai-domain-platform/api
npm install
```

Create config:
```bash
cp ../config/config.example.json ../config/config.json
```

Edit `config/config.json`:
```json
{
  "resellerclub": {
    "resellerId": "YOUR_TEST_ID",
    "apiKey": "YOUR_TEST_KEY",
    "testMode": true
  },
  "crypto": {
    "enabled": false
  },
  "api": {
    "port": 3000,
    "apiKeys": ["test-key-123"]
  }
}
```

---

## 4. Start Server (30 seconds)

```bash
npm start
```

You should see:
```
🤖 AI Domain & Hosting Platform
✅ Server running on port 3000
Ready for AI agents! 🐙
```

---

## 5. Test It! (30 seconds)

Open a new terminal:

```bash
# Search for a domain
curl -X GET "http://localhost:3000/api/v1/domains/search?query=test123&tlds=com" \
  -H "Authorization: Bearer test-key-123"
```

You should see:
```json
{
  "success": true,
  "results": [
    {
      "domain": "test123.com",
      "available": true,
      "pricing": {
        "registration": 12.99,
        "renewal": 14.99,
        "currency": "USD"
      }
    }
  ]
}
```

**🎉 It works!**

---

## Next Steps

### For Testing:
- Try different domain queries
- Check hosting plans: `GET /api/v1/hosting/plans?type=linux`
- View API info: `GET /api/v1`

### For Production:
1. Sign up for real ResellerClub account
2. Change `testMode: false` in config
3. Add crypto payment support
4. Deploy to server
5. Generate strong API keys

### Read More:
- **Full Setup**: See `SETUP.md`
- **AI Agent Guide**: See `docs/AI-AGENT-GUIDE.md`
- **Integration Examples**: See `docs/INTEGRATION-EXAMPLES.md`

---

## Troubleshooting

**"Module not found"**
→ Run `npm install` in the `api` directory

**"Failed to load config.json"**
→ Make sure you copied `config.example.json` to `config.json`

**"ResellerClub API Error"**
→ Check your Reseller ID and API Key are correct

**Port 3000 in use**
→ Change port in config.json or kill the process using port 3000

---

**That's it! You're running an AI-friendly domain platform. 🐙**

Now go build something cool with it!
