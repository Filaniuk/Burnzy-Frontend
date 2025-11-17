"use client";
import Link from "next/link";

export default function BillingCancel() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-white">
      <h1 className="text-3xl font-bold text-red-500">❌ Payment Canceled</h1>
      <p className="mt-4 text-neutral-400">
        Your payment was canceled. You can try again anytime.
      </p>
      <Link
        href="/pricing"
        className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-medium"
      >
        Back to Pricing
      </Link>
    </div>
  );
}
