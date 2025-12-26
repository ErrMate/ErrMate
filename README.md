# ErrMate

**Paste any error. Understand it. Fix it.**

ErrMate is an AI-powered error analysis tool that helps developers understand and fix errors quickly. Built with Next.js, OpenRouter AI, Stripe, and PostgreSQL.

## Features

- 🔍 **Error Analysis**: Paste any error or stack trace and get structured explanations
- 📝 **Context Support**: Add additional context from logs, GitHub issues, or StackOverflow
- 🎯 **Tech-Specific**: Select your tech context (JavaScript, React, Node.js, Browser, Other)
- 🆓 **Free Tier**: 3 explanations per day
- 💎 **Pro Tier**: Unlimited explanations via Stripe subscription ($9.99/month)
- 🎨 **Glassmorphic UI**: Beautiful, modern design with glassmorphic effects
- 🔐 **Google Auth**: Secure authentication via NextAuth.js

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS with glassmorphic design
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenRouter API (GPT-4o-mini)
- **Payments**: Stripe
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials
- OpenRouter API key
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENROUTER_API_KEY`: From https://openrouter.ai
- `STRIPE_SECRET_KEY`: From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET`: From Stripe Dashboard (webhook endpoint)
- `NEXT_PUBLIC_APP_URL`: Your app URL

3. **Set up the database:**

```bash
npx prisma generate
npx prisma db push
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up a webhook endpoint:
   - URL: `https://your-domain.com/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Database Schema

The app uses Prisma with the following models:
- `User`: User accounts (via NextAuth)
- `Account`: OAuth account connections
- `Session`: User sessions
- `UsageTracking`: Daily usage tracking for free tier
- `Subscription`: Stripe subscription status

## API Routes

- `POST /api/explain-error`: Analyzes error using OpenRouter AI
- `POST /api/create-checkout`: Creates Stripe checkout session
- `POST /api/webhook`: Handles Stripe webhook events
- `GET /api/usage`: Returns current usage count and subscription status

## Deployment to Vercel

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel:**

- Import your GitHub repository in Vercel
- Add all environment variables in Vercel dashboard
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel URL
- Deploy!

3. **Update OAuth redirect URI:**

- Add your Vercel URL to Google OAuth authorized redirect URIs
- Format: `https://your-app.vercel.app/api/auth/callback/google`

4. **Update Stripe webhook:**

- Add your Vercel webhook URL in Stripe Dashboard
- Format: `https://your-app.vercel.app/api/webhook`

5. **Run database migrations:**

```bash
npx prisma db push
```

## Project Structure

```
ErrMate/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── explain-error/route.ts
│   │   ├── create-checkout/route.ts
│   │   ├── webhook/route.ts
│   │   └── usage/route.ts
│   ├── app/
│   │   └── page.tsx          # Main app page
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## Features in Detail

### Error Explanation

The AI analyzes errors using a structured prompt that includes:
1. Plain English explanation
2. Likely root causes
3. Step-by-step fixes
4. Prevention tips

### Usage Tracking

- Free users: 3 explanations per day (resets at midnight)
- Pro users: Unlimited explanations
- Usage tracked in PostgreSQL with daily reset

### Subscription Management

- Stripe Checkout for subscription creation
- Webhook handles subscription updates
- Status stored in PostgreSQL

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, OpenRouter, and Stripe.

