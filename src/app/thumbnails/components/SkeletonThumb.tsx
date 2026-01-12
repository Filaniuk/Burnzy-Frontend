"use client";

type Props = {
  className?: string;
};

export default function SkeletonThumb({ className = "" }: Props) {
  return (
    <div
      className={[
        "absolute inset-0 z-10 pointer-events-none",
        "rounded-xl border border-[#2E2D39] bg-[#14131C] overflow-hidden",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-white/5" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
