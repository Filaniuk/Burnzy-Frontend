"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    (async () => {
      await refresh(); // loads user from session cookie
      router.push("/analyze");
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0E17] text-white text-center px-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
        Connecting your Google Account...
      </h1>
      <p className="text-neutral-400 mt-4">
        Please wait while we set up your workspace.
      </p>
      <div className="mt-8 animate-spin h-12 w-12 border-4 border-[#00F5A0] border-t-transparent rounded-full"></div>
    </div>
  );
}
