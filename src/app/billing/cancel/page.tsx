"use client";

import Link from "next/link";
import { useEffect } from "react";
import posthog from "posthog-js";

export default function BillingCancel() {
  useEffect(() => {
    posthog.capture("billing_payment_canceled_viewed");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-white">
      <h1 className="text-3xl font-bold text-red-500">❌ Payment Canceled</h1>
      <p className="mt-4 text-neutral-400">
        Your payment was canceled. You can try again anytime.
      </p>

      <Link
        href="/pricing"
        onClick={() => posthog.capture("billing_cancel_back_to_pricing_clicked")}
        className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-medium"
      >
        Back to Pricing
      </Link>
    </div>
  );
}
