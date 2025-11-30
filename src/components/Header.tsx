"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import AccountMenu from "./AccountMenu";

export function Header() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <header className="sticky top-0 z-40 w-full bg-[#0F0E17]/80 backdrop-blur-lg border-b border-[#1D1C26]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between opacity-50">
          <div className="text-2xl font-bold text-white">YT <span className="text-[#6C63FF]">Analyzer</span></div>
          <div className="h-6 w-6 rounded-md bg-neutral-700 animate-pulse" />
        </div>
      </header>
    );
  }


  // --- Animation variants ---
  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };


  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F0E17]/80 backdrop-blur-lg border-b border-[#1D1C26]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* --- Logo --- */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.webp"
            alt="Burnzy Logo"
            className="w-16 max-w-[150px] h-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>


        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          {!user ? (
            <>
              <Link
                href="/login"
                className="bg-[#00F5A0] text-black px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
              >
                Try for free
              </Link>
              <Link href="/dashboard" className="hover:text-[#00F5A0] transition">
                Dashboard
              </Link>
              <Link href="/history" className="hover:text-[#00F5A0] transition">
                History
              </Link>
              <Link href="/pricing" className="hover:text-[#00F5A0] transition">
                Pricing
              </Link>

            </>
          ) : (
            <>
              <Link
                href="/analyze"
                className="rounded-xl font-semibold shadow-lg transition-all bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] text-black flex items-center justify-center gap-2 px-4 py-2 text-sm"
              >
                Analyze 🚀
              </Link>
              <Link href="/dashboard" className="hover:text-[#00F5A0] transition">
                Dashboard
              </Link>
              <Link href="/history" className="hover:text-[#00F5A0] transition">
                History
              </Link>
              <Link href="/pricing" className="hover:text-[#00F5A0] transition">
                Pricing
              </Link>
              <AccountMenu />
            </>
          )}
        </nav>

        {/* --- Mobile Menu Button --- */}
        <button
          className="md:hidden text-neutral-300 hover:text-white transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Mobile Menu Dropdown --- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobileMenu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="md:hidden bg-[#0F0E17]/95 backdrop-blur-xl border-t border-[#1D1C26] px-6 py-5 text-neutral-300 text-sm"
          >
            <div className="flex flex-col gap-4">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="bg-[#00F5A0] text-black px-4 py-2 rounded-xl font-semibold text-center hover:opacity-90"
                    onClick={() => setMenuOpen(false)}
                  >
                    Try for free
                  </Link>
                  <Link
                    href="/dashboard"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/history"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    History
                  </Link>
                  <Link
                    href="/pricing"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Pricing
                  </Link>

                </>
              ) : (
                <>
                  <Link
                    href="/analyze"
                    className="bg-[#00F5A0] text-black px-4 py-2 rounded-xl font-semibold text-center hover:opacity-90"
                    onClick={() => setMenuOpen(false)}
                  >
                    Analyze 🚀
                  </Link>
                  <Link
                    href="/dashboard"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/history"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    History
                  </Link>
                  <Link
                    href="/pricing"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/legal"
                    className="hover:text-[#00F5A0]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Legal
                  </Link>

                  <div className="flex flex-col gap-3 pt-2 border-t border-[#1D1C26] mt-2">
                    <span className="text-center text-[#00F5A0] font-semibold">
                      {user.email}
                    </span>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setTimeout(() => logout(), 200);
                      }}
                      className="text-center text-red-400 hover:text-red-300 py-2"
                    >
                      Logout
                    </button>
                  </div>

                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
