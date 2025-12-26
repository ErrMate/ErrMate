# ErrMate

<div align="center">

**Paste any error. Understand it. Fix it.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

An AI-powered error analysis tool that helps developers understand and fix errors quickly.

[Features](#-features) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## ✨ Features

- 🔍 **Intelligent Error Analysis** - Paste any error or stack trace and get structured, detailed explanations
- 📝 **Context Support** - Add additional context from logs, GitHub issues, or StackOverflow for better analysis
- 🎯 **Tech-Specific Analysis** - Select your tech context (JavaScript, React, Node.js, Python, Java, and more)
- 🆓 **Free Tier** - 2 explanations overall (anonymous) or 3 per day (signed in)
- 💎 **Pro Tier** - Unlimited explanations via Stripe subscription ($9.99/month)
- 🎨 **Modern UI** - Beautiful, responsive design with glassmorphic effects
- 🔐 **Secure Auth** - Google OAuth authentication via NextAuth.js
- 📊 **Query History** - View and manage your past error analyses
- 🔗 **Resource Links** - Get relevant documentation, blog posts, and Stack Overflow links

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenRouter API
- **Payments**: Stripe (subscriptions)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (free options: [Supabase](https://supabase.com) or [Neon](https://neon.tech))
- Google OAuth credentials
- OpenRouter API key ([get one here](https://openrouter.ai))
- Stripe account ([sign up here](https://stripe.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/errmate.git
cd errmate
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Database
DATABASE_URL=<your PostgreSQL connection string>

# OpenRouter AI
OPENROUTER_API_KEY=<from openrouter.ai>

# Stripe
STRIPE_SECRET_KEY=<from Stripe Dashboard>
STRIPE_WEBHOOK_SECRET=<from Stripe Dashboard>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Service Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys
3. Set up a webhook endpoint (after deployment):
   - URL: `https://your-domain.com/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### OpenRouter

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up and create an API key
3. Add credits to your account
4. Copy the API key to `OPENROUTER_API_KEY`

## 📁 Project Structure

```
ErrMate/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   │   ├── explain-error/route.ts         # AI error analysis
│   │   ├── create-checkout/route.ts       # Stripe checkout
│   │   ├── webhook/route.ts               # Stripe webhooks
│   │   ├── usage/route.ts                 # Usage tracking
│   │   ├── queries/route.ts               # Query history
│   │   └── cancel-subscription/route.ts   # Subscription management
│   ├── error-analyzer/
│   │   └── page.tsx                       # Main error analyzer page
│   ├── query-history/
│   │   └── page.tsx                       # Query history page
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Landing page
│   └── globals.css                        # Global styles
├── components/
│   ├── Header.tsx                         # Navigation header
│   ├── Footer.tsx                         # Footer
│   ├── Logo.tsx                           # Logo component
│   ├── BugIcon.tsx                        # Bug icon component
│   ├── Tooltip.tsx                        # Tooltip component
│   ├── Modal.tsx                          # Modal component
│   ├── ConfirmModal.tsx                   # Confirmation modal
│   ├── Dropdown.tsx                       # Dropdown component
│   ├── ResourceTabs.tsx                   # Resource tabs
│   └── UserProfileDropdown.tsx           # User profile dropdown
├── lib/
│   ├── prisma.ts                          # Prisma client
│   └── auth.ts                            # NextAuth configuration
├── prisma/
│   └── schema.prisma                      # Database schema
├── public/
│   ├── favicon.svg                        # Favicon
│   └── logo_1.png                         # Logo image
└── package.json
```

## 🗄️ Database Schema

The app uses Prisma with the following models:

- **User** - User accounts (via NextAuth)
- **Account** - OAuth account connections (NextAuth)
- **Session** - User sessions (NextAuth)
- **UsageTracking** - Daily usage tracking for free tier
- **Subscription** - Stripe subscription status
- **QueryResponse** - Stored query history and explanations

## 🔌 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/explain-error` | POST | Analyzes error using OpenRouter AI |
| `/api/create-checkout` | POST | Creates Stripe checkout session |
| `/api/webhook` | POST | Handles Stripe webhook events |
| `/api/usage` | GET | Returns current usage count and subscription status |
| `/api/queries` | GET | Returns user's query history |
| `/api/cancel-subscription` | POST | Cancels user subscription |

## 🚀 Deployment

### Free Deployment Guide

**Complete step-by-step guide:** See [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md)

This comprehensive guide covers:
- ✅ Deploying to Vercel (FREE hosting)
- ✅ Setting up free PostgreSQL database (Supabase/Neon)
- ✅ Configuring all services (Google OAuth, Stripe, OpenRouter)
- ✅ Adding custom domain (optional)
- ✅ **Total cost: $0/month** (just domain ~$1/month if you want custom domain)

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

For detailed instructions, see [FREE_DEPLOYMENT.md](./FREE_DEPLOYMENT.md).

## 💡 Features in Detail

### Error Explanation

The AI analyzes errors using a structured prompt that includes:
1. **Plain English explanation** - Understand what went wrong
2. **Likely root causes** - Identify potential issues
3. **Step-by-step fixes** - Clear resolution steps
4. **Prevention tips** - Avoid similar errors in the future

### Usage Tracking

- **Anonymous users**: 2 explanations overall (tracked in localStorage)
- **Signed-in users**: 3 explanations per day (resets at midnight)
- **Pro users**: Unlimited explanations
- Usage tracked in PostgreSQL with daily reset

### Subscription Management

- Stripe Checkout for subscription creation
- Webhook handles subscription updates automatically
- Status stored in PostgreSQL
- Easy cancellation with end-of-period access

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenRouter](https://openrouter.ai)
- Payments handled by [Stripe](https://stripe.com)
- Authentication via [NextAuth.js](https://next-auth.js.org/)

---

<div align="center">

**Built with ❤️ using Next.js, OpenRouter, and Stripe**

[⭐ Star this repo](https://github.com/yourusername/errmate) if you find it helpful!

</div>
