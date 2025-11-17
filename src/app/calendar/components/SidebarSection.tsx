// app/calendar/components/SidebarSection.tsx
"use client";

interface SidebarSectionProps {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  accent?: "purple" | "green" | "white" | "gray";
  children: React.ReactNode;
}

export default function SidebarSection({
  title,
  count,
  open,
  onToggle,
  accent = "white",
  children,
}: SidebarSectionProps) {
  const accentColor =
    accent === "purple"
      ? "#6C63FF"
      : accent === "green"
      ? "#00F5A0"
      : accent === "gray"
      ? "rgba(255,255,255,0.5)"
      : "#FFFFFF";

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg bg-[#181624] px-3 py-2 text-left text-xs font-semibold text-neutral-200 transition hover:bg-[#201C33]"
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: accentColor }}
          />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="rounded-full bg-[#13121C] px-2 py-0.5 text-[10px]">
            {count}
          </span>
          <span className={`transition-transform ${open ? "rotate-90" : ""}`}>
            ▸
          </span>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "mt-2 max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
