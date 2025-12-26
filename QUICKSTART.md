# Quick Start Guide

Get ErrMate running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Database (use a free PostgreSQL from Supabase, Neon, or Railway)
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenRouter API (get from https://openrouter.ai)
OPENROUTER_API_KEY=your-api-key

# Stripe (use test keys from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Quick Setup:**
- Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Get Google OAuth: https://console.cloud.google.com/ → APIs & Services → Credentials
- Get OpenRouter key: https://openrouter.ai → Keys
- Get Stripe keys: https://dashboard.stripe.com/test/apikeys

## 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test the App

1. Click "Sign In with Google"
2. Go to `/app`
3. Paste an error message
4. Click "Explain Error"

## Next Steps

- See [README.md](./README.md) for full documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Troubleshooting

**Database connection error?**
- Check your `DATABASE_URL` format
- Ensure database is accessible from your IP

**OAuth not working?**
- Verify redirect URI: `http://localhost:3000/api/auth/callback/google`
- Check Google Cloud Console credentials

**OpenRouter API error?**
- Verify API key is correct
- Check you have credits in OpenRouter account



