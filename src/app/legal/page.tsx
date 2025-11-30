"use client";

import React from "react";
import Link from "next/link";

export default function LegalOverviewPage() {
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white py-20 px-6 flex justify-center">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Legal Information
        </h1>

        <p className="text-neutral-400 mb-12 max-w-2xl">
          Welcome to the Legal Center of Burnzy.  
          Here you can find all legally required documents, including our Terms of Service, Privacy Policy, 
          Cancellation & Refund Policy, and the Impressum (mandatory for Germany).
        </p>

        {/* Legal Sections */}
        <div className="space-y-8">

          {/* Impressum */}
          <section className="bg-[#12111A] border border-[#1F1E29] rounded-2xl p-8 shadow-lg hover:scale-[1.01] transition-transform">
            <h2 className="text-2xl font-bold mb-3">Impressum</h2>
            <p className="text-neutral-400 mb-4">
              Required by German law (§5 TMG / §18 MStV).  
              Contains owner information, address, and contact details.
            </p>
            <Link
              href="/legal/impressum"
              className="text-[#00F5A0] hover:underline font-medium"
            >
              View Impressum →
            </Link>
          </section>

          {/* Privacy Policy */}
          <section className="bg-[#12111A] border border-[#1F1E29] rounded-2xl p-8 shadow-lg hover:scale-[1.01] transition-transform">
            <h2 className="text-2xl font-bold mb-3">Privacy Policy</h2>
            <p className="text-neutral-400 mb-4">
              Explains how Burnzy collects, processes, and stores your data, 
              including information handled by Stripe, Google, and YouTube APIs.
            </p>
            <Link
              href="/legal/privacy"
              className="text-[#00F5A0] hover:underline font-medium"
            >
              Read Privacy Policy →
            </Link>
          </section>

          {/* Terms of Service */}
          <section className="bg-[#12111A] border border-[#1F1E29] rounded-2xl p-8 shadow-lg hover:scale-[1.01] transition-transform">
            <h2 className="text-2xl font-bold mb-3">Terms of Service</h2>
            <p className="text-neutral-400 mb-4">
              The rules and conditions for using Burnzy, including subscriptions, 
              responsibilities, limitations of liability, and acceptable use.
            </p>
            <Link
              href="/legal/terms"
              className="text-[#00F5A0] hover:underline font-medium"
            >
              View Terms of Service →
            </Link>
          </section>

          {/* Refund & Cancellation */}
          <section className="bg-[#12111A] border border-[#1F1E29] rounded-2xl p-8 shadow-lg hover:scale-[1.01] transition-transform">
            <h2 className="text-2xl font-bold mb-3">Cancellation & Refund Policy</h2>
            <p className="text-neutral-400 mb-4">
              Information about your 14-day withdrawal right, cancellations, 
              subscription end-of-cycle rules, and refunds processed via Stripe.
            </p>
            <Link
              href="/legal/refunds"
              className="text-[#00F5A0] hover:underline font-medium"
            >
              View Refund Policy →
            </Link>
          </section>

        </div>

        {/* Footer */}
        <p className="text-neutral-500 text-sm mt-12">
          For any questions, contact us at{" "}
          <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
            contact@burnzy.co
          </a>
        </p>

      </div>
    </div>
  );
}
