"use client";

import BoardHeader from "./components/BoardHeader";
import KanbanBoard from "./components/KanbanBoard";

export default function BoardPage() {
  return (
    <main className="min-h-screen bg-[#0F0E17] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <BoardHeader />
        <KanbanBoard />
      </div>
    </main>
  );
}
