import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-01-27.acacia",
});

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

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
	} catch (err) {
		return NextResponse.json(
			{ error: "Webhook signature verification failed: " + JSON.stringify(err) },
			{ status: 400 }
		);
	}

	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const { order_id, app_id, user_id, package_id, quantity } = session.metadata || {};

		if (!order_id || !app_id || !user_id || !package_id) {
			return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
		}

		const supabase = createAdminClient();

		// Mark order paid + record the payment intent
		await supabase
			.from("orders")
			.update({
				status: "paid",
				stripe_payment_intent: (session.payment_intent as string) ?? null,
			})
			.eq("id", order_id);

		// Idempotency: don't create a second cycle if one already exists
		const { data: existing } = await supabase
			.from("test_cycles")
			.select("id")
			.eq("order_id", order_id)
			.maybeSingle();

		if (!existing) {
			const { data: pkg } = await supabase
				.from("packages")
				.select("tester_count")
				.eq("id", package_id)
				.single();

			const qty = Number(quantity) || 1;
			const testerTarget = (pkg?.tester_count ?? 12) * qty;

			await supabase.from("test_cycles").insert({
				order_id,
				app_id,
				user_id,
				status: "pending_setup",
				tester_target: testerTarget,
			});
		}

		return NextResponse.json({ status: "success" });
	}

	return NextResponse.json({ received: true });
}
