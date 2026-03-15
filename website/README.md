# joni.bz - Crypto Domain Sales Website

A complete, modern landing page and domain registration platform that accepts cryptocurrency payments (ETH, BTC, SOL, USDC).

## Features

- 🎨 Beautiful landing page with hero section
- 🔍 Domain search and availability checking
- 💰 Multi-cryptocurrency payment support
- 📊 Admin dashboard for order management
- 📱 Fully responsive design
- ⚡ Fast, modern, and secure

## Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (no build step required)
- **Styling**: Custom CSS with gradient theme
- **Routing**: Client-side hash-based routing
- **API**: Railway backend (https://porkbun-api-production.up.railway.app)
- **Domain Registration**: Porkbun API integration

## Project Structure

```
joni-bz-website/
├── index.html          # Main HTML file with all pages
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── router.js       # Client-side routing
│   └── app.js          # Application logic
├── assets/             # Images/icons (if needed)
└── README.md           # This file
```

## Pages

1. **Home** (`/#home`) - Landing page with features and how-it-works
2. **Search** (`/#search`) - Domain search and crypto payment flow
3. **About** (`/#about`) - About page with FAQ
4. **Admin** (`/#admin`) - Admin dashboard for order management

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy from project directory:
   ```bash
   cd ~/.joni/workspace/joni-bz-website
   vercel
   ```

3. Point joni.bz to Vercel:
   - Add custom domain in Vercel dashboard
   - Update DNS records at Porkbun:
     - Type: CNAME
     - Host: @
     - Target: cname.vercel-dns.com
   - SSL automatically handled by Vercel

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd ~/.joni/workspace/joni-bz-website
   netlify deploy --prod
   ```

3. Configure custom domain in Netlify dashboard
4. Update DNS at Porkbun to point to Netlify

### Option 3: Porkbun Static Hosting

1. Log into Porkbun account
2. Go to domain management for joni.bz
3. Enable static hosting
4. Upload all files via FTP/SFTP
5. SSL automatically provided

### Option 4: Railway (With Backend)

1. Add frontend to Railway backend repo:
   ```bash
   cp -r ~/.joni/workspace/joni-bz-website/* ~/.joni/workspace/crypto-payment-system/public/
   ```

2. Update Railway service to serve static files
3. Point joni.bz to Railway URL
4. One deployment for both frontend and backend

### Option 5: GitHub Pages

1. Create repo and push:
   ```bash
   cd ~/.joni/workspace/joni-bz-website
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

2. Enable GitHub Pages in repo settings
3. Point joni.bz to GitHub Pages:
   - Type: A
   - Host: @
   - Target: 185.199.108.153 (GitHub Pages IP)

## Local Development

Simply open `index.html` in a browser or use a local server:

```bash
cd ~/.joni/workspace/joni-bz-website

# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Or just open in browser
open index.html
```

Visit: `http://localhost:8000`

## API Configuration

The website connects to the Railway API:
- Base URL: `https://porkbun-api-production.up.railway.app/api/v1`
- Endpoints used:
  - `POST /domains/check` - Check domain availability
  - `POST /orders/create` - Create order
  - `GET /orders/:id/status` - Check order status
  - `GET /admin/orders` - Admin: List all orders

## Environment Variables

No environment variables needed for the frontend! All API endpoints are public except admin, which requires authentication via API key.

## Admin Access

To access the admin dashboard:
1. Navigate to `/#admin`
2. Enter your API key (stored in backend environment)
3. View all orders, stats, and manage registrations

## Customization

### Colors
Edit `css/styles.css` CSS variables:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --accent: #f093fb;
}
```

### Content
Edit `index.html` to change text, features, or layout.

### API Endpoint
Change `API_BASE` in `js/app.js` if using different backend.

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## Security

- All payments are on-chain (no custody)
- Admin dashboard requires API key authentication
- SSL/HTTPS required for production
- No sensitive data stored client-side

## Performance

- No build step = instant deployment
- Minimal dependencies (only QR code library)
- Fast page loads (<2s)
- Optimized CSS and JS

## Support

For issues or questions:
- Email: support@joni.bz
- Backend repo: crypto-payment-system

## License

Proprietary - joni.bz 2026
