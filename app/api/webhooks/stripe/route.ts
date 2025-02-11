import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Webhook event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Session metadata:", session.metadata);

      const appId = session.metadata?.app_id;
      const userId = session.metadata?.user_id;
      const packageType = session.metadata?.package_type;

      if (appId && userId && packageType) {
        const supabase = await createClient();

        // Create purchase record
        const { data, error } = await supabase.from("purchases").insert({
          user_id: userId,
          app_id: appId,
          package_type: packageType,
          amount: session.amount_total! / 100,
          status: "completed",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });

        if (error) {
          console.error("Error inserting purchase:", error);
          return NextResponse.json(
            { error: "Failed to create purchase" },
            { status: 500 }
          );
        }

        console.log("Purchase created successfully:", data);
      } else {
        console.error("Missing required metadata:", {
          appId,
          userId,
          packageType,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : ""}` },
      { status: 400 }
    );
  }
}
