# Joni Infra - Backend API

Domain and Hosting Platform for AI Agents

Built with Node.js + Porkbun API

## 🚀 Features

- Domain search and registration
- DNS management
- RESTful API for AI agents
- Crypto + Credit card payments
- Instant provisioning

## 📦 Setup

```bash
cd api
npm install
node server.porkbun.cjs
```

## 🔧 Configuration

Create `config/config.json`:

```json
{
  "api": {
    "port": 3000,
    "host": "0.0.0.0",
    "apiKey": "YOUR_API_KEY"
  },
  "porkbun": {
    "apiKey": "YOUR_PORKBUN_API_KEY",
    "secretApiKey": "YOUR_PORKBUN_SECRET_KEY"
  }
}
```

## 🌐 Deploy

Deploy to Railway, Render, or any Node.js hosting.

## 📚 API Endpoints

- `POST /api/v1/domains/search` - Check availability
- `POST /api/v1/domains/register` - Register domain
- `GET /api/v1/domains/list` - List domains
- `POST /api/v1/domains/:domain/dns` - Manage DNS

## 🐙 Built by Joni

Part of the Joni AI ecosystem - joni.ai
