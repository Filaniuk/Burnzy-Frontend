"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  // 🔐 Check if user already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch<{ ok: boolean }>("/auth/me");
        if (res?.ok) {
          router.replace("/auth/dashboard");
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    };
    checkAuth();
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0F0E17] text-white px-4 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center text-center w-full max-w-md p-8 sm:p-10 bg-[#1B1A24]/60 rounded-2xl border border-[#2E2D39] shadow-xl"
      >
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Welcome Back
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-sm sm:text-base mb-8">
          Sign in to continue with your account
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 w-full py-3 sm:py-3.5 rounded-xl bg-white text-black font-semibold shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/50 active:scale-[0.98]"
          aria-label="Continue with Google"
        >
          <img
            src="/googlelogo.svg"
            alt="Google logo"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
          Continue with Google
        </button>

        {/* Legal text */}
        <p className="text-neutral-500 text-xs sm:text-sm mt-6 max-w-sm leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="text-[#00F5A0] hover:underline transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-[#00F5A0] hover:underline transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </motion.section>

      {/* Footer */}
      <footer className="mt-10 text-neutral-600 text-xs text-center">
        © {new Date().getFullYear()} ContentAI. All rights reserved.
      </footer>
    </main>
  );
}
