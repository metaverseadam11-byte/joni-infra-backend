# Deployment Guide for joni.bz

## Quick Start (Recommended: Vercel)

### 1. Deploy to Vercel

```bash
cd ~/.joni/workspace/joni-bz-website
./deploy-vercel.sh
```

Or manually:
```bash
npm i -g vercel
vercel --prod
```

### 2. Configure Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Domains"
   - Click "Add Domain"
   - Enter: `joni.bz`
   - Click "Add"

2. **In Porkbun Dashboard:**
   - Log in to Porkbun
   - Go to domain management for `joni.bz`
   - Update DNS records:
   
   **Option A: CNAME (Recommended)**
   ```
   Type: CNAME
   Host: @
   Answer: cname.vercel-dns.com.
   TTL: 600
   ```
   
   **Option B: A Record**
   ```
   Type: A
   Host: @
   Answer: 76.76.21.21
   TTL: 600
   ```

3. **Wait for DNS Propagation** (5-30 minutes)
   - Check status: `dig joni.bz`
   - SSL certificate will be auto-issued by Vercel

### 3. Verify Deployment

Visit: https://joni.bz

Expected pages:
- ✅ Home: https://joni.bz/#home
- ✅ Search: https://joni.bz/#search
- ✅ About: https://joni.bz/#about
- ✅ Admin: https://joni.bz/#admin

---

## Alternative: Netlify

### 1. Deploy to Netlify

```bash
cd ~/.joni/workspace/joni-bz-website
./deploy-netlify.sh
```

Or manually:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.
```

### 2. Configure Custom Domain

1. **In Netlify Dashboard:**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `joni.bz`

2. **In Porkbun:**
   - Update DNS records as shown by Netlify
   - Typically:
     ```
     Type: A
     Host: @
     Answer: 75.2.60.5
     ```

3. **Enable HTTPS** (automatic in Netlify)

---

## Alternative: GitHub Pages

### 1. Push to GitHub

```bash
cd ~/.joni/workspace/joni-bz-website
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/joni-bz-website.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to repo settings
2. Navigate to "Pages"
3. Source: Deploy from branch `main`
4. Folder: `/ (root)`
5. Click "Save"

### 3. Configure Custom Domain

1. **In GitHub Pages Settings:**
   - Enter custom domain: `joni.bz`
   - Check "Enforce HTTPS"

2. **In Porkbun:**
   ```
   Type: A
   Host: @
   Answer: 185.199.108.153
   
   Type: A
   Host: @
   Answer: 185.199.109.153
   
   Type: A
   Host: @
   Answer: 185.199.110.153
   
   Type: A
   Host: @
   Answer: 185.199.111.153
   ```

---

## Alternative: Railway (With Backend)

### Option 1: Separate Frontend Service

1. **Create new Railway service:**
   ```bash
   cd ~/.joni/workspace/joni-bz-website
   railway init
   railway up
   ```

2. **Add custom domain in Railway:**
   - Settings → Domains → Add custom domain
   - Enter: `joni.bz`
   - Follow DNS instructions

### Option 2: Serve from Existing Backend

1. **Copy frontend to backend:**
   ```bash
   cp -r ~/.joni/workspace/joni-bz-website/* \
         ~/.joni/workspace/crypto-payment-system/public/
   ```

2. **Update backend to serve static files** (if not already)
   
3. **Point domain to Railway:**
   - Get Railway URL from dashboard
   - Update DNS in Porkbun

---

## DNS Configuration Cheatsheet

### For Vercel
```
Type: CNAME
Host: @
Answer: cname.vercel-dns.com.
TTL: 600
```

### For Netlify
```
Type: A
Host: @
Answer: 75.2.60.5
TTL: 600
```

### For GitHub Pages
```
Type: A (add all 4)
Host: @
Answer: 185.199.108.153
Answer: 185.199.109.153
Answer: 185.199.110.153
Answer: 185.199.111.153
TTL: 600
```

### For Railway
```
Type: CNAME
Host: @
Answer: <your-project>.up.railway.app
TTL: 600
```

---

## SSL/HTTPS

All platforms automatically provide free SSL certificates via Let's Encrypt:

- ✅ **Vercel**: Automatic
- ✅ **Netlify**: Automatic
- ✅ **GitHub Pages**: Automatic (after DNS propagates)
- ✅ **Railway**: Automatic

No manual configuration needed!

---

## Troubleshooting

### DNS not resolving?
```bash
# Check DNS propagation
dig joni.bz

# Check from different locations
https://dnschecker.org
```

### SSL certificate not issued?
- Wait 30-60 minutes after DNS propagates
- Ensure DNS is pointing correctly
- Check domain validation in platform dashboard

### 404 errors on refresh?
- Ensure SPA routing is configured (vercel.json / netlify.toml)
- Check that index.html is served for all routes

### API not working?
- Check browser console for CORS errors
- Verify API_BASE in js/app.js is correct
- Ensure Railway backend is running

---

## Post-Deployment Checklist

- [ ] Domain resolves to correct IP/CNAME
- [ ] HTTPS is working (green lock icon)
- [ ] All pages load correctly (home, search, about, admin)
- [ ] Navigation works between pages
- [ ] Domain search form appears
- [ ] Admin login page appears
- [ ] Mobile responsive (test on phone)
- [ ] Browser console has no errors
- [ ] API connection working (test domain search)

---

## Monitoring

After deployment, monitor:
- **Uptime**: Use UptimeRobot or similar
- **Analytics**: Add Google Analytics if desired
- **Errors**: Check platform logs for 404s or 500s
- **Performance**: Test with PageSpeed Insights

---

## Rollback

If something goes wrong:

### Vercel
```bash
vercel rollback
```

### Netlify
```bash
netlify rollback
```

### GitHub Pages
```bash
git revert HEAD
git push
```

### Railway
- Use Railway dashboard to rollback to previous deployment

---

## Support

Questions? Check:
- Platform docs (Vercel/Netlify/etc.)
- DNS propagation: https://dnschecker.org
- SSL status: https://www.ssllabs.com/ssltest/

For joni.bz issues:
- Email: support@joni.bz
- Backend logs: Check Railway dashboard
