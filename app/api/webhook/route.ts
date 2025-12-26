import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;

        if (!customerId) {
          console.error("No customerId found in checkout session", { sessionId: session.id });
          break;
        }

        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (!userId) {
          console.error("No userId found in customer metadata", { customerId });
          break;
        }

        const subscriptionId = session.subscription as string | null;
        
        let subscriptionStatus = "pending";
        if (subscriptionId) {
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionStatus = stripeSubscription.status;
          } catch (err: any) {
            console.error("Error retrieving subscription from Stripe", {
              error: err.message,
              subscriptionId,
            });
            if (session.payment_status === "paid") {
              subscriptionStatus = "active";
            }
          }
        } else if (session.payment_status === "paid") {
          subscriptionStatus = "active";
        }

        const updated = await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: subscriptionStatus,
            stripeSubscriptionId: subscriptionId || undefined,
            stripeCustomerId: customerId,
          },
          create: {
            userId,
            stripeCustomerId: customerId,
            status: subscriptionStatus,
            stripeSubscriptionId: subscriptionId || undefined,
          },
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        if (!customerId) {
          console.error("No customerId found in subscription", { subscriptionId: subscription.id });
          break;
        }

        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (!userId) {
          console.error("No userId found in customer metadata", { customerId });
          break;
        }

        // If cancel_at_period_end is true, set status to "canceling"
        // Otherwise use the Stripe status
        let subscriptionStatus: string = subscription.status;
        if (subscription.cancel_at_period_end && subscription.status === "active") {
          subscriptionStatus = "canceling";
        }

        const updated = await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: subscriptionStatus as string,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: customerId,
          },
          create: {
            userId,
            stripeCustomerId: customerId,
            status: subscriptionStatus as string,
            stripeSubscriptionId: subscription.id,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        if (!customerId) {
          console.error("No customerId found in subscription", { subscriptionId: subscription.id });
          break;
        }

        const customer = await stripe.customers.retrieve(customerId);
        const userId = (customer as Stripe.Customer).metadata?.userId;

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              status: "canceled",
              stripeSubscriptionId: subscription.id,
            },
            create: {
              userId,
              stripeCustomerId: customerId,
              status: "canceled",
              stripeSubscriptionId: subscription.id,
            },
          });

        }
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

