import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
	try {
		const { appId, userId, productId, packageType, quantity = 1 } = await req.json();

		// Get base URL from request
		const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price: productId,
					quantity: packageType === "single_tester" ? Math.min(quantity, 5) : 1,
				},
			],
			mode: "payment",
			success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&appId=${appId}`,
			cancel_url: `${origin}/dashboard`,
			metadata: {
				app_id: appId,
				user_id: userId,
				package_type: packageType,
			},
		});

		return NextResponse.json({ sessionId: session.id });
	} catch (error) {
		return NextResponse.json({ error: "Error creating checkout session" }, { status: 500 });
	}
}
