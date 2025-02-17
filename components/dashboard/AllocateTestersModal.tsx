"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: string;
  link: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function AllocateTestersModal({
  appId,
  appName,
  userId,
}: {
  appId: string;
  appName: string;
  userId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    open && fetchProducts();
  }, [open]);

  const features = {
    single_tester: [
      "1 Pre-verified Tester",
      "Instant Access",
      "Google Play Ready",
      "24/7 Support",
    ],
    full_package: [
      "12 Pre-verified Testers",
      "Instant Access",
      "Google Play Ready",
      "24/7 Support",
      "Priority Support",
      "Detailed Feedback",
    ],
  };

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Allocate Testers
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[1100px] h-[90vh] overflow-y-auto">
        <DialogHeader className="px-2">
          <DialogTitle className="text-2xl md:text-3xl text-center mb-4">
            Select Testing Package for {appName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose a package to allocate testers for your app
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-3 p-2">
          {isLoading ? (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Loading packages...
            </p>
          ) : (
            products.map((product) => {
              const isFull = product.name.includes("12");
              const featureList = isFull
                ? features.full_package
                : features.single_tester;

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 flex flex-col",
                    "hover:border-primary/50 hover:shadow-xl hover:-translate-y-1",
                    isFull &&
                      "md:border-primary md:shadow-lg bg-gradient-to-br from-primary/5 to-background"
                  )}
                >
                  {isFull && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-bl-lg">
                      Popular
                    </div>
                  )}
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base leading-relaxed">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-3xl md:text-4xl font-bold mb-6 flex items-baseline gap-2">
                      {product.price}
                    </div>
                    <ul className="space-y-3">
                      {featureList.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 animate-in fade-in slide-in-from-left-1 duration-300" />
                          <span className="text-sm md:text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <Button
                      className={cn(
                        "w-full py-6 transition-all duration-300",
                        isFull
                          ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                          : "hover:bg-primary/10"
                      )}
                      size="lg"
                      variant={isFull ? "default" : "outline"}
                      onClick={async () => {
                        try {
                          if (isFull) {
                            toast.error(
                              "While MVP is in progress, we cannot offer this package"
                            );
                            return;
                          }
                          const stripe = await stripePromise;
                          if (!stripe) throw new Error("Stripe failed to load");

                          const response = await fetch(
                            "/api/create-checkout-session",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                appId,
                                userId,
                                productId: product.priceId,
                                packageType: product.name.includes("Active")
                                  ? "full_package"
                                  : "single_tester",
                              }),
                            }
                          );

                          const { sessionId } = await response.json();
                          const result = await stripe.redirectToCheckout({
                            sessionId,
                          });

                          if (result.error) {
                          }
                        } catch (error) {}
                      }}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
