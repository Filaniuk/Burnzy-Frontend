"use client";

import React from "react";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#0F0E17] text-white py-16 px-6 flex justify-center">
            <div className="max-w-4xl w-full bg-[#12111A] p-10 rounded-2xl shadow-lg border border-[#1F1E29]">

                <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
                    Terms of Service
                </h1>

                <p className="text-neutral-400 mb-6">
                    Last updated: 30.11.2025
                </p>

                <p className="mb-6">
                    Welcome to Burnzy. These Terms of Service (“Terms”) govern your access
                    to and use of Burnzy (“Service”). By accessing or using the Service,
                    you agree to be bound by these Terms.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">1. About Burnzy</h2>
                <p className="mb-6">
                    Burnzy is operated by:
                    <br />
                    <br />
                    <strong>Mikalai Filaniuk</strong>
                    <br />
                    Friedrichstraße 34
                    <br />
                    80801 München
                    <br />
                    Germany
                    <br />
                    Email: contact@burnzy.co
                    <br />
                    <br />
                    Burnzy offers automated YouTube channel analysis, trend detection, and
                    AI-powered content idea generation for creators.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">2. Eligibility</h2>
                <p className="mb-6">
                    Burnzy is available for users of all ages. If you are under 18, you
                    may only use the Service with permission from a parent or guardian.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    3. Account Registration and Security
                </h2>
                <p className="mb-6">
                    To use Burnzy, you must register using a valid email. You are
                    responsible for maintaining the confidentiality of your account and
                    all activity that occurs under it.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    4. Service Plans & Subscriptions
                </h2>
                <p className="mb-6">
                    Burnzy provides free and paid subscription tiers. Paid plans are
                    billed monthly through Stripe. By subscribing, you authorize Burnzy to
                    charge your payment method on a recurring basis until you cancel.
                    <br />
                    <br />
                    As a <strong>Kleinunternehmer under §19 UStG</strong>, no VAT/USt is
                    charged on purchases.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    5. AI Processing & Data Sources
                </h2>
                <p className="mb-6">
                    Burnzy uses AI models and public YouTube API data to generate
                    insights. No user-uploaded media files are processed. Burnzy does not
                    use your data for AI model training.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    6. Intellectual Property
                </h2>
                <p className="mb-6">
                    Burnzy retains all rights to its software, algorithms, branding, and
                    platform content. You receive a limited, non-transferable license to
                    use the Service for personal or business content creation.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">7. User Obligations</h2>
                <p className="mb-6">
                    Users must comply with applicable laws and YouTube’s Terms of Service.
                    You are solely responsible for decisions made based on Burnzy’s
                    AI-generated insights.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">8. Acceptable Use</h2>
                <p className="mb-6">
                    You may not:
                </p>
                <ul className="list-disc ml-6 mb-6 space-y-2 text-neutral-300">
                    <li>Use Burnzy for unlawful purposes</li>
                    <li>Attempt to reverse-engineer or copy the Service</li>
                    <li>Use automation to bypass rate limits or analysis quotas</li>
                    <li>Harass or misuse the system to harm others</li>
                    <li>Resell Burnzy-generated insights as a competing product</li>
                </ul>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    9. Payments, Billing & Refunds
                </h2>
                <p className="mb-6">
                    Subscriptions renew automatically each month. You may cancel at any
                    time, but cancellation only takes effect at the end of the current
                    billing cycle.
                    <br />
                    <br />
                    Due to the nature of digital services,{" "}
                    <strong>all payments are final and non-refundable</strong>, except
                    where required by law.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    10. Right of Withdrawal (EU 14-Day Consumer Rights)
                </h2>

                <p className="mb-6">
                    If you are a consumer residing in the European Union, you have a statutory
                    <strong> 14-day right of withdrawal</strong> for digital service purchases.
                    However, this right can expire early to avoid misuse when you choose to access a digital
                    service immediately.
                </p>

                <h3 className="text-xl font-semibold mb-3">Early Expiration of Withdrawal Rights</h3>

                <p className="mb-6">
                    By purchasing and using Burnzy, you expressly request and consent to the
                    immediate start of the digital service. You acknowledge and agree that:
                </p>

                <ul className="list-disc ml-6 mb-6 space-y-2 text-neutral-300">
                    <li>The service is provided immediately after purchase</li>
                    <li>You gain instant access to digital content and AI-generated analysis</li>
                    <li>
                        Because the service is fully delivered instantly and cannot be returned,
                        your statutory withdrawal right
                        <strong>expires immediately upon the start of service provision</strong>,
                        in accordance with Article 16(m) of the EU Consumer Rights Directive and
                        §356(5) BGB.
                    </li>
                </ul>

                <p className="mb-6">
                    If you do not wish the withdrawal right to expire immediately, do not start
                    using Burnzy during the 14-day period. Accessing paid features constitutes
                    your clear request for immediate delivery.
                </p>

                <h3 className="text-xl font-semibold mb-3">Users Outside the EU</h3>
                <p className="mb-6">
                    Refund, cancellation, and withdrawal rights vary between jurisdictions.
                    Burnzy provides refunds outside the EU only where legally required.
                    In all other cases, <strong>payments are final and non-refundable</strong>.
                </p>

                <p className="mb-6">
                    For any questions or exceptional cases, please contact us at{" "}
                    <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
                        contact@burnzy.co
                    </a>.
                </p>


                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">11. Cancellation</h2>
                <p className="mb-6">
                    You may cancel your subscription at any time via the dashboard. You
                    will retain access until the end of your billing period, after which
                    your plan will downgrade to Free.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    12. Availability & Service Changes
                </h2>
                <p className="mb-6">
                    Burnzy is provided on a best-effort basis. We do not guarantee
                    uninterrupted availability or error-free operation. Features may be
                    added, changed, or removed at any time.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">13. Disclaimers</h2>
                <p className="mb-6">
                    Burnzy makes no guarantees regarding the accuracy of AI-generated
                    content or improvements to your YouTube channel. The Service is
                    provided “as is” without warranty of any kind.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    14. Limitation of Liability
                </h2>
                <p className="mb-6">
                    To the maximum extent permitted by German law, Burnzy shall not be
                    liable for indirect damages, lost profits, loss of data, or any
                    decisions made based on AI insights. Total liability is limited to the
                    amount you paid in the previous 12 months or €50, whichever is higher.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">15. Governing Law</h2>
                <p className="mb-6">
                    These Terms are governed by the laws of Germany. Jurisdiction is
                    Munich, Germany.
                </p>

                {/* -------------------------------- */}
                <h2 className="text-2xl font-bold mt-10 mb-4">
                    16. Contact Information
                </h2>
                <p className="mb-6">
                    For legal questions, please contact us:
                    <br />
                    <strong>Email:</strong> contact@burnzy.co
                </p>
            </div>
        </div>
    );
}
