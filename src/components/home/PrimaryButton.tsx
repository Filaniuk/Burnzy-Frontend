"use client";

import { useRouter } from "next/navigation";

interface Props {
  label: string;
}

export default function PrimaryButton({ label }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/login")}
      className="
        rounded-full bg-[#00F5A0] px-8 py-3 text-sm font-semibold text-black
        shadow-[0_0_12px_rgba(0,245,160,0.35)]
        transition hover:brightness-110 hover:shadow-[0_0_18px_rgba(0,245,160,0.45)]
        focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/70
        focus:ring-offset-2 focus:ring-offset-[#0F0E17]

        motion-safe:transition-transform motion-safe:duration-300
        motion-safe:hover:scale-[1.03]
      "
    >
      {label}
    </button>
  );
}
