# 🚀 Deployment Guide - Vercel (FREE)

This guide will help you deploy your macOS-style portfolio to Vercel for **FREE**.

## ✅ Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com) - free!)
- Your portfolio code pushed to GitHub

---

## 🎯 Quick Deploy to Vercel (Recommended)

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Login" (use GitHub)

3. **Import Your Repository**
   - Click "Add New Project"
   - Select your portfolio repository from GitHub
   - Click "Import"

4. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Add Environment Variables** (Important!)
   Click "Environment Variables" and add these:

   | Name | Value | Description |
   |------|-------|-------------|
   | `VITE_GITHUB_USERNAME` | `sisodiajatin` | Your GitHub username |
   | `VITE_JAMENDO_CLIENT_ID` | `56d30c95` | Music API (free) |
   | `VITE_WEATHER_LAT` | `42.2626` | Your city latitude |
   | `VITE_WEATHER_LON` | `-71.8023` | Your city longitude |

   > **Note**: Change `sisodiajatin` to your GitHub username!
   > **Note**: Change coordinates to your city (optional)

6. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes ⏱️
   - Your site is live! 🎉

---

### Method 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Follow prompts:
#    - Set up and deploy? Y
#    - Which scope? (select your account)
#    - Link to existing project? N
#    - Project name? (press Enter or choose a name)
#    - In which directory? ./ (press Enter)
#    - Override settings? N

# 5. Set environment variables
vercel env add VITE_GITHUB_USERNAME
# Enter value: sisodiajatin (or your username)
# Select environments: Production, Preview, Development

vercel env add VITE_JAMENDO_CLIENT_ID
# Enter value: 56d30c95

vercel env add VITE_WEATHER_LAT
# Enter value: 42.2626 (or your city's latitude)

vercel env add VITE_WEATHER_LON
# Enter value: -71.8023 (or your city's longitude)

# 6. Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables Explained

### Required Variables

1. **`VITE_GITHUB_USERNAME`**
   - Your GitHub username
   - Used to fetch your GitHub activity
   - Example: `sisodiajatin`

2. **`VITE_JAMENDO_CLIENT_ID`**
   - Jamendo Music API client ID
   - Free API, no signup needed
   - Default: `56d30c95` (you can use this)

### Optional Variables

3. **`VITE_WEATHER_LAT`** & **`VITE_WEATHER_LON`**
   - Coordinates for weather location
   - Default: Worcester, MA (42.2626, -71.8023)
   - To change to your city:
     1. Google "my city coordinates"
     2. Update both LAT and LON values

---

## 🌍 Finding Your City Coordinates

1. Go to [latlong.net](https://www.latlong.net/)
2. Enter your city name
3. Copy the Latitude and Longitude values
4. Update environment variables

**Example:**
- New York: `40.7128, -74.0060`
- Los Angeles: `34.0522, -118.2437`
- London: `51.5074, -0.1278`
- Tokyo: `35.6762, 139.6503`

---

## 🎨 Custom Domain (Optional, but FREE)

1. **Buy a domain** (optional - Vercel gives you a free subdomain)
   - Namecheap, GoDaddy, etc.

2. **Add to Vercel**
   - Go to your project → Settings → Domains
   - Add your domain
   - Update DNS records as shown

3. **SSL Certificate**
   - Automatically provided by Vercel (FREE)
   - HTTPS enabled by default

---

## 🔄 Automatic Deployments

Once deployed, Vercel automatically:
- ✅ Deploys every push to `main` branch
- ✅ Creates preview deployments for PRs
- ✅ Runs builds and checks
- ✅ Provides deployment URLs

---

## 📊 After Deployment

Your portfolio will be available at:
```
https://your-project-name.vercel.app
```

**Next Steps:**
1. ✅ Share your portfolio link
2. ✅ Add it to your GitHub profile
3. ✅ Update your LinkedIn
4. ✅ Monitor analytics in Vercel dashboard

---

## 🆘 Troubleshooting

### Build fails?
```bash
# Clear cache and rebuild locally first
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variables not working?
- Make sure variable names start with `VITE_`
- Redeploy after adding variables
- Check Vercel dashboard → Project Settings → Environment Variables

### GitHub API rate limit?
- The GitHub API has a 60 requests/hour limit for unauthenticated requests
- Your portfolio caches data and updates every 5 minutes
- Normal usage won't hit this limit

---

## 💰 Vercel Free Tier Limits

✅ **100% Free includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)
- Custom domains

🚀 **This is more than enough for a portfolio!**

---

## 🎉 You're Done!

Your portfolio is now live on the internet!

**Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

Need help? Check [Vercel Docs](https://vercel.com/docs)
