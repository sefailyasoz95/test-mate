import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-01-27.acacia",
});

// Create a pending order + a Stripe Checkout session priced from the DB package.
// Pricing is dynamic (price_data) so packages live entirely in the DB.
export async function POST(req: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { appId, packageId, quantity = 1 } = await req.json();
		if (!appId || !packageId) {
			return NextResponse.json(
				{ error: "appId and packageId are required" },
				{ status: 400 }
			);
		}

		const supabase = createAdminClient();

		// Validate app ownership
		const { data: app } = await supabase
			.from("apps")
			.select("id, user_id, name")
			.eq("id", appId)
			.single();
		if (!app || app.user_id !== user.id) {
			return NextResponse.json({ error: "App not found" }, { status: 404 });
		}

		// Load the package
		const { data: pkg } = await supabase
			.from("packages")
			.select("*")
			.eq("id", packageId)
			.eq("active", true)
			.single();
		if (!pkg) {
			return NextResponse.json({ error: "Invalid package" }, { status: 400 });
		}

		const isSingle = pkg.code === "single";
		const qty = isSingle ? Math.max(1, Math.min(Number(quantity) || 1, 12)) : 1;
		const amount = Number(pkg.price_usd) * qty;

		// Create the pending order up front (so the webhook can resolve it)
		const { data: order, error: orderErr } = await supabase
			.from("orders")
			.insert({
				user_id: user.id,
				app_id: appId,
				package_id: pkg.id,
				amount_usd: amount,
				status: "pending",
			})
			.select()
			.single();
		if (orderErr || !order) {
			return NextResponse.json(
				{ error: orderErr?.message ?? "Failed to create order" },
				{ status: 500 }
			);
		}

		const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			payment_method_types: ["card"],
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: "usd",
						unit_amount: Math.round(amount * 100),
						product_data: {
							name: `TestMate — ${pkg.name}${isSingle && qty > 1 ? ` x${qty}` : ""}`,
							description: app.name,
						},
					},
				},
			],
			success_url: `${origin}/dashboard?order=${order.id}`,
			cancel_url: `${origin}/dashboard`,
			metadata: {
				order_id: order.id,
				app_id: appId,
				user_id: user.id,
				package_id: pkg.id,
				quantity: String(qty),
			},
		});

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Error creating checkout session" },
			{ status: 500 }
		);
	}
}
