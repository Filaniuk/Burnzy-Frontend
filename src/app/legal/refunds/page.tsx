"use client";

import { posthog } from "posthog-js";
import React from "react";

export default function CancellationRefundPage() {
    posthog.capture("refunds_viewed");

    return (
        <div className="min-h-screen bg-[#0F0E17] text-white py-16 px-6 flex justify-center">
            <div className="max-w-4xl w-full bg-[#12111A] p-10 rounded-2xl shadow-lg border border-[#1F1E29]">

                <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
                    Cancellation & Refund Policy
                </h1>

                <p className="text-neutral-400 mb-10">
                    Last updated: {new Date().toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    })}
                </p>

                {/* Introduction */}
                <section className="mb-10">
                    <p className="mb-4">
                        This Cancellation & Refund Policy explains your rights regarding
                        subscription cancellations, upgrades, downgrades, and legally
                        required withdrawal rights for EU consumers. This policy applies to
                        all purchases made on <strong>Burnzy</strong> (burnzy.co).
                    </p>

                    <p className="mb-4">
                        Burnzy is operated by:
                    </p>

                    <p className="mb-1"><strong>Mikalai Filaniuk</strong></p>
                    <p className="mb-1">Friedrichstraße 34</p>
                    <p className="mb-1">80801 München, Germany</p>

                    <p className="mt-2">
                        Email:{" "}
                        <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
                            contact@burnzy.co
                        </a>
                    </p>
                </section>

                {/* 1. Cancellation */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">1. Cancelling Your Subscription</h2>

                    <p className="mb-4">
                        You may cancel your Burnzy subscription at any time through your
                        dashboard. Upon cancellation:
                    </p>

                    <ul className="list-disc ml-6 space-y-2 text-neutral-300">
                        <li>Your subscription remains active until the end of the current billing cycle.</li>
                        <li>You retain access to paid features until that date.</li>
                        <li>No additional payments will be charged after the current cycle ends.</li>
                        <li>Your account automatically switches to the Free plan at the end of the period.</li>
                    </ul>
                </section>

                {/* 2. EU Withdrawal */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">2. 14-Day Withdrawal (EU Right of Revocation)</h2>

                    <p className="mb-4">
                        EU consumers have a statutory <strong>14-day right of withdrawal</strong>
                        for digital services unless the right expires earlier due to immediate access.
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">Immediate Service & Early Expiration</h3>

                    <p className="mb-4">
                        Burnzy provides instant access to premium features immediately after purchase.
                        By starting to use any paid feature, you expressly request early service
                        delivery.
                    </p>

                    <p className="mb-4">
                        Under Article 16(m) of the EU Consumer Rights Directive and §356(5) BGB:
                        <strong> once service begins, the withdrawal right expires immediately.</strong>
                    </p>

                    <p className="text-neutral-300 italic mb-6">
                        Even if you contact us within 14 days, the withdrawal right no longer applies
                        if paid features were accessed.
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">How to Request Withdrawal (If Eligible)</h3>

                    <p className="mb-4">
                        If you did not access any paid features and wish to withdraw, contact us:
                    </p>

                    <p className="mb-4">
                        <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
                            contact@burnzy.co
                        </a>
                    </p>
                </section>

                {/* 3. Refunds */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">3. Refund Eligibility</h2>

                    <p className="mb-4">
                        Burnzy uses immediate delivery of digital services and prorated billing.
                        Refunds are therefore limited and are only provided when legally required or
                        in rare, exceptional cases at our discretion.
                    </p>

                    <ul className="list-disc ml-6 space-y-3 text-neutral-300 mb-6">

                        <li>
                            <strong>Upgrades:</strong> Upgrades take effect immediately. A prorated charge
                            is applied instantly. This charge is <strong>non-refundable</strong> because the
                            upgraded features are available immediately.
                        </li>

                        <li>
                            <strong>Downgrades:</strong> Downgrades take effect immediately. You receive a
                            prorated credit applied automatically to your next invoice. This is <strong>not</strong>
                            a refund to your payment method, but a billing credit.
                        </li>

                        <li>
                            If no paid features were accessed and the EU withdrawal right remains valid,
                            you may receive a full refund.
                        </li>

                        <li>
                            If paid features were accessed, the withdrawal right expires and
                            <strong> no refund</strong> will be granted.
                        </li>

                        <li>
                            Outside the EU, all payments are <strong>final and non-refundable</strong>
                            unless required by law.
                        </li>
                    </ul>

                    <p className="mt-4 mb-4">
                        All refunds, when applicable, are issued through Stripe to the original payment method.
                    </p>
                </section>

                {/* 4. No refunds after withdrawal window */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-4">4. No Refunds After the Withdrawal Window</h2>

                    <p className="mb-4">
                        After the 14-day withdrawal window expires, all subscription charges are final.
                        Cancellation stops future billing but does not entitle you to a refund for
                        past or partially used periods.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">5. Contact</h2>

                    <p className="mb-2">
                        For questions about cancellations or refunds, contact:
                    </p>

                    <p>
                        Email:{" "}
                        <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
                            contact@burnzy.co
                        </a>
                    </p>

                    <p className="mt-2 text-neutral-500 text-sm">
                        Include your account email and payment details to help us respond faster.
                    </p>
                </section>

            </div>
        </div>
    );
}
