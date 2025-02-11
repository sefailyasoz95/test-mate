import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServer } from "@/lib/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const relevantEvents = new Set([
  "checkout.session.completed",
  "payment_intent.succeeded",
]);

// Disable edge runtime as it's causing issues with crypto
// export const runtime = "edge";

// Disable body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { app_id, user_id, package_type } = session.metadata || {};

      if (!app_id || !user_id || !package_type) {
        return NextResponse.json(
          { error: "Missing required metadata" },
          { status: 400 }
        );
      }

      const supabase = await createServer({ cookies: () => request.cookies });

      await supabase.from("purchases").insert({
        user_id,
        app_id,
        package_type,
        amount: session.amount_total! / 100,
        status: "completed",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Webhook signature verification failed: " + JSON.stringify(err),
      },
      { status: 400 }
    );
  }
}
