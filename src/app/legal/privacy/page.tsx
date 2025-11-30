"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white py-16 px-6 flex justify-center">
      <div className="max-w-4xl w-full bg-[#12111A] p-10 rounded-2xl shadow-lg border border-[#1F1E29]">

        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-neutral-400 mb-1">
          This Privacy Policy explains how Burnzy collects, uses and protects your personal data.
        </p>
        <p className="text-neutral-500 text-sm mb-10">Last updated: 30.11.2025</p>

        {/* 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">1. Data Controller</h2>
          <p className="text-neutral-300 mb-2">
            The data controller responsible for processing your personal data in the sense of the GDPR is:
          </p>
          <p className="text-neutral-300 mb-2">
            <strong>Mikalai Filaniuk</strong>
            <br />
            Friedrichstraße 34
            <br />
            80801 München
            <br />
            Germany
          </p>
          <p className="text-neutral-300">
            Email:{" "}
            <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
              contact@burnzy.co
            </a>
          </p>
        </section>

        {/* 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">2. Scope of This Policy</h2>
          <p className="text-neutral-300">
            This Privacy Policy applies to the website and service available at{" "}
            <a href="https://burnzy.co" className="text-[#00F5A0] hover:underline">
              https://burnzy.co
            </a>{" "}
            and any subpages or backend services that belong to it. By creating an account or using Burnzy, you agree to
            the processing of your personal data as described in this policy.
          </p>
        </section>

        {/* 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">3. Data We Collect</h2>

          <h3 className="text-lg font-semibold mt-4 mb-1">3.1 Account and Authentication Data</h3>
          <p className="text-neutral-300 mb-4">
            When you create an account or log in, we collect your email address and a hashed version of your password.
            Passwords are never stored in plain text. We also use authentication cookies to keep you logged in and to
            secure access to your account.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-1">3.2 Usage and Technical Data</h3>
          <p className="text-neutral-300 mb-4">
            When you use Burnzy, our servers may automatically log technical data such as your IP address, browser type
            and version, device information, access times, and the pages or API endpoints you access. These logs help us
            operate and secure the service and to detect abuse or errors in our FastAPI backend and PostgreSQL
            database.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-1">3.3 Billing and Payment Data (Stripe)</h3>
          <p className="text-neutral-300 mb-4">
            Payments for Burnzy subscriptions are processed by our payment provider Stripe. We do not store full payment
            details such as full credit card numbers. On our side, we only store identifiers that are needed to manage
            your subscription, such as Stripe customer IDs, subscription IDs and price IDs and information about whether
            a payment or subscription is active, canceled or expired. All sensitive payment information is processed
            directly by Stripe in accordance with their own privacy policy.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-1">3.4 Cookies</h3>
          <p className="text-neutral-300">
            Burnzy uses cookies only for authentication and session management. These cookies are required to keep you
            logged in and to protect your account. We do not use cookies for advertising purposes and do not place
            third-party tracking or marketing cookies.
          </p>
        </section>

        {/* 4 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">4. Purposes and Legal Bases</h2>
          <p className="text-neutral-300">
            We process your personal data to create and manage your account, provide access to the features of Burnzy,
            manage your subscription, handle billing and payments, secure our systems, and comply with legal
            obligations. The legal basis for these processing activities is usually the performance of a contract with
            you (Art. 6(1)(b) GDPR), our legitimate interest in operating a secure and reliable service (Art. 6(1)(f)
            GDPR), or compliance with legal obligations (Art. 6(1)(c) GDPR), for example in the case of tax and billing
            records.
          </p>
        </section>

        {/* 5 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>

          <h3 className="text-lg font-semibold mt-4 mb-1">5.1 Stripe</h3>
          <p className="text-neutral-300 mb-4">
            We use Stripe to process payments securely. When you start or renew a subscription, your payment data is
            transferred directly to Stripe. Stripe may process data such as your payment method, billing address and
            transaction details. We only receive the information needed to manage your subscription internally, such as
            Stripe customer IDs and subscription status. For more information, please refer to Stripe’s own privacy
            policy at{" "}
            <a href="https://stripe.com/privacy" className="text-[#00F5A0] hover:underline">
              stripe.com/privacy
            </a>
            .
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-1">5.2 Other Technical Services</h3>
          <p className="text-neutral-300">
            Burnzy is built using technologies such as FastAPI, PostgreSQL and React. These technologies themselves do
            not involve separate data controllers but are tools used on our own infrastructure or hosting provider to
            deliver the service.
          </p>
        </section>

        {/* 6 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">6. Data Storage and Retention</h2>
          <p className="text-neutral-300">
            Your account and usage data are stored in our databases as long as your account is active. If you request
            deletion of your account, we will delete or anonymize your personal data, unless we are legally required to
            keep it longer. Billing and payment related information may need to be stored for several years to comply
            with German tax and commercial law. Log data used for security and debugging is typically retained only for
            a limited period.
          </p>
        </section>

        {/* 7 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">7. Your Rights</h2>
          <p className="text-neutral-300 mb-4">
            Under the GDPR, you have various rights regarding your personal data. You have the right to request access
            to the data we store about you and to receive a copy of it. You may ask us to correct inaccurate data or to
            delete your personal data where the legal requirements are met. You may also request that we restrict
            certain processing activities, object to processing based on legitimate interests, and request data
            portability for information you have provided. If you have given consent for a specific processing activity,
            you can withdraw that consent at any time with effect for the future.
          </p>
          <p className="text-neutral-300">
            If you believe that we are not handling your personal data in accordance with data protection laws, you have
            the right to file a complaint with a data protection supervisory authority. In Germany, this is in
            particular the authority of your place of residence or the Bayerisches Landesamt für Datenschutzaufsicht
            (BayLDA) for Bavaria.
          </p>
        </section>

        {/* 8 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">8. Data Deletion and Account Closure</h2>
          <p className="text-neutral-300">
            You may request deletion of your account and personal data at any time by contacting us via email. Once we
            verify your identity, we will delete or anonymize your data unless legal retention obligations require us to
            keep certain records for a longer period. Subscription and payment data that is required for accounting and
            tax purposes can only be deleted once those obligations have expired.
          </p>
        </section>

        {/* 9 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">9. Security Measures</h2>
          <p className="text-neutral-300">
            We take appropriate technical and organizational measures to protect your personal data against
            unauthorized access, loss, misuse or alteration. This includes the use of HTTPS encryption, hashed and
            salted passwords, access controls on our backend systems and monitoring for suspicious activity. No system
            can be absolutely secure, but we strive to follow industry best practices to keep your data safe.
          </p>
        </section>

        {/* 10 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">10. International Data Transfers</h2>
          <p className="text-neutral-300">
            Some of our service providers, such as Stripe, may process data outside the European Union or the European
            Economic Area. In such cases, we rely on appropriate safeguards such as Standard Contractual Clauses or
            adequacy decisions to ensure that your data is protected in accordance with GDPR requirements.
          </p>
        </section>

        {/* 11 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">11. Changes to This Privacy Policy</h2>
          <p className="text-neutral-300">
            We may update this Privacy Policy from time to time to reflect changes in our service, legal requirements or
            technical developments. The current version is always available on this page. If we make significant
            changes, we may notify you by email or via a notice within the app.
          </p>
        </section>

        {/* 12 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-3">12. Contact</h2>
          <p className="text-neutral-300 mb-2">
            If you have any questions about this Privacy Policy, your personal data or your rights under data
            protection law, you can contact us at:
          </p>
          <p className="text-neutral-300">
            Email:{" "}
            <a href="mailto:contact@burnzy.co" className="text-[#00F5A0] hover:underline">
              contact@burnzy.co
            </a>
            <br />
            Address: Friedrichstraße 34, 80801 München, Germany
          </p>
        </section>

      </div>
    </div>
  );
}
