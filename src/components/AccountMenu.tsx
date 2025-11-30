"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown } from "lucide-react";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[#00F5A0] font-medium hover:opacity-80"
      >
        {user.email}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1B1A24] border border-[#2E2D39] p-2 shadow-xl z-50">
          <button
            onClick={() => window.open("/legal")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-[#2E2D39] rounded-lg"
          >
            Legal
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2E2D39] rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
