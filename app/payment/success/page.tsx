"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      toast.success("Payment successful!", {
        description: "Redirecting to dashboard...",
      });
      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
      }, 3000);
    }
  }, [sessionId]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      <p>Redirecting you back to dashboard...</p>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
