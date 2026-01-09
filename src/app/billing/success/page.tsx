"use client";
import Link from "next/link";

export default function BillingSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-white">
      <h1 className="text-3xl font-bold text-[#00F5A0]">✅ Payment Successful</h1>
      <p className="mt-4 text-neutral-400">
        Your plan has been activated. You can now access all premium features.
      </p>
      <Link
        href="/pricing"
        className="mt-6 bg-[#00F5A0] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#00d98b]"
      >
        Go to Pricing Page
      </Link>
    </div>
  );
}
