"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, Image as ImageIcon, IndentIncrease, LightbulbIcon, Calendar } from "lucide-react";

export default function FeaturesMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(
    () => [
      {
        label: "Keyword analyzer",
        href: "/keywords",
        Icon: Search,
        description: "Score demand, momentum, and competition for a keyword or a niche.",
      },
      {
        label: "Thumbnails",
        href: "/thumbnails",
        Icon: ImageIcon,
        description: "Manage your generated high-converting thumbnail concepts.",
      },
      {
        label: "Explore Ideas",
        href: "/explore",
        Icon: LightbulbIcon,
        description: "Create professional ideas that actually work.",
      },
      {
        label: "Calendar",
        href: "/calendar",
        Icon: Calendar,
        description: "Plan and schedule your content effectively.",
      },
    ],
    []
  );

  // Close on outside click / ESC for a production-grade dropdown
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 hover:text-[#00F5A0] transition"
      >
        Features
        <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-3 w-[320px] rounded-2xl bg-[#1B1A24] border border-[#2E2D39] p-2 shadow-2xl z-50"
        >
          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-white/50">
            Tools
          </div>

          <div className="flex flex-col">
            {items.map(({ href, label, Icon, description }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-[#2E2D39] transition"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-white/15">
                  <Icon size={18} className="text-[#00F5A0]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <span className="text-xs text-white/40 group-hover:text-white/55">Open</span>
                  </div>
                  <div className="mt-1 text-xs text-white/55 leading-snug">{description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
