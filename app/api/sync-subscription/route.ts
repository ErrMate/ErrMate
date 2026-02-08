import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = "force-dynamic";

/** Build usage-shaped response so client doesn't need to call /api/usage after sync */
function usageFromSubscription(
  subscription: { status: string; stripeSubscriptionId: string | null } | null
) {
  const isPro =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    subscription?.status === "canceling";
  const isCanceling = subscription?.status === "canceling";
  return {
    count: 0,
    isPro: !!isPro,
    limit: isPro ? Infinity : 3,
    isCanceling,
    cancelAt: null as number | null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (sessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
        const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
        return NextResponse.json({ updated: false, usage: usageFromSubscription(sub) });
      }

      const customerId = checkoutSession.customer as string;
      if (!customerId) {
        const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
        return NextResponse.json({ updated: false, usage: usageFromSubscription(sub) });
      }

      const customer = await stripe.customers.retrieve(customerId);
      const metadataUserId = (customer as Stripe.Customer).metadata?.userId;
      if (metadataUserId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id ?? null;
      let status = "active";
      let cancelAt: number | null = null;
      if (subscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          status = sub.status;
          if (sub.cancel_at_period_end && sub.status === "active") status = "canceling";
          cancelAt = sub.cancel_at || sub.current_period_end;
        } catch {
          // keep active if paid
        }
      }

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          status,
          stripeSubscriptionId: subscriptionId || undefined,
          stripeCustomerId: customerId,
        },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          status,
          stripeSubscriptionId: subscriptionId || undefined,
        },
      });

      const usage = {
        count: 0,
        isPro: status === "active" || status === "trialing" || status === "canceling",
        limit: Infinity,
        isCanceling: status === "canceling",
        cancelAt,
      };
      return NextResponse.json({ updated: true, usage });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId || subscription.status !== "pending") {
      return NextResponse.json({ updated: false, usage: usageFromSubscription(subscription) });
    }

    const stripeSubs = await stripe.subscriptions.list({
      customer: subscription.stripeCustomerId,
      status: "all",
      limit: 5,
    });

    const active = stripeSubs.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    if (!active) {
      return NextResponse.json({ updated: false, usage: usageFromSubscription(subscription) });
    }

    let subscriptionStatus: string = active.status;
    if (active.cancel_at_period_end && active.status === "active") {
      subscriptionStatus = "canceling";
    }
    const cancelAt = active.cancel_at || active.current_period_end;

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: subscriptionStatus,
        stripeSubscriptionId: active.id,
      },
    });

    const usage = {
      count: 0,
      isPro: true,
      limit: Infinity,
      isCanceling: subscriptionStatus === "canceling",
      cancelAt: subscriptionStatus === "canceling" ? cancelAt : null,
    };
    return NextResponse.json({ updated: true, usage });
  } catch (error: any) {
    console.error("Error in sync-subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
