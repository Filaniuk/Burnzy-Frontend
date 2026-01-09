"use client";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
}

export default function ToggleSwitch({
  enabled,
  onToggle,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-center gap-4 select-none">
      {/* Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`
          relative inline-flex w-14 h-7 rounded-full transition-all duration-300
          ${enabled ? "bg-[#00F5A0]" : "bg-[#2E2D39]"}
          shadow-inner border border-[#3A3A45]
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transform transition-all duration-300
            ${enabled ? "translate-x-7" : "translate-x-0"}
          `}
        />
      </button>

      {/* Label */}
      {label && (
        <span
          onClick={!disabled ? onToggle : undefined}
          className={`
            text-neutral-300 text-sm transition cursor-pointer
            hover:text-white
            ${disabled ? "opacity-50 cursor-not-allowed hover:text-neutral-300" : ""}
          `}
        >
          {label}
        </span>
      )}
    </div>
  );
}
