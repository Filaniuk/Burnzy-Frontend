"use client";

import { useRouter } from "next/navigation";
import { GradientActionButton } from "./GradientActionButton";
import { PurpleActionButton } from "./PurpleActionButton";

export default function Unauthorized({
  title = "You need to log in",
  description = "Access to this page requires authentication.",
  buttonText = "Go to Login",
}: {
  title?: string;
  description?: string;
  buttonText?: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-center px-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent mb-4">
        {title}
      </h1>

      <p className="text-neutral-400 max-w-md mb-8">{description}</p>

      <PurpleActionButton
        onClick={() => router.push("/login")}
        label="🔐 Go To Login"
        size="md"
      />
    </div>
  );
}
