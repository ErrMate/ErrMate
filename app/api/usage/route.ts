import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const FREE_LIMIT = 3;
const ANONYMOUS_LIMIT = 2; 

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        count: 0,
        isPro: false,
        limit: ANONYMOUS_LIMIT,
        isAnonymous: true,
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === "active" || subscription?.status === "trialing" || subscription?.status === "canceling";
    const isCanceling = subscription?.status === "canceling";

    let cancelAt: number | null = null;
    if (isCanceling && subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        cancelAt = stripeSubscription.cancel_at || stripeSubscription.current_period_end;
      } catch (error) {
        console.error("Error fetching subscription from Stripe:", error);
      }
    }

    if (isPro) {
      return NextResponse.json({ 
        count: 0, 
        isPro: true, 
        limit: Infinity,
        isCanceling: isCanceling || false,
        cancelAt: cancelAt
      });
    }

    // Count today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsage = await prisma.usageTracking.count({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
        },
      },
    });

    return NextResponse.json({
      count: todayUsage,
      isPro: false,
      limit: FREE_LIMIT,
    });
  } catch (error: any) {
    console.error("Error in usage route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

