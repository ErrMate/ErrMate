# Deployment Guide

## Step-by-Step Deployment to Vercel

### Prerequisites

Before deploying, make sure you have:
- ✅ A GitHub account
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ A PostgreSQL database (Vercel Postgres, Supabase, Neon, or Railway)
- ✅ Google OAuth credentials
- ✅ OpenRouter API key
- ✅ Stripe account

---

## Step 1: Prepare Your Code

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/errmate.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Database

### Option A: Vercel Postgres (Easiest)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Create a new Postgres database
4. Copy the connection string (it will be auto-added to your environment variables)

### Option B: External PostgreSQL (Supabase/Neon/Railway)

1. **Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → Database
   - Copy the connection string (format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

2. **Neon**:
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

3. **Railway**:
   - Go to [railway.app](https://railway.app)
   - Create a new PostgreSQL service
   - Copy the connection string

### 2.1 Run Database Migrations

After setting up the database, run migrations:

```bash
# Using the production DATABASE_URL
npx prisma db push
```

Or use Vercel's CLI:

```bash
vercel env pull .env.production.local
npx prisma db push
```

---

## Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://your-app.vercel.app/api/auth/callback/google` (for production)
5. Copy the **Client ID** and **Client Secret**

---

## Step 4: Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys:
   - Go to **Developers** → **API keys**
   - Copy your **Secret key** (starts with `sk_`)
3. Set up webhook (do this after deployment):
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-app.vercel.app/api/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the **Signing secret** (starts with `whsec_`)

---

## Step 5: Get OpenRouter API Key

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up or log in
3. Go to **Keys** section
4. Create a new API key
5. Copy the key

---

## Step 6: Deploy to Vercel

### 6.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 6.2 Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
DATABASE_URL=<your PostgreSQL connection string>
OPENROUTER_API_KEY=<from openrouter.ai>
STRIPE_SECRET_KEY=<from Stripe Dashboard>
STRIPE_WEBHOOK_SECRET=<from Stripe Webhook>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**: 
- Replace `your-app.vercel.app` with your actual Vercel domain
- Generate `NEXTAUTH_SECRET` by running: `openssl rand -base64 32` in your terminal
- Add these for **Production**, **Preview**, and **Development** environments

### 6.3 Configure Build Settings

Vercel auto-detects Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Root Directory**: `./` (default)

### 6.4 Deploy

Click **Deploy** and wait for the build to complete.

---

## Step 7: Post-Deployment Setup

### 7.1 Update Google OAuth Redirect URI

1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 Client ID
3. Add the production redirect URI:
   - `https://your-actual-domain.vercel.app/api/auth/callback/google`

### 7.2 Set Up Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://your-actual-domain.vercel.app/api/webhook`
3. Select the required events
4. Copy the webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### 7.3 Run Database Migrations

After first deployment, run migrations:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.production.local
npx prisma db push

# Option 2: Using production DATABASE_URL directly
DATABASE_URL="your-production-url" npx prisma db push
```

---

## Step 8: Verify Deployment

### 8.1 Test Checklist

- [ ] Homepage loads correctly
- [ ] Google OAuth login works
- [ ] Error explanation works (test with anonymous user - 2 allowed)
- [ ] Signed-in users can use 3 per day
- [ ] Stripe checkout works (use test mode)
- [ ] Webhook receives events (check Stripe Dashboard)
- [ ] Dashboard shows query history
- [ ] Pro subscription activates correctly

### 8.2 Common Issues

**Database Connection Error**:
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel
- Ensure SSL is enabled (add `?sslmode=require` to connection string if needed)

**OAuth Not Working**:
- Verify redirect URI matches exactly (including https)
- Check `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set

**Stripe Webhook Failing**:
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe Dashboard

**OpenRouter API Errors**:
- Verify API key is correct
- Check API key has sufficient credits
- Review OpenRouter dashboard for usage limits

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your app's public URL | `https://errmate.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENROUTER_API_KEY` | OpenRouter API key | From openrouter.ai |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Public app URL (same as NEXTAUTH_URL) | `https://errmate.vercel.app` |

---

## Local Production Testing

Test your production build locally:

```bash
# Pull production environment variables
vercel env pull .env.production.local

# Build and start
npm run build
npm start
```

---

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run builds automatically

---

## Monitoring & Analytics

Consider setting up:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking (optional)
- **Stripe Dashboard**: Monitor subscriptions and payments
- **OpenRouter Dashboard**: Monitor API usage and costs

---

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] Database connection uses SSL
- [ ] Stripe webhook secret is set correctly
- [ ] Google OAuth redirect URIs are restricted to your domain
- [ ] API keys are not exposed in client-side code

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Check Stripe webhook logs
4. Verify all environment variables are set
5. Test database connection separately

### 2. Database Setup

**Option A: Vercel Postgres (Recommended)**
- Add Vercel Postgres in your Vercel project
- Copy the connection string to `DATABASE_URL`
- Run migrations: `npx prisma db push`

**Option B: External PostgreSQL**
- Use services like Supabase, Neon, or Railway
- Add connection string to `DATABASE_URL`
- Run migrations: `npx prisma db push`

### 3. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URI:
   - `https://your-app.vercel.app/api/auth/callback/google`
3. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel

### 4. Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Build Settings

Vercel will auto-detect Next.js. Ensure:
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 6. Post-Deployment

1. Verify database connection
2. Test Google OAuth login
3. Test error explanation (free tier)
4. Test Stripe checkout (use test mode)
5. Verify webhook receives events

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database allows connections from Vercel IPs
- Run `npx prisma db push` locally with production URL

### OAuth Not Working
- Verify redirect URI matches exactly
- Check `NEXTAUTH_URL` matches your domain
- Ensure `NEXTAUTH_SECRET` is set

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe Dashboard

### OpenRouter API Errors
- Verify API key is correct
- Check API key has sufficient credits
- Review OpenRouter dashboard for usage

## Local Testing

Test production build locally:

```bash
npm run build
npm start
```

Test with production environment variables (use `.env.production.local`).



