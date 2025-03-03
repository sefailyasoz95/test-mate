"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const sessionId = searchParams.get("session_id");
  const appId = searchParams.get("appId");

  useEffect(() => {
    const updateAppStatus = async () => {
      if (!appId || isUpdated) return;

      setIsUpdating(true);

      try {
        const response = await fetch("/api/apps/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appId: appId,
            status: "purchased",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update app status");
        }

        setIsUpdated(true);
        toast.success("App status updated successfully!");
      } catch (error) {
        console.error("Error updating app status:", error);
        toast.error("Failed to update app status. Please contact support.");
      } finally {
        setIsUpdating(false);
      }
    };

    if (sessionId && appId) {
      updateAppStatus();
    }
  }, [sessionId, appId, isUpdated]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Payment Successful!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>
        {isUpdating ? (
          <p className="text-center text-sm text-muted-foreground">
            Updating app status...
          </p>
        ) : isUpdated ? (
          <p className="text-center text-sm text-green-500">
            App status updated to "purchased"
          </p>
        ) : null}
        <div className="flex justify-center pt-4">
          <Link href="/dashboard">
            <Button className="flex items-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
