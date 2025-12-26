import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (subscription.status === "canceling" || subscription.status === "canceled") {
      return NextResponse.json(
        { error: "Subscription is already canceled or being canceled" },
        { status: 400 }
      );
    }

    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return NextResponse.json(
        { error: "Subscription is not active" },
        { status: 400 }
      );
    }

    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true, // Cancel at end of billing period
      }
    );

    // Update subscription status in database
    // Use "canceling" status to indicate it's canceled but still active until period ends
    const newStatus: string = canceledSubscription.cancel_at_period_end ? "canceling" : canceledSubscription.status;
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: newStatus,
      },
    });

    const cancelAt = canceledSubscription.cancel_at || canceledSubscription.current_period_end;

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
      cancelAt: cancelAt,
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

