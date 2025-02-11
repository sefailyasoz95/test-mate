import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET() {
  try {
    const { data: products } = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });
    const formattedProducts = products
      .filter((product) => product.name.includes("TestMate"))
      .map((product) => {
        const price = product.default_price as Stripe.Price;
        return {
          id: product.id,
          priceId: price.id,
          name: product.name,
          description: product.description,
          priceAmount: (price.unit_amount || 0) / 100,
          price: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currency,
          }).format((price.unit_amount || 0) / 100),
        };
      })
      .sort((a, b) => a.priceAmount - b.priceAmount)
      .map(({ priceAmount, ...product }) => product);

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error fetching products",
      },
      { status: 500 }
    );
  }
}
