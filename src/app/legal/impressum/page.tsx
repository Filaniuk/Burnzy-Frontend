"use client";

import React from "react";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white py-16 px-6 flex justify-center">
      <div className="max-w-4xl w-full bg-[#12111A] p-10 rounded-2xl shadow-lg border border-[#1F1E29]">
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Legal Notice (Impressum)
        </h1>

        <p className="text-neutral-400 mb-8">
          Legal notice / Provider identification pursuant to § 5 TMG.
        </p>

        {/* Provider */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Service Provider</h2>
          <p className="mb-2">
            <strong>Burnzy</strong> – YouTube Channel Analysis &amp; Idea Tool
          </p>
          <p className="mb-1">
            Operator / Responsible Person:
            <br />
            <strong>Mikalai Filaniuk</strong>
          </p>
          <p className="mb-1">Friedrichstraße 34</p>
          <p className="mb-1">80801 Munich</p>
          <p className="mb-1">Germany</p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Contact</h2>
          <p className="mb-1">
            E-Mail:{" "}
            <a
              href="mailto:contact@burnzy.co"
              className="text-[#00F5A0] hover:underline"
            >
              contact@burnzy.co
            </a>
          </p>
          <p className="text-neutral-400 text-sm mt-2">
            Please use the e-mail address above for legal inquiries, support, or
            other contact requests.
          </p>
        </section>

        {/* VAT / Small Business */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">VAT / Small Business Status</h2>
          <p className="mb-2">
            The service provider is a{" "}
            <strong>small business operator according to § 19 UStG</strong>.
          </p>
          <p className="mb-2">
            Therefore, <strong>no value-added tax (VAT) is charged or shown</strong>.
          </p>
        </section>

        {/* Responsible under RStV */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">
            Person Responsible for Content under § 55 Abs. 2 RStV
          </h2>
          <p className="mb-1">
            <strong>Mikalai Filaniuk</strong>
          </p>
          <p className="mb-1">Friedrichstraße 34</p>
          <p className="mb-1">80801 Munich</p>
          <p className="mb-1">Germany</p>
        </section>

        {/* Technical implementation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Technical Implementation</h2>
          <p className="mb-2">
            Burnzy is operated as a web application and uses the following technologies:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-neutral-300">
            <li>Backend: FastAPI</li>
            <li>Database: PostgreSQL</li>
            <li>Frontend: React</li>
            <li>Authentication / Sessions: Cookies</li>
            <li>Payment Processing: Stripe (only customer IDs, no full card data)</li>
          </ul>
        </section>

        {/* Liability for content */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Liability for Content</h2>
          <p className="mb-4">
            As a service provider, I am responsible for my own content on these
            pages in accordance with § 7 Abs. 1 TMG and the general laws. However,
            according to §§ 8 to 10 TMG, I am not obligated to monitor transmitted
            or stored third-party information or to investigate circumstances
            indicating illegal activity.
          </p>
          <p className="mb-4">
            Obligations to remove or block the use of information under general
            laws remain unaffected. However, liability in this respect is only
            possible from the time of knowledge of a specific legal violation. If
            I become aware of such infringements, I will remove the content
            immediately.
          </p>
        </section>

        {/* Liability for links */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Liability for External Links</h2>
          <p className="mb-4">
            This website may contain links to external third-party websites whose
            content I have no control over. Therefore, I cannot assume any
            liability for such external content. The respective provider or
            operator of the linked pages is always responsible for their content.
          </p>
          <p className="mb-4">
            Permanent monitoring of the content of linked sites is unreasonable
            without concrete evidence of a legal violation. Upon becoming aware of
            such violations, I will remove those links immediately.
          </p>
        </section>

        {/* Copyright */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Copyright</h2>
          <p className="mb-4">
            The content and works created by the service provider on these pages
            are subject to German copyright law. Third-party content is marked as
            such. Reproduction, editing, distribution, or any form of usage beyond
            copyright limits requires the written consent of the respective author
            or creator.
          </p>
          <p className="mb-4">
            Downloads and copies of this page are permitted only for private,
            non-commercial use unless expressly stated otherwise.
          </p>
        </section>

        {/* English note */}
        <section className="mt-10">
          <p className="text-neutral-500 text-sm">
            This legal notice is provided in accordance with German law and is
            legally binding for visitors from Germany. For general terms regarding
            the use of Burnzy, please also see our{" "}
            <a
              href="/legal/terms"
              className="text-[#00F5A0] hover:underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/legal/privacy"
              className="text-[#00F5A0] hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
