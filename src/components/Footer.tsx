"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F0E17] border-t border-[#1D1C26]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <img
              src="/logo.webp"
              alt="Burnzy Logo"
              className="h-9 w-auto max-w-[120px] object-contain transition-transform group-hover:scale-105"
            />
            <p className="text-neutral-500 text-sm mt-4 leading-relaxed max-w-sm">
              YouTube insights, content research, and analytics designed
              to help creators grow smarter and faster.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-start md:items-center">
            <h3 className="text-white font-semibold mb-3 tracking-wide text-lg">Navigation</h3>
            <nav className="flex flex-col gap-2 text-sm text-neutral-400">
              <Link href="/analyze" className="hover:text-[#00F5A0] transition">Analyze</Link>
              <Link href="/dashboard" className="hover:text-[#00F5A0] transition">Dashboard</Link>
              <Link href="/history" className="hover:text-[#00F5A0] transition">History</Link>
              <Link href="/pricing" className="hover:text-[#00F5A0] transition">Pricing</Link>
              <Link href="/legal" className="hover:text-[#00F5A0] transition">Legal</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-start md:items-end">
            <h3 className="text-white font-semibold mb-3 tracking-wide text-lg">Legal</h3>
            <div className="flex flex-col gap-2 text-sm text-neutral-400">
              <Link href="/legal/terms" className="hover:text-[#00F5A0] transition">Terms of Service</Link>
              <Link href="/legal/privacy" className="hover:text-[#00F5A0] transition">Privacy Policy</Link>
              <Link href="/legal/refunds" className="hover:text-[#00F5A0] transition">Refund Policy</Link>
              <Link href="/legal/impressum" className="hover:text-[#00F5A0] transition">Impressum</Link>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-[#1D1C26] py-6 text-center text-neutral-600 text-xs sm:text-sm">
        © {new Date().getFullYear()} Burnzy · All rights reserved
      </div>
    </footer>

  );
}
